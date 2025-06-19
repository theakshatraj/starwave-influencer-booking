// Global variables
let clientEmail = localStorage.getItem('clientEmail') || 'demo@client.com'; // Replace with actual logic
let savedInfluencers = [];
let currentInfluencerToRemove = null;

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
    loadSavedInfluencers();
});

// Function to get image URL (handles both Cloudinary URLs and fallback)
function getImageUrl(picData) {
    // If picData is empty, null, or undefined, return default
    if (!picData || picData.trim() === '') {
        return 'https://via.placeholder.com/150x150/6c757d/ffffff?text=No+Image';
    }
    
    // If it's already a full URL (Cloudinary), return as is
    if (picData.startsWith('http://') || picData.startsWith('https://')) {
        return picData;
    }
    
    // If it's a local path, construct the full URL
    if (picData.startsWith('/uploads/') || picData.startsWith('uploads/')) {
        return picData.startsWith('/') ? picData : `/${picData}`;
    }
    
    // Default fallback
    return 'https://via.placeholder.com/150x150/6c757d/ffffff?text=No+Image';
}

// Load saved influencers from API
async function loadSavedInfluencers() {
    try {
        showLoading(true);
        
        const response = await fetch(`/api/get-saved-influencers?cemail=${encodeURIComponent(clientEmail)}`);
        
        if (!response.ok) {
            throw new Error('Failed to fetch saved influencers');
        }
        
        const data = await response.json();
        savedInfluencers = data;
        
        showLoading(false);
        
        if (savedInfluencers.length === 0) {
            showEmptyState();
        } else {
            renderInfluencers();
        }
        
    } catch (error) {
        console.error('Error loading saved influencers:', error);
        showLoading(false);
        showToast('Error', 'Failed to load saved influencers. Please try again.', 'error');
    }
}

// Show/hide loading state
function showLoading(show) {
    const loadingContainer = document.getElementById('loadingContainer');
    const influencersGrid = document.getElementById('influencersGrid');
    const emptyState = document.getElementById('emptyState');
    
    if (show) {
        loadingContainer.style.display = 'block';
        influencersGrid.style.display = 'none';
        emptyState.style.display = 'none';
    } else {
        loadingContainer.style.display = 'none';
    }
}

// Show empty state
function showEmptyState() {
    const emptyState = document.getElementById('emptyState');
    const influencersGrid = document.getElementById('influencersGrid');
    
    emptyState.style.display = 'block';
    influencersGrid.style.display = 'none';
}

// Render influencer cards
function renderInfluencers() {
    const grid = document.getElementById('influencersGrid');
    const emptyState = document.getElementById('emptyState');
    
    grid.innerHTML = '';
    
    savedInfluencers.forEach(influencer => {
        const card = createInfluencerCard(influencer);
        grid.appendChild(card);
    });
    
    grid.style.display = 'grid';
    emptyState.style.display = 'none';
}

// Create influencer card element
function createInfluencerCard(influencer) {
    const card = document.createElement('div');
    card.className = 'influencer-card';
    
    const imageUrl = getImageUrl(influencer.pic);
    
    card.innerHTML = `
        <div class="card-header">
            <div class="saved-badge">
                <i class="bi bi-bookmark-fill me-1"></i>Saved
            </div>
            <img src="${imageUrl}" 
                 class="rounded-circle profile-image" 
                 alt="${influencer.name}"
                 onerror="this.src='https://via.placeholder.com/150x150/6c757d/ffffff?text=No+Image'">
        </div>
        <div class="card-body">
            <h5 class="card-title">${influencer.name}</h5>
            <div class="card-text">
                <p><strong>Fields:</strong> ${influencer.field}</p>
                <p><strong>City:</strong> ${influencer.city}</p>
                <p><strong>Saved:</strong> ${new Date(influencer.saved_at).toLocaleDateString()}</p>
            </div>
            
            ${(influencer.insta || influencer.youtube) ? `
                <div class="social-links">
                    ${influencer.insta ? `
                        <a href="https://instagram.com/${influencer.insta}" target="_blank" class="social-btn instagram">
                            <i class="bi bi-instagram"></i> Instagram
                        </a>
                    ` : ''}
                    ${influencer.youtube ? `
                        <a href="https://youtube.com/${influencer.youtube}" target="_blank" class="social-btn youtube">
                            <i class="bi bi-youtube"></i> YouTube
                        </a>
                    ` : ''}
                </div>
            ` : ''}
        </div>
        <div class="card-footer">
            <button class="btn btn-primary-action" onclick="showInfluencerDetails('${influencer.emailid}')">
                <i class="bi bi-eye me-2"></i>More Details
            </button>
            <button class="btn btn-remove" onclick="confirmRemoveInfluencer('${influencer.emailid}', '${influencer.name}')">
                <i class="bi bi-trash me-2"></i>Remove
            </button>
        </div>
    `;
    
    return card;
}

