let currentARLooker = '';

// Initialize on load
document.addEventListener('DOMContentLoaded', function() {
    const savedName = localStorage.getItem('arlookerName');
    if (savedName) {
        setARLookerName(savedName, true);
    }
    
    // Bind ARLooker selection change
    document.getElementById('arlookerSelect').addEventListener('change', function(e) {
        if (e.target.value) {
            setARLookerName(e.target.value);
        }
    });
});

function setARLookerName(name, fromStorage = false) {
    const inputName = fromStorage ? name : document.getElementById('arlookerSelect').value;
    
    if (inputName) {
        currentARLooker = inputName;
        
        // Save to localStorage (unless this is already from storage)
        if (!fromStorage) {
            localStorage.setItem('arlookerName', inputName);
        }
        
        // Update UI
        showDashboard(inputName);
    }
}

function showDashboard(name) {
    // Update welcome message
    document.getElementById('welcomeName').textContent = name;
    
    // Set the dropdown value
    document.getElementById('arlookerSelect').value = name;
    
    // Load appointments
    loadAssignedAppointments();
}

function logout() {
    localStorage.removeItem('arlookerName');
    currentARLooker = '';
    document.getElementById('welcomeName').textContent = 'ARLooker';
    document.getElementById('arlookerSelect').value = '';
    document.getElementById('appointmentsContainer').innerHTML = `
        <div class="loading">
            <div class="loading-spinner"></div>
            <p>Select your ARLooker profile to view appointments...</p>
        </div>
    `;
}

async function loadAssignedAppointments() {
    const container = document.getElementById('appointmentsContainer');
    
    if (!currentARLooker) {
        container.innerHTML = `
            <div class="no-appointments">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/>
                    <circle cx="12" cy="13" r="3"/>
                </svg>
                <h3>Select Your ARLooker Profile</h3>
                <p>Choose your ARLooker profile from the dropdown above to view assigned appointments.</p>
            </div>
        `;
        return;
    }
    
    try {
        console.log('Loading appointments for ARLooker:', currentARLooker);
        const response = await fetch('/api/appointments');
        const data = await response.json();
        
        if (data.success) {
            // Filter appointments assigned to this ARLooker
            const myAppointments = data.appointments.filter(app => 
                app.assigned_arlooker === currentARLooker
            );
            
            console.log('My appointments:', myAppointments);
            displayAppointments(myAppointments);
            updateStats(myAppointments);
        } else {
            console.error('Failed to load appointments:', data.error);
            showError('Failed to load appointments');
        }
    } catch (error) {
        console.error('Failed to load appointments:', error);
        showError('Network error. Please check your connection.');
    }
}

function displayAppointments(appointments) {
    const container = document.getElementById('appointmentsContainer');
    
    if (appointments.length === 0) {
        container.innerHTML = `
            <div class="no-appointments">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/>
                    <circle cx="12" cy="13" r="3"/>
                </svg>
                <h3>📭 No appointments assigned</h3>
                <p>You don't have any appointments assigned to you yet. Check back later or contact your admin.</p>
            </div>
        `;
        return;
    }

    const appointmentsGrid = document.createElement('div');
    appointmentsGrid.className = 'appointments-grid';

    appointments.forEach(appointment => {
        const card = createAppointmentCard(appointment);
        appointmentsGrid.appendChild(card);
    });

    container.innerHTML = '';
    container.appendChild(appointmentsGrid);
}

