
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
        alert('Logging out...');
    }
});

document.querySelectorAll('.exportButton').forEach(button => {
    button.addEventListener('click', function() {
        const eventName = this.closest('.eventAnalyticsCard').querySelector('h3').textContent;
        alert(`Exporting attendee list for: ${eventName}`);
    });
});

document.querySelectorAll('.validateButton').forEach((button, index) => {
    button.addEventListener('click', function() {
        const qrInputId = `qrCodeInput${index + 1}`;
        const qrCode = document.getElementById(qrInputId).value;
        const eventName = this.closest('.eventAnalyticsCard').querySelector('h3').textContent;
        
        if(qrCode.trim() === '') {
            alert('Please enter a QR code');
        } else {
            alert(`Validating QR code for ${eventName}: ${qrCode}`);
        }
    });
});

const eventCards = document.querySelectorAll('.eventAnalyticsCard');
eventCards.forEach(card => {
    card.addEventListener('click', function() {
        const eventName = this.querySelector('h3').textContent;
        alert(`Viewing detailed analytics for: ${eventName}`);
    });
});

function refreshAnalytics() {
    alert('Refreshing analytics data...');
}