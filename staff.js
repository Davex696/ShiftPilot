const shifts = JSON.parse(localStorage.getItem('shifts')) || [];
const staff = JSON.parse(localStorage.getItem('staff')) || [];
const loggedInId = parseInt(localStorage.getItem('loggedInStaffId'));

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

function formatTime(time) {
    if (!time) return '--';
    return time.slice(0, 5);
}

function getStaffName(staffId) {
    const member = staff.find(m => m.id === staffId);
    return member ? member.name : 'Unknown';
}

function getLoggedInMember() {
    return staff.find(m => m.id === loggedInId);
}

function renderStaffSchedule() {
    const container = document.getElementById('staffSchedule');
    container.innerHTML = '';

    const member = getLoggedInMember();

    // Update sidebar with logged in member info
    if (member) {
        document.querySelector('.user-name').textContent = member.name;
        document.querySelector('.user-role').textContent = member.role;
        document.querySelector('.sidebar-user .avatar').textContent =
            member.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }

    // Filter shifts for this staff member only
    const myShifts = shifts.filter(s => s.staffId === loggedInId);

    if (myShifts.length === 0) {
        container.innerHTML = `<div style="text-align:center; color:#6b7280; padding:48px; background:#fff; border-radius:12px">You have no shifts scheduled yet.</div>`;
        return;
    }

    days.forEach(function(day) {
        const dayShifts = myShifts.filter(s => s.day === day);
        if (dayShifts.length === 0) return;

        container.innerHTML += `
        <div style="margin-bottom:24px">
            <div style="font-weight:700; font-size:0.85rem; text-transform:uppercase; letter-spacing:1px; color:#6b7280; margin-bottom:12px">${day}</div>
            <div style="background:#fff; border-radius:12px; overflow:hidden; box-shadow:0 1px 4px rgba(0,0,0,0.07)">
                ${dayShifts.map(shift => `
                <div style="display:flex; align-items:center; gap:16px; padding:16px 20px; border-bottom:1px solid #e0e4ea">
                    <div class="avatar">${member ? member.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0,2) : 'ST'}</div>
                    <div>
                        <div style="font-weight:600">${member ? member.name : 'Staff'}</div>
                        <div style="font-size:0.8rem; color:#6b7280">${formatTime(shift.start)} – ${formatTime(shift.end)}</div>
                        <div style="font-size:0.75rem; color:#1a73e8; margin-top:2px">${member ? member.role : ''}</div>
                    </div>
                </div>`).join('')}
            </div>
        </div>`;
    });
}

function logout() {
    localStorage.removeItem('loggedInStaffId');
    window.location.href = 'login.html';
}

renderStaffSchedule();