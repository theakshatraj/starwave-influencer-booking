$(document).ready(function () {
  //  Signup Handler
$("#signupBtn").click(function () {
  const email = $("#signupEmail").val();
  const pwd = $("#signupPwd").val();
  const utype = $("#signupRole").val(); // this is the role (client/influencer)

  if (!email || !pwd || !utype) {
    alert("Please fill all fields.");
    return;
  }

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

  //  Login Handler
  $("#loginBtn").click(function () {
    const email = $("#loginEmail").val();
    const pwd = $("#loginPwd").val();

    if (!email || !pwd) {
      alert("Please enter login credentials.");
      return;
    }

    $.get("/login-process", { txtEmaill: email, txtPwd: pwd })
      .done(function (resp) {
        if (resp === "Client") {
          localStorage.setItem("clientEmail", email);
          window.location.href = "client-Dash.html";
        } else if (resp === "Influencer") {
          localStorage.setItem("inflEmail", email);
          window.location.href = "Infl-Dash.html";
        } else {
          alert(resp);
        }
      })
      .fail(function (err) {
        alert("Login failed: " + err.statusText);
      });
  });
});
