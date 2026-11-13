const express = require('express');
const router = express.Router();
const db = require('../database/db');
const { validateAllotment } = require('../middleware/validation');

// PART 3: JOIN ENDPOINT — Allotments with the member name and the locker name
router.get('/', (req, res) => {
  const sql = `
    SELECT 
      allotments.id,
      allotments.member_id,
      members.name AS member_name,
      allotments.locker_id,
      lockers.name AS locker_name,
      lockers.floor AS locker_floor,
      allotments.assigned_date
    FROM allotments
    INNER JOIN members ON allotments.member_id = members.id
    INNER JOIN lockers ON allotments.locker_id = lockers.id
  `;

  db.all(sql, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(200).json(rows);
  });
});

// POST /allotments — Assign a locker to a member (prevents duplicate locker assignment)
router.post('/', validateAllotment, (req, res) => {
  const { member_id, locker_id } = req.body;

  db.run(
    'INSERT INTO allotments (member_id, locker_id) VALUES (?, ?)',
    [member_id, locker_id],
    function (err) {
      if (err) {
        if (err.message.includes('UNIQUE')) {
          return res.status(400).json({
            error: 'This locker is already assigned to another member.'
          });
        }
        if (err.message.includes('FOREIGN KEY')) {
          return res.status(404).json({
            error: 'Member ID or Locker ID does not exist.'
          });
        }
        return res.status(500).json({ error: err.message });
      }
      res.status(201).json({
        id: this.lastID,
        member_id,
        locker_id
      });
    }
  );
});

// DELETE /allotments/:id — Release a locker allotment
router.delete('/:id', (req, res) => {
  db.run('DELETE FROM allotments WHERE id = ?', [req.params.id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    if (this.changes === 0) return res.status(404).json({ error: 'Allotment not found' });
    res.status(200).json({ message: 'Locker allotment removed successfully' });
  });
});

module.exports = router;