function createAppointmentCard(appointment) {
    const card = document.createElement('div');
    card.className = 'appointment-card';

    const concernsHtml = appointment.key_concerns ? appointment.key_concerns.map(concern => 
        `<span class="concern-tag">${concern}</span>`
    ).join('') : '';

    const actionButton = getActionButton(appointment);
    const completionInfo = getCompletionInfo(appointment);

    card.innerHTML = `
        <div class="appointment-header">
            <div class="appointment-id">#${appointment.id}</div>
            <span class="status-badge status-${appointment.status}">${appointment.status}</span>
        </div>
        
        <div class="appointment-details">
            <div class="detail-row">
                <span class="detail-label">Customer:</span>
                <span class="detail-value">${appointment.customer_name}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Email:</span>
                <span class="detail-value">${appointment.customer_email}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Phone:</span>
                <span class="detail-value">${appointment.customer_phone}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Apartment:</span>
                <span class="detail-value">${appointment.apartment_name}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Date:</span>
                <span class="detail-value">${formatDate(appointment.preferred_date)}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Address:</span>
                <span class="detail-value">${appointment.apartment_address}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Concerns:</span>
                <div class="concerns-list">${concernsHtml}</div>
            </div>
        </div>
        
        <div class="appointment-actions">
            ${actionButton}
            <button class="action-btn contact" onclick="contactCustomer('${appointment.customer_phone}', '${appointment.customer_email}')">
                📞 Contact Customer
            </button>
        </div>
        
        ${completionInfo}
    `;

    return card;
}

function getActionButton(appointment) {
    if (appointment.status === 'scheduled' || appointment.status === 'assigned' || appointment.status === 'in-progress') {
        return `
            <button class="action-btn upload" onclick="startVideoUpload('${appointment.id}')">
                📹 Upload Video Tour
            </button>
        `;
    } else if (appointment.status === 'completed' && appointment.report_data) {
        return `
            <button class="action-btn view" onclick="viewReport('${appointment.id}')">
                📊 View Completed Report
            </button>
        `;
    } else {
        return `
            <button class="action-btn" disabled>
                Processing...
            </button>
        `;
    }
}

function getCompletionInfo(appointment) {
    if (appointment.status === 'completed' && appointment.completed_at) {
        const completedDate = new Date(appointment.completed_at).toLocaleDateString();
        return `
            <div class="completion-info">
                <p style="color: #28a745; margin-top: 15px; font-weight: 600;">
                    ✅ Tour completed on ${completedDate}
                </p>
            </div>
        `;
    }
    return '';
}

function updateStats(appointments) {
    const assignedCount = appointments.length;
    const completedCount = appointments.filter(apt => apt.status === 'completed').length;

    document.getElementById('assignedCount').textContent = assignedCount;
    document.getElementById('completedCount').textContent = completedCount;
}

function formatDate(dateString) {
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    } catch (error) {
        return dateString;
    }
}

function startVideoUpload(appointmentId) {
    // Store appointment ID for upload page
    localStorage.setItem('currentAppointmentId', appointmentId);
    console.log('Starting video upload for appointment:', appointmentId);
    
    // Redirect to upload page with appointment context
    window.location.href = `upload.html?appointment=${appointmentId}`;
}

function contactCustomer(phone, email) {
    const message = `Contact customer:\n\nPhone: ${phone}\nEmail: ${email}\n\nClick OK to copy email to clipboard.`;
    
    if (confirm(message)) {
        // Copy email to clipboard
        navigator.clipboard.writeText(email).then(() => {
            alert('Email copied to clipboard!');
        }).catch(() => {
            alert(`Email: ${email}`);
        });
    }
}

function viewReport(appointmentId) {
    console.log('Viewing report for appointment:', appointmentId);
    
    // Find the appointment to get report data
    fetch('/api/appointments')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                const appointment = data.appointments.find(apt => apt.id === appointmentId);
                if (appointment && appointment.report_data) {
                    // Display report in a modal
                    displayReportModal(appointment);
                } else if (appointment && appointment.report_url) {
                    window.open(appointment.report_url, '_blank');
                } else {
                    alert('No report available for this appointment yet.');
                }
            }
        })
        .catch(error => {
            console.error('Error loading report:', error);
            alert('Error loading report. Please try again.');
        });
}

