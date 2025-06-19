var app = angular.module("influencerProfileApp", []);

app.controller("influencerProfileCtrl", function ($scope, $http) {
  // Initialize influencer data model
  $scope.influencer = {
    emailid: localStorage.getItem("inflEmail") || "influencer@example.com", // Remove localStorage dependency for artifacts
    name: "",
    gender: "",
    dob: "",
    address: "",
    city: "",
    contact: "",
    field: [],
    insta: "",
    youtube: "",
    otherinfo: "",
    pic: "",
  };

  $scope.showPreview = false;

  // Initialize function
  $scope.init = function () {
    console.log("Influencer profile initialized");
  };

  /**
   * Handles file input change event for profile picture upload.
   */
  $scope.handleFileChange = function (files) {
    if (files && files[0]) {
      const file = files[0];
      if (!file.type.startsWith("image/")) {
        showToast("Validation Error", "Please upload an image file.", "error");
        document.getElementById("picUpload").value = "";
        $scope.showPreview = false;
        $scope.influencer.pic = "";
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        // Max 5MB
        showToast(
          "Validation Error",
          "File size should be less than 5MB.",
          "error"
        );
        document.getElementById("picUpload").value = "";
        $scope.showPreview = false;
        $scope.influencer.pic = "";
        return;
      }

      const reader = new FileReader();
      reader.onload = function (e) {
        const previewElement = document.getElementById("preview");
        if (previewElement) {
          previewElement.src = e.target.result;
          $scope.showPreview = true;
          $scope.$apply();
        }
      };
      reader.readAsDataURL(file);
    } else {
      $scope.showPreview = false;
      $scope.influencer.pic = "";
      $scope.$apply();
    }
  };

  /**
   * Validates contact number.
   */
  function validateContact(contact) {
    return /^\d{10}$/.test(contact);
  }

  /**
   * Submits or updates the influencer profile.
   */
  $scope.submitForm = function (actionType) {
    console.log("Submit form called with action:", actionType);

    // Validate Email
    if (!$scope.influencer.emailid) {
      showToast("Validation Error", "Email ID is required.", "error");
      return;
    }

    // Validate Contact if provided
    if (
      $scope.influencer.contact &&
      !validateContact($scope.influencer.contact)
    ) {
      showToast(
        "Validation Error",
        "Please enter a valid 10-digit contact number.",
        "error"
      );
      return;
    }

    // Action-specific validations
    if (actionType === "submit") {
      // For new profile creation, validate required fields
      if (
        !$scope.influencer.name ||
        !$scope.influencer.dob ||
        !$scope.influencer.address ||
        !$scope.influencer.city ||
        !$scope.influencer.contact ||
        !$scope.influencer.field.length
      ) {
        showToast(
          "Validation Error",
          "Please fill in all required fields correctly.",
          "error"
        );
        return;
      }
      if (!document.getElementById("picUpload").files[0]) {
        showToast(
          "Validation Error",
          "Please upload a profile picture.",
          "error"
        );
        return;
      }
    }

    const formData = new FormData();

    // Always append email ID
    formData.append("emailid", $scope.influencer.emailid);

    // Handle other fields
    if ($scope.influencer.name) formData.append("name", $scope.influencer.name);
    if ($scope.influencer.gender)
      formData.append("gender", $scope.influencer.gender);
    if ($scope.influencer.dob) {
      const formattedDob = new Date($scope.influencer.dob)
        .toISOString()
        .split("T")[0]; // "YYYY-MM-DD"
      formData.append("dob", formattedDob);
    }
    if ($scope.influencer.address)
      formData.append("address", $scope.influencer.address);
    if ($scope.influencer.city) formData.append("city", $scope.influencer.city);
    if ($scope.influencer.contact)
      formData.append("contact", $scope.influencer.contact);

    // Handle field array - convert to comma-separated string
    if ($scope.influencer.field && $scope.influencer.field.length > 0) {
      formData.append("field", $scope.influencer.field.join(", "));
    }

    if ($scope.influencer.insta)
      formData.append("insta", $scope.influencer.insta);
    if ($scope.influencer.youtube)
      formData.append("youtube", $scope.influencer.youtube);
    if ($scope.influencer.otherinfo)
      formData.append("otherinfo", $scope.influencer.otherinfo);

    // Handle file upload
    const picFile = document.getElementById("picUpload").files[0];
    if (picFile) {
      formData.append("picUpload", picFile);
    }

    const url = actionType === "submit" ? "/profile-submit" : "/profile-update";

    $http
      .post(url, formData, {
        transformRequest: angular.identity,
        headers: { "Content-Type": undefined },
      })
      .then(function (response) {
        showToast("Success", response.data.message, "success");

        // Update pic path if new image was uploaded
        if (response.data.picpath) {
          $scope.influencer.pic = response.data.picpath;
          $scope.showPreview = true;
        }

        // Clear file input after successful operation
        document.getElementById("picUpload").value = "";
      })
      .catch(function (error) {
        console.error("Error submitting profile:", error);
        const errorMessage =
          error.data?.message || error.statusText || "Something went wrong";
        showToast("Error", "Error: " + errorMessage, "error");
      });
  };
});

// Custom Toast Notification Function
function showToast(title, message, type, duration = 3000) {
  const toastContainer = document.querySelector(".toast-container");
  if (!toastContainer) {
    console.error(
      "Toast container not found. Make sure a <div class='toast-container'> exists in your HTML."
    );
    return;
  }

  const toastId = "toast-" + Date.now();
  let bgClass = "";
  switch (type) {
    case "success":
      bgClass = "bg-success";
      break;
    case "error":
      bgClass = "bg-danger";
      break;
    case "info":
      bgClass = "bg-info";
      break;
    default:
      bgClass = "bg-primary";
  }

  const toastHtml = `
                <div id="${toastId}" class="toast align-items-center text-white ${bgClass} border-0" role="alert" aria-live="assertive" aria-atomic="true">
                    <div class="d-flex">
                        <div class="toast-body">
                            <strong>${title}:</strong> ${message}
                        </div>
                        <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
                    </div>
                </div>
            `;

  toastContainer.insertAdjacentHTML("beforeend", toastHtml);

  const toastElement = document.getElementById(toastId);
  const toast = new bootstrap.Toast(toastElement, {
    autohide: true,
    delay: duration,
  });

  toast.show();

  toastElement.addEventListener(
    "hidden.bs.toast",
    function () {
      toastElement.remove();
    },
    { once: true }
  );
}
