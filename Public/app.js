let staff = [];
let shifts = [];

async function loadData() {
    const staffRes = await fetch('/api/staff');
    staff = await staffRes.json();

    const shiftsRes = await fetch('/api/shifts');
    shifts = await shiftsRes.json();

    renderTeam();
    renderSchedule();
    renderStats();
    loadNotifications();
    renderComplaints();
}
const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
function logout() {
    window.location.href = 'index.html';

}
    function generateStaffId() {
    const num = Math.floor(Math.random() * 900 ) + 100;
    return 'SP-' + num;
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

document.getElementById('saveMember').addEventListener('click', async function() {
    const name = document.getElementById('memberName').value.trim();
    const role = document.getElementById('memberRole').value.trim();

    if (!name || !role) {
        alert('Please fill in all fields');
        return;
    }

    await fetch('/api/staff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            staffId: generateStaffId(),
            name: name,
            role: role,
            active: true
        })
    });

    await loadData();

    document.getElementById('memberName').value = '';
    document.getElementById('memberRole').value = '';
    document.getElementById('memberModal').classList.remove('open');
});
async function loadNotifications() {
    const res = await fetch('http://localhost:3000/api/notifications');
    const notifications = await res.json();
    
    const unread = notifications.filter(n => !n.read);
    const countEl = document.getElementById('notifCount');
    
    if (unread.length > 0) {
        countEl.style.display = 'inline';
        countEl.textContent = unread.length;
    } else {
        countEl.style.display = 'none';
    }

    const list = document.getElementById('notifList');
    if (notifications.length === 0) {
        list.innerHTML = `<div class="notif-empty">No notifications yet.</div>`;
        return;
    }

    list.innerHTML = notifications.reverse().map(n => `
    <div onclick="markRead(${n.id})" class="notif-item ${n.read ? '' : 'unread'}">
        <div class="notif-message">${n.message}</div>
        <div class="notif-time">${n.time}</div>
    </div>`).join('');
}

function toggleNotifications() {
    const dropdown = document.getElementById('notifDropdown');
    dropdown.style.display = dropdown.style.display === 'none' ? 'block' : 'none';
    if (dropdown.style.display === 'block') {
        loadNotifications();
    }
}

async function markRead(id) {
    await fetch(`http://localhost:3000/api/notifications/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ read: true })
    });
    loadNotifications();
}

// Close dropdown when clicking outside
document.addEventListener('click', function(e) {
    const btn = document.getElementById('notifBtn');
    const dropdown = document.getElementById('notifDropdown');
    if (!btn.contains(e.target) && !dropdown.contains(e.target)) {
        dropdown.style.display = 'none';
    }
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
            <td><span style="font-weight:700; color:#1a73e8; letter-spacing:1px">${member.staffId}</span></td>
            <td>${member.role}</td>
            <td><span class="badge ${member.active ? 'badge-active' : 'badge-inactive'}">${member.active ? 'Active' : 'Inactive'}</span></td>
            <td><button class="btn-danger" onclick="deleteMember(${member.id})">Remove</button></td>
        </tr>`;
    });
}

