const form = document.getElementById('form');
const email_input = document.getElementById('emailInput');
const password_input = document.getElementById('passwordInput');
const error_message = document.getElementById('errorMessage');

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  if (!email_input.value || !password_input.value) {
    error_message.innerText = "Email and password are required";
    return;
  }

  const userData = {
    email: email_input.value,
    password: password_input.value
  };

  try {
    const res = await fetch("/api/users/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData)
    });
    const data = await res.json();

    if (!res.ok) throw new Error(data.error || "Login failed");

    alert("Welcome back, " + data.user.username + "!");
    localStorage.setItem("user", JSON.stringify(data.user));
    if (data.user.role === "admin") window.location.href = "../admin-analytics/adminAnalytics.html";
    else if (data.user.role === "organizer") window.location.href = "../analytics/analytics.html";
    else window.location.href = "../main/main.html";
  } catch (err) {
    error_message.innerText = err.message;
  }
});