
// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
    const logoutButton = document.querySelector('.logoutButton');

    
    // Logout functionality
    document.querySelector('.logoutButton').addEventListener('click', function() {
    if(confirm('Are you sure you want to log out?')) {
        window.location.href = '../main/main.html';
        }
    });



    // Sample data for the chart (would come from API in real app)
const events = [
    {
        id: 1,
        title: "Entrepeneurship Workshop",
        organizer: "Commerce Club",
        date: "2026-04-15",
        time: "6:00 PM"
    },
    {
        id: 2,
        title: "AI & Machine Learning Workshop",
        organizer: "Computer Science Department",
        date: "2026-04-20",
        time: "2:00 PM"
    },    
    {
        id: 3,
        title: "Career Fair 2026",
        organizer: "Career Services",
        date: "2026-05-05",
        time: "10:00 AM"
    }
];

// DOM elements
const eventsTableBody = document.getElementById('events-table-body');

// Format date for display
function formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
}

// Render events table
function renderEvents() {
    eventsTableBody.innerHTML = '';
    
    events.forEach(event => {
        const row = document.createElement('tr');
        
        row.innerHTML = `
            <td class="event-title">${event.title}</td>
            <td>${event.organizer}</td>
            <td>${formatDate(event.date)}<br><small>${event.time}</small></td>
            <td>
                <div class="action-buttons">
                    <button class="btn btn-approve approve-event" data-id="${event.id}">Approve</button>
                    <button class="btn btn-reject reject-event" data-id="${event.id}">Reject</button>
                </div>
            </td>
        `;
        
        eventsTableBody.appendChild(row);
    });
    
    // Add event listeners to action buttons
    document.querySelectorAll('.approve-event').forEach(button => {
        button.addEventListener('click', (e) => {
            const eventId = parseInt(e.target.getAttribute('data-id'));
            approveEvent(eventId);
        });
    });
    
    document.querySelectorAll('.reject-event').forEach(button => {
        button.addEventListener('click', (e) => {
            const eventId = parseInt(e.target.getAttribute('data-id'));
            rejectEvent(eventId);
        });
    });
}




// Approve event
async function approveEvent(eventId) {
    const eventIndex = events.findIndex(ev => ev.id === eventId);
    if (eventIndex !== -1) {
        const eventTitle = events[eventIndex].title;

        try {
            const res = await fetch(`/api/admin/events/${eventId}/moderate`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action: "approve" })
            });

            if (res.ok) {
                events.splice(eventIndex, 1);
                renderEvents();
            } else {
                console.error(`Error approving "${eventTitle}"`);
            }
        } catch (err) {
            console.error(`Network error while approving "${eventTitle}":`, err);
        }
    }
}

// Reject event
async function rejectEvent(eventId) {
    const eventIndex = events.findIndex(ev => ev.id === eventId);
    if (eventIndex !== -1) {
        const eventTitle = events[eventIndex].title;
        const reason = prompt(`Enter reason for rejecting "${eventTitle}":`) || "No reason provided";

        try {
            const res = await fetch(`/api/admin/events/${eventId}/moderate`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action: "reject", reason })
            });

            if (res.ok) {
                events.splice(eventIndex, 1);
                renderEvents();
            } else {
                console.error(`Error rejecting "${eventTitle}"`);
            }
        } catch (err) {
            console.error(`Network error while rejecting "${eventTitle}":`, err);
        }
    }
}



renderEvents();

});

