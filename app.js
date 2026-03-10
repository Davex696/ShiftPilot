let staff = JSON.parse(localStorage.getItem('staff')) || [];
let shifts = JSON.parse(localStorage.getItem('shifts')) || [];


function logout() {
    window.location.href = 'login.html';
}

// Save to localStorage
function saveData() {
    localStorage.setItem('staff', JSON.stringify(staff));
    localStorage.setItem('shifts', JSON.stringify(shifts));
}

document.querySelectorAll('.nav-item').forEach(function(item) {
    item.addEventListener('click', function(e) {
        e.preventDefault();
        const view = this.dataset.view;

        document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
        document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));

        this.classList.add('active');
        document.getElementById('view-' + view).classList.add('active');
    });
});

document.getElementById('openAddShift').addEventListener('click', function() {
    populateStaffDropdown();
    document.getElementById('shiftModal').classList.add('open');
});

document.getElementById('closeShift').addEventListener('click', function() {
    document.getElementById('shiftModal').classList.remove('open');
});

document.getElementById('openAddMember').addEventListener('click', function() {
    document.getElementById('memberModal').classList.add('open');
});

document.getElementById('closeMember').addEventListener('click', function() {
    document.getElementById('memberModal').classList.remove('open');
});

document.getElementById('saveMember').addEventListener('click', function() {
    const name = document.getElementById('memberName').value.trim();
    const role = document.getElementById('memberRole').value.trim();

    if (!name || !role) {
        alert('Please fill in all fields');
        return;
    }

    const member = {
        id: Date.now(),
        name: name,
        role: role,
        active: true
    };

    staff.push(member);
    saveData();
    renderTeam();
    renderSchedule();

    document.getElementById('memberName').value = '';
    document.getElementById('memberRole').value = '';
    document.getElementById('memberModal').classList.remove('open');
});

function getInitials(name) {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

function renderTeam() {
    const tbody = document.getElementById('teamTable');
    tbody.innerHTML = '';

    if (staff.length === 0) {
        tbody.innerHTML = `<tr><td colspan="4" style="text-align:center; color:#6b7280; padding:32px">No team members yet. Add your first member.</td></tr>`;
        return;
    }

    staff.forEach(function(member) {
        tbody.innerHTML += `
        <tr>
            <td>
                <div class="member-cell">
                    <div class="avatar">${getInitials(member.name)}</div>
                    <div>
                        <div style="font-weight:600">${member.name}</div>
                    </div>
                </div>
            </td>
            <td>${member.role}</td>
            <td><span class="badge ${member.active ? 'badge-active' : 'badge-inactive'}">${member.active ? 'Active' : 'Inactive'}</span></td>
            <td><button class="btn-danger" onclick="deleteMember(${member.id})">Remove</button></td>
        </tr>`;
    });
}

function deleteMember(id) {
    staff = staff.filter(m => m.id !== id);
    shifts = shifts.filter(s => s.staffId !== id);
    saveData();
    renderTeam();
    renderSchedule();
}

function populateStaffDropdown() {
    const select = document.getElementById('shiftStaff');
    select.innerHTML = '';
    staff.forEach(function(member) {
        select.innerHTML += `<option value="${member.id}">${member.name}</option>`;
    });
}

document.getElementById('saveShift').addEventListener('click', function() {
    const staffId = parseInt(document.getElementById('shiftStaff').value);
    const day = document.getElementById('shiftDay').value;
    const start = document.getElementById('shiftStart').value;
    const end = document.getElementById('shiftEnd').value;

    if (!staffId || !day || !start || !end) {
        alert('Please fill in all fields');
        return;
    }

    const shift = {
        id: Date.now(),
        staffId: staffId,
        day: day,
        start: start,
        end: end
    };

    shifts.push(shift);
    saveData();
    renderSchedule();

    document.getElementById('shiftStart').value = '';
    document.getElementById('shiftEnd').value = '';
    document.getElementById('shiftModal').classList.remove('open');
});

function deleteShift(id) {
    shifts = shifts.filter(s => s.id !== id);
    saveData();
    renderSchedule();
}
const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

function formatTime(time) {
    return time.slice(0, 5);
}

function renderSchedule() {
    const grid = document.getElementById('scheduleGrid');

    if (staff.length === 0) {
        grid.innerHTML = `<div style="text-align:center; color:#6b7280; padding:48px; background:#fff; border-radius:12px">No staff members yet. Add your team first.</div>`;
        return;
    }

    let html = `<div class="schedule-grid"><table>`;

    // Header row
    html += `<tr><th class="name-col">Team Member</th>`;
    days.forEach(d => html += `<th>${d.slice(0, 3).toUpperCase()}</th>`);
    html += `</tr>`;

    // One row per staff member
    staff.forEach(function(member) {
        html += `<tr>
            <td class="name-col">
                <div class="member-cell">
                    <div class="avatar">${getInitials(member.name)}</div>
                    <div>
                        <div style="font-weight:600; font-size:0.9rem">${member.name}</div>
                        <div style="font-size:0.75rem; color:#6b7280">${member.role}</div>
                    </div>
                </div>
            </td>`;

        days.forEach(function(day) {
            const dayShifts = shifts.filter(s => s.staffId === member.id && s.day === day);
            html += `<td>`;
            dayShifts.forEach(function(shift) {

                html += `
<div class="shift-block">
    <div class="shift-time">${formatTime(shift.start)}–${formatTime(shift.end)}</div>
    <div class="shift-role">${member.role}</div>
    <div style="text-align:right; margin-top:4px">
        <span onclick="deleteShift(${shift.id})" style="font-size:0.7rem; color:#dc2626; cursor:pointer;">✕ remove</span>
    </div>
</div>`
            });
            html += `</td>`;
        });

        html += `</tr>`;
    });

    html += `</table></div>`;
    grid.innerHTML = html;
}

renderTeam();
renderSchedule();