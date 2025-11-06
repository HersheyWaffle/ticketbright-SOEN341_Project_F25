document.addEventListener('DOMContentLoaded', function() {
    const ticketButton = document.getElementById('ticketButton');
    const calendarButton = document.getElementById('calendarButton');
    const mapButton = document.getElementById('mapButton');
    
    const homeButton = document.querySelector('.homeButton');
    const logoutButton = document.querySelector('.logoutButton');

    // Home functionality
    document.querySelector('.homeButton').addEventListener('click', function() {
    
        window.location.href = '../main/main.html';
        
    });

    // Logout functionality
    document.querySelector('.logoutButton').addEventListener('click', function() {
    if(confirm('Are you sure you want to log out?')) {
        window.location.href = '../main/main.html';
        }
    });

    // Function for ticket button
    ticketButton.addEventListener('click', function() {
        window.location.href = '../buy/buy.html';
    });
    
    // Function for calendar button
    calendarButton.addEventListener('click', function() {
        window.location.href = '../calendar/calendar.html';
    });
    
    // Function for map button
    mapButton.addEventListener('click', function() {
        window.location.href = '../map/map.html';
    });
});