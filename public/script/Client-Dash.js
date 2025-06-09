// script/client-Dash.js

const app = angular.module("clientApp", []);
app.controller("ClientController", function ($scope, $window, $http) {
    $scope.clientEmail = localStorage.getItem("clientEmail") || "client@example.com";

    $scope.savedCount = 3;
    $scope.activeCollaborations = 2;
    $scope.totalReach = "1.5M";

    // Password update data and state
    $scope.passwordData = {
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
    };

    $scope.updating = false;

    $scope.updatePassword = function () {
        if ($scope.passwordData.newPassword !== $scope.passwordData.confirmPassword) {
            alert("New Password and Confirm Password do not match.");
            return;
        }

        $scope.updating = true;

        $http({
            method: "GET",
            url: "/updatePwd",
            params: {
                txtEmail: $scope.clientEmail,
                oldPwd: $scope.passwordData.currentPassword,
                newPwd: $scope.passwordData.newPassword,
                conPwd: $scope.passwordData.confirmPassword
            }
        }).then(function (response) {
            alert(response.data);
            $scope.passwordData = {
                currentPassword: "",
                newPassword: "",
                confirmPassword: ""
            };
            $scope.updating = false;
        }).catch(function (error) {
            alert(error.statusText || "Password update failed");
            $scope.updating = false;
        });
    };

    $scope.logout = function () {
        localStorage.removeItem("clientEmail");
        $window.location.href = "index.html";
    };
});
