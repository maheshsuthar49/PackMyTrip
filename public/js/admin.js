document.getElementById('adminLoginForm').addEventListener('submit', async function(event) {
    event.preventDefault();
    
    const email = document.getElementById('adminEmail').value;
    const password = document.getElementById('adminPassword').value;

    const response = await fetch('packmytrip-1val.onrender.com/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    });

    const data = await response.json();
    if (data.success) {
        localStorage.setItem('isAdmin', 'true');  // Save login status
        window.location.href = '/admindashboard.html';
    } else {
        alert('Invalid credentials');
    }
});
