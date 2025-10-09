document.addEventListener('DOMContentLoaded', function() {
    // Elements
    const eventForm = document.getElementById('eventForm');
    const reviewPage = document.getElementById('reviewPage');
    const savedMessage = document.getElementById('savedMessage');
    const successMessage = document.getElementById('successMessage');
    
    // Ticket type elements
    const freeOption = document.getElementById('freeOption');
    const paidOption = document.getElementById('paidOption');
    const priceContainer = document.getElementById('priceContainer');
    const freeRadio = document.getElementById('free');
    const paidRadio = document.getElementById('paid');
    const priceInput = document.getElementById('price');

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

    // Save as Draft - goes directly to saved message
    document.getElementById('saveDraft').addEventListener('click', function() {
        if (validateForm(true)) {
            eventForm.style.display = 'none';
            savedMessage.style.display = 'block';
        }
    });

    // Publish Event - goes to review page first
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
        alert('Redirecting to dashboard...');
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

    // Form validation
    function validateForm(isDraft = false) {
        const requiredFields = ['title', 'description', 'date', 'time', 'location', 'capacity'];
        let isValid = true;

        requiredFields.forEach(field => {
            const input = document.getElementById(field);
            if (!input.value.trim()) {
                input.style.borderColor = '#dc2626';
                isValid = false;
            } else {
                input.style.borderColor = '';
            }
        });

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
        document.getElementById('reviewTitle').textContent = document.getElementById('title').value;
        document.getElementById('reviewDescription').textContent = document.getElementById('description').value;
        
        const date = document.getElementById('date').value;
        const time = document.getElementById('time').value;
        document.getElementById('reviewDateTime').textContent = `${formatDate(date)} at ${formatTime(time)}`;
        
        document.getElementById('reviewLocation').textContent = document.getElementById('location').value;
        document.getElementById('reviewCapacity').textContent = document.getElementById('capacity').value + ' tickets';
        
        const ticketType = freeRadio.checked ? 'Free' : 'Paid';
        document.getElementById('reviewTicketType').textContent = ticketType;
        
        if (paidRadio.checked) {
            document.getElementById('reviewPrice').textContent = '$' + parseFloat(priceInput.value).toFixed(2);
            document.getElementById('reviewPriceRow').style.display = 'flex';
        } else {
            document.getElementById('reviewPriceRow').style.display = 'none';
        }
    }

    // Reset form
    function resetForm() {
        eventForm.reset();
        freeOption.classList.add('selected');
        paidOption.classList.remove('selected');
        priceContainer.classList.remove('visible');
    }

    // Date formatting
    function formatDate(dateString) {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', options);
    }

    function formatTime(timeString) {
        const [hours, minutes] = timeString.split(':');
        const hour = parseInt(hours);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour % 12 || 12;
        return `${displayHour}:${minutes} ${ampm}`;
    }

    // Set minimum date to today
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('date').min = today;
});