function renderStats() {
    const container = document.getElementById('statsContent');
    container.innerHTML = '';

    if (shifts.length === 0) {
        container.innerHTML = `<div style="text-align:center; color:#6b7280; padding:48px; background:#fff; border-radius:12px">No shifts yet. Add shifts to see statistics.</div>`;
        return;
    }

    // Calculate stats
    const totalShifts = shifts.length;

    const dayCount = {};
    days.forEach(d => dayCount[d] = 0);
    shifts.forEach(s => dayCount[s.day]++);
    const busiestDay = Object.keys(dayCount).reduce((a, b) => dayCount[a] > dayCount[b] ? a : b);

    const staffCount = {};
    shifts.forEach(s => {
        staffCount[s.staffId] = (staffCount[s.staffId] || 0) + 1;
    });
    const busiestStaffId = Object.keys(staffCount).reduce((a, b) => staffCount[a] > staffCount[b] ? a : b);
    const busiestMember = staff.find(m => m.id === parseInt(busiestStaffId));

    // Stats cards
    container.innerHTML += `
    <div style="display:grid; grid-template-columns:repeat(3,1fr); gap:16px; margin-bottom:32px">
        <div class="stat-card">
            <div class="stat-label">Total Shifts</div>
            <div class="stat-value">${totalShifts}</div>
        </div>
        <div class="stat-card">
            <div class="stat-label">Busiest Day</div>
            <div class="stat-value">${busiestDay}</div>
        </div>
        <div class="stat-card">
            <div class="stat-label">Most Scheduled</div>
            <div class="stat-value">${busiestMember ? busiestMember.name.split(' ')[0] : '—'}</div>
        </div>
    </div>`;

    // Bar chart
    const maxCount = Math.max(...Object.values(dayCount), 1);
    let chartHtml = `
    <div style="background:#fff; border-radius:12px; padding:28px; box-shadow:0 1px 4px rgba(0,0,0,0.07)">
        <div style="font-size:0.75rem; font-weight:700; text-transform:uppercase; letter-spacing:1px; color:#6b7280; margin-bottom:24px">Shifts Per Day</div>
        <div style="display:flex; align-items:flex-end; gap:12px; height:200px; padding-top:20px">`;

    days.forEach(function(day) {
        const count = dayCount[day] || 0;
        const barHeight = (count / maxCount) * 160;
        chartHtml += `
        <div style="display:flex; flex-direction:column; align-items:center; flex:1; gap:6px">
            <div style="font-size:0.75rem; font-weight:600; color:#1a73e8">${count}</div>
            <div style="width:100%; background:#1a73e8; border-radius:6px 6px 0 0; height:${barHeight}px; min-height:4px; transition:height 0.3s"></div>
            <div style="font-size:0.7rem; color:#6b7280; text-transform:uppercase; letter-spacing:0.5px">${day.slice(0,3)}</div>
        </div>`;
    });

    chartHtml += `</div></div>`;
    container.innerHTML += chartHtml;

    /* Staff shift breakdown render problem with 
    the second card need amelioration*/
    let tableHtml = `
    <div style="background:#fff; border-radius:12px; overflow:hidden; box-shadow:0 1px 4px rgba(0,0,0,0.07); margin-top:24px">
        <div style="padding:20px 24px; border-bottom:1px solid #e0e4ea; font-size:0.75rem; font-weight:700; text-transform:uppercase; letter-spacing:1px; color:#6b7280">Shifts Per Staff Member</div>
        <table class="team-table">
            <thead><tr><th>Name</th><th>Role</th><th>Total Shifts</th></tr></thead>
            <tbody>`;

    staff.forEach(function(member) {
        const count = staffCount[String(member.id)] || 0;
        tableHtml += `
        <tr>
            <td><div class="member-cell"><div class="avatar">${getInitials(member.name)}</div><div style="font-weight:600">${member.name}</div></div></td>
            <td>${member.role}</td>
            <td><strong style="color:#1a73e8">${count}</strong></td>
        </tr>`;
    });

    tableHtml += `</tbody></table></div>`;
    container.innerHTML += tableHtml;
}


async function deleteMember(id) {

    await fetch(`/api/staff/${id}`, { method: 'DELETE' });
    await loadData();

}

function populateStaffDropdown() {
    const select = document.getElementById('shiftStaff');
    select.innerHTML = '';
    staff.forEach(function(member) {
        select.innerHTML += `<option value="${member.id}">${member.name}</option>`;
    });
}

