
document.querySelectorAll('.tabButton').forEach(button => {
    button.addEventListener('click', function() {
        
        document.querySelectorAll('.tabButton').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.tabContent').forEach(content => content.classList.remove('active'));
  
        this.classList.add('active');
        
        const tabId = this.getAttribute('data-tab');
        document.getElementById(tabId).classList.add('active');
    });
});

document.querySelector('.logoutButton').addEventListener('click', function() {
    if(confirm('Are you sure you want to log out?')) {
        window.location.href = '../main/main.html';

    }
});

document.querySelectorAll('.exportButton').forEach(button => {
    button.addEventListener('click', function() {
        const eventName = this.closest('.eventAnalyticsCard').querySelector('h3').textContent;
        alert(`Exporting attendee list for: ${eventName}`);
    });
});



function refreshAnalytics() {
    alert('Refreshing analytics data...');
}