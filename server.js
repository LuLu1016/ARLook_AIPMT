const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const OpenAI = require('openai');
const ffmpeg = require('fluent-ffmpeg');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Simple ARLooker registry (in-memory store)
const arlookers = {
  "lily_huang": { name: "Lily Huang", email: "lily@upenn.edu", phone: "215-555-0101" },
  "grace_li": { name: "Grace Li", email: "grace@upenn.edu", phone: "215-555-0102" },
  "mike_chen": { name: "Mike Chen", email: "mike@upenn.edu", phone: "215-555-0103" },
  "sarah_wang": { name: "Sarah Wang", email: "sarah@upenn.edu", phone: "215-555-0104" }
};

// Initialize OpenAI (only if API key is provided)
let openai = null;
if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'your_openai_api_key_here') {
  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
  });
  console.log('✅ OpenAI client initialized');
} else {
  console.log('⚠️  OpenAI API key not configured - using mock responses');
}

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Create uploads directory if it doesn't exist
    if (!fs.existsSync('uploads')) {
      fs.mkdirSync('uploads');
    }
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 500 * 1024 * 1024 // 500MB limit for real apartment videos
  },
  fileFilter: (req, file, cb) => {
    console.log('File received:', {
      fieldname: file.fieldname,
      originalname: file.originalname,
      mimetype: file.mimetype,
      size: file.size
    });
    
    // Accept all files for now - we'll validate in the endpoint
    cb(null, true);
  }
});

// Function to extract frames from video
function extractFrames(videoPath, outputDir, frameCount = 5) {
  return new Promise((resolve, reject) => {
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const frames = [];
    let completedFrames = 0;
    let hasError = false;

    // Get video duration first
    ffmpeg.ffprobe(videoPath, (err, metadata) => {
      if (err) {
        console.error('Error getting video metadata:', err);
        reject(err);
        return;
      }

      const duration = metadata.format.duration;
      console.log(`Video duration: ${duration} seconds`);

      // Extract frames sequentially to avoid race conditions
      const extractFrame = (index) => {
        if (index >= frameCount || hasError) {
          if (completedFrames === frameCount) {
            resolve(frames);
          }
          return;
        }

        const framePath = path.join(outputDir, `frame_${index}.jpg`);
        // Distribute frames evenly across the video duration
        const timestamp = (duration * index) / (frameCount - 1);

        ffmpeg(videoPath)
          .seekInput(timestamp)
          .frames(1)
          .outputOptions(['-q:v', '2']) // High quality
          .output(framePath)
          .on('end', () => {
            if (!hasError) {
              completedFrames++;
              frames.push(framePath);
              console.log(`Frame ${index + 1}/${frameCount} extracted: ${framePath}`);
              
              // Extract next frame
              extractFrame(index + 1);
            }
          })
          .on('error', (err) => {
            if (!hasError) {
              hasError = true;
              console.error(`Frame extraction error for frame ${index}:`, err);
              reject(err);
            }
          })
          .run();
      };

      // Start extracting frames sequentially
      extractFrame(0);
    });
  });
}

// Function to convert image to base64
function imageToBase64(imagePath) {
  try {
    const imageBuffer = fs.readFileSync(imagePath);
    return imageBuffer.toString('base64');
  } catch (error) {
    console.error('Error reading image:', error);
    return null;
  }
}

// AI Analysis Prompt
const getAnalysisPrompt = () => {
  return `You are a professional apartment inspector specializing in student housing analysis. Analyze these images from a rental apartment tour, focusing on factors that matter most to international students.

**CRITICAL ANALYSIS AREAS:**

**1. Layout & Space (25%)**
- Room size and space utilization
- Window placement and natural lighting
- Storage space availability
- Privacy considerations
- Noise isolation potential

**2. Facilities & Amenities (25%)**
- Kitchen appliances and functionality
- Bathroom condition and fixtures
- Furniture quality and condition
- Internet/electrical outlets
- Heating/cooling systems

**3. Issues & Maintenance (25%)**
- Visible damages, stains, or wear
- Mold, water damage, or structural issues
- Maintenance problems
- Cleanliness and hygiene concerns
- Safety hazards

**4. Safety & Security (25%)**
- Door locks and security features
- Electrical safety (outlets, wiring)
- Fire safety (smoke detectors, exits)
- Structural integrity
- Neighborhood safety indicators

**RATING CRITERIA:**
- 5: Excellent - Perfect for students, great value
- 4: Good - Minor issues, good overall
- 3: Average - Some concerns, acceptable
- 2: Poor - Significant issues, not recommended
- 1: Bad - Major problems, avoid

**RETURN FORMAT (JSON only):**
{
  "layout": "Detailed description of room layout, space, and lighting",
  "facilities": ["List of visible facilities and appliances"],
  "issues": "Description of any visible problems or concerns",
  "safety": "Assessment of safety features and potential risks",
  "rating": 4.2,
  "summary": "Brief overall assessment focusing on student rental value"
}

Focus on practical concerns for international students who need reliable, safe, and comfortable housing. Be thorough but concise.`;
};

// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ARLooker profiles API
app.get('/api/arlookers', (req, res) => {
  res.json({ success: true, arlookers: arlookers });
});

// Appointments API
app.get('/api/appointments', (req, res) => {
  try {
    const appointmentsPath = path.join(__dirname, 'data', 'appointments.json');
    
    // Ensure data directory exists
    const dataDir = path.dirname(appointmentsPath);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    
    if (fs.existsSync(appointmentsPath)) {
      const appointmentsData = JSON.parse(fs.readFileSync(appointmentsPath, 'utf8'));
      res.json({ success: true, appointments: appointmentsData.appointments || [] });
    } else {
      // Create empty appointments file if it doesn't exist
      const emptyData = { appointments: [] };
      fs.writeFileSync(appointmentsPath, JSON.stringify(emptyData, null, 2));
      res.json({ success: true, appointments: [] });
    }
  } catch (error) {
    console.error('Error reading appointments:', error);
    // Return empty array instead of error for better UX
    res.json({ success: true, appointments: [] });
  }
});

app.post('/api/appointments', (req, res) => {
  try {
    const appointmentsPath = path.join(__dirname, 'data', 'appointments.json');
    
    // Ensure data directory exists
    const dataDir = path.dirname(appointmentsPath);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    
    let appointmentsData;
    if (fs.existsSync(appointmentsPath)) {
      appointmentsData = JSON.parse(fs.readFileSync(appointmentsPath, 'utf8'));
    } else {
      appointmentsData = { appointments: [] };
    }
    
    // Generate new appointment ID
    const newId = String(appointmentsData.appointments.length + 1).padStart(3, '0');
    
    const newAppointment = {
      id: newId,
      ...req.body,
      status: 'scheduled',
      assigned_arlooker: '',
      assigned_at: null,
      video_url: '',
      report_url: '',
      created_at: new Date().toISOString()
    };
    
    appointmentsData.appointments.push(newAppointment);
    fs.writeFileSync(appointmentsPath, JSON.stringify(appointmentsData, null, 2));
    
    res.json({ 
      success: true, 
      appointmentId: newId,
      message: 'Appointment scheduled successfully' 
    });
  } catch (error) {
    console.error('Error creating appointment:', error);
    res.status(500).json({ success: false, error: 'Failed to create appointment' });
  }
});

app.put('/api/appointments/:id', (req, res) => {
  try {
    const appointmentsPath = path.join(__dirname, 'data', 'appointments.json');
    
    // Ensure data directory exists
    const dataDir = path.dirname(appointmentsPath);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    
    let appointmentsData;
    if (fs.existsSync(appointmentsPath)) {
      appointmentsData = JSON.parse(fs.readFileSync(appointmentsPath, 'utf8'));
    } else {
      return res.status(404).json({ success: false, error: 'No appointments data found' });
    }
    
    const appointmentIndex = appointmentsData.appointments.findIndex(apt => apt.id === req.params.id);
    
    if (appointmentIndex === -1) {
      return res.status(404).json({ success: false, error: 'Appointment not found' });
    }
    
    // Update appointment
    const updateData = { ...req.body };
    
    // If assigning ARLooker, add assigned_at timestamp
    if (updateData.assigned_arlooker && !appointmentsData.appointments[appointmentIndex].assigned_arlooker) {
      updateData.assigned_at = new Date().toISOString();
    }
    
    appointmentsData.appointments[appointmentIndex] = {
      ...appointmentsData.appointments[appointmentIndex],
      ...updateData
    };
    
    fs.writeFileSync(appointmentsPath, JSON.stringify(appointmentsData, null, 2));
    
    res.json({ success: true, message: 'Appointment updated successfully' });
  } catch (error) {
    console.error('Error updating appointment:', error);
    res.status(500).json({ success: false, error: 'Failed to update appointment' });
  }
});

