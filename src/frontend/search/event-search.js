const user = JSON.parse(localStorage.getItem("user"));
if (!user) {
    alert("Please log in to access this page.");
    window.location.href = "../signup-login/login.html";
}

// DOM elements
const searchInput = document.getElementById("searchInput");
const searchButton = document.getElementById("searchButton");
const resultsCount = document.getElementById("resultsCount");
const clearFiltersBtn = document.getElementById("clearFilters");
const activeFiltersContainer = document.getElementById("activeFilters");
const activeFiltersCount = document.getElementById("activeFiltersCount");
const eventsContainer = document.getElementById("eventsContainer");
const noResults = document.getElementById("noResults");
const loading = document.getElementById("loading");
const sortBy = document.getElementById("sortBy");
const mobileFiltersToggle = document.getElementById("mobileFiltersToggle");
const filtersSidebar = document.getElementById("filtersSidebar");

// Header buttons
document.querySelector(".myEventsButton").addEventListener("click", () => {
    window.location.href = "../main/main.html";
});
document.querySelector(".logoutButton").addEventListener("click", () => {
    if (confirm("Are you sure you want to log out?")) {
        localStorage.removeItem("user");
        window.location.href = "../main/main.html";
    }
});

// State
let activeFilters = {
    search: "",
    category: [],
    organizer: [],
    dateFrom: "",
    dateTo: "",
    ticketType: [],
    mode: [],
};

let backendResults = [];   // raw results from API after query/category
let filteredResults = [];  // after client filters + sort

document.addEventListener("DOMContentLoaded", () => {
    setupEventListeners();
    loadSearchParams();
    wireRowClicks();
});

function loadSearchParams() {
    const params = new URLSearchParams(window.location.search);
    const query = params.get("query");
    const category = params.get("category");

    if (query) {
        searchInput.value = query;
        activeFilters.search = query;
        performSearch();
    } else if (category) {
        activeFilters.category = [category];
        // auto-check the matching category box if it exists
        const cb = document.querySelector(`input[data-filter="category"][value="${category}"]`);
        if (cb) cb.checked = true;
        performSearch();
    } else {
        performSearch(); // load all
    }
}

function setupEventListeners() {
    searchButton.addEventListener("click", () => {
        activeFilters.search = searchInput.value.trim();
        performSearch();
    });

    searchInput.addEventListener("keyup", e => {
        if (e.key === "Enter") {
            activeFilters.search = searchInput.value.trim();
            performSearch();
        }
    });

    document.querySelectorAll("input[data-filter]").forEach(input => {
        input.addEventListener("change", handleFilterChange);
    });

    document.getElementById("dateFrom").addEventListener("change", handleDateFilterChange);
    document.getElementById("dateTo").addEventListener("change", handleDateFilterChange);

    clearFiltersBtn.addEventListener("click", clearAllFilters);
    sortBy.addEventListener("change", () => {
        applyFiltersAndSort();
        displayEvents(filteredResults);
    });

    mobileFiltersToggle.addEventListener("click", function () {
        filtersSidebar.classList.toggle("active");
        this.textContent = filtersSidebar.classList.contains("active")
            ? "Hide Filters"
            : "Show Filters";
    });
}

// ---------- Filters ----------
function handleFilterChange(event) {
    const filterType = event.target.getAttribute("data-filter");
    const value = event.target.value;
    const isChecked = event.target.checked;

    if (["category", "organizer", "ticketType", "mode"].includes(filterType)) {
        if (isChecked) activeFilters[filterType].push(value);
        else activeFilters[filterType] = activeFilters[filterType].filter(v => v !== value);
    }

    updateActiveFiltersDisplay();
    applyFiltersAndSort();
    displayEvents(filteredResults);
}

function handleDateFilterChange() {
    activeFilters.dateFrom = document.getElementById("dateFrom").value;
    activeFilters.dateTo = document.getElementById("dateTo").value;
    updateActiveFiltersDisplay();
    applyFiltersAndSort();
    displayEvents(filteredResults);
}

