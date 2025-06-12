$(document).ready(function () {
    // Admin Email Constant (for client-side redirection)
    const ADMIN_EMAIL = 'aksh.devproj@gmail.com';

    // Helper for showing alerts/toasts (if you have one, or just use alert)
    function showCustomAlert(type, message) {
        // You can replace this with your actual toast/alert library (e.g., SweetAlert, Toastr)
        alert(`${type}: ${message}`);
    }

    // --- Signup Handler (UNCHANGED from your original code) ---
    $("#signupBtn").click(function () {
        const email = $("#signupEmail").val();
        const pwd = $("#signupPwd").val();
        const utype = $("#signupRole").val(); // this is the role (client/influencer)

        if (!email || !pwd || !utype) {
            alert("Please fill all fields.");
            return;
        }

        // Using $.get as per your original code, but remember POST is more secure for credentials
        $.get("/signup-process", { txtEmail: email, pwd, combo: utype })
            .done(function (resp) {
                alert(resp);
                if (resp.includes("successfully")) {
                    // Hide modal
                    $("#signupModal").modal("hide");

                    // Store email & redirect based on role
                    if (utype === "Client") {
                        localStorage.setItem("clientEmail", email);
                        window.location.href = "client-Dash.html";
                    } else if (utype === "influencer") {
                        localStorage.setItem("inflEmail", email);
                        window.location.href = "Infl-Dash.html";
                    }
                }
            })
            .fail(function (err) {
                alert("Signup failed: " + err.statusText);
            });
    });

    // --- Login Handler (MODIFIED for Admin Redirection) ---
    $("#loginBtn").click(function () {
        const email = $("#loginEmail").val();
        const pwd = $("#loginPwd").val();

        if (!email || !pwd) {
            showCustomAlert("Error", "Please enter login credentials.");
            return;
        }

        // Use $.post for login to send sensitive data in the request body (SECURITY FIX)
        $.post("/login-process", { txtEmaill: email, txtPwd: pwd })
            .done(function (resp) {
                // Server now sends JSON response
                if (resp.success) {
                    const userRole = resp.role; // Get the role from the server response
                    const userEmail = resp.email;

                    if (userRole === "Admin") {
                        localStorage.setItem("adminEmail", userEmail);
                        window.location.href = "admin-Dash.html"; // Redirect to admin dashboard
                    } else if (userRole === "Client") {
                        localStorage.setItem("clientEmail", userEmail);
                        window.location.href = "client-Dash.html";
                    } else if (userRole === "Influencer") { // Note: Server might send 'Influencer'
                        localStorage.setItem("inflEmail", userEmail);
                        window.location.href = "Infl-Dash.html";
                    } else {
                        showCustomAlert("Warning", "Unknown user type. Redirecting to home.");
                        window.location.href = "index.html"; // Fallback
                    }
                } else {
                    showCustomAlert("Error", resp.message || "Login failed.");
                }
            })
            .fail(function (jqXHR) {
                // Error handling for failed HTTP request
                const errorMessage = jqXHR.responseJSON ? jqXHR.responseJSON.message : jqXHR.statusText;
                showCustomAlert("Error", "Login failed: " + errorMessage);
                console.error("Login AJAX Error:", jqXHR.responseText);
            });
    });

  // --- Creator Filter Logic ---

  // Function to filter creators
  function filterCreators(category) {
    const creatorItems = $(".creator-item");

    creatorItems.each(function () {
      const itemCategory = $(this).data("category"); // Get data-category from each item
      if (category === "all" || itemCategory === category) {
        $(this).show(); // Show if it matches the category or if "all" is selected
      } else {
        $(this).hide(); // Hide otherwise
      }
    });
  }

  // Event listener for filter buttons (All, Fashion, Travel, etc.)
  $(".filter-btn").click(function () {
    $(".filter-btn").removeClass("active"); // Remove active class from all buttons
    $(this).addClass("active"); // Add active class to the clicked button

    const category = $(this).data("category"); // Get the category from the data-category attribute
    filterCreators(category); // Call the filter function
  });

  // Event listener for footer links
  $(".creator-filter-link").click(function (e) {
    e.preventDefault(); // Prevent default link behavior (like jumping to #creators without filtering)

    const category = $(this).data("filter"); // Get the category from data-filter attribute
    filterCreators(category); // Apply the filter

    // Scroll to the creators section smoothly
    $("html, body").animate(
      {
        scrollTop: $("#creators").offset().top,
      },
      800 // Scroll duration in milliseconds
    );

    // Update the active state on the filter buttons in the creators section
    $(".filter-btn").removeClass("active");
    $(`.filter-btn[data-category="${category}"]`).addClass("active");
  });

  // Initial filter when the page loads (show all creators by default)
  filterCreators("all");

  // --- Contact Form Submission Handler ---
  $("#contactForm").submit(function (event) {
    event.preventDefault(); // Prevent default form submission

    const name = $("#contactName").val().trim();
    const email = $("#contactEmail").val().trim();
    const message = $("#contactMessage").val().trim();

    if (!name || !email || !message) {
      alert("Please fill in all fields.");
      return;
    }

    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      alert("Please enter a valid email address.");
      return;
    }

    // Disable button and show loading text
    $("#sendMessageBtn").prop("disabled", true).text("Sending...");

    // Send data to your server using a POST request
    $.post("/send-message", { name, email, message })
      .done(function (resp) {
        alert(resp); // Show success or error message from the server
        if (resp.includes("successfully")) {
          $("#contactForm")[0].reset(); // Clear the form on success
        }
      })
      .fail(function (jqXHR, textStatus, errorThrown) {
        alert("Failed to send message. Please try again later.");
        console.error("AJAX Error:", textStatus, errorThrown, jqXHR.responseText);
      })
      .always(function () {
        // Re-enable button and restore original text regardless of success or failure
        $("#sendMessageBtn").prop("disabled", false).text("Send Message");
      });
  });
});

// Custom Typewriter Function for Hero Section
window.addEventListener("load", function () {
  const heroTitle = document.querySelector(".hero-title");
  // Store the full text and clear the element for typing animation
  const originalText = heroTitle.textContent;
  heroTitle.textContent = ""; // Clear the text initially

  // Function to simulate typing
  function typeWriter(element, text, speed) {
    let i = 0;
    function type() {
      if (i < text.length) {
        element.textContent += text.charAt(i);
        i++;
        setTimeout(type, speed);
      }
    }
    type(); // Start the typing
  }

  // Call the typewriter function after a short delay (optional, for effect)
  setTimeout(() => {
    typeWriter(heroTitle, originalText, 70); // 70ms per character for typing speed
  }, 500); // Start typing after 0.5 seconds
});