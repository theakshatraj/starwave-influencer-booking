var app = angular.module("clientModule", []); // Renamed module to avoid conflict

app.controller("clientController", function($scope, $http) { // Renamed controller
    $scope.jsonArrayAllClients = []; // Renamed scope variable for clarity

    // Fetch all clients
    $scope.getAllClients = function() {
        let url = "/fetch-clients"; // New endpoint for clients
        $http.get(url).then(function(response) {
            $scope.jsonArrayAllClients = response.data;
        }, function(err) {
            alert("Error fetching client data: " + err.data); // More descriptive error
        });
    };
});