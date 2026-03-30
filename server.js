const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// In-memory data
let staff = [];
let shifts = [];
let complaints = [];
let notifications = [];
// ── Staff Routes ──────────────────────────────

app.post('/api/shifts', (req, res) => {
    const { staffId, day, start, end } = req.body;

    // Conflict detection
    const conflict = shifts.find(s => 
        String(s.staffId) === String(staffId) && 
        s.day === day &&
        start < s.end && 
        end > s.start
    );

    if (conflict) {
        return res.status(409).json({ 
            error: `Conflict detected. This staff member already has a shift on ${day} from ${conflict.start} to ${conflict.end}.`
        });
    }

    const shift = { id: Date.now(), staffId, day, start, end };
    shifts.push(shift);
    res.json(shift);
});
app.get('/api/staff', (req, res) => {
    res.json(staff);
});

app.post('/api/staff', (req, res) => {
    const { name, role, staffId } = req.body;
    const member = { id: Date.now(), staffId, name, role, active: true };
    staff.push(member);
    res.json(member);
});

app.delete('/api/staff/:id', (req, res) => {
    staff = staff.filter(m => m.id !== parseInt(req.params.id));
    shifts = shifts.filter(s => s.staffId !== parseInt(req.params.id));
    res.json({ success: true });
});

// ── Shift Routes ──────────────────────────────

app.get('/api/shifts', (req, res) => {
    res.json(shifts);
});


app.delete('/api/shifts/:id', (req, res) => {
    shifts = shifts.filter(s => s.id !== parseInt(req.params.id)); // ← fix this
    res.json({ success: true });
});
// ── Complaint Routes ──────────────────────────

app.get('/api/complaints', (req, res) => {
    res.json(complaints);
});

app.post('/api/complaints', (req, res) => {
    const { staffId, staffName, shiftId, shiftDay, message } = req.body;
    const complaint = {
        id: Date.now(),
        staffId,
        staffName,
        shiftId,
        shiftDay,
        message,
        status: 'pending'
    };
    complaints.push(complaint);

    // Create admin notification
    notifications.push({
        id: Date.now() + 1,
        message: `${staffName} filed a complaint about their ${shiftDay} shift: "${message}"`,
        read: false,
        time: new Date().toLocaleTimeString()
    });

    res.json(complaint);
});
app.patch('/api/complaints/:id', (req, res) => {
    const complaint = complaints.find(c => c.id === parseInt(req.params.id));
    if (complaint) complaint.status = 'resolved';
    res.json({ success: true });
});

// ── Notification Routes ───────────────────────

app.get('/api/notifications', (req, res) => {
    res.json(notifications);
});

app.patch('/api/notifications/:id', (req, res) => {
    const notif = notifications.find(n => n.id === parseInt(req.params.id));
    if (notif) notif.read = true;
    res.json({ success: true });
});

// ── Start ─────────────────────────────────────

app.listen(PORT, () => {
    console.log(`ShiftPilot running at http://localhost:${PORT}`);
});