// script/admin-dash.js

const app = angular.module("adminApp", []); 
app.controller("AdminController", function ($scope, $window, $http) {
   
    $scope.adminEmail = localStorage.getItem("adminEmail") || "admin@starwave.com";
    $scope.adminName = "Admin";

    $scope.totalUsers = "1,200";
    $scope.totalInfluencers = "350";
    $scope.totalRevenue = "$15,000";

    $scope.activeSection = 'overview'; 

    $scope.setActiveSection = function(section) {
        $scope.activeSection = section;
       
    };

   
    $scope.passwordData = {
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
    };
    $scope.updating = false; // State for the password update button loading spinner

    // Function to update admin password (similar to client/influencer dashboard)
    $scope.updatePassword = function () {
        if ($scope.passwordData.newPassword !== $scope.passwordData.confirmPassword) {
            alert("New Password and Confirm Password do not match. Please try again.");
            return;
        }

        if ($scope.passwordData.newPassword.length < 6) {
            alert("New password must be at least 6 characters long.");
            return;
        }

        if (!$scope.passwordData.currentPassword) {
            alert("Please enter your old password.");
            return;
        }

        $scope.updating = true; // Show loading spinner

        $http({
            method: "GET", // Assuming your backend /updatePwd endpoint still uses GET
            url: "/updatePwd", // Re-using the same endpoint, assuming it handles admin IDs too
            params: {
                txtEmail: $scope.adminEmail, // Use admin email from localStorage
                oldPwd: $scope.passwordData.currentPassword,
                newPwd: $scope.passwordData.newPassword,
                conPwd: $scope.passwordData.confirmPassword
            }
        })
        .then(function (response) {
            const message = response.data; // e.g., "Password updated successfully."

            if (message === "Password updated successfully.") {
                alert(message);
                $scope.passwordData = {
                    currentPassword: "",
                    newPassword: "",
                    confirmPassword: ""
                };
                // Close the modal
                const modalElement = document.getElementById('adminSettingsModal');
                if (modalElement) {
                    const modalInstance = bootstrap.Modal.getInstance(modalElement);
                    if (modalInstance) {
                        modalInstance.hide();
                    }
                }
            } else {
                alert(message);
            }
        })
        .catch(function (error) {
            console.error("Password update error:", error);
            alert("Network error or server unavailable: " + (error.data || error.statusText));
        })
        .finally(function() {
            $scope.updating = false; // Hide loading spinner
        });
    };

    // Function to log out the admin
    $scope.logout = function () {
        localStorage.removeItem("adminEmail"); // Clear stored admin email
        // Clear any other admin-specific session data if needed
        $window.location.href = "index.html"; // Redirect to the login/home page
    };

    
    const hash = $window.location.hash.substring(1); // Remove '#'
    if (hash && ['overview', 'users', 'influencers'].includes(hash)) {
        $scope.activeSection = hash;
    }

});