// Show influencer details in modal
function showInfluencerDetails(emailid) {
    const influencer = savedInfluencers.find(inf => inf.emailid === emailid);
    if (!influencer) return;
    
    const imageUrl = getImageUrl(influencer.pic);
    
    // Populate modal
    document.getElementById('modalInfluencerName').textContent = influencer.name;
    document.getElementById('modalProfileImage').src = imageUrl;
    document.getElementById('modalProfileImage').alt = influencer.name;
    
    const modalInfo = document.getElementById('modalInfo');
    modalInfo.innerHTML = `
        <div class="row">
            <div class="col-md-6">
                <p><strong>Gender:</strong> ${influencer.gender || 'Not specified'}</p>
                <p><strong>Date of Birth:</strong> ${influencer.dob || 'Not specified'}</p>
                <p><strong>City:</strong> ${influencer.city}</p>
                <p><strong>Contact:</strong> ${influencer.contact || 'Not specified'}</p>
            </div>
            <div class="col-md-6">
                <p><strong>Fields:</strong> ${influencer.field}</p>
                <p><strong>Address:</strong> ${influencer.address || 'Not specified'}</p>
                <p><strong>Email:</strong> ${influencer.emailid}</p>
                <p><strong>Saved:</strong> ${new Date(influencer.saved_at).toLocaleDateString()}</p>
            </div>
        </div>
        
        ${(influencer.insta || influencer.youtube) ? `
            <div class="social-links mt-3">
                ${influencer.insta ? `
                    <a href="https://instagram.com/${influencer.insta}" target="_blank" class="social-btn instagram">
                        <i class="bi bi-instagram"></i> Instagram
                    </a>
                ` : ''}
                ${influencer.youtube ? `
                    <a href="https://youtube.com/${influencer.youtube}" target="_blank" class="social-btn youtube">
                        <i class="bi bi-youtube"></i> YouTube
                    </a>
                ` : ''}
            </div>
        ` : ''}
        
        ${influencer.otherinfo ? `
            <div class="bio-section">
                <h6><i class="bi bi-person-lines-fill me-2"></i>Bio</h6>
                <p>${influencer.otherinfo}</p>
            </div>
        ` : ''}
    `;
    
    // Show modal
    const modal = new bootstrap.Modal(document.getElementById('influencerModal'));
    modal.show();
}

// Confirm removal of influencer
function confirmRemoveInfluencer(emailid, name) {
    currentInfluencerToRemove = emailid;
    document.getElementById('confirmInfluencerName').textContent = name;
    
    const modal = new bootstrap.Modal(document.getElementById('confirmationModal'));
    modal.show();
}

// Handle confirmed removal
document.getElementById('confirmRemoveBtn').addEventListener('click', async function() {
    if (!currentInfluencerToRemove) return;
    
    try {
        const button = this;
        button.disabled = true;
        button.innerHTML = '<i class="bi bi-spinner-border spinner-border-sm me-2"></i>Removing...';
        
        const response = await fetch('/api/remove-saved-influencer', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                cemail: clientEmail,
                iemail: currentInfluencerToRemove
            })
        });
        
        const result = await response.json();
        
        if (response.ok) {
            // Remove from local array
            savedInfluencers = savedInfluencers.filter(inf => inf.emailid !== currentInfluencerToRemove);
            
            // Re-render
            if (savedInfluencers.length === 0) {
                showEmptyState();
            } else {
                renderInfluencers();
            }
            
            showToast('Success', result.message, 'success');
        } else {
            showToast('Error', result.message, 'error');
        }
        
    } catch (error) {
        console.error('Error removing influencer:', error);
        showToast('Error', 'Failed to remove influencer. Please try again.', 'error');
    } finally {
        // Reset button and close modal
        const button = document.getElementById('confirmRemoveBtn');
        button.disabled = false;
        button.innerHTML = '<i class="bi bi-trash me-2"></i>Remove';
        
        const modal = bootstrap.Modal.getInstance(document.getElementById('confirmationModal'));
        modal.hide();
        
        currentInfluencerToRemove = null;
    }
});

// Toast notification function
function showToast(title, message, type) {
    const toastContainer = document.querySelector('.toast-container');
    const toastId = 'toast-' + Date.now();
    
    const bgClass = type === 'success' ? 'bg-success' : 'bg-danger';
    
    const toastHtml = `
        <div id="${toastId}" class="toast align-items-center text-white ${bgClass} border-0" role="alert" aria-live="assertive" aria-atomic="true">
            <div class="d-flex">
                <div class="toast-body">
                    <strong>${title}:</strong> ${message}
                </div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
            </div>
        </div>
    `;
    
    toastContainer.insertAdjacentHTML('beforeend', toastHtml);
    
    const toastElement = document.getElementById(toastId);
    const toast = new bootstrap.Toast(toastElement, {
        autohide: true,
        delay: 3000
    });
    
    toast.show();
    
    // Remove from DOM after hide
    toastElement.addEventListener('hidden.bs.toast', function() {
        toastElement.remove();
    });
}

// Handle image loading errors - updated to use placeholder
document.addEventListener('error', function(e) {
    if (e.target.tagName === 'IMG') {
        e.target.src = 'https://via.placeholder.com/150x150/6c757d/ffffff?text=No+Image';
    }
}, true);
