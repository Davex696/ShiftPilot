document.getElementById('staffLoginBtn').addEventListener('click', async function() {
    const input = document.getElementById('staffId').value.trim().toUpperCase();
    const errorMsg = document.getElementById('staffLoginError');

    if (!input) {
        errorMsg.textContent = 'Please enter your Staff ID';
        return;
    }

    const res = await fetch('http://localhost:3000/api/staff');
    const staff = await res.json();
    const member = staff.find(m => m.staffId === input);

    if (member) {
        localStorage.setItem('loggedInStaffId', member.id);
        window.location.href = '/staff.html';
    } else {
        errorMsg.textContent = 'Staff ID not found. Please check with your manager.';
    }
});