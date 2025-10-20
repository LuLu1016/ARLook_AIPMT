# ARLook - AI-Powered Apartment Inspector

An AI-powered apartment inspection platform that helps international students make informed rental decisions by analyzing apartment tour videos.

## Features

- 🎥 **Video Upload**: Upload apartment tour videos (MP4, MOV, AVI, MKV, WEBM)
- 🤖 **AI Analysis**: GPT-4V analyzes apartment layout, facilities, issues, and safety
- 📊 **Detailed Reports**: Get structured reports with ratings and recommendations
- 📱 **Responsive Design**: Works on desktop and mobile devices
- ⚡ **Real-time Processing**: Fast analysis with loading indicators

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure OpenAI API Key

Create a `.env` file in the project root:

```bash
# Copy the example file
cp .env.example .env

# Edit .env and add your OpenAI API key
OPENAI_API_KEY=sk-your-actual-openai-api-key-here
```

**To get an OpenAI API key:**
1. Go to [OpenAI Platform](https://platform.openai.com/)
2. Sign up or log in
3. Navigate to API Keys section
4. Create a new API key
5. Copy the key and paste it in your `.env` file

### 3. Start the Server

```bash
npm start
```

The server will start on `http://localhost:3000`

### 4. Use the Application

1. Open your browser and go to `http://localhost:3000`
2. Upload a video of an apartment tour
3. Click "Analyze Video"
4. View the AI-generated inspection report

## API Endpoints

- `GET /` - Main application page
- `GET /api/health` - Health check endpoint
- `POST /api/analyze` - Upload video for AI analysis

## How It Works

1. **Video Upload**: Users upload apartment tour videos
2. **Frame Extraction**: The system extracts 3 key frames from the video
3. **AI Analysis**: GPT-4V analyzes the frames for:
   - Layout and space utilization
   - Visible facilities and appliances
   - Damages, stains, or maintenance issues
   - Safety concerns
   - Overall condition rating (1-5)
4. **Report Generation**: Returns a structured JSON report

## Mock Mode

If no OpenAI API key is configured, the system will return mock responses for testing purposes. The health check endpoint will show `"openai_configured": false` in this case.

## File Requirements

- **Supported formats**: MP4, MOV, AVI, MKV, WEBM
- **Maximum size**: 100MB
- **Recommended**: Clear, well-lit apartment tour videos

## Development

```bash
# Install development dependencies
npm install

# Start with auto-reload
npm run dev

# Start production server
npm start
```

## Project Structure

```
ARLook/
├── server.js          # Express server with AI integration
├── package.json       # Dependencies and scripts
├── .env               # Environment variables (create this)
├── .env.example       # Environment variables template
├── public/            # Frontend files
│   ├── index.html    # Main application page
│   ├── style.css     # Styling
│   └── script.js     # Frontend JavaScript
└── uploads/           # Temporary file storage
```

## Technologies Used

- **Backend**: Node.js, Express.js
- **AI**: OpenAI GPT-4V (Vision)
- **File Processing**: Multer, FFmpeg
- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Styling**: Pure CSS (no frameworks)

## Troubleshooting

### Server won't start
- Make sure all dependencies are installed: `npm install`
- Check if port 3000 is available
- Verify your `.env` file exists and has the correct format

### OpenAI API errors
- Verify your API key is correct in the `.env` file
- Check your OpenAI account has sufficient credits
- Ensure the API key has access to GPT-4V

### Video processing issues
- Make sure FFmpeg is installed on your system
- Check video file format is supported
- Verify file size is under 100MB

## License

MIT License - see LICENSE file for details

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

---

**Note**: This is an MVP (Minimum Viable Product) designed for demonstration purposes. For production use, consider adding user authentication, database storage, and enhanced security measures.
