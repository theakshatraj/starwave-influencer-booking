var module = angular.module("myModule", []);

module.controller("myController", function ($scope, $http) {
    // Client email, obtained from localStorage or a global variable (e.g., set after login)
    $scope.clientEmail = localStorage.getItem('clientEmail') || 'dummy_client@example.com';

    $scope.cities = [];
    $scope.selectedCategory = '';
    $scope.influencers = [];
    $scope.selectedInfluencer = {}; // Stores the influencer object for the details modal

    // Dummy data for categories and cities (replace with actual API calls later if needed)
    const allCities = {
        "Technology": ["Bengaluru", "Hyderabad", "Pune"],
        "Finance": ["Mumbai", "Ahmedabad", "Delhi"],
        "Business": ["Mumbai", "Bengaluru", "Delhi"],
        "Content Creator": ["Mumbai", "Delhi", "Bengaluru", "Chennai"],
        "Singer": ["Mumbai", "Delhi", "Kolkata"],
        "Dancer": ["Mumbai", "Chennai", "Delhi"],
        "Actor": ["Mumbai", "Delhi"],
        "Education": ["Delhi", "Pune", "Bengaluru"],
        "Health": ["Mumbai", "Delhi", "Chennai"]
    };

    // Initialize and fetch cities based on selected category on load
    $scope.init = function () {
        $scope.updateCities();
        // After initial load, check saved status
        $scope.checkSavedStatus();
    };

    // Updates the list of cities based on the selected category
    $scope.updateCities = function () {
        let field = $scope.selectedCategory || '';
        let url = "/update-cities"; // Backend endpoint to get cities

        $http.get(url, { params: { field: field } })
            .then(function (response) {
                $scope.cities = response.data.map((cityObj) => cityObj.city);
            })
            .catch(function (err) {
                console.error('Error fetching cities:', err);
                showToast('Error', 'Failed to load cities.', 'error'); // Use custom toast
            });
    };

    // Fetches and displays influencers based on selected filters
    $scope.searchInfluencers = function () {
        let params = {
            category: $scope.selectedCategory,
            location: $scope.selectedCity,
            name: $scope.searchName || '', // Get the name from input
        };

        // In a real application, this would be an API call to your backend
        // For demonstration, we'll simulate filtering dummy data.
        console.log("Searching with:", params);

        // Simulate backend data fetching
        $http.get('/search-influencers', { params: params }) // Use your actual backend endpoint
            .then(function (response) {
                $scope.influencers = response.data; // Assume backend returns a list of influencer objects
                // Log image paths for verification (remove in production)
                $scope.influencers.forEach(function (inf) {
                    console.log('Image path:', '/uploads/' + inf.pic);
                    // Initialize isSaved and isSaving properties for each influencer
                    inf.isSaved = false;
                    inf.isSaving = false;
                });
                // After influencers are loaded, check their saved status
                $scope.checkSavedStatus();

                if ($scope.influencers.length === 0) {
                    showToast('Info', 'No influencers found matching your criteria.', 'info');
                }
            })
            .catch(function (err) {
                console.error('Error searching influencers:', err);
                showToast('Error', 'Failed to search for influencers.', 'error'); // Use custom toast
            });
    };

    // Shows details of a selected influencer in a modal
    $scope.showDetails = function (influencer) {
        $scope.selectedInfluencer = angular.copy(influencer); // Use angular.copy to prevent direct modification
        // Ensure isSaved and isSaving properties are propagated to the modal's selectedInfluencer
        // (These properties should ideally be fetched from the backend when the modal opens if not already on the object)
        $scope.selectedInfluencer.isSaved = influencer.isSaved;
        $scope.selectedInfluencer.isSaving = influencer.isSaving;

        // If the modal is already open and you want to ensure the button state is fresh
        // you might call a specific check for this single influencer.
        // For now, assume it's copied from the card state.

        new bootstrap.Modal(document.getElementById('influencerModal')).show();
    };

    /**
     * Saves an influencer for the current client.
     * @param {string} iemail - The influencer's email ID.
     * @param {string} influencerName - The influencer's name.
     */
    $scope.saveInfluencer = function(iemail, influencerName) {
        // Find the specific influencer object in the list
        const influencerToUpdate = $scope.influencers.find(inf => inf.emailid === iemail);

        if (influencerToUpdate && influencerToUpdate.isSaving) {
            showToast('Info', 'Influencer is already being saved.', 'info');
            return;
        }
        if (influencerToUpdate && influencerToUpdate.isSaved) {
            showToast('Info', `'${influencerName}' is already in your saved list.`, 'info');
            return;
        }

        if (influencerToUpdate) {
            influencerToUpdate.isSaving = true; // Set saving state
        }

        const requestData = {
            cemail: $scope.clientEmail,
            iemail: iemail
        };

        $http.post('/api/save-influencer', requestData) // Your backend API endpoint
            .then(function(response) {
                if (influencerToUpdate) {
                    influencerToUpdate.isSaved = true; // Mark as saved on success
                    influencerToUpdate.isSaving = false; // Reset saving state
                }
                showToast('Success', response.data.message || `'${influencerName}' saved successfully!`, 'success');
            })
            .catch(function(error) {
                if (influencerToUpdate) {
                    influencerToUpdate.isSaving = false; // Reset saving state on error
                }
                console.error('Error saving influencer:', error);
                let errorMessage = 'Failed to save influencer.';
                if (error.data && error.data.message) {
                    errorMessage = error.data.message;
                } else if (error.status === 409) { // Example for "already saved" conflict
                    errorMessage = `'${influencerName}' is already saved.`;
                    if (influencerToUpdate) influencerToUpdate.isSaved = true; // Ensure UI is updated
                }
                showToast('Error', errorMessage, 'error');
            })
            .finally(function() {
                // Manually apply scope changes if not automatically detected (common after async ops)
                $scope.$apply();
            });
    };

    /**
     * Checks the saved status for all influencers currently displayed.
     * This function should be called after `searchInfluencers` updates the list.
     */
    $scope.checkSavedStatus = function() {
        if (!$scope.influencers || $scope.influencers.length === 0) return;

        // Fetch saved influencers for the current client first
        $http.get('/api/get-saved-influencers', {
            params: { cemail: $scope.clientEmail }
        })
        .then(function(response) {
            const savedEmails = new Set(response.data.map(item => item.emailid)); // Assuming saved list returns emailid

            $scope.influencers.forEach(function(influencer) {
                // Update the isSaved property based on the fetched list
                influencer.isSaved = savedEmails.has(influencer.emailid);
            });

            // If the details modal is open, ensure its influencer's saved status is updated too
            if ($scope.selectedInfluencer && $scope.selectedInfluencer.emailid) {
                const modalInfluencerInList = $scope.influencers.find(inf => inf.emailid === $scope.selectedInfluencer.emailid);
                if (modalInfluencerInList) {
                    $scope.selectedInfluencer.isSaved = modalInfluencerInList.isSaved;
                }
            }
        })
        .catch(function(error) {
            console.error('Error checking saved status:', error);
            showToast('Error', 'Failed to check saved statuses for influencers.', 'error');
        })
        .finally(function() {
             $scope.$apply(); // Ensure UI updates are reflected
        });
    };

    // Immediately call checkSavedStatus after search results are loaded
    // This is now handled within the .then() block of searchInfluencers for cleaner flow.
});

// Custom Toast Notification Function (defined globally)
/**
 * Displays a custom toast notification.
 * @param {string} title - The title of the toast (e.g., "Success", "Error").
 * @param {string} message - The main message content of the toast.
 * @param {string} type - The type of toast ('success', 'error', 'info').
 * @param {number} [duration=3000] - Duration in milliseconds before auto-hiding.
 */
function showToast(title, message, type, duration = 3000) {
    const toastContainer = document.querySelector('.toast-container');
    if (!toastContainer) {
        console.error("Toast container not found. Make sure a <div class='toast-container'> exists in your HTML.");
        return;
    }

    const toastId = 'toast-' + Date.now();
    let bgClass = '';
    switch (type) {
        case 'success': bgClass = 'bg-success'; break;
        case 'error': bgClass = 'bg-danger'; break;
        case 'info': bgClass = 'bg-info'; break;
        default: bgClass = 'bg-primary'; // Default if type is not recognized
    }

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
        delay: duration
    });

    toast.show();

    // Remove from DOM after hide
    toastElement.addEventListener('hidden.bs.toast', function() {
        toastElement.remove();
    }, { once: true }); // Use { once: true } to remove the listener after it fires
}
