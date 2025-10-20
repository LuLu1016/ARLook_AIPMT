// ARLook Frontend JavaScript
class ARLookApp {
    constructor() {
        this.initializeElements();
        this.bindEvents();
        this.currentFile = null;
    }

    initializeElements() {
        // Form elements
        this.videoInput = document.getElementById('videoInput');
        this.uploadForm = document.getElementById('uploadForm');
        this.analyzeBtn = document.getElementById('analyzeBtn');
        this.selectedFileDiv = document.getElementById('selectedFile');
        this.fileNameSpan = document.getElementById('fileName');
        this.removeFileBtn = document.getElementById('removeFile');

        // Test mode elements
        this.testModeToggle = document.getElementById('testModeToggle');
        this.testVideoSelection = document.getElementById('testVideoSelection');
        this.testVideoSelect = document.getElementById('testVideoSelect');
        this.fileInputWrapper = document.getElementById('fileInputWrapper');

        // Section elements
        this.uploadSection = document.getElementById('uploadSection');
        this.loadingSection = document.getElementById('loadingSection');
        this.resultsSection = document.getElementById('resultsSection');
        this.errorSection = document.getElementById('errorSection');

        // Results elements
        this.overallRating = document.getElementById('overallRating');
        this.ratingStars = document.getElementById('ratingStars');
        this.layoutContent = document.getElementById('layoutContent');
        this.facilitiesContent = document.getElementById('facilitiesContent');
        this.issuesContent = document.getElementById('issuesContent');
        this.safetyContent = document.getElementById('safetyContent');

        // Control buttons
        this.newAnalysisBtn = document.getElementById('newAnalysisBtn');
        this.backHomeBtn = document.getElementById('backHomeBtn');
        this.retryBtn = document.getElementById('retryBtn');
        this.errorMessage = document.getElementById('errorMessage');
    }

    bindEvents() {
        // File input change
        this.videoInput.addEventListener('change', (e) => this.handleFileSelect(e));

        // Form submission
        this.uploadForm.addEventListener('submit', (e) => this.handleFormSubmit(e));
        
        // Analyze button click (direct)
        this.analyzeBtn.addEventListener('click', (e) => this.handleAnalyzeClick(e));

        // Remove file button
        this.removeFileBtn.addEventListener('click', () => this.removeSelectedFile());

        // New analysis button
        this.newAnalysisBtn.addEventListener('click', () => this.resetToUpload());

        // Back to home button
        this.backHomeBtn.addEventListener('click', () => this.backToHome());

        // Retry button
        this.retryBtn.addEventListener('click', () => this.resetToUpload());

        // Test mode toggle
        this.testModeToggle.addEventListener('change', () => this.toggleTestMode());

        // Test video selection
        this.testVideoSelect.addEventListener('change', () => this.handleTestVideoSelect());

        // Load test videos on page load
        this.loadTestVideos();

        // Drag and drop functionality
        this.setupDragAndDrop();
    }

