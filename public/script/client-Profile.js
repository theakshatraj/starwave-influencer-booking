angular
  .module("clientProfileApp", [])
  .controller("clientProfileCtrl", function ($scope, $http) {
    $scope.client = {
      emailid: localStorage.getItem("clientEmail") || "client@example.com",
      name: "",
      city: "",
      state: "",
      org: "",
      contact: "",
    };

    $scope.submitForm = function (isValid, actionType) {
      if (!validateContact($scope.client.contact)) {
        alert("Please enter a valid 10-digit contact number.");
        return;
      }

      const url = actionType === "submit"
        ? "/client-profile-submit"
        : "/client-profile-update";

      $http.post(url, $scope.client)
        .then(function (response) {
          alert(response.data.message);
          window.location.href = "client-Dash.html"; // redirect
        })
        .catch(function (error) {
          alert("Error: " + (error.data?.message || "Something went wrong"));
        });
    };

    function validateContact(contact) {
      return /^\d{10}$/.test(contact);
    }
  });


// Optional: fallback validation for manual form submission
document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("clientProfileForm");
  if (form) {
    form.addEventListener("submit", function (e) {
      const contact = document.getElementById("contact").value;
      if (!/^\d{10}$/.test(contact)) {
        alert("Please enter a valid 10-digit contact number.");
        e.preventDefault();
      }
    });
  }
});
