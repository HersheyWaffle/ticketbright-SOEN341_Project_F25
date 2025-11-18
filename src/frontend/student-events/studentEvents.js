// Student Events functionality
document.addEventListener('DOMContentLoaded', function() {
    const eventItems = document.querySelectorAll('.eventItem');
    const loginButton = document.querySelector('.loginButton');

    // Event item click functionality
    eventItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            const eventId = this.getAttribute('data-event-id');
            const eventName = this.querySelector('.eventName').textContent;
            
            console.log(`Viewing event: ${eventName} (ID: ${eventId})`);
            
            // Redirect to event page
            // window.location.href = `event.html?id=${eventId}`;
            alert(`Redirecting to event: ${eventName}\nEvent ID: ${eventId}\n\nThis would redirect to the event's main page.`);
        });
    });

    // Login button functionality
    loginButton.addEventListener('click', function() {
        alert('Login functionality would go here');
    });

    console.log('Student events page loaded successfully');
});