// Current organization data (would come from URL parameters or API)
const currentOrganization = {
    id: 1,
    name: "Computer Science Club"
};

// Current organization members data
let organizationMembers = [
    { id: 1, name: "Alex Johnson", email: "alex.johnson@gmail.com", role: "admin" },
    { id: 2, name: "Sarah Chen", email: "sarah.chen@gmail.com", role: "admin" },
    { id: 3, name: "Mike Rodriguez", email: "mike.rodriguez@gmail.com", role: "member" },
    { id: 4, name: "Emily Watson", email: "emily.watson@gmail.com", role: "member" },
    { id: 5, name: "David Kim", email: "david.kim@gmail.com", role: "member" }
];

// Existing organizers from our system (would come from API)
const existingOrganizers = {
    'ayla.kent@gmail.com': 'Ayla Kent',
    'ben.fred@gmail.com': 'Ben Fred',
    'chloe.tran@gmail.com': 'Chloe Tran',
    'diego.park@gmail.com': 'Diego Park',
    'emma.wilson@gmail.com': 'Emma Wilson',
    'frank.liu@gmail.com': 'Frank Liu',
    'grace.kim@gmail.com': 'Grace Kim',
    'henry.brown@gmail.com': 'Henry Brown',
    'alex.johnson@gmail.com': 'Alex Johnson',
    'sarah.chen@gmail.com': 'Sarah Chen',
    'mike.rodriguez@gmail.com': 'Mike Rodriguez',
    'emily.watson@gmail.com': 'Emily Watson',
    'david.kim@gmail.com': 'David Kim'
};

let previousAutoFilledName = '';

// DOM Elements
const els = {
    orgTitle: document.getElementById("orgTitle"),
    membersTable: document.getElementById("membersTable"),
    addMemberBtn: document.getElementById("addMemberBtn"),
    addMemberModal: document.getElementById("addMemberModal"),
    closeModal: document.getElementById("closeModal"),
    cancelAdd: document.getElementById("cancelAdd"),
    confirmAdd: document.getElementById("confirmAdd"),
    memberEmail: document.getElementById("memberEmail"),
    memberName: document.getElementById("memberName"),
    memberRole: document.getElementById("memberRole"),
    backBtn: document.getElementById("backBtn"),
    userFound: document.getElementById("userFound"),
    foundUserName: document.getElementById("foundUserName")
};

// Initialize the page
document.addEventListener('DOMContentLoaded', function() {
    initializePage();
    setupEventListeners();
});

function initializePage() {
    // Set organization name in title
    els.orgTitle.textContent = currentOrganization.name;
    renderMembersTable();
}

// Set up event listeners
function setupEventListeners() {
    // Modal controls
    els.addMemberBtn.addEventListener('click', openAddMemberModal);
    els.closeModal.addEventListener('click', closeAddMemberModal);
    els.cancelAdd.addEventListener('click', closeAddMemberModal);
    els.confirmAdd.addEventListener('click', addNewMember);
}

// Check if organizer exists in our system
function checkExistingOrganizer() {
    const email = els.memberEmail.value.trim().toLowerCase();
    
    if (isValidEmail(email)) {
        // Simulate API call to check if organizer exists
        setTimeout(() => {
            if (existingOrganizers[email]) {
                // Organizer found - auto-fill the name
                if (!els.memberName.value || els.memberName.value === previousAutoFilledName) {
                    els.memberName.value = existingOrganizers[email];
                }
                els.foundUserName.textContent = existingOrganizers[email];
                els.userFound.classList.add('active');
                previousAutoFilledName = existingOrganizers[email];
            } else {
                // Organizer not found
                els.userFound.classList.remove('active');
                previousAutoFilledName = '';
            }
        }, 300);
    } else {
        els.userFound.classList.remove('active');
        previousAutoFilledName = '';
    }
}

// Render members table
function renderMembersTable() {
    if (organizationMembers.length === 0) {
        els.membersTable.innerHTML = `
            <tr>
                <td colspan="4" class="emptyState">
                    <div class="emptyStateIcon">
                        <i class="fas fa-users"></i>
                    </div>
                    <h3 class="emptyStateTitle">No Members Found</h3>
                    <p class="emptyStateText">Add members to your organization to get started</p>
                </td>
            </tr>
        `;
    } else {
        const rows = organizationMembers.map(member => `
            <tr data-id="${member.id}">
                <td>${member.name}</td>
                <td>${member.email}</td>
                <td>
                    <span class="roleBadge role-${member.role}">
                        ${member.role.charAt(0).toUpperCase() + member.role.slice(1)}
                    </span>
                </td>
                <td class="actions">
                    <select class="formInput btn-sm" onchange="changeRole(${member.id}, this.value)">
                        <option value="member" ${member.role === 'member' ? 'selected' : ''}>Member</option>
                        <option value="admin" ${member.role === 'admin' ? 'selected' : ''}>Admin</option>
                    </select>
                    <button class="btn btnDanger btn-sm" onclick="removeMember(${member.id})">
                        <i class="fas fa-trash"></i>
                        Remove
                    </button>
                </td>
            </tr>
        `).join("");
        els.membersTable.innerHTML = rows;
    }
}

// Open add member modal
function openAddMemberModal() {
    els.memberEmail.value = '';
    els.memberName.value = '';
    els.memberRole.value = 'member';
    els.userFound.classList.remove('active');
    previousAutoFilledName = '';
    els.addMemberModal.classList.add('active');
}

// Close add member modal
function closeAddMemberModal() {
    els.addMemberModal.classList.remove('active');
}

// Add new member
function addNewMember() {
    const email = els.memberEmail.value.trim();
    const name = els.memberName.value.trim();
    const role = els.memberRole.value;
    
    if (!email) {
        alert('Please enter an email address');
        return;
    }
    
    if (!isValidEmail(email)) {
        alert('Please enter a valid email address');
        return;
    }
    
    if (!name) {
        alert('Please enter the member\'s name');
        return;
    }
    
    // Check if member already exists in organization
    if (organizationMembers.some(member => member.email === email)) {
        alert('This email is already a member of the organization');
        return;
    }
    
    // Add new member
    const newMember = {
        id: organizationMembers.length + 1,
        name: name,
        email: email,
        role: role
    };
    
    organizationMembers.push(newMember);
    renderMembersTable();
    closeAddMemberModal();
    
    alert(`Successfully added ${name} to the organization`);
}

// Change member role
function changeRole(memberId, newRole) {
    const member = organizationMembers.find(m => m.id === memberId);
    if (!member) return;
    
    if (confirm(`Change ${member.name}'s role to ${newRole}?`)) {
        member.role = newRole;
        renderMembersTable();
        alert(`Successfully changed ${member.name}'s role to ${newRole}`);
    } else {
        renderMembersTable(); // Reset the select
    }
}

// Remove member
function removeMember(memberId) {
    const member = organizationMembers.find(m => m.id === memberId);
    if (!member) return;
    
    if (confirm(`Remove ${member.name} from the organization?`)) {
        organizationMembers = organizationMembers.filter(m => m.id !== memberId);
        renderMembersTable();
        alert(`Successfully removed ${member.name} from the organization`);
    }
}

// Go back to previous page
function goBack() {
    // In a real app, this would use history.back() or router
    alert('Going back to organizations dashboard...');
    // window.history.back(); // Uncomment for real implementation
}

// Utility function to validate email
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Make functions globally available for inline event handlers
window.changeRole = changeRole;
window.removeMember = removeMember;
window.checkExistingOrganizer = checkExistingOrganizer;
window.goBack = goBack;