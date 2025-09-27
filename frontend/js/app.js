// Global variables - Ensuring proper scope
let map = null;
let currentMarker = null;
let selectedLocation = null;
let issuesData = [];
let isFormOpen = false;
let mapClickHandler = null;

// Wait for everything to load completely
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing...');
    
    // Small delay to ensure all resources are loaded
    setTimeout(() => {
        initializeMap();
        initializeEventListeners();
        loadIssues();
    }, 500);
});

// Initialize Leaflet map with multiple fallbacks
function initializeMap() {
    try {
        console.log('Initializing map...');
        
        // Destroy existing map if any
        if (map) {
            map.remove();
        }
        
        // Create map with explicit options
        map = L.map('map', {
            center: [19.4559, 72.7971],
            zoom: 11,
            zoomControl: true,
            attributionControl: true,
            scrollWheelZoom: true,
            doubleClickZoom: true,
            touchZoom: true,
            dragging: true
        });

        // Add OpenStreetMap tiles
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
            maxZoom: 18
        }).addTo(map);

        console.log('Map initialized successfully');
        
        // Set up click handler - MULTIPLE APPROACHES for guaranteed working
        setupMapClickHandler();
        
        // Ensure map is properly rendered
        setTimeout(() => {
            if (map) {
                map.invalidateSize();
                console.log('Map size invalidated and refreshed');
            }
        }, 1000);
        
    } catch (error) {
        console.error('Error initializing map:', error);
        // Retry after 2 seconds
        setTimeout(initializeMap, 2000);
    }
}

// Setup map click handler with multiple fallbacks
function setupMapClickHandler() {
    if (!map) return;
    
    // Remove any existing click handlers
    map.off('click');
    
    // Add single, reliable click handler
    map.on('click', function(e) {
        if (!isFormOpen) return;
        
        console.log('Map clicked:', e.latlng);
        selectedLocation = e.latlng;
        
        // Remove existing marker
        if (currentMarker) {
            map.removeLayer(currentMarker);
        }
        
        // Add new marker
        currentMarker = L.marker(e.latlng, {
            draggable: true // Make marker draggable for position adjustment
        }).addTo(map);
        
        // Update location input
        const locationInput = document.getElementById('complaint-location');
        if (locationInput) {
            const areaName = getAreaName(e.latlng.lat, e.latlng.lng);
            locationInput.value = areaName;
        }
        
        // Enable submit button
        const submitBtn = document.querySelector('#complaint-form-element button[type="submit"]');
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.style.opacity = '1';
            submitBtn.style.cursor = 'pointer';
        }
        
        // Show success feedback
        showLocationSelectedFeedback();
    });
}

// Centralized map click handler
function handleMapClick(e) {
    console.log('handleMapClick called with:', e.latlng, 'Form open:', isFormOpen);
    
    // Only allow location selection when form is open
    if (!isFormOpen) {
        console.log('Form not open, ignoring click');
        return;
    }
    
    // Prevent event bubbling
    if (e.originalEvent) {
        e.originalEvent.stopPropagation();
    }
    
    selectedLocation = e.latlng;
    console.log('Location selected:', selectedLocation);
    
    // Remove existing marker
    if (currentMarker) {
        map.removeLayer(currentMarker);
        console.log('Previous marker removed');
    }
    
    // Create new marker with custom red icon
    try {
        currentMarker = L.marker([e.latlng.lat, e.latlng.lng], {
            icon: L.icon({
                iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
                shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
                iconSize: [25, 41],
                iconAnchor: [12, 41],
                popupAnchor: [1, -34],
                shadowSize: [41, 41]
            })
        }).addTo(map);
        
        console.log('New marker added');
        
        // Update location input
        const areaName = getAreaName(e.latlng.lat, e.latlng.lng);
        const locationInput = document.getElementById('complaint-location');
        if (locationInput) {
            locationInput.value = areaName;
            console.log('Location input updated:', areaName);
        }
        
        // Show success popup
        currentMarker.bindPopup(`
            <div style="text-align: center; font-weight: bold; color: green;">
                ✅ Location Selected!<br>
                📍 ${areaName}
            </div>
        `).openPopup();
        
        // Enable submit button
        const submitBtn = document.querySelector('#complaint-form-element button[type="submit"]');
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.style.opacity = '1';
            submitBtn.style.cursor = 'pointer';
            console.log('Submit button enabled');
        }
        
        // Visual feedback
        showLocationSelectedFeedback();
        
    } catch (error) {
        console.error('Error creating marker:', error);
    }
}

