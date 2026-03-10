document.getElementById('staffLoginBtn').addEventListener('click', function() {
    const name = document.getElementById('staffName').value.trim();
    const errorMsg = document.getElementById('staffLoginError');

    if (!name) {
        errorMsg.textContent = 'Please enter your name';
        return;
    }

    const staff = JSON.parse(localStorage.getItem('staff')) || [];
    const member = staff.find(m => m.name.toLowerCase() === name.toLowerCase());

    if (member) {
        localStorage.setItem('loggedInStaffId', member.id);
        window.location.href = 'staff.html';
    } else {
        errorMsg.textContent = 'Name not found. Please check with your manager.';
    }
});