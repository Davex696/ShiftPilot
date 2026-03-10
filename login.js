document.getElementById('loginBtn').addEventListener('click', function() {
    const username = document.getElementById('username').value.trim().toLowerCase();
    const password = document.getElementById('password').value;
    const errorMsg = document.getElementById('loginError');

    if (username === 'admin' && password === 'admin123') {
        window.location.href = 'index.html';
    } else {
        errorMsg.textContent = 'Invalid username or password';
    }
});