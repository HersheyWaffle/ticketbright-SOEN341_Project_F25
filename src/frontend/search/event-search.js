const user = JSON.parse(localStorage.getItem("user"));
if (!user) {
    alert("Please log in to access this page.");
    window.location.href = "../signup-login/login.html";
}

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

const myEventsButton = document.querySelector('.myEventsButton');
const logoutButton = document.querySelector('.logoutButton');

function loadSearchParams() {
    const params = new URLSearchParams(window.location.search);
    const query = params.get("query");
    const category = params.get("category");

    if (query) {
        searchInput.value = query;
        performSearch();
    } else if (category) {
        activeFilters.category = [category];
        performSearch();
    } else {
        loadInitialEvents();
    }
}

document.addEventListener('DOMContentLoaded', function () {
    setupEventListeners();
    loadSearchParams();
});

// // Home functionality
document.querySelector('.myEventsButton').addEventListener('click', function () {
    window.location.href = '../main/main.html';
});

// Logout functionality
document.querySelector('.logoutButton').addEventListener('click', function () {
    if (confirm('Are you sure you want to log out?')) {
        localStorage.removeItem("user");
        window.location.href = '../main/main.html';
    }
});

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
document.addEventListener('DOMContentLoaded', function () {
    setupEventListeners();
    loadInitialEvents();

    eventsContainer.addEventListener('click', (e) => {
        const row = e.target.closest('[data-event-id]');
        if (!row) return;
        const id = row.getAttribute('data-event-id');
        if (id) {
            location.href = `../event/event.html?id=${encodeURIComponent(id)}`;
        }
    });
});

// Set up event listeners
function setupEventListeners() {
    searchButton.addEventListener('click', performSearch);
    searchInput.addEventListener('keyup', function (event) {
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

    mobileFiltersToggle.addEventListener('click', function () {
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

    filterTag.querySelector('.remove').addEventListener('click', function () {
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
async function performSearch() {
    loading.style.display = 'block';
    eventsContainer.innerHTML = '';
    noResults.style.display = 'none';

    const query = searchInput.value.trim();
    const category = activeFilters.category[0] || "";

    try {
        const res = await fetch(`/api/events/search?query=${encodeURIComponent(query)}&category=${encodeURIComponent(category)}`);
        const events = await res.json();
        console.log("Search response:", events);

        loading.style.display = 'none';
        resultsCount.textContent = `${events.length} event${events.length !== 1 ? 's' : ''} found`;

        if (events.length === 0) {
            noResults.style.display = 'block';
        } else {
            displayEvents(events);
        }
    } catch (err) {
        console.error("Search error:", err);
        resultsCount.textContent = "Error loading events.";
        loading.style.display = 'none';
    }
}

// Display events in the table
function displayEvents(events) {
  eventsContainer.innerHTML = '';

  for (const e of events) {
    const eventRow = document.createElement("div");
    eventRow.classList.add("eventRow");
    eventRow.dataset.eventId = e.id;
    eventRow.innerHTML = `
      <div>${e.title}</div>
      <div>${formatDate(e.date)}</div>
      <div>${e.location || "N/A"}</div>
      <div><button class="saveBtn">♡</button></div>
    `;
    eventsContainer.appendChild(eventRow);
  }
}

// Format date for display
function formatDate(dateString) {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
}