function displayReportModal(appointment) {
    // Create modal HTML
    const modalHTML = `
        <div id="reportModal" style="
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.5);
            z-index: 1000;
            display: flex;
            justify-content: center;
            align-items: center;
        ">
            <div style="
                background: white;
                padding: 30px;
                border-radius: 10px;
                max-width: 600px;
                max-height: 80vh;
                overflow-y: auto;
                box-shadow: 0 10px 30px rgba(0,0,0,0.3);
            ">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                    <h2 style="margin: 0; color: #333;">📊 Inspection Report - #${appointment.id}</h2>
                    <button onclick="closeReportModal()" style="
                        background: #dc3545;
                        color: white;
                        border: none;
                        padding: 8px 12px;
                        border-radius: 5px;
                        cursor: pointer;
                    ">✕ Close</button>
                </div>
                
                <div style="margin-bottom: 20px;">
                    <h3 style="color: #007bff; margin-bottom: 10px;">🏠 Apartment Details</h3>
                    <p><strong>Apartment:</strong> ${appointment.apartment_name}</p>
                    <p><strong>Address:</strong> ${appointment.apartment_address}</p>
                    <p><strong>Customer:</strong> ${appointment.customer_name}</p>
                    <p><strong>Date:</strong> ${new Date(appointment.preferred_date).toLocaleDateString()}</p>
                </div>
                
                <div style="margin-bottom: 20px;">
                    <h3 style="color: #28a745; margin-bottom: 10px;">📋 Inspection Results</h3>
                    <div style="background: #f8f9fa; padding: 15px; border-radius: 5px;">
                        <p><strong>Layout:</strong> ${appointment.report_data.layout}</p>
                        <p><strong>Rating:</strong> ⭐ ${appointment.report_data.rating}/5</p>
                    </div>
                </div>
                
                <div style="margin-bottom: 20px;">
                    <h3 style="color: #17a2b8; margin-bottom: 10px;">🏢 Facilities</h3>
                    <ul style="margin: 0; padding-left: 20px;">
                        ${appointment.report_data.facilities.map(facility => `<li>${facility}</li>`).join('')}
                    </ul>
                </div>
                
                <div style="margin-bottom: 20px;">
                    <h3 style="color: #ffc107; margin-bottom: 10px;">⚠️ Issues Found</h3>
                    <p style="background: #fff3cd; padding: 10px; border-radius: 5px; margin: 0;">
                        ${appointment.report_data.issues}
                    </p>
                </div>
                
                <div style="margin-bottom: 20px;">
                    <h3 style="color: #dc3545; margin-bottom: 10px;">🔒 Safety Assessment</h3>
                    <p style="background: #f8d7da; padding: 10px; border-radius: 5px; margin: 0;">
                        ${appointment.report_data.safety}
                    </p>
                </div>
                
                ${appointment.report_data.summary ? `
                <div style="margin-bottom: 20px;">
                    <h3 style="color: #6c757d; margin-bottom: 10px;">📝 Summary</h3>
                    <p style="background: #e9ecef; padding: 15px; border-radius: 5px; margin: 0;">
                        ${appointment.report_data.summary}
                    </p>
                </div>
                ` : ''}
                
                <div style="text-align: center; margin-top: 20px;">
                    <small style="color: #6c757d;">
                        Report generated on ${new Date(appointment.completed_at).toLocaleString()}
                    </small>
                </div>
            </div>
        </div>
    `;
    
    // Add modal to page
    document.body.insertAdjacentHTML('beforeend', modalHTML);
}

function closeReportModal() {
    const modal = document.getElementById('reportModal');
    if (modal) {
        modal.remove();
    }
}

function showError(message) {
    const container = document.getElementById('appointmentsContainer');
    container.innerHTML = `
        <div class="no-appointments">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"/>
            </svg>
            <h3>Error Loading Appointments</h3>
            <p>${message}</p>
            <button onclick="loadAssignedAppointments()" style="margin-top: 15px; padding: 10px 20px; background: #667eea; color: white; border: none; border-radius: 6px; cursor: pointer;">
                Try Again
            </button>
        </div>
    `;
}

// Auto-refresh every 30 seconds
setInterval(function() {
    if (currentARLooker) {
        loadAssignedAppointments();
    }
}, 30000);