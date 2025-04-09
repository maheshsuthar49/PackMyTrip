// Add the showToast function
function showToast(message) {
    const toastContainer = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = 'toast show';
    toast.innerHTML = `
        <span>${message}</span>
        <span class="close-btn">&times;</span>
    `;
    toastContainer.appendChild(toast);

    toast.querySelector('.close-btn').onclick = function() {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 500);
    };

    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 500);
    }, 5000);
}

// mobile number vailidation
document.getElementById('phone').addEventListener('input', function (event) {
    this.value = this.value.replace(/\D/g, ''); // Sirf numbers (0-9) allow honge
});

// Function to set the min arrival date
function setArrivalDateRange() {
    const arrivalInput = document.getElementById('arrival');
    if (!arrivalInput) return;

    const currentDate = new Date();
    const minDate = new Date();
    minDate.setDate(currentDate.getDate() + 7); 

    const minDateString = minDate.toISOString().split('T')[0]; 

    arrivalInput.setAttribute('min', minDateString);
}

// Function to validate the arrival date
function validateArrivalDate(arrivalDate) {
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    const minDate = new Date();
    minDate.setDate(currentDate.getDate() + 7); 

    const arrival = new Date(arrivalDate);

    if (isNaN(arrival.getTime())) {
        showToast('Invalid arrival date.');
        return false;
    }

    if (arrival < minDate) {
        showToast('Arrival date must be at least 7 days after today.');
        return false;
    }
    return true;
}

// Set the min arrival date when the DOM is loaded
document.addEventListener('DOMContentLoaded', setArrivalDateRange);


// Booking form submission
document.getElementById('bookingForm').addEventListener('submit', async function(event) {
    event.preventDefault();

    const arrivalDate = document.getElementById('arrival').value;
    if (!validateArrivalDate(arrivalDate)) {
        return;  // Prevent form submission if the arrival date is not valid
    }

    const formData = {
        userId: localStorage.getItem('userId'),
        name: document.getElementById('name').value,
        email: document.getElementById('email').value,
        phone: document.getElementById('phone').value,
        address: document.getElementById('address').value,
        guests: document.getElementById('guests').value,
        arrival: document.getElementById('arrival').value,
        leaving: document.getElementById('leaving').value,
        package_name: document.getElementById('package').value,
        total_price: document.getElementById('total_price').value
    };

    try {
        const response = await fetch('/book', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData),
        });

        const data = await response.json();

        if (data.status === 'success') {
            showToast('Booking successful! We will contact you soon.');
            document.getElementById('bookingForm').reset();
        } else {
            showToast('Booking failed: ' + data.message);
        }
    } catch (error) {
        showToast('Error: ' + error.message);
    }
});