var app = angular.module("influencerProfileApp", []);

app.controller("influencerProfileCtrl", function ($scope, $http) {
    // Initialize influencer data model
    $scope.influencer = {
        emailid: localStorage.getItem("influencerEmail") || "influencer@example.com", // Get email from localStorage or default
        name: "",
        gender: "",
        dob: "",
        address: "",
        city: "",
        contact: "",
        field: [], // Use array for multiple selection
        insta: "",
        youtube: "",
        otherinfo: "",
        pic: "" // To store the path to the picture
    };

    $scope.showPreview = false; // Controls the visibility of the image preview div

    // Initialize function to load profile data on page load
    $scope.init = function () {
        // Removed: $scope.searchInfluencer();
        // The form will now start empty. The user will click 'Search' to prefill if a profile exists.
    };

    /**
     * Handles file input change event for profile picture upload.
     * Updates the image preview.
     * @param {FileList} files - The file list from the input event.
     */
    $scope.handleFileChange = function(files) {
        if (files && files[0]) {
            const file = files[0];
            // Basic file type and size validation
            if (!file.type.startsWith('image/')) {
                showToast('Validation Error', 'Please upload an image file.', 'error');
                // Clear the file input if invalid
                document.getElementById('picUpload').value = '';
                $scope.showPreview = false;
                $scope.influencer.pic = ''; // Clear image path in model
                return;
            }
            if (file.size > 5 * 1024 * 1024) { // Max 5MB
                showToast('Validation Error', 'File size should be less than 5MB.', 'error');
                // Clear the file input if invalid
                document.getElementById('picUpload').value = '';
                $scope.showPreview = false;
                $scope.influencer.pic = ''; // Clear image path in model
                return;
            }

            const reader = new FileReader();
            reader.onload = function(e) {
                const previewElement = document.getElementById('preview');
                if (previewElement) {
                    previewElement.src = e.target.result;
                    $scope.showPreview = true; // Show the preview div
                    // No need to update influencer.pic here, it's for display only.
                    // The actual file will be part of the form data for submit/update.
                    $scope.$apply(); // Manually update scope
                }
            };
            reader.readAsDataURL(file);
        } else {
            $scope.showPreview = false;
            $scope.influencer.pic = ''; // Clear image path in model if no file selected
            $scope.$apply();
        }
    };

    /**
     * Searches for an influencer's profile based on the email ID.
     * This simulates fetching existing profile data.
     */
    $scope.searchInfluencer = function() {
        const iemail = $scope.influencer.emailid;
        if (!iemail) {
            showToast('Error', 'Please enter an email ID to search.', 'error');
            return;
        }

        // Simulate API call to backend to fetch influencer profile
        // In a real app: $http.get('/api/influencer-profile?emailid=' + iemail)
        console.log("Searching for influencer:", iemail);

        // Dummy data simulation based on the example structure
        const dummyProfileData = {
            "influencer@example.com": {
                name: "John Doe",
                gender: "Male",
                dob: "1990-01-15",
                address: "123 Street, Cityville",
                city: "Mumbai",
                contact: "9876543210",
                field: ["Technology", "Gaming"],
                insta: "johndoe_influ",
                youtube: "johndoegaming",
                otherinfo: "Passionate gamer and tech reviewer.",
                pic: "dummy-profile.jpg" // Assuming a dummy image path
            }
        };

        if (dummyProfileData[iemail]) {
            $scope.influencer = { ...$scope.influencer, ...dummyProfileData[iemail] }; // Merge data
            // Convert DOB string to Date object for date input field
            if ($scope.influencer.dob) {
                $scope.influencer.dob = new Date($scope.influencer.dob);
            }
            $scope.showPreview = true; // Show preview if pic exists
            showToast('Success', 'Influencer profile loaded successfully.', 'success');
        } else {
            // Reset all fields except emailid if not found
            $scope.influencer.name = "";
            $scope.influencer.gender = "";
            $scope.influencer.dob = "";
            $scope.influencer.address = "";
            $scope.influencer.city = "";
            $scope.influencer.contact = "";
            $scope.influencer.field = [];
            $scope.influencer.insta = "";
            $scope.influencer.youtube = "";
            $scope.influencer.otherinfo = "";
            $scope.influencer.pic = ""; // Clear existing pic path
            $scope.showPreview = false;
            showToast('Info', 'Influencer profile not found. You can create a new one.', 'info');
        }
    };


    /**
     * Validates contact number.
     * @param {string} contact - The contact number to validate.
     * @returns {boolean} True if valid, false otherwise.
     */
    function validateContact(contact) {
        return /^\d{10}$/.test(contact);
    }

    /**
     * Submits or updates the influencer profile.
     * @param {string} actionType - 'submit' for new creation, 'update' for existing.
     */
    $scope.submitForm = function (actionType) {
        if ($scope.profileForm.$invalid) {
            showToast('Validation Error', 'Please fill in all required fields correctly.', 'error');
            return;
        }

        if (!validateContact($scope.influencer.contact)) {
            showToast('Validation Error', 'Please enter a valid 10-digit contact number.', 'error');
            return;
        }

        // Convert Date object back to YYYY-MM-DD string for backend
        const dataToSend = angular.copy($scope.influencer);
        if (dataToSend.dob instanceof Date) {
            dataToSend.dob = dataToSend.dob.toISOString().split('T')[0];
        }

        const formData = new FormData();
        // Append all text fields
        for (const key in dataToSend) {
            if (dataToSend.hasOwnProperty(key) && key !== 'pic') { // Exclude 'pic' as it's handled separately if it's a URL
                // Handle arrays (e.g., 'field' multiple select)
                if (Array.isArray(dataToSend[key])) {
                    dataToSend[key].forEach(item => formData.append(key, item));
                } else {
                    formData.append(key, dataToSend[key]);
                }
            }
        }

        // Append the file if selected
        const picFile = document.getElementById('picUpload').files[0];
        if (picFile) {
            formData.append('picUpload', picFile);
        }

        const url = actionType === "submit" ? "/profile-submit" : "/profile-update";

        // Use $http with FormData for file uploads
        $http.post(url, formData, {
            transformRequest: angular.identity, // Prevents Angular from serializing FormData
            headers: { 'Content-Type': undefined } // Set content type to undefined for browser to set multipart/form-data
        })
        .then(function (response) {
            showToast('Success', response.data.message, 'success');
            // Optionally redirect or clear form
            // window.location.href = "client-Dash.html";
        })
        .catch(function (error) {
            console.error('Error submitting profile:', error);
            showToast('Error', 'Error: ' + (error.data?.message || "Something went wrong"), 'error');
        });
    };
});


// Custom Toast Notification Function (defined globally, as it's common across pages)
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

    // Using basic Bootstrap classes for toast appearance as per infl-finder.js
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
    }, { once: true });
}
