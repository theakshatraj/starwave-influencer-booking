var module = angular.module("myModule", []);

module.controller("myController", function($scope, $http) {
    $scope.jsonArrayAll = [];

    // Fetch all users
    $scope.getAll = function() {
        let url = "/fetch-all";
        $http.get(url).then(function(response) {
            $scope.jsonArrayAll = response.data;
        }, function(err) {
            alert(err.data);
        });
    };

    // Block user
    $scope.blockUser = function(email) {
        let url = "/block-process";
        $http.get(url, { params: { email: email } }).then(function(response) {
            alert("User blocked successfully!");
            $scope.getAll(); // Refresh user list
        }, function(err) {
            alert(err.data);
        });
    };

    // Resume user
    $scope.resumeUser = function(email) {
        let url = "/resume-process";
        $http.get(url, { params: { email: email } }).then(function(response) {
            alert("User resumed successfully!");
            $scope.getAll(); // Refresh user list
        }, function(err) {
            alert(err.data);
        });
    };

    // Delete user
    $scope.deleteUser = function(email) {
        let url = "/delete-process";
        $http.get(url, { params: { email: email } }).then(function(response) {
            alert("User deleted successfully!");
            $scope.getAll(); // Refresh user list
        }, function(err) {
            alert(err.data);
        });
    };
});