document.getElementById('saveShift').addEventListener('click', async function() {
    const staffId = parseInt(document.getElementById('shiftStaff').value);
    const day = document.getElementById('shiftDay').value;
    const start = document.getElementById('shiftStart').value;
    const end = document.getElementById('shiftEnd').value;

if (start >= end) {
    alert('End time must be later than start time');
    return;
}

    if (!staffId || !day || !start || !end) {
        alert('Please fill in all fields');
        return;
    }

const res = await fetch('http://localhost:3000/api/shifts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ staffId, day, start, end })
});

if (!res.ok) {
    const err = await res.json();
    alert(err.error);
    return;
}

await loadData();
});

document.getElementById('shiftStart').value = '';
document.getElementById('shiftEnd').value = '';
document.getElementById('shiftDay').selectedIndex = 0;
document.getElementById('shiftStaff').selectedIndex = 0;
document.getElementById('shiftModal').classList.remove('open');

async function deleteShift(id) {
    await fetch(`/api/shifts/${id}`, { method: 'DELETE' });
    await loadData();
}
function getWeekDates() {
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0=Sun, 1=Mon...
    const monday = new Date(today);
    monday.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));

    return days.map(function(day, index) {
        const date = new Date(monday);
        date.setDate(monday.getDate() + index);
        return {
            day: day,
            date: date.getDate(),
            month: date.toLocaleString('default', { month: 'short' })
        };
    });
}

function formatTime(time) {
    return time.slice(0, 5);
}

function renderSchedule() {
    const grid = document.getElementById('scheduleGrid');
    const weekDates = getWeekDates();

    if (staff.length === 0) {
        grid.innerHTML = `<div style="text-align:center; color:#6b7280; padding:48px; background:#fff; border-radius:12px">No staff members yet. Add your team first.</div>`;
        return;
    }

    let html = `<div class="schedule-grid"><table>`;

    // Header row
    html += `<tr><th class="name-col">Team Member</th>`;
    weekDates.forEach(d => html +=`
        <th>
            <div>${d.day.slice(0, 3).toUpperCase()}</div>
            <div style="font-size:0.75rem; color:#1a73e8; font-weight:600; margin-top:2px">${d.date} ${d.month}</div>
        
        </th>`)
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
            const dayShifts = shifts.filter(s => String(s.staffId) === String(member.id) && s.day === day);
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
async function renderComplaints() {
    const container = document.getElementById('complaintsList');
    const res = await fetch('http://localhost:3000/api/complaints');
    const complaints = await res.json();

    if (complaints.length === 0) {
        container.innerHTML = `<div style="text-align:center; color:#6b7280; padding:48px; background:#fff; border-radius:12px">No complaints yet.</div>`;
        return;
    }

    container.innerHTML = complaints.reverse().map(c => `
    <div style="background:#fff; border-radius:12px; padding:20px 24px; margin-bottom:12px; box-shadow:0 1px 4px rgba(0,0,0,0.07)">
        <div style="display:flex; justify-content:space-between; align-items:flex-start">
            <div>
                <div style="font-weight:700; margin-bottom:4px">${c.staffName}</div>
                <div style="font-size:0.85rem; color:#6b7280; margin-bottom:8px">Shift: ${c.shiftDay}</div>
                <div style="font-size:0.9rem; color:#1a1f2e">${c.message}</div>
            </div>
            <div style="display:flex; flex-direction:column; align-items:flex-end; gap:8px">
                <span style="font-size:0.75rem; padding:3px 10px; border-radius:20px; background:${c.status === 'pending' ? '#fef3c7' : '#dcfce7'}; color:${c.status === 'pending' ? '#92400e' : '#16a34a'}">${c.status}</span>
                ${c.status === 'pending' ? `<button class="btn-primary" onclick="resolveComplaint(${c.id})" style="font-size:0.8rem; padding:6px 14px">Mark Resolved</button>` : ''}
            </div>
        </div>
    </div>`).join('');
}

async function resolveComplaint(id) {
    await fetch(`http://localhost:3000/api/complaints/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' }
    });
    renderComplaints();
}

loadData();