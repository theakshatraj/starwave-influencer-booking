var app = angular.module("eventApp", []);

app.controller("eventController", function ($scope, $http) {
    $scope.userEmail = "";
    $scope.events = [];
    $scope.type = "";
    $scope.selectedEvent = {}; // To store the selected event for updating

    // Fetch events based on type
    $scope.fetchEvents = function (type) {
        if (!$scope.userEmail) {
            alert("Please enter your email.");
            return;
        }

        $scope.type = type;
        const url = `/fetch-events?email=${$scope.userEmail}&type=${type}`;

        $http.get(url).then(
            function (response) {
                $scope.events = response.data;
            },
            function (error) {
                alert("Error fetching events: " + error.data);
            }
        );
    };

    // Delete event
    $scope.deleteEvent = function (recordid) {
        if (confirm("Are you sure you want to delete this event?")) {
            $http.delete(`/delete-event?recordid=${recordid}`).then(
                function () {
                    alert("Event deleted successfully.");
                    $scope.fetchEvents($scope.type); // Refresh the event list
                },
                function (error) {
                    alert("Error deleting event: " + error.data);
                }
            );
        }
    };

    // Set event for updating
    $scope.setUpdateEvent = function (event) {
        $scope.selectedEvent = angular.copy(event); // Store the selected event data

        // Show the modal
        $('#updateEventModal').modal('show');

        // Show a message when the title field is clicked
        $('#eventTitle').on('click', function () {
            $('#titleMessage').show();
        });
    };

    // Update event
    $scope.updateEvent = function () {
        if (!$scope.selectedEvent.recordid) {
            alert("Invalid event selection.");
            return;
        }

        // Prepare the updated event data
        const updatedEvent = {
            recordid: $scope.selectedEvent.recordid,
            doe: $scope.selectedEvent.doe,
            tos: $scope.selectedEvent.tos,
            venue: $scope.selectedEvent.venue,
            city: $scope.selectedEvent.city,
        };

        // Send the update request to the server
        $http.put("/update-event", updatedEvent).then(
            function () {
                alert("Event updated successfully.");
                $scope.fetchEvents($scope.type); // Refresh the event list
                $scope.selectedEvent = {}; // Reset the selected event
                $('#updateEventModal').modal('hide'); // Close the modal
            },
            function (error) {
                alert("Error updating event: " + error.data);
            }
        );
    };
});