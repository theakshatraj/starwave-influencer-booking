var module = angular.module("myModule", []); // Ensure this line is only once at the top of the file

module.controller("myController", function($scope, $http) {
    $scope.jsonArrayAll = [];

    // Fetch all influencers
    $scope.getAll = function() {
        let url = "/fetch-infl";
        $http.get(url).then(function(response) {
            $scope.jsonArrayAll = response.data;
        }, function(err) {
            alert("Error fetching influencer data: " + err.data);
        });
    };
});