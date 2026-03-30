const loggedInId = parseInt(localStorage.getItem('loggedInStaffId'));
const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

let allStaff = [];
let myShifts = [];
let allShifts = [];

async function loadData() {
    const staffRes = await fetch('http://localhost:3000/api/staff');
    allStaff = await staffRes.json();

    const shiftsRes = await fetch('http://localhost:3000/api/shifts');
    allShifts = await shiftsRes.json();
    myShifts = allShifts.filter(s => parseInt(s.staffId) === loggedInId);

    const member = allStaff.find(m => m.id === loggedInId);
    if (member) {
        document.querySelector('.user-name').textContent = member.name;
        document.querySelector('.user-role').textContent = member.role;
        document.querySelector('.sidebar-user .avatar').textContent =
            member.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }

    renderStaffSchedule();
    populateComplaintShifts();
}

function formatTime(time) {
    if (!time) return '--';
    return time.slice(0, 5);
}

function renderStaffSchedule() {
    const container = document.getElementById('staffSchedule');
    container.innerHTML = '';

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
                    <div class="avatar">${document.querySelector('.user-name').textContent.split(' ').map(n => n[0]).join('').toUpperCase().slice(0,2)}</div>
                    <div>
                        <div style="font-weight:600">${document.querySelector('.user-name').textContent}</div>
                        <div style="font-size:0.8rem; color:#6b7280">${formatTime(shift.start)} – ${formatTime(shift.end)}</div>
                        <div style="font-size:0.75rem; color:#1a73e8; margin-top:2px">${document.querySelector('.user-role').textContent}</div>
                    </div>
                </div>`).join('')}
            </div>
        </div>`;
    });
}

function populateComplaintShifts() {
    const select = document.getElementById('complaintShift');
    select.innerHTML = '<option value="">-- Select a shift --</option>';
    myShifts.forEach(shift => {
        select.innerHTML += `<option value="${shift.id}">${shift.day} — ${formatTime(shift.start)} to ${formatTime(shift.end)}</option>`;
    });
}


async function submitComplaint() {
    const shiftId = document.getElementById('complaintShift').value;
    const message = document.getElementById('complaintMessage').value.trim();

    if (!shiftId || !message) {
        alert('Please select a shift and write a message');
        return;
    }

    const shift = myShifts.find(s => s.id === parseInt(shiftId));
    const member = allStaff.find(m => m.id === loggedInId);

    await fetch('http://localhost:3000/api/complaints', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            staffId: loggedInId,
            staffName: member ? member.name : 'Unknown',
            shiftId: parseInt(shiftId),
            shiftDay: shift ? shift.day : '',
            message
        })
    });

    document.getElementById('complaintMessage').value = '';
    document.getElementById('complaintShift').value = '';
    alert('Complaint submitted successfully.');
}


function logout() {
    localStorage.removeItem('loggedInStaffId');
    window.location.href = 'login.html';
}

loadData();