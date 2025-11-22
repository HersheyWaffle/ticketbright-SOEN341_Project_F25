document.addEventListener('DOMContentLoaded', async function () {
    const ticketButton = document.getElementById('ticketButton');
    const calendarButton = document.getElementById('calendarButton');
    const mapButton = document.getElementById('mapButton');
    const homeButton = document.querySelector('.homeButton');
    const logoutButton = document.querySelector('.logoutButton');

    // --- Navigation ---
    homeButton.addEventListener('click', () => window.location.href = '../main/main.html');
    logoutButton.addEventListener('click', () => {
        if (confirm('Are you sure you want to log out?')) {
            localStorage.removeItem("user");
            window.location.href = '../main/main.html';
        }
    });

    // --- Get event ID from URL ---
    const params = new URLSearchParams(window.location.search);
    const eventId = params.get("id");

    if (!eventId) {
        alert("Invalid event link");
        return;
    }

    // --- Load event data ---
    try {
        const res = await fetch(`/api/events/${eventId}`);
        const event = await res.json();

        if (!res.ok) throw new Error(event.error || "Failed to fetch event");

        document.querySelector(".event-title").textContent = event.title;
        document.getElementById("orgID").textContent = event.organizerName;
        document.getElementById("orgID").href = `../search/event-search.html?query=${encodeURIComponent(event.organizerName)}`;
        document.getElementById("eventBanner").src = `/${event.bannerPath || "default-banner.jpg"}`;
        document.querySelector(".info-date-time p:first-of-type").textContent = new Date(event.date).toLocaleDateString();
        document.querySelector(".info-date-time p:nth-of-type(2)").textContent = event.time;
        document.querySelector(".info-location p:first-of-type").textContent = event.location || "Location TBD";

        // price info
        document.querySelectorAll(".ticket-price").forEach(p => {
            p.textContent = event.ticketType === "paid" ? `$${event.price.toFixed(2)} CAD` : "Free";
        });

        document.querySelector(".event-description p").textContent = event.description;
    } catch (err) {
        console.error(err);
        alert("Error loading event: " + err.message);
    }

    // --- Ticket purchase ---
    ticketButton.addEventListener("click", async () => {
        const params = new URLSearchParams(window.location.search);
        const eventId = params.get("id");

        if (eventId) {
            window.location.href = `../purchase/purchase.html?id=${encodeURIComponent(eventId)}`;
        } else {
            console.warn("Event ID missing from URL, defaulting to purchase page");
            window.location.href = "../purchase/purchase.html";
        }
    });

    // --- Map & Calendar buttons (placeholders) ---
    calendarButton.addEventListener('click', () => window.location.href = '../calendar/calendar.html');
    mapButton.addEventListener('click', () => window.location.href = '../map/map.html');
});