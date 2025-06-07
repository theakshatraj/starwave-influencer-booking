var app = angular.module("eventApp", []);

app.controller("eventController", function ($scope, $http, $filter) {
  $scope.userEmail = "";
  $scope.events = [];
  $scope.type = "";
  $scope.selectedEvent = {};

  $scope.fetchEvents = function (type) {
    if (!$scope.userEmail) {
      alert("Please enter your email.");
      return;
    }

    $scope.type = type;
    const url = `/fetch-events?email=${$scope.userEmail}&type=${type}`;

    $http.get(url).then(
      function (response) {
        $scope.events = response.data.map(event => {
          if (event.doe) {
            event.displayDate = $filter('date')(new Date(event.doe), 'yyyy-MM-dd');
          }
          return event;
        });
      },
      function (error) {
        alert("Error fetching events: " + (error.data || error.statusText));
      }
    );
  };

  $scope.deleteEvent = function (recordid) {
    if (confirm("Are you sure you want to delete this event?")) {
      $http.delete(`/delete-event?recordid=${recordid}`).then(
        function () {
          alert("Event deleted successfully.");
          $scope.fetchEvents($scope.type);
        },
        function (error) {
          alert("Error deleting event: " + (error.data || error.statusText));
        }
      );
    }
  };

  $scope.setUpdateEvent = function (event) {
    $scope.selectedEvent = angular.copy(event);

    // Date object for input[type=date]
    if ($scope.selectedEvent.doe) {
      $scope.selectedEvent.formattedDate = new Date($scope.selectedEvent.doe);
    }

    // Date object for input[type=time]
    if ($scope.selectedEvent.tos) {
      const timeParts = $scope.selectedEvent.tos.split(':');
      const timeDate = new Date();
      timeDate.setHours(parseInt(timeParts[0], 10));
      timeDate.setMinutes(parseInt(timeParts[1], 10));
      timeDate.setSeconds(0);
      timeDate.setMilliseconds(0);
      $scope.selectedEvent.formattedTime = timeDate;
    }
  };

  $scope.updateEvent = function () {
    if (!$scope.selectedEvent.recordid) {
        alert("Invalid event selection.");
        return;
    }

    const confirmed = confirm("Are you sure you want to save these changes?");
    if (!confirmed) return; // Exit if user cancels

    // Prepare updated event object
    const updatedEvent = {
        recordid: $scope.selectedEvent.recordid,
        events: $scope.selectedEvent.events || null,
        doe: $scope.selectedEvent.formattedDate ? $filter('date')($scope.selectedEvent.formattedDate, 'yyyy-MM-dd') : null,
        tos: $scope.selectedEvent.formattedTime ? $filter('date')($scope.selectedEvent.formattedTime, 'HH:mm') : null,
        venue: $scope.selectedEvent.venue || null,
        city: $scope.selectedEvent.city || null
    };

    $http.put("/update-event", updatedEvent).then(
        function (response) {
            alert("Event updated successfully.");
            $scope.fetchEvents($scope.type);
            $('#updateEventModal').modal('hide');
        },
        function (error) {
            console.error("Update error:", error);
            alert("Error updating event: " + (error.data || error.statusText));
        }
    );
};
});
