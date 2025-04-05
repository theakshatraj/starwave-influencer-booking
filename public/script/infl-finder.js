var module = angular.module("myModule", []);

module.controller("myController", function ($scope, $http) {
  $scope.cities = [];
  $scope.selectedCategory = '';
  $scope.influencers = [];
  $scope.selectedInfluencer = {};

  // Initialize and fetch cities based on selected category
  $scope.init = function () {
    $scope.updateCities();
  };

  $scope.updateCities = function () {
    let field = $scope.selectedCategory || '';
    let url = "/update-cities";
    $http.get(url, { params: { field: field } }).then(
      function (response) {
        $scope.cities = response.data.map((cityObj) => cityObj.city);
      },
      function (err) {
        alert(err.data);
      }
    );
  };

  // Fetch influencers based on filters
  $scope.searchInfluencers = function () {
    let params = {
      category: $scope.selectedCategory,
      location: $scope.selectedCity,
      name: $scope.searchName || '', // Get the name from input
    };

    $http.get('/search-influencers', { params: params }).then(
      function (response) {
        console.log('Influencers data:', response.data); // Debug log
        $scope.influencers = response.data;
        // Log image paths for verification
        $scope.influencers.forEach(function (inf) {
          console.log('Image path:', '/uploads/' + inf.pic);
        });
      },
      function (err) {
        console.error('Error:', err); // Debug log
        alert(err.data);
      }
    );
  };

  // Show details in a modal for a selected influencer
  $scope.showDetails = function (influencer) {
    console.log('Selected influencer:', influencer); // Debug log
    $scope.selectedInfluencer = influencer;
    new bootstrap.Modal(document.getElementById('influencerModal')).show();
  };
});
