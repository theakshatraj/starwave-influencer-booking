var app = angular.module("eventApp", []);

app.controller("eventController", function ($scope, $http, $filter) {
    // Initialize userEmail from localStorage.
    // Changed to 'influencerEmail' as Event Management is for Influencers.
    $scope.userEmail = localStorage.getItem("inflEmail") || "influencer@example.com";
    $scope.events = [];
    $scope.type = ""; // To store the type of events currently displayed ('upcoming' or 'past')
    $scope.selectedEvent = {}; // Holds data for the update modal
    $scope.modalFormSubmitted = false; // Flag to show validation messages in modal

    // Initial fetch of upcoming events when the controller loads
    $scope.init = function() {
        // You might want to automatically fetch 'upcoming' events on page load
        // if userEmail is already available.
        if ($scope.userEmail && $scope.userEmail !== "influencer@example.com") { // Check if it's not the default
            $scope.fetchEvents('upcoming');
        } else {
            showToast('Info', 'Please ensure you are logged in as an influencer to fetch events.', 'info');
        }
    };

    /**
     * Fetches events (upcoming or past) for the current user.
     * @param {string} type - 'upcoming' or 'past'
     */
    $scope.fetchEvents = function (type) {
        if (!$scope.userEmail || $scope.userEmail === "influencer@example.com") {
            showToast('Error', 'Please enter your email or log in as an influencer to fetch events.', 'error');
            return;
        }

        $scope.type = type;
        // Construct URL for backend API to fetch events
        const url = `/fetch-events?email=${$scope.userEmail}&type=${type}`;

        $http.get(url)
            .then(function (response) {
                // Map event dates for proper display in date input fields
                $scope.events = response.data.map(event => {
                    if (event.doe) {
                        // For display in the table, convert to 'yyyy-MM-dd' string
                        event.displayDate = $filter('date')(new Date(event.doe), 'yyyy-MM-dd');
                    }
                    return event;
                });
                showToast('Success', `${type === 'upcoming' ? 'Upcoming' : 'Past'} events fetched successfully.`, 'success');
                if ($scope.events.length === 0) {
                     showToast('Info', `No ${type} events found for this email.`, 'info');
                }
            })
            .catch(function (error) {
                console.error("Error fetching events:", error);
                showToast('Error', "Error fetching events: " + (error.data?.message || error.statusText || "Unknown error"), 'error');
            });
    };

    /**
     * Deletes an event by its record ID.
     * Uses a custom confirmation modal.
     * @param {number} recordid - The ID of the event to delete.
     */
    $scope.deleteEvent = function (recordid) {
        showCustomConfirm("Are you sure you want to delete this event?")
            .then(function(confirmed) {
                if (confirmed) {
                    $http.delete(`/delete-event?recordid=${recordid}`)
                        .then(function () {
                            showToast('Success', "Event deleted successfully.", 'success');
                            $scope.fetchEvents($scope.type); // Refresh the list
                        })
                        .catch(function (error) {
                            console.error("Error deleting event:", error);
                            showToast('Error', "Error deleting event: " + (error.data?.message || error.statusText || "Unknown error"), 'error');
                        });
                } else {
                    showToast('Info', 'Event deletion cancelled.', 'info');
                }
            });
    };

    /**
     * Sets the event data to the update modal form.
     * @param {object} event - The event object to populate the modal with.
     */
    $scope.setUpdateEvent = function (event) {
        // Create a deep copy to avoid modifying the original event object directly
        $scope.selectedEvent = angular.copy(event);
        $scope.modalFormSubmitted = false; // Reset validation flag for new modal open

        // Format date for input[type=date]
        if ($scope.selectedEvent.doe) {
            $scope.selectedEvent.formattedDate = new Date($scope.selectedEvent.doe);
        } else {
            $scope.selectedEvent.formattedDate = null; // Ensure it's null if empty
        }

        // Format time for input[type=time]
        // The time input expects a string like "HH:mm"
        if ($scope.selectedEvent.tos) {
            // Assuming event.tos is already in "HH:mm" or "HH:mm:ss" format from backend
            // If it's a full date string from backend, you'd parse it:
            // const timeDate = new Date(`1970-01-01T${$scope.selectedEvent.tos}`); // Example for HH:mm:ss
            $scope.selectedEvent.formattedTime = $scope.selectedEvent.tos.substring(0, 5); // Ensure HH:mm format
        } else {
            $scope.selectedEvent.formattedTime = null; // Ensure it's null if empty
        }
    };

    /**
     * Updates an event using data from the modal form.
     */
    $scope.updateEvent = function () {
        $scope.modalFormSubmitted = true; // Set flag to show validation messages

        // Manual validation for modal fields since ng-submit is not on form
        if (!$scope.selectedEvent.events || !$scope.selectedEvent.formattedDate ||
            !$scope.selectedEvent.formattedTime || !$scope.selectedEvent.venue ||
            !$scope.selectedEvent.city) {
            showToast('Validation Error', 'Please fill in all required fields in the modal.', 'error');
            return;
        }

        if (!$scope.selectedEvent.recordid) {
            showToast('Error', "Invalid event selection for update.", 'error');
            return;
        }

        showCustomConfirm("Are you sure you want to save these changes?")
            .then(function(confirmed) {
                if (confirmed) {
                    // Prepare updated event object for backend
                    const updatedEventData = {
                        recordid: $scope.selectedEvent.recordid,
                        events: $scope.selectedEvent.events,
                        // Convert Date object to 'YYYY-MM-DD' string for backend
                        doe: $scope.selectedEvent.formattedDate ? $filter('date')($scope.selectedEvent.formattedDate, 'yyyy-MM-dd') : null,
                        // Time should be 'HH:mm' string for backend
                        tos: $scope.selectedEvent.formattedTime || null,
                        venue: $scope.selectedEvent.venue,
                        city: $scope.selectedEvent.city
                    };

                    $http.put("/update-event", updatedEventData)
                        .then(function (response) {
                            showToast('Success', "Event updated successfully.", 'success');
                            $scope.fetchEvents($scope.type); // Refresh the list
                            // Hide modal manually
                            const modalElement = document.getElementById('updateEventModal');
                            const modalInstance = bootstrap.Modal.getInstance(modalElement) || new bootstrap.Modal(modalElement);
                            modalInstance.hide();
                        })
                        .catch(function (error) {
                            console.error("Update error:", error);
                            showToast('Error', "Error updating event: " + (error.data?.message || error.statusText || "Unknown error"), 'error');
                        });
                } else {
                    showToast('Info', 'Event update cancelled.', 'info');
                }
            });
    };

    // Initialize events on controller load if userEmail is ready
    $scope.init();
});