// Assign appointment to ARLooker
app.post('/api/appointments/:id/assign', express.json(), (req, res) => {
  try {
    const appointmentId = req.params.id;
    const { arlooker } = req.body;
    
    const appointmentsPath = path.join(__dirname, 'data', 'appointments.json');
    
    // Ensure data directory exists
    const dataDir = path.dirname(appointmentsPath);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    
    let appointments;
    if (fs.existsSync(appointmentsPath)) {
      appointments = JSON.parse(fs.readFileSync(appointmentsPath, 'utf8'));
    } else {
      return res.status(404).json({ success: false, error: 'No appointments data found' });
    }
    
    // Find and update the appointment
    const appointmentIndex = appointments.appointments.findIndex(app => app.id === appointmentId);
    if (appointmentIndex !== -1) {
      appointments.appointments[appointmentIndex].assigned_arlooker = arlooker;
      appointments.appointments[appointmentIndex].status = 'assigned';
      appointments.appointments[appointmentIndex].assigned_at = new Date().toISOString();
      
      fs.writeFileSync(appointmentsPath, JSON.stringify(appointments, null, 2));
      res.json({ success: true, appointment: appointments.appointments[appointmentIndex] });
    } else {
      res.status(404).json({ success: false, error: 'Appointment not found' });
    }
  } catch (error) {
    console.error('Error assigning appointment:', error);
    res.status(500).json({ success: false, error: 'Failed to assign appointment' });
  }
});

// Mark appointment as completed
app.post('/api/appointments/:id/complete', express.json(), (req, res) => {
  try {
    const appointmentId = req.params.id;
    const { video_url, report_data, status } = req.body;
    
    const appointmentsPath = path.join(__dirname, 'data', 'appointments.json');
    
    // Ensure data directory exists
    const dataDir = path.dirname(appointmentsPath);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    
    let appointments;
    if (fs.existsSync(appointmentsPath)) {
      appointments = JSON.parse(fs.readFileSync(appointmentsPath, 'utf8'));
    } else {
      return res.status(404).json({ success: false, error: 'No appointments data found' });
    }
    
    const appointmentIndex = appointments.appointments.findIndex(app => app.id === appointmentId);
    if (appointmentIndex !== -1) {
      appointments.appointments[appointmentIndex].video_url = video_url;
      appointments.appointments[appointmentIndex].report_data = report_data;
      appointments.appointments[appointmentIndex].status = status || 'completed';
      appointments.appointments[appointmentIndex].completed_at = new Date().toISOString();
      
      fs.writeFileSync(appointmentsPath, JSON.stringify(appointments, null, 2));
      res.json({ success: true, appointment: appointments.appointments[appointmentIndex] });
    } else {
      res.status(404).json({ success: false, error: 'Appointment not found' });
    }
  } catch (error) {
    console.error('Error completing appointment:', error);
    res.status(500).json({ success: false, error: 'Failed to complete appointment' });
  }
});

// Customer login endpoint
app.post('/api/customer/login', express.json(), (req, res) => {
  try {
    const { email, phone } = req.body;
    const appointmentsPath = path.join(__dirname, 'data', 'appointments.json');
    
    // Ensure data directory exists
    const dataDir = path.dirname(appointmentsPath);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    
    if (fs.existsSync(appointmentsPath)) {
      const data = fs.readFileSync(appointmentsPath, 'utf8');
      const appointments = JSON.parse(data);
      const customerAppointments = appointments.appointments.filter(
        apt => apt.customer_email === email && apt.customer_phone === phone
      );
      
      if (customerAppointments.length > 0) {
        res.json({ success: true, appointments: customerAppointments });
      } else {
        res.status(404).json({ success: false, error: 'No appointments found for this email and phone.' });
      }
    } else {
      res.status(404).json({ success: false, error: 'No appointments data found.' });
    }
  } catch (error) {
    console.error('Error during customer login:', error);
    res.status(500).json({ success: false, error: 'Failed to process login.' });
  }
});

