const user = JSON.parse(localStorage.getItem("user"));
if (!user || user.role !== "admin") {
  alert("You are not authorized to access this page.");
  window.location.href = "../main/main.html";
}

document.addEventListener("DOMContentLoaded", () => {
  // Logout functionality
  document.querySelector(".logoutButton").addEventListener("click", () => {
    if (confirm("Are you sure you want to log out?")) {
      localStorage.removeItem("user");
      window.location.href = "../main/main.html";
    }
  });

  // REAL events list (from DB)
  let events = [];

  // DOM elements
  const eventsTableBody = document.getElementById("events-table-body");

  // Format date for display
  function formatDate(dateString) {
    if (!dateString) return "—";
    const options = { year: "numeric", month: "long", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  }

  // Fetch only published events for moderation
  async function loadPublishedEvents() {
    const res = await fetch("/api/admin/events/published");
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    events = await res.json();
    renderEvents();
  }

  // Render events table
  function renderEvents() {
    eventsTableBody.innerHTML = "";

    if (events.length === 0) {
      eventsTableBody.innerHTML = `
        <tr>
          <td colspan="4" style="text-align:center; padding:1rem;">
            No published events waiting for moderation.
          </td>
        </tr>
      `;
      return;
    }

    events.forEach(event => {
      const row = document.createElement("tr");

      const organizerDisplay =
        event.organizerName ||
        event.organizerUsername ||
        event.organizerEmail ||
        "—";

      row.innerHTML = `
        <td class="event-title">${event.title}</td>
        <td>${organizerDisplay}</td>
        <td>${formatDate(event.date)}<br><small>${event.time || ""}</small></td>
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
    eventsTableBody.querySelectorAll(".approve-event").forEach(button => {
      button.addEventListener("click", () => {
        const eventId = button.getAttribute("data-id");
        approveEvent(eventId);
      });
    });

    eventsTableBody.querySelectorAll(".reject-event").forEach(button => {
      button.addEventListener("click", () => {
        const eventId = button.getAttribute("data-id");
        rejectEvent(eventId);
      });
    });
  }

  // Approve event -> set status to "approved"
  async function approveEvent(eventId) {
    try {
      const res = await fetch(`/api/admin/events/${eventId}/moderate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "approve" })
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      // remove locally + rerender
      events = events.filter(ev => ev.id !== eventId);
      renderEvents();
    } catch (err) {
      console.error("Approve failed:", err);
      alert("Error approving event.");
    }
  }

  // Reject event -> delete row
  async function rejectEvent(eventId) {
    if (!confirm("Rejecting will delete this event. Continue?")) return;

    try {
      const res = await fetch(`/api/admin/events/${eventId}/moderate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reject" })
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      // remove locally + rerender
      events = events.filter(ev => ev.id !== eventId);
      renderEvents();
    } catch (err) {
      console.error("Reject failed:", err);
      alert("Error rejecting event.");
    }
  }

  // Initial load
  loadPublishedEvents().catch(err => {
    console.error(err);
    alert("Failed to load published events.");
  });
});