const user = JSON.parse(localStorage.getItem("user"));
if (!user || (user.role !== "admin" && user.role !== "organizer")) {
  alert("Please log in to access this page.");
  window.location.href = "../signup-login/login.html";
}

//Analytics seems cursed, moving it was the only way my browser would recognize when serving express
document.querySelectorAll('.tabButton').forEach(button => {
    button.addEventListener('click', function () {

        document.querySelectorAll('.tabButton').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.tabContent').forEach(content => content.classList.remove('active'));

        this.classList.add('active');

        const tabId = this.getAttribute('data-tab');
        document.getElementById(tabId).classList.add('active');
    });
});

document.querySelector('.logoutButton').addEventListener('click', function () {
    if (confirm('Are you sure you want to log out?')) {
        localStorage.removeItem("user");
        window.location.href = '../main/main.html';
    }
});

(async () => {
    const eventCards = document.querySelectorAll('.eventAnalyticsCard');

    let totalTicketsSold = 0;
    let totalAttendances = 0;
    let totalWeightedRating = 0;
    let totalEventsWithRating = 0;

    for (const card of eventCards) {
        const eventName = card.querySelector('h3').textContent.trim();
        const eventId = eventName.toLowerCase().replace(/\s+/g, '_');

        try {
            const res = await fetch(`/api/events/${eventId}/analytics`);
            if (!res.ok) throw new Error('Failed to fetch analytics');
            const data = await res.json();

            card.querySelector('.ticketsSold .statNumber').textContent = data.ticketsSold;
            card.querySelector('.attendances .statNumber').textContent = data.attendances;
            card.querySelector('.attendanceRate .statNumber').textContent = `${data.attendanceRate}%`;
            card.querySelector('.rating .statNumber').textContent = data.averageRating.toFixed(1);
            card.querySelector('.remainingCapacity .statNumber').textContent = data.remainingCapacity;

            totalTicketsSold += data.ticketsSold;
            totalAttendances += data.attendances;
            if (data.averageRating > 0) {
                totalWeightedRating += data.averageRating;
                totalEventsWithRating++;
            }
        } catch (err) {
            console.error(`Error loading analytics for ${eventId}:`, err);
        }
    }

    const overallAttendanceRate = totalTicketsSold
        ? ((totalAttendances / totalTicketsSold) * 100).toFixed(2)
        : 0;
    const overallAverageRating = totalEventsWithRating
        ? (totalWeightedRating / totalEventsWithRating).toFixed(2)
        : 0;

    document.querySelector('.ticketsSoldTotal .statValue').textContent = totalTicketsSold;
    document.querySelector('.attendanceRateTotal .statValue').textContent = `${overallAttendanceRate}%`;
    document.querySelector('.ratingAverage .statValue').textContent = overallAverageRating;
})();

document.addEventListener("click", async (e) => {
    if (e.target.classList.contains("exportButton")) {
        const button = e.target;
        const eventName = button.closest(".eventAnalyticsCard").querySelector("h3").textContent.trim();
        const eventId = eventName.toLowerCase().replace(/\s+/g, "_");
        const url = `/api/events/${eventId}/attendees.csv`;

        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error("Failed to fetch CSV");
            const blob = await response.blob();
            const downloadUrl = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = downloadUrl;
            a.download = `attendees_${eventId}.csv`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            URL.revokeObjectURL(downloadUrl);
        } catch (err) {
            console.error(err);
            alert("Error exporting CSV.");
        }
    }
});

document.querySelectorAll('.validateButton').forEach((button, index) => {
    button.addEventListener('click', async (e) => {
        const button = e.target;
        const eventName = button.closest(".eventAnalyticsCard").querySelector("h3").textContent.trim();
        const eventId = eventName.toLowerCase().replace(/\s+/g, "_");
        const fileInput = button.closest(".eventAnalyticsCard").querySelector('.qrInput');
        const file = fileInput.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await fetch('/api/tickets/validate', {
                method: 'POST',
                body: formData
            });

            const data = await res.json();

            if (!res.ok) {
                alert(`Error validating QR for ${eventName}: ${data.message || 'Unknown error'}`);
                return;
            }

            if (data.valid) {
                alert(`✅ ${data.message}\nTicket ID: ${data.ticketId}`);       //TODO Replace with real messages
            } else {
                alert(`❌ ${data.message}`);
            }
        } catch (err) {
            console.error('Validation failed:', err);
            alert(`Error validating QR: ${err.message}`);
        }

        // Reset file input so the same file can be re-uploaded if needed
        fileInput.value = '';
    });
});

function refreshAnalytics() {
    alert('Refreshing analytics data...');
}