function clearAllFilters() {
    activeFilters = {
        search: "",
        category: [],
        organizer: [],
        dateFrom: "",
        dateTo: "",
        ticketType: [],
        mode: [],
    };

    searchInput.value = "";
    document.querySelectorAll('input[type="checkbox"]').forEach(cb => (cb.checked = false));
    document.getElementById("dateFrom").value = "";
    document.getElementById("dateTo").value = "";

    updateActiveFiltersDisplay();
    applyFiltersAndSort();
    displayEvents(filteredResults);
}

function updateActiveFiltersDisplay() {
    activeFiltersContainer.innerHTML = "";
    let filterCount = 0;

    if (activeFilters.search) {
        addActiveFilterTag("Search", activeFilters.search, "search");
        filterCount++;
    }

    activeFilters.category.forEach(c => {
        addActiveFilterTag("Category", c, "category", c);
        filterCount++;
    });

    activeFilters.organizer.forEach(o => {
        addActiveFilterTag("Organizer", o, "organizer", o);
        filterCount++;
    });

    if (activeFilters.dateFrom || activeFilters.dateTo) {
        let dateText = activeFilters.dateFrom && activeFilters.dateTo
            ? `${activeFilters.dateFrom} to ${activeFilters.dateTo}`
            : activeFilters.dateFrom
                ? `From ${activeFilters.dateFrom}`
                : `Until ${activeFilters.dateTo}`;

        addActiveFilterTag("Date", dateText, "date");
        filterCount++;
    }

    activeFilters.ticketType.forEach(t => {
        addActiveFilterTag("Ticket", t, "ticketType", t);
        filterCount++;
    });

    activeFilters.mode.forEach(m => {
        addActiveFilterTag("Mode", m, "mode", m);
        filterCount++;
    });

    activeFiltersCount.textContent =
        filterCount === 0
            ? "No filters applied"
            : `${filterCount} filter${filterCount !== 1 ? "s" : ""} applied`;
}

function addActiveFilterTag(type, value, filterType, specificValue = null) {
    const tag = document.createElement("div");
    tag.className = "filterTag";
    tag.innerHTML = `
    ${type}: ${value}
    <button type="button" class="remove" data-filter-type="${filterType}" data-value="${specificValue}">×</button>
  `;
    activeFiltersContainer.appendChild(tag);

    tag.querySelector(".remove").addEventListener("click", () => {
        removeFilter(filterType, specificValue);
    });
}

function removeFilter(filterType, value) {
    if (filterType === "search") {
        activeFilters.search = "";
        searchInput.value = "";
    } else if (filterType === "date") {
        activeFilters.dateFrom = "";
        activeFilters.dateTo = "";
        document.getElementById("dateFrom").value = "";
        document.getElementById("dateTo").value = "";
    } else if (["category", "organizer", "ticketType", "mode"].includes(filterType)) {
        activeFilters[filterType] = activeFilters[filterType].filter(v => v !== value);
        const cb = document.querySelector(`input[data-filter="${filterType}"][value="${value}"]`);
        if (cb) cb.checked = false;
    }

    updateActiveFiltersDisplay();
    applyFiltersAndSort();
    displayEvents(filteredResults);
}

// ---------- Search ----------
async function performSearch() {
    loading.style.display = "block";
    eventsContainer.innerHTML = "";
    noResults.style.display = "none";

    const query = activeFilters.search.trim();
    const category = activeFilters.category[0] || "";

    try {
        const res = await fetch(
            `/api/events/search?query=${encodeURIComponent(query)}&category=${encodeURIComponent(category)}`
        );
        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        backendResults = await res.json();

        loading.style.display = "none";
        applyFiltersAndSort();
        resultsCount.textContent = `${filteredResults.length} event${filteredResults.length !== 1 ? "s" : ""} found`;

        if (filteredResults.length === 0) noResults.style.display = "block";
        else displayEvents(filteredResults);

    } catch (err) {
        console.error("Search error:", err);
        resultsCount.textContent = "Error loading events.";
        loading.style.display = "none";
    }
}

