var module = angular.module("myModule", []);

module.controller("myController", function ($scope, $http) {
    // Client email, obtained from localStorage or a global variable (e.g., set after login)
    $scope.clientEmail = localStorage.getItem('clientEmail') || 'dummy_client@example.com';

    $scope.cities = [];
    $scope.selectedCategory = '';
    $scope.influencers = [];
    $scope.selectedInfluencer = {}; 
    $scope.searchName = ''; 


    // Initialize and fetch cities based on selected category on load
    $scope.init = function () {
        $scope.updateCities();
      
    };

    // Updates the list of cities based on the selected category
    $scope.updateCities = function () {
        let field = $scope.selectedCategory || '';
        let url = "/update-cities"; // Backend endpoint to get cities

        $http.get(url, { params: { field: field } })
            .then(function (response) {
                // Ensure response.data is an array and map it
                if (Array.isArray(response.data)) {
                    $scope.cities = response.data.map((cityObj) => cityObj.city);
                } else {
                    console.warn('Backend /update-cities did not return an array:', response.data);
                    $scope.cities = [];
                }
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
            location: $scope.selectedCity, // Ensure $scope.selectedCity is set from your HTML select
            name: $scope.searchName || '',
        };

        console.log("Searching with:", params);

        $http.get('/search-influencers', { params: params }) // Use your actual backend endpoint
            .then(function (response) {
                $scope.influencers = response.data; // Assume backend returns a list of influencer objects
                
                $scope.influencers.forEach(function (inf) {
                    // console.log('Image path:', '/uploads/' + inf.pic); // Uncomment for debugging image paths
                    inf.isSaved = false; // Default to not saved
                    inf.isSaving = false; // Default to not saving
                });

                // After influencers are loaded, check their saved status
                $scope.checkSavedStatus();

                if ($scope.influencers.length === 0) {
                    showToast('Info', 'No influencers found matching your criteria.', 'info');
                } else {
                    showToast('Success', `${$scope.influencers.length} influencers found!`, 'success');
                }
            })
            .catch(function (err) {
                console.error('Error searching influencers:', err);
                showToast('Error', 'Failed to search for influencers.', 'error'); // Use custom toast
            });
            // NO $scope.$apply() here, $http handles it.
    };

    // Shows details of a selected influencer in a modal
    $scope.showDetails = function (influencer) {
        $scope.selectedInfluencer = angular.copy(influencer); // Use angular.copy to prevent direct modification
        // These properties should ideally be copied from the main list's influencer object
        // if they are updated dynamically.
        // $scope.selectedInfluencer.isSaved = influencer.isSaved; // Already part of angular.copy if present
        // $scope.selectedInfluencer.isSaving = influencer.isSaving; // Already part of angular.copy if present

        new bootstrap.Modal(document.getElementById('influencerModal')).show();
    };

$scope.contactInfluencer = function (influencer) {
    const adminEmail = 'aksh.devproj@gmail.com'; // admin email
    const influencerEmail = influencer.emailid; // Influencer's email from the object
    const influencerName = influencer.name;     // Influencer's name from the object

    if (!influencerEmail) {
        showToast('Error', 'Influencer email not available.', 'error');
        return;
    }

    // You can customize this message as needed
    const subject = `Collaboration Opportunity with ${influencerName} from StarWave`;
    const messageBody = `Dear ${influencerName},\n\n` +
                        `We hope this email finds you well. \n\n` +
                        `We are reaching out from StarWave, a platform dedicated to connecting brands and creators. ` +
                        `We are highly impressed by your work in the ${influencer.field} category, particularly your content around ${influencer.city}. ` +
                        `We believe your unique style and audience align perfectly with potential collaboration opportunities we have.\n\n` +
                        `Would you be open to discussing potential partnerships and how we can work together? ` +
                        `Please let us know your availability for a brief call or if you prefer to communicate via email.\n\n` +
                        `Looking forward to hearing from you soon.\n\n` +
                        `Best regards,\n` +
                        `The StarWave Team\n` +
                        `Contact: ${adminEmail}`;

    const requestData = {
        to: influencerEmail,
        subject: subject,
        text: messageBody
    };

    // Show a toast immediately to indicate email is being sent
    showToast('Sending', `Sending email to ${influencerName}...`, 'info', 5000); // Longer duration

    $http.post('/api/send-contact-email', requestData) // New backend endpoint
        .then(function (response) {
            showToast('Success', response.data.message || `Email sent to ${influencerName}!`, 'success');

         
            const influencerModalElement = document.getElementById('influencerModal');
            const influencerModal = bootstrap.Modal.getInstance(influencerModalElement);
            if (influencerModal) {
                influencerModal.hide();
            } else {
                new bootstrap.Modal(influencerModalElement).hide();
            }

        })
        .catch(function (error) {
            console.error('Error sending contact email:', error);
            let errorMessage = 'Failed to send email. Please try again.';
            if (error.data && error.data.message) {
                errorMessage = error.data.message;
            }
            showToast('Error', errorMessage, 'error');
        });
};

    /**
     * Saves an influencer for the current client.
     * @param {string} iemail - The influencer's email ID.
     * @param {string} influencerName - The influencer's name.
     */
    $scope.saveInfluencer = function(iemail, influencerName) {
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
                    // No need for $scope.$apply() here.
                }
                showToast('Success', response.data.message || `'${influencerName}' saved successfully!`, 'success');
            })
            .catch(function(error) {
                if (influencerToUpdate) {
                    influencerToUpdate.isSaving = false; // Reset saving state on error
                    // No need for $scope.$apply() here.
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
            });
            // Removed .finally() with $scope.$apply() - $http handles the digest.
    };

    
    $scope.checkSavedStatus = function() {
        if (!$scope.influencers || $scope.influencers.length === 0) return;

        $http.get('/api/get-saved-influencers', {
            params: { cemail: $scope.clientEmail }
        })
        .then(function(response) {
            if (Array.isArray(response.data)) {
                const savedEmails = new Set(response.data.map(item => item.emailid)); // Assuming saved list returns emailid

                $scope.influencers.forEach(function(influencer) {
                    influencer.isSaved = savedEmails.has(influencer.emailid);
                });

                // If the details modal is open, ensure its influencer's saved status is updated too
                if ($scope.selectedInfluencer && $scope.selectedInfluencer.emailid) {
                    const modalInfluencerInList = $scope.influencers.find(inf => inf.emailid === $scope.selectedInfluencer.emailid);
                    if (modalInfluencerInList) {
                        $scope.selectedInfluencer.isSaved = modalInfluencerInList.isSaved;
                    }
                }
            } else {
                console.warn('Backend /api/get-saved-influencers did not return an array:', response.data);
            }
        })
        .catch(function(error) {
            console.error('Error checking saved status:', error);
            showToast('Error', 'Failed to check saved statuses for influencers.', 'error');
        });
        // Removed .finally() with $scope.$apply() - $http handles the digest.
    };

    // Immediately call init to set up initial state
    $scope.init();
});

// Custom Toast Notification Function (defined globally) - Keep this as is
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