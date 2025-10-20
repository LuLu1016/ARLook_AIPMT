const ADMIN_PASSWORD = "admin2024";

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
    // Check if already authenticated
    const isAuthenticated = sessionStorage.getItem('adminAuthenticated');
    if (isAuthenticated === 'true') {
        showDashboard();
        loadAppointments();
    } else {
        showLogin();
    }
    
    // Bind form submission
    document.getElementById('loginForm').addEventListener('submit', function(e) {
        e.preventDefault();
        checkPassword();
    });
});

function checkPassword() {
    const password = document.getElementById('password').value;
    const errorMessage = document.getElementById('errorMessage');
    
    if (password === ADMIN_PASSWORD) {
        sessionStorage.setItem('adminAuthenticated', 'true');
        showDashboard();
        loadAppointments();
        errorMessage.style.display = 'none';
        document.getElementById('password').value = '';
    } else {
        errorMessage.style.display = 'block';
        document.getElementById('password').value = '';
    }
}

function showLogin() {
    document.getElementById('passwordScreen').style.display = 'flex';
    document.getElementById('dashboard').style.display = 'none';
}

function showDashboard() {
    document.getElementById('passwordScreen').style.display = 'none';
    document.getElementById('dashboard').style.display = 'block';
}

function logout() {
    sessionStorage.removeItem('adminAuthenticated');
    showLogin();
}

async function loadAppointments() {
    try {
        console.log('Loading appointments...');
        const response = await fetch('/api/appointments');
        const data = await response.json();
        
        if (data.success) {
            console.log('Appointments loaded:', data.appointments);
            displayAppointments(data.appointments);
            updateStats(data.appointments);
        } else {
            console.error('Failed to load appointments:', data.error);
            alert('Failed to load appointments: ' + data.error);
        }
    } catch (error) {
        console.error('Failed to load appointments:', error);
        alert('Network error. Please check your connection.');
    }
}

function displayAppointments(appointments) {
    const filter = document.getElementById('statusFilter').value;
    const filteredApps = filter === 'all' ? appointments : appointments.filter(app => app.status === filter);
    
    const tbody = document.getElementById('appointmentsBody');
    
    if (filteredApps.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="8" style="text-align: center; padding: 40px; color: #666;">
                    No appointments found for the selected filter.
                </td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = filteredApps.map(app => `
        <tr>
            <td><strong>#${app.id}</strong></td>
            <td class="customer-info">
                <div class="customer-name">${app.customer_name}</div>
                <div class="customer-contact">${app.customer_email}</div>
                <div class="customer-contact">${app.customer_phone}</div>
            </td>
            <td class="apartment-info">
                <div class="apartment-name">${app.apartment_name}</div>
                <div class="apartment-address">${app.apartment_address}</div>
                ${app.unit_number ? `<div class="apartment-address">Unit: ${app.unit_number}</div>` : ''}
            </td>
            <td>${formatDate(app.preferred_date)}</td>
            <td>
                <div class="concerns-list">
                    ${app.key_concerns ? app.key_concerns.map(concern => 
                        `<span class="concern-tag">${concern}</span>`
                    ).join('') : 'None specified'}
                </div>
            </td>
            <td><span class="status-badge status-${app.status}">${app.status}</span></td>
            <td>${app.assigned_arlooker || 'Unassigned'}</td>
            <td>
                <div class="action-buttons">
                    <button class="action-btn assign" onclick="assignARLooker('${app.id}')">Assign</button>
                    <button class="action-btn details" onclick="viewDetails('${app.id}')">Details</button>
                </div>
            </td>
        </tr>
    `).join('');
}

function updateStats(appointments) {
    const stats = {
        total: appointments.length,
        scheduled: appointments.filter(app => app.status === 'scheduled').length,
        'in-progress': appointments.filter(app => app.status === 'in-progress').length,
        completed: appointments.filter(app => app.status === 'completed').length
    };
    
    document.getElementById('totalCount').textContent = stats.total;
    document.getElementById('scheduledCount').textContent = stats.scheduled;
    document.getElementById('inProgressCount').textContent = stats['in-progress'];
    document.getElementById('completedCount').textContent = stats.completed;
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

async function assignARLooker(appointmentId) {
    // Create a simple dropdown prompt
    const arlookerOptions = [
        'lily_huang (Lily Huang)',
        'grace_li (Grace Li)', 
        'mike_chen (Mike Chen)',
        'sarah_wang (Sarah Wang)'
    ];
    
    const optionsText = arlookerOptions.map((option, index) => `${index + 1}. ${option}`).join('\n');
    const promptText = `Assign to ARLooker:\n${optionsText}\n\nEnter number (1-4) or custom name:`;
    
    const input = prompt(promptText);
    if (input && input.trim()) {
        let arlookerName;
        
        // Check if it's a number (1-4)
        const num = parseInt(input.trim());
        if (num >= 1 && num <= 4) {
            arlookerName = arlookerOptions[num - 1].split(' ')[0]; // Get the username part
        } else {
            arlookerName = input.trim();
        }
        
        try {
            const response = await fetch(`/api/appointments/${appointmentId}/assign`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ arlooker: arlookerName })
            });
            
            const result = await response.json();
            if (result.success) {
                alert(`✅ Successfully assigned appointment #${appointmentId} to ${arlookerName}`);
                loadAppointments(); // Refresh the list
            } else {
                alert(`❌ Assignment failed: ${result.error}`);
            }
        } catch (error) {
            console.error('Assignment error:', error);
            alert('❌ Assignment failed - check console for details');
        }
    }
}

async function updateAppointmentAssignment(appointmentId, arlookerName) {
    try {
        console.log(`Assigning appointment ${appointmentId} to ARLooker: ${arlookerName}`);
        
        const response = await fetch(`/api/appointments/${appointmentId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                assigned_arlooker: arlookerName,
                status: 'in-progress' // Update status when assigned
            })
        });

        const result = await response.json();

        if (result.success) {
            alert(`✅ Successfully assigned appointment #${appointmentId} to ${arlookerName}`);
            console.log('Assignment successful:', result);
            
            // Refresh the appointments to show updated assignment
            loadAppointments();
        } else {
            throw new Error(result.error || 'Assignment failed');
        }
    } catch (error) {
        console.error('Assignment failed:', error);
        alert(`❌ Failed to assign appointment: ${error.message}`);
    }
}

function viewDetails(appointmentId) {
    // TODO: Implement detailed view modal
    alert(`Viewing details for appointment: #${appointmentId}\n\nThis will show:\n- Full customer information\n- Apartment details\n- Inspection notes\n- Status history`);
    console.log(`Viewing details for appointment: ${appointmentId}`);
}

// Auto-refresh every 30 seconds
setInterval(function() {
    if (document.getElementById('dashboard').style.display !== 'none') {
        loadAppointments();
    }
}, 30000);