// ---------- Apply client-side filters + sort ----------
function applyFiltersAndSort() {
    filteredResults = backendResults.filter(e => {
        // organizer type (model field: organizerType)
        if (activeFilters.organizer.length) {
            if (!activeFilters.organizer.includes(e.organizerType)) return false;
        }

        // ticket type (model field: ticketType)
        if (activeFilters.ticketType.length) {
            if (!activeFilters.ticketType.includes(e.ticketType)) return false;
        }

        // mode (model field: mode)
        if (activeFilters.mode.length) {
            if (!activeFilters.mode.includes(e.mode)) return false;
        }

        // date range (model field: date)
        if (activeFilters.dateFrom) {
            if (!e.date || e.date < activeFilters.dateFrom) return false;
        }
        if (activeFilters.dateTo) {
            if (!e.date || e.date > activeFilters.dateTo) return false;
        }

        return true;
    });

    // Sorting
    const sortKey = sortBy.value;

    filteredResults.sort((a, b) => {
        if (sortKey === "date") {
            return (a.date || "").localeCompare(b.date || "");
        }
        if (sortKey === "title") {
            return (a.title || "").localeCompare(b.title || "");
        }
        if (sortKey === "price") {
            return (Number(a.price) || 0) - (Number(b.price) || 0);
        }
        if (sortKey === "popularity") {
            return (Number(b.ticketsSold) || 0) - (Number(a.ticketsSold) || 0);
        }
        return 0;
    });
}

// ---------- Render ----------
function displayEvents(events) {
    eventsContainer.innerHTML = "";

    for (const e of events) {
        // ---- normalize categories to an array of strings ----
        let categories = [];
        if (Array.isArray(e.categories)) {
            categories = e.categories;
        } else if (typeof e.categories === "string") {
            try {
                const parsed = JSON.parse(e.categories);
                categories = Array.isArray(parsed) ? parsed : [e.categories];
            } catch {
                categories = [e.categories];
            }
        }

        const categoryText = categories.filter(Boolean).join(", ");

        // ---- banner url ----
        let bannerUrl = "/event/eventBanner.jpg"; // default

        if (e.bannerPath) {
            // normalize and ensure leading slash for web
            const clean = e.bannerPath.replace(/\\/g, "/").replace(/^\/+/, "");
            bannerUrl = "/" + clean;   // -> "/data/events/..../file.jpg"
        }

        const row = document.createElement("div");
        row.classList.add("tableRow");
        row.setAttribute("data-event-id", e.id);

        row.innerHTML = `
      <div class="eventInfo">
        <img class="eventImage" src="${bannerUrl}" alt="${e.title} banner"
             onerror="this.src='/event/eventBanner.jpg'"/>
        <div class="eventDetails">
          <div class="eventTitle">${e.title}</div>
          <div class="eventMeta">
            <span class="eventCategory">${categoryText || ""}</span>
            <span class="eventOrganizer">${e.organizerName || e.organizerEmail || ""}</span>
          </div>
        </div>
      </div>

      <div class="eventDate">${formatDateShort(e.date)}</div>
      <div class="eventLocation">${e.location || "N/A"}</div>
      <div class="eventActions">
        <button class="saveButton"><span class="heart">♡</span></button>
      </div>
    `;

        eventsContainer.appendChild(row);
    }
}

function formatDateShort(dateString) {
    if (!dateString) return "—";
    const options = { year: "numeric", month: "short", day: "numeric" };
    return new Date(dateString).toLocaleDateString("en-US", options);
}

// ---------- Click to open event ----------
function wireRowClicks() {
    eventsContainer.addEventListener("click", e => {
        const row = e.target.closest("[data-event-id]");
        if (!row) return;
        const id = row.getAttribute("data-event-id");
        location.href = `../event/event.html?id=${encodeURIComponent(id)}`;
    });
}