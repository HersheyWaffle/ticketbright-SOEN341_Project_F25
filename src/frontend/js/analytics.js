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
        alert('Logging out...');
    }
});

const eventCards = document.querySelectorAll('.eventAnalyticsCard');
eventCards.forEach(card => {
    card.addEventListener('click', function (e) {
        if (e.target.closest('button, input')) return;
        const eventName = this.querySelector('h3').textContent;
        alert(`Viewing detailed analytics for: ${eventName}`);
    });
});

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