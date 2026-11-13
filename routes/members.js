const express = require('express');
const router = express.Router();
const db = require('../database/db');
const { validateMember } = require('../middleware/validation');

// GET all members
router.get('/', (req, res) => {
  db.all('SELECT * FROM members', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(200).json(rows);
  });
});

// GET one member
router.get('/:id', (req, res) => {
  db.get('SELECT * FROM members WHERE id = ?', [req.params.id], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ error: 'Member not found' });
    res.status(200).json(row);
  });
});

// POST add a member
router.post('/', validateMember, (req, res) => {
  const { name, email } = req.body;
  db.run('INSERT INTO members (name, email) VALUES (?, ?)', [name, email], function (err) {
    if (err) {
      if (err.message.includes('UNIQUE')) {
        return res.status(400).json({ error: 'A member with this email already exists.' });
      }
      return res.status(500).json({ error: err.message });
    }
    res.status(201).json({ id: this.lastID, name, email });
  });
});

module.exports = router;