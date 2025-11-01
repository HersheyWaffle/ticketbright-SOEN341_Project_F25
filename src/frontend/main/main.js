//For searching
document.querySelector('.searchForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const location = document.getElementById('location').value;
    const date = document.getElementById('date').value;
    const search = document.getElementById('search').value;
    const filters = document.getElementById('filters').value;
    
    const searchData = {
        location: location,
        date: date,
        search: search,
        category: filters
    };
    
    if (location.trim() !== '' || date.trim() !== '' || search.trim() !== '') {
        alert(`Searching with:\nLocation: ${location || 'Any'}\nDate: ${date || 'Any'}\nSearch: ${search || 'Any'}\nCategory: ${filters || 'All'}`);
        
    } else {
        alert('Please enter at least one search criteria');
    }
});



//For the date
document.getElementById('date').addEventListener('focus', function() {
    this.type = 'date';
});

document.getElementById('date').addEventListener('blur', function() {
    if (!this.value) {
        this.type = 'text';
    }
});

//Category
const categoryCards = document.querySelectorAll('.categoryCard');
categoryCards.forEach(card => {
    card.addEventListener('click', function() {
        const categoryName = this.querySelector('.categoryName').textContent;
        alert(`Browsing ${categoryName} events`);
        
    });
});