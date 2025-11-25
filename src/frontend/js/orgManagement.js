// Organizations management functionality
document.addEventListener('DOMContentLoaded', async function () {
  const totalOrganizationsElement = document.getElementById('totalOrganizations');
  const tableBody = document.getElementById('orgTableBody');
  const logoutButton = document.querySelector('.logoutButton');

  // logout
  logoutButton.addEventListener('click', function () {
    if (confirm('Are you sure you want to log out?')) {
      localStorage.removeItem("user");
      window.location.href = '../main/main.html';
    }
  });

  try {
    const res = await fetch("/api/events/organizations/summary");
    const data = await res.json();
    if (!res.ok || !Array.isArray(data)) {
      throw new Error(data.error || "Invalid org summary response");
    }

    // total organizations
    totalOrganizationsElement.textContent = data.length;

    // build table rows
    if (data.length === 0) {
      tableBody.innerHTML = `
        <div class="tableRow">
          <div class="tableCell" colspan="3">
            No organizations found yet.
          </div>
        </div>
      `;
      return;
    }

    tableBody.innerHTML = "";
    data.forEach(org => {
      const row = document.createElement("div");
      row.className = "tableRow";

      const organizersLine = org.organizers
        .map(o => o.username || o.email || "Unknown")
        .join(", ");

      row.innerHTML = `
        <div class="tableCell">
          <div class="orgName">${org.name}</div>
          <div class="orgMeta">${org.eventCount} event${org.eventCount !== 1 ? "s" : ""}</div>
        </div>
        <div class="tableCell">
          <div class="organizersInfo">
            <div class="organizersCount">${org.organizerCount} organizer${org.organizerCount !== 1 ? "s" : ""}</div>
            <div class="organizerNames">${organizersLine}</div>
          </div>
        </div>
        <div class="tableCell actionsCell">
          <button class="manageButton" data-org-name="${org.name}">
            Manage Organization
          </button>
        </div>
      `;

      tableBody.appendChild(row);
    });

    // wire manage buttons to go to edit page
    document.querySelectorAll('.manageButton').forEach(button => {
      button.addEventListener('click', function () {
        const orgName = this.getAttribute('data-org-name');
        window.location.href = `../organization-edit/organization-edit.html?name=${encodeURIComponent(orgName)}`;
      });
    });

    console.log('Organization management page loaded successfully');
    console.log(`Total organizations: ${data.length}`);
  } catch (err) {
    console.error("Failed to load organizations:", err);
    tableBody.innerHTML = `
      <div class="tableRow">
        <div class="tableCell" colspan="3">
          Error loading organizations.
        </div>
      </div>
    `;
    totalOrganizationsElement.textContent = "0";
  }
});

// Logout functionality
document.querySelector('.logoutButton').addEventListener('click', function () {
    if (confirm('Are you sure you want to log out?')) {
        localStorage.removeItem("user");
        window.location.href = '../main/main.html';
    }
});