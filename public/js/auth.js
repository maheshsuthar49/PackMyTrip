document.addEventListener('DOMContentLoaded', function() {
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

            const formData = {
                name: document.getElementById('name').value,
                email: document.getElementById('email').value,
                password: document.getElementById('password').value
            };

            try {
                const response = await fetch('https://packmytrip-1val.onrender.com/register', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(formData),
                });

                const data = await response.json();

                if (response.status === 201) {
                    showToast('Registration successful! Please log in.');
                    registerForm.reset();
                    window.location.href = 'login.html';
                } else {
                    showToast('Registration failed: ' + data.message);
                }
            } catch (error) {
                showToast('Error: ' + error.message);
            }
        });
    }

    // Login form submission
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async function(event) {
            event.preventDefault();

            const formData = {
                email: document.getElementById('email').value,
                password: document.getElementById('password').value
            };

            try {
                const response = await fetch('https://packmytrip-1val.onrender.com/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(formData),
                });

                const data = await response.json();

                if (response.status === 200) {
                    showToast('Login successful!');
                    localStorage.setItem('userId', data.userId);
                    localStorage.setItem('isLoggedIn', 'true');
                    window.location.href = 'index.html';
                } else {
                    showToast('Login failed: ' + data.message);
                }
            } catch (error) {
                showToast('Error: ' + error.message);
            }
        });
    }
});
