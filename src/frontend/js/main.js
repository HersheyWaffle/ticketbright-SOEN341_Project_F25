document.addEventListener("DOMContentLoaded", () => {
    const authArea = document.getElementById("authArea");
    const storedUser = localStorage.getItem("user");

    if (storedUser) {
        const user = JSON.parse(storedUser);

        // Replace signup/login with username + logout
        authArea.innerHTML = `
      <span class="welcome">Welcome, <strong>${user.username}</strong></span>
      <button id="logoutBtn" class="loginButton">Logout</button>
    `;

        document.getElementById("logoutBtn").addEventListener("click", () => {
            if (confirm('Are you sure you want to log out?')) {
                localStorage.removeItem("user");
                window.location.reload();
            }
        });
    } else {
        // Show default links if not logged in
        authArea.innerHTML = `
      <a class="loginButton" href="../signup-login/signup.html">Sign Up</a>
      <a class="loginButton" href="../signup-login/login.html">Log In</a>
    `;
    }
});

//For searching
document.querySelector(".searchForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const query = document.getElementById("search").value.trim();
    if (query) {
        window.location.href = `../search/event-search.html?query=${encodeURIComponent(query)}`;
    }
});

//For the date
document.getElementById('date').addEventListener('focus', function () {
    this.type = 'date';
});

document.getElementById('date').addEventListener('blur', function () {
    if (!this.value) {
        this.type = 'text';
    }
});

//Category
document.querySelectorAll(".categoryCard").forEach(card => {
    card.addEventListener("click", () => {
        const category = card.dataset.category;
        window.location.href = `../search/event-search.html?category=${encodeURIComponent(category)}`;
    });
});