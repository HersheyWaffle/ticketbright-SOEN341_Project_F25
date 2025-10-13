document.addEventListener('DOMContentLoaded', function() {
    const ticketButton = document.getElementById('ticketButton');
    const calendarButton = document.getElementById('calendarButton');
    const mapButton = document.getElementById('mapButton');
    
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