    setupDragAndDrop() {
        const fileInputLabel = document.querySelector('.file-input-label');
        
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            fileInputLabel.addEventListener(eventName, this.preventDefaults, false);
        });

        ['dragenter', 'dragover'].forEach(eventName => {
            fileInputLabel.addEventListener(eventName, () => {
                fileInputLabel.style.borderColor = '#5a6fd8';
                fileInputLabel.style.backgroundColor = '#f0f2ff';
            }, false);
        });

        ['dragleave', 'drop'].forEach(eventName => {
            fileInputLabel.addEventListener(eventName, () => {
                fileInputLabel.style.borderColor = '#667eea';
                fileInputLabel.style.backgroundColor = '#f8f9ff';
            }, false);
        });

        fileInputLabel.addEventListener('drop', (e) => this.handleDrop(e), false);
    }

    preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    handleDrop(e) {
        const dt = e.dataTransfer;
        const files = dt.files;

        if (files.length > 0) {
            this.videoInput.files = files;
            this.handleFileSelect({ target: { files: files } });
        }
    }

    handleFileSelect(event) {
        const file = event.target.files[0];
        
        if (!file) {
            this.removeSelectedFile();
            return;
        }

        // Validate file type
        const allowedTypes = ['video/mp4', 'video/mov', 'video/avi', 'video/mkv', 'video/webm'];
        const allowedExtensions = ['.mp4', '.mov', '.avi', '.mkv', '.webm'];
        const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
        
        if (!allowedTypes.includes(file.type) && !allowedExtensions.includes(fileExtension)) {
            this.showError('Please select a valid video file (MP4, MOV, AVI, MKV, WEBM).');
            return;
        }

        // Validate file size (500MB limit)
        const maxSize = 500 * 1024 * 1024; // 500MB in bytes
        if (file.size > maxSize) {
            this.showError('File size must be less than 500MB.');
            return;
        }

        this.currentFile = file;
        this.displaySelectedFile(file);
        this.analyzeBtn.disabled = false;
    }

    displaySelectedFile(file) {
        this.fileNameSpan.textContent = file.name;
        this.selectedFileDiv.style.display = 'flex';
    }

    removeSelectedFile() {
        this.currentFile = null;
        this.videoInput.value = '';
        this.selectedFileDiv.style.display = 'none';
        this.analyzeBtn.disabled = true;
    }

    async handleAnalyzeClick(event) {
        event.preventDefault();
        event.stopPropagation();
        
        console.log('🔍 Analyze button clicked - handling click event');
        
        // Check if we're in test mode
        if (this.testModeToggle && this.testModeToggle.checked) {
            console.log('📹 Test mode enabled, analyzing test video');
            await this.analyzeTestVideo();
            return;
        }
        
        if (!this.currentFile) {
            console.log('❌ No file selected');
            this.showError('Please select a video file first.');
            return;
        }

        console.log('✅ Starting video analysis for:', this.currentFile.name);
        this.showLoading();
        await this.analyzeVideo();
    }

    async handleFormSubmit(event) {
        event.preventDefault();
        
        // Check if we're in test mode
        if (this.testModeToggle && this.testModeToggle.checked) {
            await this.analyzeTestVideo();
            return;
        }
        
        if (!this.currentFile) {
            this.showError('Please select a video file first.');
            return;
        }

        this.showLoading();
        await this.analyzeVideo();
    }

    showLoading() {
        this.hideAllSections();
        this.loadingSection.style.display = 'block';
        
        // Animate loading steps
        this.animateLoadingSteps();
    }

    animateLoadingSteps() {
        const steps = document.querySelectorAll('.step');
        let currentStep = 0;

        const stepInterval = setInterval(() => {
            if (currentStep < steps.length) {
                steps[currentStep].classList.add('active');
                currentStep++;
            } else {
                clearInterval(stepInterval);
            }
        }, 1500); // Faster animation
    }

    async analyzeVideo() {
        try {
            const formData = new FormData();
            formData.append('video', this.currentFile);

            console.log('Sending video for analysis...', {
                filename: this.currentFile.name,
                size: this.currentFile.size,
                type: this.currentFile.type
            });

            const response = await fetch('/api/analyze', {
                method: 'POST',
                body: formData
            });

            const result = await response.json();

            console.log('Analysis response:', result);

            if (result.success) {
                this.displayResults(result.report);
            } else {
                this.showError(result.error || 'Analysis failed. Please try again.');
            }

        } catch (error) {
            console.error('Analysis error:', error);
            this.showError('Network error. Please check your connection and try again.');
        }
    }

    displayResults(report) {
        this.hideAllSections();
        this.resultsSection.style.display = 'block';

        // Display overall rating
        this.displayRating(report.rating);

        // Display detailed sections
        this.displaySection('layout', report.layout, this.layoutContent);
        this.displaySection('facilities', report.facilities, this.facilitiesContent);
        this.displaySection('issues', report.issues, this.issuesContent);
        this.displaySection('safety', report.safety, this.safetyContent);

        // Scroll to results
        this.resultsSection.scrollIntoView({ behavior: 'smooth' });
    }

    displayRating(rating) {
        if (!rating) return;

        this.overallRating.textContent = rating;
        
        // Add color coding based on rating
        if (rating >= 4) {
            this.overallRating.style.color = '#4caf50'; // Green
        } else if (rating >= 3) {
            this.overallRating.style.color = '#ff9800'; // Orange
        } else {
            this.overallRating.style.color = '#f44336'; // Red
        }

        // Display stars
        this.displayStars(rating);
    }

    displayStars(rating) {
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;
        
        this.ratingStars.innerHTML = '';
        
        for (let i = 0; i < 5; i++) {
            const star = document.createElement('div');
            star.className = 'star';
            
            if (i < fullStars) {
                star.classList.add('full');
            } else if (i === fullStars && hasHalfStar) {
                star.classList.add('half');
            } else {
                star.classList.add('empty');
            }
            
            this.ratingStars.appendChild(star);
        }
    }

    displaySection(sectionName, sectionData, container) {
        if (!sectionData || !container) return;

        container.innerHTML = '';

        if (Array.isArray(sectionData)) {
            // Handle array data (like facilities)
            const ul = document.createElement('ul');
            sectionData.forEach(item => {
                const li = document.createElement('li');
                li.textContent = item;
                ul.appendChild(li);
            });
            container.appendChild(ul);
        } else if (typeof sectionData === 'string') {
            // Handle string data
            const p = document.createElement('p');
            p.textContent = sectionData;
            container.appendChild(p);
        } else if (typeof sectionData === 'object') {
            // Handle object data
            Object.entries(sectionData).forEach(([key, value]) => {
                if (value && value.toString().trim()) {
                    const item = document.createElement('div');
                    item.innerHTML = `
                        <p><strong>${this.formatKey(key)}:</strong> ${value}</p>
                    `;
                    container.appendChild(item);
                }
            });
        }

        if (container.children.length === 0) {
            container.innerHTML = '<p>No information available for this section.</p>';
        }
    }

    formatKey(key) {
        return key
            .replace(/([A-Z])/g, ' $1')
            .replace(/^./, str => str.toUpperCase())
            .trim();
    }

    showError(message) {
        this.hideAllSections();
        this.errorSection.style.display = 'block';
        this.errorMessage.textContent = message;
    }

    hideAllSections() {
        this.uploadSection.style.display = 'none';
        this.loadingSection.style.display = 'none';
        this.resultsSection.style.display = 'none';
        this.errorSection.style.display = 'none';
    }

    resetToUpload() {
        this.hideAllSections();
        this.uploadSection.style.display = 'block';
        this.removeSelectedFile();
        
        // Reset loading steps
        document.querySelectorAll('.step').forEach(step => {
            step.classList.remove('active');
        });
    }

    // Test mode methods
    async loadTestVideos() {
        try {
            const response = await fetch('/api/test-videos');
            const data = await response.json();
            
            this.testVideoSelect.innerHTML = '<option value="">Select a test video...</option>';
            
            if (data.videos && data.videos.length > 0) {
                data.videos.forEach(video => {
                    const option = document.createElement('option');
                    option.value = video;
                    option.textContent = video;
                    this.testVideoSelect.appendChild(option);
                });
            } else {
                this.testVideoSelect.innerHTML = '<option value="">No test videos available</option>';
            }
        } catch (error) {
            console.error('Error loading test videos:', error);
            this.testVideoSelect.innerHTML = '<option value="">Error loading test videos</option>';
        }
    }

    toggleTestMode() {
        const isTestMode = this.testModeToggle.checked;
        
        if (isTestMode) {
            this.testVideoSelection.style.display = 'block';
            this.fileInputWrapper.style.display = 'none';
            this.selectedFileDiv.style.display = 'none';
            this.analyzeBtn.disabled = false;
        } else {
            this.testVideoSelection.style.display = 'none';
            this.fileInputWrapper.style.display = 'block';
            this.analyzeBtn.disabled = !this.currentFile;
        }
    }

    handleTestVideoSelect() {
        const selectedVideo = this.testVideoSelect.value;
        this.analyzeBtn.disabled = !selectedVideo;
    }

    async analyzeTestVideo() {
        const selectedVideo = this.testVideoSelect.value;
        if (!selectedVideo) return;

        this.showLoading();
        
        try {
            const response = await fetch('/api/test-analyze', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ videoFile: selectedVideo })
            });

            const result = await response.json();

            if (result.success) {
                this.displayResults(result.report);
            } else {
                this.showError(result.error || 'Analysis failed. Please try again.');
            }

        } catch (error) {
            console.error('Test analysis error:', error);
            this.showError('Network error. Please check your connection and try again.');
        }
    }

    backToHome() {
        // Reset everything and go back to the initial state
        this.hideAllSections();
        this.uploadSection.style.display = 'block';
        this.removeSelectedFile();
        
        // Reset test mode if it was enabled
        if (this.testModeToggle) {
            this.testModeToggle.checked = false;
            this.toggleTestMode();
        }
        
        // Reset loading steps
        document.querySelectorAll('.step').forEach(step => {
            step.classList.remove('active');
        });
        
        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('ARLook app initializing...');
    
    // Add smooth scrolling for better UX
    document.documentElement.style.scrollBehavior = 'smooth';

    // Add loading state to buttons
    const buttons = document.querySelectorAll('button');
    buttons.forEach(button => {
        button.addEventListener('click', function() {
            if (!this.disabled) {
                this.style.transform = 'scale(0.95)';
                setTimeout(() => {
                    this.style.transform = 'scale(1)';
                }, 150);
            }
        });
    });

    // Initialize the main app
    new ARLookApp();
    console.log('ARLook app initialized successfully');
});