var module = angular.module("myModule", []);

module.controller("myController", function($scope, $http) {
    $scope.jsonArrayAll = [];

    // Fetch all users
    $scope.getAll = function() {
        let url = "/fetch-users";
        $http.get(url).then(function(response) {
            $scope.jsonArrayAll = response.data;
        }, function(err) {
            alert(err.data);
        });
    };

    
});
