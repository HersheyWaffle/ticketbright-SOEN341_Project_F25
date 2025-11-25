const user = JSON.parse(localStorage.getItem("user"));
if (!user || user.role !== "admin") {
    alert("You are not authorized to access this page.");
    window.location.href = "../main/main.html";
}

document.addEventListener("DOMContentLoaded", async () => {
    // Logout
    document.querySelector(".logoutButton").addEventListener("click", () => {
        if (confirm("Are you sure you want to log out?")) {
            localStorage.removeItem("user");
            window.location.href = "../main/main.html";
        }
    });

    // Elements
    const totalEventsEl = document.getElementById("totalEventsValue");
    const totalTicketsEl = document.getElementById("totalTicketsValue");

    // 1) Load top stats
    async function loadStats() {
        const res = await fetch("/api/admin/analytics/stats");
        if (!res.ok) throw new Error(`Stats HTTP ${res.status}`);
        const data = await res.json();

        totalEventsEl.textContent = data.totalEvents.toLocaleString();
        totalTicketsEl.textContent = data.totalTicketsIssued.toLocaleString();
    }

    // 2) Load monthly chart data
    async function loadMonthlyChart() {
        const res = await fetch("/api/admin/analytics/monthly");
        if (!res.ok) throw new Error(`Monthly HTTP ${res.status}`);
        const rows = await res.json();

        // Convert to labels + data for Chart.js
        // labels like "2025-01" -> "Jan 2025" (simple formatting)
        const labels = rows.map(r => r.month);
        const tickets = rows.map(r => Number(r.tickets) || 0);

        const ctx = document.getElementById("participationChart").getContext("2d");
        new Chart(ctx, {
            type: "line",
            data: {
                labels,
                datasets: [
                    {
                        label: "Tickets Sold",
                        data: tickets,
                        borderColor: "#3b82f6",
                        backgroundColor: "rgba(59, 130, 246, 0.1)",
                        borderWidth: 3,
                        fill: true,
                        tension: 0.4,
                    },
                ],
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: "Monthly Ticket Sales",
                        font: { size: 16, weight: "bold" },
                    },
                    legend: { position: "top" },
                },
                scales: {
                    y: { beginAtZero: true, title: { display: true, text: "Tickets Sold" } },
                    x: { title: { display: true, text: "Month" } },
                },
                interaction: { intersect: false, mode: "index" },
            },
        });
    }

    try {
        await loadStats();
        await loadMonthlyChart();
        console.log("Admin analytics loaded from DB.");
    } catch (err) {
        console.error(err);
    }
});