
document.addEventListener('DOMContentLoaded', function() {
    console.log('Page loaded - JavaScript is running!');
    
    const buyerInfoSection = document.getElementById('buyerInfo');
    const reviewSection = document.getElementById('reviewPurchase');
    const reviewButton = document.getElementById('reviewButton');
    const backButton = document.getElementById('backToForm');
    const confirmButton = document.getElementById('confirmPurchase');
    const closePopup = document.getElementById('closePopup');
    const confirmationPopup = document.getElementById('confirmationPopup');
    const paymentMethod = document.getElementById('paymentMethod');
    const paymentDetails = document.getElementById('paymentDetails');

    let TB;
    import('../js/student-features.js')
  .then(m => { TB = m; })
  .catch(err => console.warn('student-features not loaded:', err));

    const eventData = {
        name: "Career Fair 2025",
        date: "December 3, 2025",
        time: "10:00 AM - 4:00 PM",
        location: "University Main Hall",
        price: 0.00
    };

    paymentMethod.addEventListener('change', function() {
        console.log('Payment method changed:', this.value);
        if (this.value) {
            paymentDetails.classList.add('show');
        } else {
            paymentDetails.classList.remove('show');
        }
    });

    document.getElementById('cardNumber').addEventListener('input', function(e) {
        let value = e.target.value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
        let formattedValue = value.match(/.{1,4}/g)?.join(' ');
        e.target.value = formattedValue || value;
    });

    document.getElementById('expiryDate').addEventListener('input', function(e) {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length >= 2) {
            value = value.substring(0, 2) + '/' + value.substring(2, 4);
        }
        e.target.value = value;
    });

    document.getElementById('cvv').addEventListener('input', function(e) {
        e.target.value = e.target.value.replace(/\D/g, '');
    });

    function validateEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    function validatePhone(phone) {
        return /^\d{10}$/.test(phone.replace(/\D/g, ''));
    }

    function validateCardNumber(cardNumber) {
        return /^\d{4} \d{4} \d{4} \d{4}$/.test(cardNumber);
    }

    function validateExpiry(expiry) {
        return /^(0[1-9]|1[0-2])\/\d{2}$/.test(expiry);
    }

    function validateCVV(cvv) {
        return /^\d{3}$/.test(cvv);
    }

    function showError(elementId, message) {
        const errorElement = document.getElementById(elementId);
        const inputId = elementId.replace('Error', '');
        const inputElement = document.getElementById(inputId);
        
        if (errorElement && inputElement) {
            errorElement.textContent = message;
            errorElement.classList.add('show');
            inputElement.classList.add('error');
        }
    }

    function hideError(elementId) {
        const errorElement = document.getElementById(elementId);
        const inputId = elementId.replace('Error', '');
        const inputElement = document.getElementById(inputId);
        
        if (errorElement && inputElement) {
            errorElement.classList.remove('show');
            inputElement.classList.remove('error');
        }
    }

    function clearAllErrors() {
        document.querySelectorAll('.error-message').forEach(el => {
            el.classList.remove('show');
        });
        document.querySelectorAll('.formInput').forEach(el => {
            el.classList.remove('error');
        });
    }

    function validateForm() {
        clearAllErrors();
        let isValid = true;

        const fullName = document.getElementById('fullName').value.trim();
        const email = document.getElementById('email').value.trim();
        const phone = document.getElementById('phone').value.trim();
        const ticketQuantity = document.getElementById('ticketQuantity').value;
        const paymentMethodValue = document.getElementById('paymentMethod').value;
        const cardholderName = document.getElementById('cardholderName').value.trim();
        const cardNumber = document.getElementById('cardNumber').value.trim();
        const expiryDate = document.getElementById('expiryDate').value.trim();
        const cvv = document.getElementById('cvv').value.trim();

        console.log('Validating form...');
        console.log('Name:', fullName);
        console.log('Email:', email);
        console.log('Phone:', phone);
        console.log('Tickets:', ticketQuantity);
        console.log('Payment:', paymentMethodValue);

        if (!fullName) {
            showError('nameError', 'Full name is required');
            isValid = false;
        }

        if (!email) {
            showError('emailError', 'Email is required');
            isValid = false;
        } else if (!validateEmail(email)) {
            showError('emailError', 'Please enter a valid email address');
            isValid = false;
        }

        if (!phone) {
            showError('phoneError', 'Phone number is required');
            isValid = false;
        } else if (!validatePhone(phone)) {
            showError('phoneError', 'Please enter a valid 10-digit phone number');
            isValid = false;
        }

        if (!ticketQuantity) {
            showError('quantityError', 'Please select number of tickets');
            isValid = false;
        }

        if (!paymentMethodValue) {
            showError('paymentError', 'Please select a payment method');
            isValid = false;
        } else {

            if (!cardholderName) {
                showError('cardNameError', 'Cardholder name is required');
                isValid = false;
            }

            if (!cardNumber) {
                showError('cardNumberError', 'Card number is required');
                isValid = false;
            } else if (!validateCardNumber(cardNumber)) {
                showError('cardNumberError', 'Please enter a valid 16-digit card number');
                isValid = false;
            }

            if (!expiryDate) {
                showError('expiryError', 'Expiry date is required');
                isValid = false;
            } else if (!validateExpiry(expiryDate)) {
                showError('expiryError', 'Please enter a valid expiry date (MM/YY)');
                isValid = false;
            }

            if (!cvv) {
                showError('cvvError', 'CVV is required');
                isValid = false;
            } else if (!validateCVV(cvv)) {
                showError('cvvError', 'Please enter a valid 3-digit CVV');
                isValid = false;
            }
        }

        console.log('Form validation result:', isValid);
        return isValid;
    }


    reviewButton.addEventListener('click', function() {
        console.log('Review button clicked!');
        
        if (validateForm()) {
            console.log('Validation passed - moving to review page');
            
     
            const fullName = document.getElementById('fullName').value;
            const email = document.getElementById('email').value;
            const phone = document.getElementById('phone').value;
            const ticketQuantity = parseInt(document.getElementById('ticketQuantity').value);

        
            const pricePerTicket = eventData.price;
            const subtotal = pricePerTicket * ticketQuantity;
            const tax = subtotal * 0.15; 
            const total = subtotal + tax;


            document.getElementById('reviewTickets').textContent = ticketQuantity;
            document.getElementById('reviewPricePerTicket').textContent = `$${pricePerTicket.toFixed(2)}`;
            document.getElementById('reviewSubtotal').textContent = `$${subtotal.toFixed(2)}`;
            document.getElementById('reviewTax').textContent = `$${tax.toFixed(2)}`;
            document.getElementById('reviewTotal').textContent = `$${total.toFixed(2)}`;
            document.getElementById('reviewName').textContent = fullName;
            document.getElementById('reviewEmail').textContent = email;
            document.getElementById('reviewPhone').textContent = phone;

    
            buyerInfoSection.classList.remove('active');
            reviewSection.classList.add('active');
        } else {
            console.log('Validation failed - showing errors');
        }
    });

  
    backButton.addEventListener('click', function() {
        reviewSection.classList.remove('active');
        buyerInfoSection.classList.add('active');
    });


    confirmButton.addEventListener('click', function() {
(async () => {
    try {
        // derive event + purchase info
        const params = new URLSearchParams(location.search);
        const eventId  = params.get('id') || 'EVT-DEMO-001';
        const title    = (eventData && eventData.name) ? eventData.name : 'Event';
        const quantity = parseInt(document.getElementById('ticketQuantity').value || '1', 10);
        const price    = Number((eventData && eventData.price) || 0);

        if (TB && TB.claimTicket && TB.renderTicketQR) {
            // create local ticket
            const t = await TB.claimTicket({ eventId, title, price, quantity });

            // ensure a canvas exists inside the popup
            let canvas = document.getElementById('ticketQR');
            if (!canvas) {
                const holder = confirmationPopup.querySelector('.popupContent') || confirmationPopup;
                const wrap = document.createElement('div');
                wrap.style.marginTop = '16px';

                canvas = document.createElement('canvas');
                canvas.id = 'ticketQR';
                canvas.width = 220;
                canvas.height = 220;

                const pid = document.createElement('p');
                pid.id = 'ticketIdLine';
                pid.textContent = `Ticket ID: ${t.ticketId}`;

                wrap.appendChild(canvas);
                wrap.appendChild(pid);
                holder.appendChild(wrap);
            }

            // draw QR for this ticket
            await TB.renderTicketQR(canvas, t);
        }
    } catch (e) {
        console.warn('QR render skipped:', e);
    }
})();
    confirmationPopup.classList.add('active');

    });


    closePopup.addEventListener('click', function() {
        confirmationPopup.classList.remove('active');
        window.location.href = 'main.html';
    });

 
    confirmationPopup.addEventListener('click', function(e) {
        if (e.target === confirmationPopup) {
            confirmationPopup.classList.remove('active');
            window.location.href = 'main.html';
        }
    });


    document.querySelectorAll('.formInput').forEach(input => {
        input.addEventListener('input', function() {
            const errorId = this.id + 'Error';
            hideError(errorId);
        });
    });

    document.getElementById('ticketQuantity').addEventListener('change', function() {
        hideError('quantityError');
    });

    document.getElementById('paymentMethod').addEventListener('change', function() {
        hideError('paymentError');
    });

    console.log('All event listeners attached successfully!');
});