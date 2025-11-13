// Organizations management functionality
document.addEventListener('DOMContentLoaded', function () {
    const totalOrganizationsElement = document.getElementById('totalOrganizations');
    const manageButtons = document.querySelectorAll('.manageButton');
    const logoutButton = document.querySelector('.logoutButton');

    // Count total organizations
    const totalOrgs = document.querySelectorAll('.tableRow').length;
    totalOrganizationsElement.textContent = totalOrgs;

    // Manage Organization button functionality
    // Manage Organization button functionality
    manageButtons.forEach(button => {
        button.addEventListener('click', function () {
            const orgId = this.getAttribute('data-org-id');
            const orgName = this.closest('.tableRow').querySelector('.orgName').textContent;

            console.log(`Managing organization: ${orgName} (ID: ${orgId})`);

            // Redirect directly to organization-edit page
            window.location.href = `/organization-edit/organization-edit.html`;
        });
    });

    // manageButtons.forEach(button => {
    //     button.addEventListener('click', function() {
    //         const orgId = this.getAttribute('data-org-id');
    //         const orgName = this.closest('.tableRow').querySelector('.orgName').textContent;

    //         console.log(`Managing organization: ${orgName} (ID: ${orgId})`);

    // Redirect to organization management page
    // In real app, this would be: window.location.href = `manage-organization.html?id=${orgId}`;
    // alert(`Redirecting to manage organization: ${orgName}\nOrganization ID: ${orgId}\n\nThis would redirect to the organization management page created by your teammate.`);
    window.location.href = '../organization-edit/organization-edit.html';

});

// Logout functionality
document.querySelector('.logoutButton').addEventListener('click', function () {
    if (confirm('Are you sure you want to log out?')) {
        localStorage.removeItem("user");
        window.location.href = '../main/main.html';
    }
});


console.log('Organization management page loaded successfully');
console.log(`Total organizations: ${totalOrgs}`);