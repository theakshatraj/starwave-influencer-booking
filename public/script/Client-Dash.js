// script/client-Dash.js

const app = angular.module("clientApp", []); // Ensure this module name matches your HTML ng-app
app.controller("ClientController", function ($scope, $window, $http) {
    // Retrieve client email from local storage
    $scope.clientEmail = localStorage.getItem("clientEmail") || "client@example.com";

    // Initialize dashboard data with default/placeholder values
    $scope.clientName = "Client";
    $scope.savedInfluencerCount = 0;
    $scope.activeCampaigns = 0;

    // Password update data and state
    $scope.passwordData = {
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
    };
    $scope.updating = false; // State for the password update button loading spinner

    // Function to update user password
    $scope.updatePassword = function () {
        // Basic client-side validation
        if ($scope.passwordData.newPassword !== $scope.passwordData.confirmPassword) {
            alert("New Password and Confirm Password do not match. Please try again.");
            return;
        }

        if ($scope.passwordData.newPassword.length < 6) {
            alert("New password must be at least 6 characters long.");
            return;
        }

        $scope.updating = true; // Show loading spinner

        $http({
            method: "GET", // MUST BE GET to match backend
            url: "/updatePwd",
            params: { // Data sent as query parameters for GET
                txtEmail: $scope.clientEmail,
                oldPwd: $scope.passwordData.currentPassword, // Matches backend 'oldPwd'
                newPwd: $scope.passwordData.newPassword,     // Matches backend 'newPwd'
                conPwd: $scope.passwordData.confirmPassword  // Matches backend 'conPwd'
            }
        })
        .then(function (response) {
            // Backend sends plain text. response.data will be the string.
            const message = response.data; // e.g., "Password updated successfully."

            // Check specific success/error messages from the backend's plain text response
            if (message === "Password updated successfully.") {
                alert(message);
                // Clear the password fields
                $scope.passwordData = {
                    currentPassword: "",
                    newPassword: "",
                    confirmPassword: ""
                };
                // Optionally, close the modal
                // For Bootstrap 5, you might need to manually close it:
                // const settingsModal = bootstrap.Modal.getInstance(document.getElementById('settingsModal'));
                // if (settingsModal) settingsModal.hide();
            } else {
                // These are backend validation messages
                alert(message); // "Password confirmation does not match.", "Invalid ID or password.", "Password update failed."
            }
        })
        .catch(function (error) {
            // This catch block will primarily hit for network errors or unhandled 500s from the backend.
            // Backend sends plain text for 500 errors.
            console.error("Password update error:", error);
            alert("Network error or server unavailable: " + (error.data || error.statusText));
        })
        .finally(function() {
            $scope.updating = false; // Hide loading spinner regardless of success or failure
        });
    };

    // Function to log out the client
    $scope.logout = function () {
        localStorage.removeItem("clientEmail");
        $window.location.href = "index.html";
    };

    // Function to fetch dynamic dashboard metrics from the backend (assuming this uses GET and expects JSON)
    $scope.fetchDashboardMetrics = function() {
        $http.get('/api/client/dashboard-metrics', {
            params: { clientEmail: $scope.clientEmail }
        })
        .then(function(response) {
            // Assuming this endpoint *does* return JSON as previously discussed
            $scope.savedInfluencerCount = response.data.savedInfluencerCount || 0;
            $scope.activeCampaigns = response.data.activeCampaigns || 0;
            $scope.clientName = response.data.clientName || "Client";
        })
        .catch(function(error) {
            console.error("Error fetching dashboard metrics:", error);
            $scope.savedInfluencerCount = "N/A";
            $scope.activeCampaigns = "N/A";
            $scope.clientName = "Guest";
        });
    };

    $scope.fetchDashboardMetrics();
});