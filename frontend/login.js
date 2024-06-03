document.addEventListener("DOMContentLoaded", function () {
  const loginForm = document.getElementById("login-form");
  const registerForm = document.getElementById("register-form");
  const showRegisterLink = document.getElementById("show-register");
  const showLoginLink = document.getElementById("show-login");

  showRegisterLink.addEventListener("click", function (e) {
    e.preventDefault();
    loginForm.style.display = "none";
    registerForm.style.display = "block";
  });

  showLoginLink.addEventListener("click", function (e) {
    e.preventDefault();
    loginForm.style.display = "block";
    registerForm.style.display = "none";
  });

  document
    .getElementById("register-form-fields")
    .addEventListener("submit", function (e) {
      e.preventDefault();

      const username = document.getElementById("register-username").value;
      const password = document.getElementById("register-password").value;

      fetch("/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      })
        .then((response) => {
          if (response.ok) {
            return response.json();
          } else {
            throw new Error("Failed to register user");
          }
        })
        .then((data) => {
          alert(data.message);
          // Redirect to login page after successful registration
          window.location.href = "/index.html";
        })
        .catch((error) => {
          alert(error.message);
        });
    });

  document
    .getElementById("login-form-fields")
    .addEventListener("submit", function (e) {
      e.preventDefault();

      const username = document.getElementById("login-username").value;
      const password = document.getElementById("login-password").value;

      fetch("/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      })
        .then((response) => {
          if (response.ok) {
            return response.json();
          } else {
            throw new Error("Invalid username or password");
          }
        })
        .then((data) => {
          // Store token in localStorage
          localStorage.setItem("token", data.token);
          // Redirect to home page
          window.location.href = "home.html";
        })
        .catch((error) => {
          alert(error.message);
        });
    });
});