// Visual feedback for location selection
function showLocationSelectedFeedback() {
    // Temporary visual feedback
    const mapContainer = document.getElementById('map');
    if (mapContainer) {
        mapContainer.style.border = '3px solid #28a745';
        setTimeout(() => {
            mapContainer.style.border = 'none';
        }, 1000);
    }
    
    // Show temporary success message
    showAlert('📍 Location selected successfully! You can now submit your complaint.', 'success');
}

// Initialize all event listeners
function initializeEventListeners() {
    console.log('Setting up event listeners...');
    
    // Report Issue button - GUARANTEED TO WORK
    const reportBtn = document.getElementById('add-complaint-btn');
    if (reportBtn) {
        // Remove any existing listeners
        reportBtn.replaceWith(reportBtn.cloneNode(true));
        const newReportBtn = document.getElementById('add-complaint-btn');
        
        newReportBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('Report button clicked');
            showComplaintForm();
        });
        
        console.log('Report button listener added');
    }
    
    // Cancel complaint button
    const cancelBtn = document.getElementById('cancel-complaint');
    if (cancelBtn) {
        cancelBtn.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('Cancel button clicked');
            hideComplaintForm();
        });
        console.log('Cancel button listener added');
    }
    
    // Refresh button
    const refreshBtn = document.getElementById('refresh-btn');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('Refresh button clicked');
            this.innerHTML = '<span class="loading"></span> Refreshing...';
            setTimeout(() => {
                loadIssues();
                showAlert('🔄 Data refreshed successfully!', 'success');
                this.textContent = '🔄 Refresh';
            }, 1000);
        });
        console.log('Refresh button listener added');
    }
    
    // Filter dropdown
    const filterSelect = document.getElementById('issue-type-filter');
    if (filterSelect) {
        filterSelect.addEventListener('change', function() {
            console.log('Filter changed to:', this.value);
            filterIssues();
        });
        console.log('Filter listener added');
    }
    
    // Form submission
    const complaintForm = document.getElementById('complaint-form-element');
    if (complaintForm) {
        complaintForm.addEventListener('submit', function(e) {
            e.preventDefault();
            console.log('Form submitted');
            handleComplaintSubmission(e);
        });
        console.log('Form submission listener added');
    }
    
    // Close form when clicking outside
    const formOverlay = document.getElementById('complaint-form');
    if (formOverlay) {
        formOverlay.addEventListener('click', function(e) {
            if (e.target === this) {
                console.log('Clicked outside form');
                hideComplaintForm();
            }
        });
        console.log('Form overlay listener added');
    }
    
    // Escape key to close form
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && isFormOpen) {
            console.log('Escape key pressed');
            hideComplaintForm();
        }
    });
    
    console.log('All event listeners set up successfully');
}

// Show complaint form with enhanced debugging
function showComplaintForm() {
    console.log('showComplaintForm called');
    
    isFormOpen = true;
    const formElement = document.getElementById('complaint-form');
    
    if (formElement) {
        formElement.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
        
        // Reset form and map state
        const form = document.getElementById('complaint-form-element');
        if (form) {
            form.reset();
        }
        
        if (currentMarker) {
            map.removeLayer(currentMarker);
            currentMarker = null;
        }
        selectedLocation = null;
        
        // Ensure map is clickable
        if (map) {
            map.getContainer().style.cursor = 'crosshair';
            // Refresh map click handler
            setupMapClickHandler();
        }
        
        // Show instruction popup
        const instructionPopup = L.popup({
            closeButton: false,
            autoClose: false,
            className: 'instruction-popup'
        })
        .setLatLng(map.getCenter())
        .setContent(`
            <div style="text-align: center; padding: 10px; font-weight: bold; color: #007bff;">
                🎯 Click anywhere on the map<br>
                to select the issue location
            </div>
        `)
        .openOn(map);
        
        setTimeout(() => {
            if (map.hasLayer(instructionPopup)) {
                map.closePopup(instructionPopup);
            }
        }, 5000);
    }
}

