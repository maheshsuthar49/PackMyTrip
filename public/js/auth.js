document.addEventListener('DOMContentLoaded', function() {
    const BASE_URL = "https://pack-mytrip.vercel.app";
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
        }, 3000);
    }

    // Register form submission
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', async function(event) {
            event.preventDefault();
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            try {
                const response = await fetch(`${BASE_URL}/register`, {  
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name, email, password })
                });

                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }

                const result = await response.json();
                if (result.success) {
                    showToast('Registration successful');
                } else {
                    showToast(result.message);
                }
            } catch (error) {
                console.error('Error:', error);
                showToast('An error occurred');
            }
        });
    }

    // Login form submission
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async function(event) {
            event.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            try {
                const response = await fetch('/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ email, password })
                });

                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }

                const result = await response.json();
                if (result.success) {
                    showToast('Login successful');
                } else {
                    showToast(result.message);
                }
            } catch (error) {
                console.error('Error:', error);
                showToast('An error occurred');
            }
        });
    }
});