// DOM elements
const searchInput = document.getElementById('searchInput');
const searchButton = document.getElementById('searchButton');
const resultsCount = document.getElementById('resultsCount');
const clearFiltersBtn = document.getElementById('clearFilters');
const activeFiltersContainer = document.getElementById('activeFilters');
const activeFiltersCount = document.getElementById('activeFiltersCount');
const eventsContainer = document.getElementById('eventsContainer');
const noResults = document.getElementById('noResults');
const loading = document.getElementById('loading');
const sortBy = document.getElementById('sortBy');
const mobileFiltersToggle = document.getElementById('mobileFiltersToggle');
const filtersSidebar = document.getElementById('filtersSidebar');

// State
let activeFilters = {
    search: '',
    category: [],
    organizer: [],
    dateFrom: '',
    dateTo: '',
    location: [],
    ticketType: [],
    mode: [],
    accessibility: []
};

// Initialize the page
document.addEventListener('DOMContentLoaded', function() {
    setupEventListeners();
    loadInitialEvents();
});

// Set up event listeners
function setupEventListeners() {
    searchButton.addEventListener('click', performSearch);
    searchInput.addEventListener('keyup', function(event) {
        if (event.key === 'Enter') {
            performSearch();
        }
    });

    document.querySelectorAll('input[data-filter]').forEach(input => {
        input.addEventListener('change', handleFilterChange);
    });

    document.getElementById('dateFrom').addEventListener('change', handleDateFilterChange);
    document.getElementById('dateTo').addEventListener('change', handleDateFilterChange);

    clearFiltersBtn.addEventListener('click', clearAllFilters);
    sortBy.addEventListener('change', performSearch);

    mobileFiltersToggle.addEventListener('click', function() {
        filtersSidebar.classList.toggle('active');
        this.textContent = filtersSidebar.classList.contains('active') ? 
            'Hide Filters' : 'Show Filters';
    });
}

// Load initial events
function loadInitialEvents() {
    setTimeout(() => {
        loading.style.display = 'none';
        resultsCount.textContent = '0 events found';
        noResults.style.display = 'block';
    }, 1000);
}

// Handle filter changes
function handleFilterChange(event) {
    const filterType = event.target.getAttribute('data-filter');
    const value = event.target.value;
    const isChecked = event.target.checked;

    if (['category', 'organizer', 'location', 'ticketType', 'mode', 'accessibility'].includes(filterType)) {
        if (isChecked) {
            activeFilters[filterType].push(value);
        } else {
            activeFilters[filterType] = activeFilters[filterType].filter(item => item !== value);
        }
    }

    updateActiveFiltersDisplay();
    performSearch();
}

// Handle date filter changes
function handleDateFilterChange() {
    activeFilters.dateFrom = document.getElementById('dateFrom').value;
    activeFilters.dateTo = document.getElementById('dateTo').value;
    updateActiveFiltersDisplay();
    performSearch();
}

// Update active filters display
function updateActiveFiltersDisplay() {
    activeFiltersContainer.innerHTML = '';
    let filterCount = 0;
    
    if (activeFilters.search) {
        addActiveFilterTag('Search', activeFilters.search, 'search');
        filterCount++;
    }
    
    activeFilters.category.forEach(category => {
        addActiveFilterTag('Category', category, 'category', category);
        filterCount++;
    });
    
    activeFilters.organizer.forEach(organizer => {
        addActiveFilterTag('Organizer', organizer, 'organizer', organizer);
        filterCount++;
    });
    
    if (activeFilters.dateFrom || activeFilters.dateTo) {
        let dateText = '';
        if (activeFilters.dateFrom && activeFilters.dateTo) {
            dateText = `${activeFilters.dateFrom} to ${activeFilters.dateTo}`;
        } else if (activeFilters.dateFrom) {
            dateText = `From ${activeFilters.dateFrom}`;
        } else {
            dateText = `Until ${activeFilters.dateTo}`;
        }
        addActiveFilterTag('Date', dateText, 'date');
        filterCount++;
    }
    
    activeFilters.location.forEach(location => {
        addActiveFilterTag('Location', location, 'location', location);
        filterCount++;
    });
    
    activeFilters.ticketType.forEach(ticketType => {
        addActiveFilterTag('Ticket', ticketType, 'ticketType', ticketType);
        filterCount++;
    });
    
    activeFilters.mode.forEach(mode => {
        addActiveFilterTag('Mode', mode, 'mode', mode);
        filterCount++;
    });
    
    activeFilters.accessibility.forEach(accessibility => {
        addActiveFilterTag('Accessibility', accessibility, 'accessibility', accessibility);
        filterCount++;
    });

    activeFiltersCount.textContent = filterCount === 0 ? 'No filters applied' : `${filterCount} filter${filterCount !== 1 ? 's' : ''} applied`;
}

// Add an active filter tag
function addActiveFilterTag(type, value, filterType, specificValue = null) {
    const filterTag = document.createElement('div');
    filterTag.className = 'filter-tag';
    filterTag.innerHTML = `
        ${type}: ${value}
        <button type="button" class="remove" data-filter-type="${filterType}" data-value="${specificValue}">×</button>
    `;
    activeFiltersContainer.appendChild(filterTag);
    
    filterTag.querySelector('.remove').addEventListener('click', function() {
        removeFilter(filterType, specificValue);
    });
}

// Remove a specific filter
function removeFilter(filterType, value) {
    if (filterType === 'search') {
        activeFilters.search = '';
        searchInput.value = '';
    } else if (filterType === 'date') {
        activeFilters.dateFrom = '';
        activeFilters.dateTo = '';
        document.getElementById('dateFrom').value = '';
        document.getElementById('dateTo').value = '';
    } else if (['category', 'organizer', 'location', 'ticketType', 'mode', 'accessibility'].includes(filterType)) {
        activeFilters[filterType] = activeFilters[filterType].filter(item => item !== value);
        const checkbox = document.querySelector(`input[data-filter="${filterType}"][value="${value}"]`);
        if (checkbox) checkbox.checked = false;
    }
    
    updateActiveFiltersDisplay();
    performSearch();
}

// Clear all filters
function clearAllFilters() {
    activeFilters = {
        search: '',
        category: [],
        organizer: [],
        dateFrom: '',
        dateTo: '',
        location: [],
        ticketType: [],
        mode: [],
        accessibility: []
    };
    
    searchInput.value = '';
    
    document.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
        checkbox.checked = false;
    });
    
    document.getElementById('dateFrom').value = '';
    document.getElementById('dateTo').value = '';
    
    updateActiveFiltersDisplay();
    performSearch();
}

// Perform search with current filters
function performSearch() {
    loading.style.display = 'block';
    eventsContainer.innerHTML = '';
    noResults.style.display = 'none';
    
    activeFilters.search = searchInput.value.trim();
    updateActiveFiltersDisplay();
    
    setTimeout(() => {
        const filteredEvents = [];
        
        resultsCount.textContent = `${filteredEvents.length} event${filteredEvents.length !== 1 ? 's' : ''} found`;
        
        displayEvents(filteredEvents);
        
        loading.style.display = 'none';
        
        if (filteredEvents.length === 0) {
            noResults.style.display = 'block';
        }
    }, 500);
}

// Display events in the table
function displayEvents(eventsToDisplay) {
    eventsContainer.innerHTML = '';
    
    if (eventsToDisplay.length === 0) {
        return;
    }
    
    // Backend team: Implement event row generation based on API response
}

// Format date for display
function formatDate(dateString) {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
}