// Custom Toast Notification Function (defined globally)
// This function should be placed outside the Angular controller
// or in a separate file accessible globally.
/**
 * Displays a custom toast notification.
 * @param {string} title - The title of the toast (e.g., "Success", "Error").
 * @param {string} message - The main message content of the toast.
 * @param {string} type - The type of toast ('success', 'error', 'info').
 * @param {number} [duration=3000] - Duration in milliseconds before auto-hiding.
 */
function showToast(title, message, type, duration = 3000) {
    const toastContainer = document.querySelector('.toast-container');
    if (!toastContainer) {
        console.error("Toast container not found. Make sure a <div class='toast-container'> exists in your HTML.");
        return;
    }

    const toastId = 'toast-' + Date.now();
    let bgClass = '';
    switch (type) {
        case 'success': bgClass = 'bg-success'; break;
        case 'error': bgClass = 'bg-danger'; break;
        case 'info': bgClass = 'bg-info'; break;
        default: bgClass = 'bg-primary'; // Default if type is not recognized
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

    toastContainer.insertAdjacentHTML('beforeend', toastHtml);

    const toastElement = document.getElementById(toastId);
    const toast = new bootstrap.Toast(toastElement, {
        autohide: true,
        delay: duration
    });

    toast.show();

    toastElement.addEventListener('hidden.bs.toast', function() {
        toastElement.remove();
    }, { once: true });
}

// Global function to show a custom confirmation dialog (programmatic)
// This is a simplified programmatic version. For a more robust solution,
// a dedicated modal HTML structure for confirmations is highly recommended.
function showCustomConfirm(message) {
    return new Promise((resolve) => {
        const confirmDialog = document.createElement('div');
        confirmDialog.className = 'custom-confirm-overlay';
        confirmDialog.innerHTML = `
            <div class="custom-confirm-box">
                <p class="mb-4">${message}</p>
                <div class="d-flex justify-content-center gap-3">
                    <button class="custom-confirm-yes btn btn-themed-primary">Yes</button>
                    <button class="custom-confirm-no btn btn-themed-secondary">No</button>
                </div>
            </div>
            <style>
                /* Scoped styles for the custom confirm modal to prevent conflicts */
                .custom-confirm-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background-color: rgba(0, 0, 0, 0.6);
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    z-index: 1060; /* Higher than Bootstrap modals */
                    font-family: 'Inter', sans-serif; /* Use consistent font */
                }
                .custom-confirm-box {
                    background-color: var(--bg-white);
                    padding: 30px;
                    border-radius: 12px;
                    box-shadow: var(--shadow-card);
                    text-align: center;
                    max-width: 400px;
                    width: 90%;
                    position: relative;
                }
                .custom-confirm-box p {
                    margin-bottom: 25px;
                    font-size: 1.1rem;
                    color: var(--text-dark);
                }
                .custom-confirm-buttons button {
                    border-radius: 12px; /* Consistent with other buttons */
                    padding: 0.75rem 2rem;
                    font-weight: 600;
                    transition: all 0.3s ease;
                    font-size: 0.95rem;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }
                /* Use themed button classes directly */
                .custom-confirm-buttons .btn-themed-primary {
                    background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
                    border: none;
                    color: white;
                }
                .custom-confirm-buttons .btn-themed-primary:hover {
                    transform: translateY(-2px);
                    box-shadow: var(--shadow-hover);
                    background: linear-gradient(135deg, #e55a2b, #e6a500);
                }
                .custom-confirm-buttons .btn-themed-secondary {
                    background-color: var(--bg-light);
                    color: var(--text-dark);
                    border: 1px solid var(--border-color);
                }
                .custom-confirm-buttons .btn-themed-secondary:hover {
                    background-color: #e2e4e6;
                    box-shadow: var(--shadow-light);
                    transform: translateY(-2px);
                }

                @media (max-width: 768px) {
                    .custom-confirm-buttons {
                        flex-direction: column;
                        align-items: center;
                    }
                    .custom-confirm-buttons button {
                        width: 100%;
                        margin-top: 10px;
                    }
                }
            </style>
        `;
        document.body.appendChild(confirmDialog);

        document.body.style.overflow = 'hidden'; // Prevent background scrolling

        const yesBtn = confirmDialog.querySelector('.custom-confirm-yes');
        const noBtn = confirmDialog.querySelector('.custom-confirm-no');

        yesBtn.addEventListener('click', () => {
            document.body.removeChild(confirmDialog);
            document.body.style.overflow = ''; // Restore scrolling
            resolve(true);
        }, { once: true }); // Ensure listener is removed after first click

        noBtn.addEventListener('click', () => {
            document.body.removeChild(confirmDialog);
            document.body.style.overflow = ''; // Restore scrolling
            resolve(false);
        }, { once: true }); // Ensure listener is removed after first click
    });
}
