// Admin Analytics functionality
document.addEventListener('DOMContentLoaded', function() {
    const logoutButton = document.querySelector('.logoutButton');
    
    // Sample data for the chart (would come from API in real app)
    const monthlyData = {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        tickets: [800, 1200, 900, 1100, 1300, 1500, 1400, 1600, 1200, 1000, 900, 700]
    };

    // Initialize the chart
    const ctx = document.getElementById('participationChart').getContext('2d');
    const participationChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: monthlyData.labels,
            datasets: [
                {
                    label: 'Tickets Sold',
                    data: monthlyData.tickets,
                    borderColor: '#3b82f6',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: 'Monthly Ticket Sales',
                    font: {
                        size: 16,
                        weight: 'bold'
                    }
                },
                legend: {
                    position: 'top',
                    labels: {
                        font: {
                            size: 12
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Tickets Sold'
                    },
                    grid: {
                        color: 'rgba(0, 0, 0, 0.1)'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Month'
                    },
                    grid: {
                        color: 'rgba(0, 0, 0, 0.1)'
                    }
                }
            },
            interaction: {
                intersect: false,
                mode: 'index'
            }
        }
    });

    // Logout functionality
    logoutButton.addEventListener('click', function() {
        if(confirm('Are you sure you want to log out?')) {
            alert('Logging out...');
            window.location.href = 'main.html';
        }
    });

    //Simulate real-time updates
    function simulateDataUpdate() {
        setTimeout(() => {
            // Add new data point for current month (simulated)
            const newTickets = Math.floor(Math.random() * 500) + 800;
            
            //Update chart data
            participationChart.data.datasets[0].data.push(newTickets);
            participationChart.data.labels.push('Now');
            
            //Remove first data point to keep 12 months visible
            if (participationChart.data.labels.length > 12) {
                participationChart.data.labels.shift();
                participationChart.data.datasets[0].data.shift();
            }
            
            participationChart.update();
            
            console.log('Chart updated with new ticket data:', newTickets);
        }, 5000);
    }

    //Start simulated updates
    simulateDataUpdate();

    console.log('Admin analytics dashboard loaded successfully');
});