// Hide complaint form
function hideComplaintForm() {
    console.log('hideComplaintForm called');
    
    isFormOpen = false;
    const formElement = document.getElementById('complaint-form');
    
    if (formElement) {
        formElement.classList.add('hidden');
        document.body.style.overflow = 'auto';
        console.log('Form hidden, isFormOpen set to:', isFormOpen);
        
        // Reset form
        const form = document.getElementById('complaint-form-element');
        if (form) {
            form.reset();
        }
        
        // Remove marker
        if (currentMarker) {
            map.removeLayer(currentMarker);
            currentMarker = null;
            console.log('Marker removed');
        }
        
        selectedLocation = null;
        
        // Reset map cursor
        if (map) {
            map.getContainer().style.cursor = '';
        }
        
        console.log('Form hide complete');
    }
}

// Handle form submission
async function handleComplaintSubmission(e) {
    e.preventDefault();
    console.log('handleComplaintSubmission called');
    
    if (!selectedLocation) {
        console.log('No location selected');
        showAlert('❌ Please click on the map to select a location first!', 'error');
        
        // Flash the map to draw attention
        const mapContainer = document.getElementById('map');
        if (mapContainer) {
            mapContainer.style.border = '3px solid #dc3545';
            setTimeout(() => {
                mapContainer.style.border = 'none';
            }, 2000);
        }
        return;
    }
    
    const formData = new FormData(e.target);
    const complaintData = {
        issue_type: formData.get('type'),
        description: formData.get('description'),
        location: formData.get('location'),
        contact_number: formData.get('contact'),
        priority: formData.get('priority'),
        latitude: selectedLocation.lat,
        longitude: selectedLocation.lng
    };
    
    console.log('Submitting complaint:', complaintData);
    
    // Show loading state
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.innerHTML = '<span class="loading"></span> Submitting...';
    submitBtn.disabled = true;
    
    try {
        await simulateComplaintSubmission(complaintData);
        
        const referenceId = 'PLG' + Date.now().toString().slice(-6);
        showAlert(`✅ Complaint submitted successfully!<br>📋 Reference ID: ${referenceId}`, 'success');
        
        hideComplaintForm();
        loadIssues(); // Refresh the map
        
    } catch (error) {
        console.error('Error submitting complaint:', error);
        showAlert('❌ Failed to submit complaint. Please try again.', 'error');
    } finally {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
}

// Get area name based on coordinates
function getAreaName(lat, lng) {
    const areas = [
        { name: 'Palghar City', lat: 19.6961, lng: 72.7693, radius: 0.05 },
        { name: 'Vasai East', lat: 19.4034, lng: 72.8209, radius: 0.03 },
        { name: 'Vasai West', lat: 19.3912, lng: 72.8254, radius: 0.03 },
        { name: 'Virar West', lat: 19.4559, lng: 72.7971, radius: 0.03 },
        { name: 'Virar East', lat: 19.4578, lng: 72.7989, radius: 0.03 },
        { name: 'Nalasopara East', lat: 19.4239, lng: 72.7890, radius: 0.03 },
        { name: 'Nalasopara West', lat: 19.4156, lng: 72.7823, radius: 0.03 },
        { name: 'Boisar', lat: 19.8031, lng: 72.7569, radius: 0.04 },
        { name: 'Dahanu', lat: 19.9703, lng: 72.7344, radius: 0.04 }
    ];
    
    for (let area of areas) {
        const distance = Math.sqrt(
            Math.pow(lat - area.lat, 2) + Math.pow(lng - area.lng, 2)
        );
        if (distance <= area.radius) {
            return area.name + ', Palghar District';
        }
    }
    
    return `Location (${lat.toFixed(4)}, ${lng.toFixed(4)}), Palghar District`;
}

// Simulate API submission
function simulateComplaintSubmission(data) {
    return new Promise((resolve) => {
        setTimeout(() => {
            const newIssue = {
                id: 'PLG' + Date.now(),
                title: `${data.issue_type} - ${data.description.substring(0, 30)}...`,
                description: data.description,
                type: data.issue_type,
                priority: data.priority,
                status: 'pending',
                coordinates: [data.latitude, data.longitude],
                location: data.location,
                contact: data.contact_number,
                reporter: 'Current User',
                reported_date: new Date().toISOString().split('T')[0]
            };
            
            issuesData.push(newIssue);
            resolve(newIssue);
        }, 2000);
    });
}

// Load sample issues
async function loadIssues() {
    try {
        console.log('Loading issues...');
        issuesData = await loadSampleIssues();
        displayIssuesOnMap();
        updateComplaintsSidebar();
        console.log('Issues loaded successfully');
    } catch (error) {
        console.error('Error loading issues:', error);
        showAlert('Failed to load issues data', 'error');
    }
}

// Sample data
function loadSampleIssues() {
    return new Promise((resolve) => {
        setTimeout(() => {
            const sampleIssues = [
                {
                    id: 'PLG001',
                    title: 'Major Pothole on NH8',
                    description: 'Deep pothole causing accidents near Palghar Railway Station',
                    type: 'road',
                    priority: 'urgent',
                    status: 'pending',
                    coordinates: [19.6961, 72.7693],
                    location: 'Palghar Railway Station',
                    contact: '9876543210',
                    reporter: 'Ramesh Patil',
                    reported_date: '2025-01-25'
                },
                {
                    id: 'VAS001',
                    title: 'Water Pipeline Burst',
                    description: 'Major water leak on main road causing flooding',
                    type: 'water',
                    priority: 'urgent',
                    status: 'processing',
                    coordinates: [19.4056, 72.8234],
                    location: 'Vasai Junction',
                    contact: '9876543212',
                    reporter: 'Sunita Sharma',
                    reported_date: '2025-01-26'
                },
                {
                    id: 'VIR001',
                    title: 'Street Light Not Working',
                    description: 'Multiple street lights not working in residential area',
                    type: 'electricity',
                    priority: 'medium',
                    status: 'pending',
                    coordinates: [19.4559, 72.7971],
                    location: 'Virar West Station Road',
                    contact: '9876543210',
                    reporter: 'Vikash Joshi',
                    reported_date: '2025-01-21'
                },
                {
                    id: 'NAL001',
                    title: 'Garbage Collection Issue',
                    description: 'Garbage not collected for a week in residential area',
                    type: 'sanitation',
                    priority: 'high',
                    status: 'resolved',
                    coordinates: [19.4239, 72.7890],
                    location: 'Nalasopara East',
                    contact: '9876543210',
                    reporter: 'Priya Nair',
                    reported_date: '2025-01-20'
                }
            ];
            resolve(sampleIssues);
        }, 500);
    });
}

// Display issues on map
function displayIssuesOnMap() {
    if (!map) return;
    
    // Clear existing issue markers (preserve current selection marker)
    map.eachLayer(function(layer) {
        if (layer instanceof L.Marker && layer !== currentMarker) {
            map.removeLayer(layer);
        }
    });
    
    // Add issue markers
    issuesData.forEach(issue => {
        const marker = createIssueMarker(issue);
        marker.addTo(map);
    });
}

// Create issue marker
function createIssueMarker(issue) {
    const iconColor = getPriorityColor(issue.priority);
    const iconUrl = `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-${iconColor}.png`;
    
    const marker = L.marker(issue.coordinates, {
        icon: L.icon({
            iconUrl: iconUrl,
            shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            shadowSize: [41, 41]
        })
    });
    
    const statusEmoji = issue.status === 'resolved' ? '✅' : issue.status === 'processing' ? '🔄' : '⏳';
    const priorityEmoji = {
        'urgent': '🔴',
        'high': '🟠',
        'medium': '🟡',
        'low': '🟢'
    };
    
    const popupContent = `
        <div class="issue-popup" style="min-width: 250px;">
            <h4 style="margin: 0 0 10px 0; color: #333; font-size: 1.1rem;">${issue.title}</h4>
            <p style="margin: 5px 0;"><strong>🏷️ Type:</strong> ${issue.type}</p>
            <p style="margin: 5px 0;"><strong>⚠️ Priority:</strong> ${priorityEmoji[issue.priority]} ${issue.priority.toUpperCase()}</p>
            <p style="margin: 5px 0;"><strong>📊 Status:</strong> ${statusEmoji} ${issue.status.toUpperCase()}</p>
            <p style="margin: 5px 0;"><strong>📝 Description:</strong> ${issue.description}</p>
            <p style="margin: 5px 0;"><strong>📅 Reported:</strong> ${issue.reported_date}</p>
            <p style="margin: 5px 0;"><strong>📍 Location:</strong> ${issue.location}</p>
        </div>
    `;
    
    marker.bindPopup(popupContent);
    return marker;
}

// Get priority color
function getPriorityColor(priority) {
    const colors = {
        'urgent': 'red',
        'high': 'orange',
        'medium': 'yellow',
        'low': 'green'
    };
    return colors[priority] || 'blue';
}

// Filter issues
function filterIssues() {
    const filterValue = document.getElementById('issue-type-filter').value;
    
    if (filterValue === '') {
        displayIssuesOnMap();
    } else {
        map.eachLayer(function(layer) {
            if (layer instanceof L.Marker && layer !== currentMarker) {
                map.removeLayer(layer);
            }
        });
        
        const filteredIssues = issuesData.filter(issue => issue.type === filterValue);
        filteredIssues.forEach(issue => {
            const marker = createIssueMarker(issue);
            marker.addTo(map);
        });
    }
    
    updateComplaintsSidebar(filterValue);
}

// Update sidebar
function updateComplaintsSidebar(filter = '') {
    const sidebar = document.getElementById('area-complaints');
    if (!sidebar) return;
    
    const filteredIssues = filter ? issuesData.filter(issue => issue.type === filter) : issuesData;
    
    if (filteredIssues.length === 0) {
        sidebar.innerHTML = '<p style="text-align: center; color: #666;">No complaints found.</p>';
        return;
    }
    
    sidebar.innerHTML = filteredIssues.map(issue => {
        const statusClass = `status-${issue.status}`;
        const priorityEmoji = {
            'urgent': '🔴',
            'high': '🟠',
            'medium': '🟡',
            'low': '🟢'
        };
        
        return `
            <div class="complaint-item" onclick="focusIssue(${issue.coordinates[0]}, ${issue.coordinates[1]})" style="cursor: pointer;">
                <h4>${issue.title}</h4>
                <p>${issue.description.substring(0, 80)}...</p>
                <p><strong>📍 Location:</strong> ${issue.location}</p>
                <p><strong>⚠️ Priority:</strong> ${priorityEmoji[issue.priority]} ${issue.priority}</p>
                <span class="complaint-status ${statusClass}">${issue.status}</span>
            </div>
        `;
    }).join('');
}

// Focus on issue
function focusIssue(lat, lng) {
    if (map) {
        map.setView([lat, lng], 15);
    }
}

// Enhanced alert system
function showAlert(message, type) {
    const existingAlerts = document.querySelectorAll('.alert');
    existingAlerts.forEach(alert => alert.remove());
    
    const alert = document.createElement('div');
    alert.className = `alert alert-${type}`;
    alert.innerHTML = message; // Use innerHTML to support HTML content
    
    alert.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 3000;
        max-width: 350px;
        padding: 15px 20px;
        border-radius: 8px;
        font-weight: 600;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        transform: translateX(100%);
        transition: transform 0.3s ease;
    `;
    
    if (type === 'success') {
        alert.style.background = '#d4edda';
        alert.style.color = '#155724';
        alert.style.border = '1px solid #c3e6cb';
    } else if (type === 'error') {
        alert.style.background = '#f8d7da';
        alert.style.color = '#721c24';
        alert.style.border = '1px solid #f5c6cb';
    }
    
    document.body.appendChild(alert);
    
    setTimeout(() => {
        alert.style.transform = 'translateX(0)';
    }, 100);
    
    setTimeout(() => {
        if (alert.parentNode) {
            alert.style.transform = 'translateX(100%)';
            setTimeout(() => alert.remove(), 300);
        }
    }, 5000);
}

// Global function exports
window.showComplaintForm = showComplaintForm;
window.hideComplaintForm = hideComplaintForm;
window.loadIssues = loadIssues;
window.focusIssue = focusIssue;

// Debug helper - Remove in production
window.debugMap = function() {
    console.log('Map object:', map);
    console.log('Form open:', isFormOpen);
    console.log('Selected location:', selectedLocation);
    console.log('Current marker:', currentMarker);
};