// Test endpoint for pre-uploaded Evo videos
app.post('/api/test-analyze', async (req, res) => {
  try {
    console.log('=== Test Analysis Request Received ===');
    
    const { videoFile } = req.body;
    const testVideoPath = path.join(__dirname, 'test_videos', videoFile);
    
    if (!fs.existsSync(testVideoPath)) {
      return res.status(400).json({
        success: false,
        error: `Test video file not found: ${videoFile}`
      });
    }

    console.log('Using test video:', testVideoPath);

    // Check if OpenAI API key is configured
    if (!openai) {
      console.log('OpenAI API key not configured, returning mock response');
      
      const mockReport = {
        layout: "Evo apartment with modern open-concept living space, approximately 400 sq ft",
        facilities: ["Full kitchen with stainless steel appliances", "Private bathroom with modern fixtures", "Built-in storage", "High-speed internet ready"],
        issues: "Minor wear on hardwood floors, some scuff marks on walls", 
        safety: "Secure entry system, smoke detectors present, electrical outlets properly installed",
        rating: 4.3,
        summary: "This Evo apartment offers excellent value for students with modern amenities and good security features."
      };

      res.json({
        success: true,
        report: mockReport,
        timestamp: new Date().toISOString(),
        fileInfo: {
          filename: videoFile,
          originalname: videoFile,
          size: fs.statSync(testVideoPath).size,
          mimetype: "video/quicktime"
        },
        note: "Mock response - OpenAI API key not configured"
      });
      return;
    }

    console.log('Extracting frames from test video...');
    
    // Extract frames from video
    const framesDir = path.join('uploads', 'frames', `test_${Date.now()}`);
    const frames = await extractFrames(testVideoPath, framesDir, 5);
    
    console.log('Frames extracted:', frames.length);

    // Convert frames to base64
    const base64Images = [];
    for (const framePath of frames) {
      const base64 = imageToBase64(framePath);
      if (base64) {
        base64Images.push(base64);
      }
    }

    if (base64Images.length === 0) {
      throw new Error('Failed to extract frames from video');
    }

    console.log('Sending images to OpenAI GPT-4o...');

    // Prepare messages for OpenAI
    const messages = [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: getAnalysisPrompt()
          }
        ]
      }
    ];

    // Add images to the message
    base64Images.forEach((base64Image, index) => {
      messages[0].content.push({
        type: "image_url",
        image_url: {
          url: `data:image/jpeg;base64,${base64Image}`,
          detail: "high"
        }
      });
    });

    // Call OpenAI GPT-4o API
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: messages,
      max_tokens: 2000,
      temperature: 0.3
    });

    console.log('OpenAI response received');

    // Parse AI response
    const aiResponse = response.choices[0].message.content;
    let report;
    
    try {
      // Try to extract JSON from response
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        report = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      console.error('Error parsing AI response:', parseError);
      console.log('AI Response:', aiResponse);
      
      // Fallback response if JSON parsing fails
      report = {
        layout: "Unable to analyze layout from images",
        facilities: ["Analysis incomplete"],
        issues: "Unable to identify issues from images",
        safety: "Unable to assess safety from images",
        rating: 3,
        summary: "AI analysis completed but response format was unexpected"
      };
    }

    console.log('AI analysis completed, sending response...');

    // Clean up files
    frames.forEach(framePath => {
      if (fs.existsSync(framePath)) {
        fs.unlinkSync(framePath);
      }
    });
    
    // Clean up frames directory
    const framesDirPath = path.dirname(frames[0]);
    if (fs.existsSync(framesDirPath)) {
      fs.rmdirSync(framesDirPath);
    }

    res.json({
      success: true,
      report: report,
      timestamp: new Date().toISOString(),
      fileInfo: {
        filename: videoFile,
        originalname: videoFile,
        size: fs.statSync(testVideoPath).size,
        mimetype: "video/quicktime"
      },
      analysisInfo: {
        framesAnalyzed: base64Images.length,
        model: "gpt-4o",
        processingTime: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Test analysis error:', error);
    
    res.status(500).json({
      success: false,
      error: 'Failed to analyze test video. Please try again.',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get list of available test videos
app.get('/api/test-videos', (req, res) => {
  try {
    const testVideosDir = path.join(__dirname, 'test_videos');
    if (!fs.existsSync(testVideosDir)) {
      return res.json({ videos: [] });
    }

    const files = fs.readdirSync(testVideosDir);
    const videoFiles = files.filter(file => {
      const ext = path.extname(file).toLowerCase();
      return ['.mp4', '.mov', '.avi', '.mkv', '.webm'].includes(ext);
    });

    res.json({ videos: videoFiles });
  } catch (error) {
    console.error('Error reading test videos:', error);
    res.status(500).json({ error: 'Failed to read test videos' });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    openai_configured: !!openai
  });
});

// AI Analysis endpoint
app.post('/api/analyze', upload.single('video'), async (req, res) => {
  try {
    console.log('=== AI Analysis Request Received ===');
    
    if (!req.file) {
      console.log('No file uploaded');
      return res.status(400).json({
        success: false,
        error: 'No video file uploaded'
      });
    }

    console.log('File uploaded successfully:', {
      filename: req.file.filename,
      originalname: req.file.originalname,
      size: req.file.size,
      mimetype: req.file.mimetype,
      path: req.file.path
    });

    // Validate file type based on extension
    const allowedExtensions = ['.mp4', '.mov', '.avi', '.mkv', '.webm'];
    const fileExtension = path.extname(req.file.originalname).toLowerCase();
    
    if (!allowedExtensions.includes(fileExtension)) {
      console.log('Invalid file extension:', fileExtension);
      // Clean up uploaded file
      fs.unlinkSync(req.file.path);
      return res.status(400).json({
        success: false,
        error: 'Only video files are allowed. Supported formats: MP4, MOV, AVI, MKV, WEBM'
      });
    }

    // Check if OpenAI API key is configured
    if (!openai) {
      console.log('OpenAI API key not configured, returning mock response');
      
      // Return mock response if API key not configured
      const mockReport = {
        layout: "Studio apartment, approximately 300 sq ft",
        facilities: ["Refrigerator", "Microwave", "Private bathroom"],
        issues: "Minor wall scuffs near doorway", 
        safety: "All electrical outlets properly installed",
        rating: 4.2,
        summary: "This is a well-maintained apartment with good facilities. Minor cosmetic issues are present but don't affect overall livability."
      };

      res.json({
        success: true,
        report: mockReport,
        timestamp: new Date().toISOString(),
        fileInfo: {
          filename: req.file.filename,
          originalname: req.file.originalname,
          size: req.file.size,
          mimetype: req.file.mimetype
        },
        note: "Mock response - OpenAI API key not configured"
      });
      return;
    }

    console.log('Extracting frames from video...');
    
    // Extract frames from video
    const framesDir = path.join('uploads', 'frames', req.file.filename);
    const frames = await extractFrames(req.file.path, framesDir, 3);
    
    console.log('Frames extracted:', frames.length);

    // Convert frames to base64
    const base64Images = [];
    for (const framePath of frames) {
      const base64 = imageToBase64(framePath);
      if (base64) {
        base64Images.push(base64);
      }
    }

    if (base64Images.length === 0) {
      throw new Error('Failed to extract frames from video');
    }

    console.log('Sending images to OpenAI GPT-4V...');

    // Prepare messages for OpenAI
    const messages = [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: getAnalysisPrompt()
          }
        ]
      }
    ];

    // Add images to the message
    base64Images.forEach((base64Image, index) => {
      messages[0].content.push({
        type: "image_url",
        image_url: {
          url: `data:image/jpeg;base64,${base64Image}`,
          detail: "high"
        }
      });
    });

    // Call OpenAI GPT-4V API
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // Updated model name
      messages: messages,
      max_tokens: 2000,
      temperature: 0.3
    });

    console.log('OpenAI response received');

    // Parse AI response
    const aiResponse = response.choices[0].message.content;
    let report;
    
    try {
      // Try to extract JSON from response
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        report = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      console.error('Error parsing AI response:', parseError);
      console.log('AI Response:', aiResponse);
      
      // Fallback response if JSON parsing fails
      report = {
        layout: "Unable to analyze layout from images",
        facilities: ["Analysis incomplete"],
        issues: "Unable to identify issues from images",
        safety: "Unable to assess safety from images",
        rating: 3,
        summary: "AI analysis completed but response format was unexpected"
      };
    }

    console.log('AI analysis completed, sending response...');

    // Clean up files
    fs.unlinkSync(req.file.path);
    frames.forEach(framePath => {
      if (fs.existsSync(framePath)) {
        fs.unlinkSync(framePath);
      }
    });
    
    // Clean up frames directory
    const framesDirPath = path.dirname(frames[0]);
    if (fs.existsSync(framesDirPath)) {
      fs.rmdirSync(framesDirPath);
    }

    res.json({
      success: true,
      report: report,
      timestamp: new Date().toISOString(),
      fileInfo: {
        filename: req.file.filename,
        originalname: req.file.originalname,
        size: req.file.size,
        mimetype: req.file.mimetype
      },
      analysisInfo: {
        framesAnalyzed: base64Images.length,
        model: "gpt-4o",
        processingTime: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Analysis error:', error);
    
    // Clean up file if it exists
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    res.status(500).json({
      success: false,
      error: 'Failed to analyze video. Please try again.',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Server error:', error);
  
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        error: 'File too large. Maximum size is 500MB.'
      });
    }
  }
  
  res.status(500).json({
    success: false,
    error: error.message || 'Internal server error'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 ARLook server running on http://localhost:${PORT}`);
  console.log(`📁 Static files served from: ${path.join(__dirname, 'public')}`);
  console.log(`📂 Upload directory: ${path.join(__dirname, 'uploads')}`);
  console.log(`🔧 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🎥 Upload endpoint: http://localhost:${PORT}/api/analyze`);
  console.log(`🤖 OpenAI API Key: ${openai ? 'Configured' : 'Not configured - using mock responses'}`);
});

module.exports = app;