const API_BASE = "http://127.0.0.1:5000"; // Flask server URL

function login(event) {
  event.preventDefault();
  const username = document.getElementById("login-username").value;
  const password = document.getElementById("login-password").value;
  const shift = document.getElementById("login-shift").value;

  fetch(`${API_BASE}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password })
  })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        localStorage.setItem("loggedInUser", username);
        localStorage.setItem("selectedCountry", data.country);
        localStorage.setItem("selectedShift", shift);
        localStorage.setItem("userRole", data.role);

        // Redirect based on role
        if (data.role === "worker") {
          window.location.href = "worker_display/worker_display.html";
        } else {
          window.location.href = "index.html";
        }
      } else {
        alert(data.message || "Login failed.");
      }
    })
    .catch(err => alert("Server error during login."));
}

function register(event) {
  event.preventDefault();
  const username = document.getElementById("register-username").value;
  const password = document.getElementById("register-password").value;
  const country = document.getElementById("register-country").value;
  const role = document.getElementById("register-role").value;

  fetch(`${API_BASE}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password, country, role })
  })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        // Clear any session data
        localStorage.removeItem("loggedInUser");
        localStorage.removeItem("selectedCountry");
        localStorage.removeItem("selectedShift");
        localStorage.setItem("userRole", data.role);

        alert("Registration successful! Please log in.");
        window.location.href = "index.html";
      } else {
        alert(data.message || "Registration failed.");
      }
    })
    .catch(err => alert("Server error during registration."));
}


function logout() {
  localStorage.removeItem("loggedInUser");
  localStorage.removeItem("selectedCountry");
  localStorage.removeItem("selectedShift");
  window.location.href = "index.html";
}

function protectDashboard() {
  const user = localStorage.getItem("loggedInUser");
  if (!user) {
    alert("Please log in first.");
    window.location.href = "index.html";
  }
}


