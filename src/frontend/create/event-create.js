document.addEventListener('DOMContentLoaded', function() {
    // Elements
    const eventForm = document.getElementById('eventForm');
    const reviewPage = document.getElementById('reviewPage');
    const savedMessage = document.getElementById('savedMessage');
    const successMessage = document.getElementById('successMessage');
    const reviewDetails = document.getElementById('reviewDetails');
    const categoryTags = document.getElementById('categoryTags');
    
    // Selected categories
    let selectedCategories = [];
    
    // Ticket type elements
    const freeOption = document.getElementById('freeOption');
    const paidOption = document.getElementById('paidOption');
    const priceContainer = document.getElementById('priceContainer');
    const freeRadio = document.getElementById('free');
    const paidRadio = document.getElementById('paid');
    const priceInput = document.getElementById('price');

    // Duration elements
    const durationValue = document.getElementById('durationValue');
    const durationUnit = document.getElementById('durationUnit');

    // Event mode elements
    const modeSelect = document.getElementById('mode');
    const eventLinkContainer = document.getElementById('eventLinkContainer');
    const locationContainer = document.getElementById('locationContainer');

    // Category selection
    document.querySelectorAll('.categoryOption').forEach(option => {
        option.addEventListener('click', function() {
            const value = this.getAttribute('data-value');
            const text = this.textContent;
            
            if (this.classList.contains('selected')) {
                // Remove category
                this.classList.remove('selected');
                selectedCategories = selectedCategories.filter(cat => cat.value !== value);
            } else {
                // Add category
                this.classList.add('selected');
                selectedCategories.push({ value, text });
            }
            
            updateCategoryTags();
        });
    });

    function updateCategoryTags() {
        categoryTags.innerHTML = '';
        selectedCategories.forEach(category => {
            const tag = document.createElement('div');
            tag.className = 'categoryTag';
            tag.innerHTML = `
                ${category.text}
                <button type="button" class="remove" data-value="${category.value}">×</button>
            `;
            categoryTags.appendChild(tag);
        });

        // Add remove functionality
        document.querySelectorAll('.categoryTag .remove').forEach(button => {
            button.addEventListener('click', function() {
                const value = this.getAttribute('data-value');
                selectedCategories = selectedCategories.filter(cat => cat.value !== value);
                document.querySelector(`.categoryOption[data-value="${value}"]`).classList.remove('selected');
                updateCategoryTags();
            });
        });
    }

    // Initialize conditional fields
    updateConditionalFields();

    // Event mode change handler
    modeSelect.addEventListener('change', updateConditionalFields);

    // Ticket type functionality
    freeOption.addEventListener('click', function() {
        freeRadio.checked = true;
        freeOption.classList.add('selected');
        paidOption.classList.remove('selected');
        priceContainer.classList.remove('visible');
        priceInput.removeAttribute('required');
    });

    paidOption.addEventListener('click', function() {
        paidRadio.checked = true;
        paidOption.classList.add('selected');
        freeOption.classList.remove('selected');
        priceContainer.classList.add('visible');
        priceInput.setAttribute('required', 'required');
    });

    // Reset Form
    document.getElementById('resetForm').addEventListener('click', function() {
        if (confirm('Are you sure you want to clear the form? All entered data will be lost.')) {
            resetForm();
        }
    });

    // Save as Draft
    document.getElementById('saveDraft').addEventListener('click', function() {
        if (validateForm(true)) {
            eventForm.style.display = 'none';
            savedMessage.style.display = 'block';
        }
    });

    // Publish Event
    document.getElementById('publishEvent').addEventListener('click', function() {
        if (validateForm()) {
            populateReviewPage();
            eventForm.style.display = 'none';
            reviewPage.style.display = 'block';
        }
    });

    // Review page buttons
    document.getElementById('editEvent').addEventListener('click', function() {
        reviewPage.style.display = 'none';
        eventForm.style.display = 'block';
    });

    document.getElementById('confirmPublish').addEventListener('click', function() {
        reviewPage.style.display = 'none';
        successMessage.style.display = 'block';
    });

    // Saved message buttons
    document.getElementById('createAnotherDraft').addEventListener('click', function() {
        savedMessage.style.display = 'none';
        eventForm.style.display = 'block';
        resetForm();
    });

    document.getElementById('viewDashboard').addEventListener('click', function() {
        alert('Redirecting to My Events...');
    });

    // Success message buttons
    document.getElementById('createAnother').addEventListener('click', function() {
        successMessage.style.display = 'none';
        eventForm.style.display = 'block';
        resetForm();
    });

    document.getElementById('viewEvent').addEventListener('click', function() {
        alert('Redirecting to event page...');
    });

    // Update conditional fields based on event mode
    function updateConditionalFields() {
        const mode = modeSelect.value;
        
        // Reset both fields
        eventLinkContainer.style.display = 'none';
        locationContainer.style.display = 'none';
        
        // Show appropriate fields
        if (mode === 'online' || mode === 'hybrid') {
            eventLinkContainer.style.display = 'block';
        }
        if (mode === 'in-person' || mode === 'hybrid') {
            locationContainer.style.display = 'block';
        }
    }

    // Form validation
    function validateForm(isDraft = false) {
        const requiredFields = [
            'title', 'organizerName', 'organizerEmail', 
            'organizerType', 'date', 'time', 'mode', 
            'capacity', 'registrationDeadline', 'description'
        ];
        
        let isValid = true;

        // Check categories
        if (selectedCategories.length === 0 && !isDraft) {
            alert('Please select at least one event category');
            isValid = false;
        }

        // Check duration
        if (!durationValue.value || parseInt(durationValue.value) <= 0) {
            durationValue.style.borderColor = '#dc2626';
            isValid = false;
        } else {
            durationValue.style.borderColor = '';
        }

        requiredFields.forEach(field => {
            const input = document.getElementById(field);
            if (!input.value.trim()) {
                input.style.borderColor = '#dc2626';
                isValid = false;
            } else {
                input.style.borderColor = '';
            }
        });

        // Validate event mode specific fields
        const mode = modeSelect.value;
        if ((mode === 'online' || mode === 'hybrid') && !document.getElementById('eventLink').value.trim()) {
            document.getElementById('eventLink').style.borderColor = '#dc2626';
            isValid = false;
        }
        
        if ((mode === 'in-person' || mode === 'hybrid') && !document.getElementById('location').value.trim()) {
            document.getElementById('location').style.borderColor = '#dc2626';
            isValid = false;
        }

        // Validate paid tickets
        if (paidRadio.checked && (!priceInput.value || parseFloat(priceInput.value) <= 0)) {
            priceInput.style.borderColor = '#dc2626';
            isValid = false;
        } else {
            priceInput.style.borderColor = '';
        }

        if (isDraft && !isValid) {
            return confirm('Some required fields are empty. Save as draft anyway?');
        }

        return isValid;
    }

    // Populate review page
    function populateReviewPage() {
        reviewDetails.innerHTML = '';
        
        // Section 1: Event Information
        const section1 = createReviewSection('Event Information', [
            { label: 'Event Title', value: getValue('title') },
            { label: 'Event Subtitle', value: getValue('subtitle') || 'Not provided' },
            { label: 'Event Description', value: getValue('description') },
            { label: 'Speakers/Performers', value: getValue('speakers') || 'Not provided' },
            { label: 'Categories', value: selectedCategories.map(cat => cat.text).join(', ') || 'Not selected' },
            { label: 'Tags', value: getValue('tags') || 'Not provided' },
            { label: 'Banner Image', value: document.getElementById('banner').files.length > 0 ? 'Uploaded' : 'Not provided' }
        ]);
        reviewDetails.appendChild(section1);

        // Section 2: Organizer Details
        const section2 = createReviewSection('Organizer Details', [
            { label: 'Organization Name', value: getValue('organizerName') },
            { label: 'Contact Email', value: getValue('organizerEmail') },
            { label: 'Organization Type', value: getSelectedText('organizerType') }
        ]);
        reviewDetails.appendChild(section2);

        // Section 3: Date & Location
        const logisticsData = [
            { label: 'Event Date', value: formatDate(getValue('date')) },
            { label: 'Start Time', value: getValue('time') },
            { label: 'Duration', value: getDurationText() },
            { label: 'Event Format', value: getSelectedText('mode') }
        ];

        const mode = getValue('mode');
        if (mode === 'online' || mode === 'hybrid') {
            logisticsData.push({ label: 'Online Event Link', value: getValue('eventLink') });
        }
        if (mode === 'in-person' || mode === 'hybrid') {
            logisticsData.push({ label: 'Venue Location', value: getValue('location') });
        }
        
        logisticsData.push({ label: 'Accessibility Information', value: getValue('accessibility') || 'Not provided' });

        const section3 = createReviewSection('Date & Location', logisticsData);
        reviewDetails.appendChild(section3);

        // Section 4: Tickets & Registration
        const section4 = createReviewSection('Tickets & Registration', [
            { label: 'Maximum Attendees', value: getValue('capacity') + ' people' },
            { label: 'Ticket Type', value: freeRadio.checked ? 'Free Event' : 'Paid Tickets' },
            { label: 'Ticket Price', value: freeRadio.checked ? 'Free' : '$' + parseFloat(getValue('price')).toFixed(2) + ' CAD' },
            { label: 'Registration Deadline', value: formatDateTime(getValue('registrationDeadline')) }
        ]);
        reviewDetails.appendChild(section4);
    }

    // Helper function to create review sections
    function createReviewSection(title, items) {
        const section = document.createElement('div');
        section.className = 'reviewSection';
        
        const titleEl = document.createElement('h3');
        titleEl.className = 'reviewSectionTitle';
        titleEl.textContent = title;
        section.appendChild(titleEl);

        items.forEach(item => {
            const row = document.createElement('div');
            row.className = 'detailRow';
            
            const label = document.createElement('div');
            label.className = 'detailLabel';
            label.textContent = item.label + ':';
            
            const value = document.createElement('div');
            value.className = 'detailValue';
            value.textContent = item.value;
            
            row.appendChild(label);
            row.appendChild(value);
            section.appendChild(row);
        });

        return section;
    }

    // Helper functions
    function getValue(id) {
        return document.getElementById(id).value.trim();
    }

    function getSelectedText(id) {
        const select = document.getElementById(id);
        return select.options[select.selectedIndex].text;
    }

    function getDurationText() {
        const value = durationValue.value;
        const unit = durationUnit.value;
        return `${value} ${unit}`;
    }

    // Reset form
    function resetForm() {
        eventForm.reset();
        freeOption.classList.add('selected');
        paidOption.classList.remove('selected');
        priceContainer.classList.remove('visible');
        updateConditionalFields();
        
        // Reset categories
        selectedCategories = [];
        document.querySelectorAll('.categoryOption').forEach(option => {
            option.classList.remove('selected');
        });
        updateCategoryTags();
        
        // Reset duration to default
        durationValue.value = '60';
        durationUnit.value = 'hours';
        
        // Clear any error borders
        const inputs = eventForm.querySelectorAll('input, select, textarea');
        inputs.forEach(input => input.style.borderColor = '');
    }

    // Date formatting
    function formatDate(dateString) {
        if (!dateString) return 'Not set';
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', options);
    }

    function formatDateTime(dateTimeString) {
        if (!dateTimeString) return 'Not set';
        const date = new Date(dateTimeString);
        return date.toLocaleString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    // Set minimum dates
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('date').min = today;
    
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    document.getElementById('registrationDeadline').min = now.toISOString().slice(0, 16);
});