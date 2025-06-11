// AngularJS Application
var app = angular.module('influencerApp', []);

app.controller('InfluencerController', function($scope, $window, $http) {
    // Retrieve influencer email from local storage
    $scope.inflEmail = localStorage.getItem('inflEmail') || 'influencer@example.com';
    
    // Initialize influencer name (you can set this from login or localStorage)
    $scope.inflName = localStorage.getItem('inflName') || 'Influencer';
    
    // Password update data and state
    $scope.passwordData = {
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    };
    $scope.updating = false; // State for the password update button loading spinner
    
    // Function to update user password
    $scope.updatePassword = function () {
        // Basic client-side validation
        if ($scope.passwordData.newPassword !== $scope.passwordData.confirmPassword) {
            alert('New Password and Confirm Password do not match. Please try again.');
            return;
        }

        if ($scope.passwordData.newPassword.length < 6) {
            alert('New password must be at least 6 characters long.');
            return;
        }

        $scope.updating = true; // Show loading spinner

        $http({
            method: 'GET', // MUST BE GET to match backend
            url: '/updatePwd',
            params: { // Data sent as query parameters for GET
                txtEmail: $scope.inflEmail,
                oldPwd: $scope.passwordData.currentPassword, // Matches backend 'oldPwd'
                newPwd: $scope.passwordData.newPassword,     // Matches backend 'newPwd'
                conPwd: $scope.passwordData.confirmPassword  // Matches backend 'conPwd'
            }
        })
        .then(function (response) {
            // Backend sends plain text. response.data will be the string.
            const message = response.data; // e.g., "Password updated successfully."

            // Check specific success/error messages from the backend's plain text response
            if (message === 'Password updated successfully.') {
                alert(message);
                // Clear the password fields
                $scope.passwordData = {
                    currentPassword: '',
                    newPassword: '',
                    confirmPassword: ''
                };
                // Close the modal
                $('#settingModal').modal('hide');
            } else {
                // These are backend validation messages
                alert(message); // "Password confirmation does not match.", "Invalid ID or password.", "Password update failed."
            }
        })
        .catch(function (error) {
            // This catch block will primarily hit for network errors or unhandled 500s from the backend.
            // Backend sends plain text for 500 errors.
            console.error('Password update error:', error);
            alert('Network error or server unavailable: ' + (error.data || error.statusText));
        })
        .finally(function() {
            $scope.updating = false; // Hide loading spinner regardless of success or failure
        });
    };
    
    // Function to log out the influencer
    $scope.logout = function () {
        localStorage.removeItem('inflEmail');
        localStorage.removeItem('inflName');
        $window.location.href = 'index.html';
    };
});

// jQuery for additional functionality (keeping existing jQuery code)
$(document).ready(function() {
    // Any additional jQuery functionality can go here
    
    // Example: Form validation enhancement
    $('#settingModal').on('hidden.bs.modal', function () {
        // Clear any validation messages when modal is closed
        $('.form-control').removeClass('is-invalid');
    });
    
    // Example: Event form submission (if needed)
    $('#eventForm').on('submit', function(e) {
        // Add any additional validation or processing here
        console.log('Event form submitted');
    });
});