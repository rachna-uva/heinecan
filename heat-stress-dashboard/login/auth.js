function register(event) {
  event.preventDefault();
  const username = document.getElementById("register-username").value;
  const password = document.getElementById("register-password").value;
  const country = document.getElementById("register-country").value;

  // Store both password and country
  const userData = { password: password, country: country };
  localStorage.setItem("user_" + username, JSON.stringify(userData));

  alert("Registration successful! Please log in.");
  window.location.href = "index.html";
}

function login(event) {
  event.preventDefault();
  const username = document.getElementById("login-username").value;
  const password = document.getElementById("login-password").value;

  const stored = localStorage.getItem("user_" + username);
  if (stored) {
    const userData = JSON.parse(stored);
    if (userData.password === password) {
      localStorage.setItem("loggedInUser", username);
      localStorage.setItem("selectedCountry", userData.country);
      window.location.href = "dashboard.html";
      return;
    }
  }

  alert("Invalid username or password");
}

function logout() {
  localStorage.removeItem("loggedInUser");
  localStorage.removeItem("selectedCountry");
  window.location.href = "index.html";
}

function protectDashboard() {
  const user = localStorage.getItem("loggedInUser");
  if (!user) {
    alert("Please log in first.");
    window.location.href = "index.html";
  }
}

