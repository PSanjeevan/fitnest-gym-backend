const express = require('express');
const router = express.Router();
const db = require('../database/db');
const { validateLocker } = require('../middleware/validation');

// GET /lockers
// Supports:
// - Part 3: Get all lockers
// - Part 4: Search by query parameter (?floor=1)
// - Part 5: Twist rule (?sort=name&order=asc|desc)
router.get('/', (req, res) => {
  const { floor, sort, order } = req.query;

  // --- PART 5: TWIST RULE (Sorted lists) ---
  const allowedSortFields = ['name', 'floor', 'id'];
  const allowedOrders = ['asc', 'desc'];

  if (sort !== undefined) {
    if (!allowedSortFields.includes(sort.toLowerCase())) {
      // Test 3: Unknown sort field gets 400 and exact message "Cannot sort by that field"
      return res.status(400).json({ message: 'Cannot sort by that field', error: 'Cannot sort by that field' });
    }
  }

  if (order !== undefined && !allowedOrders.includes(order.toLowerCase())) {
    return res.status(400).json({ error: 'Invalid order value. Use "asc" or "desc".' });
  }

  let sql = 'SELECT * FROM lockers';
  const params = [];

  // --- PART 4: SEARCH BY QUERY PARAMETER (e.g. /lockers?floor=1) ---
  if (floor !== undefined) {
    const floorNum = Number(floor);
    if (Number.isNaN(floorNum)) {
      return res.status(400).json({ error: 'Query parameter "floor" must be a valid number.' });
    }
    sql += ' WHERE floor = ?';
    params.push(floorNum);
  }

  // Apply sorting for Part 5 Twist (Test 1: asc A-Z, Test 2: desc Z-A)
  if (sort) {
    const sortColumn = sort.toLowerCase();
    const sortOrder = order ? order.toUpperCase() : 'ASC';
    sql += ` ORDER BY ${sortColumn} ${sortOrder}`;
  }

  db.all(sql, params, (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(200).json(rows);
  });
});

// GET /lockers/:id (Get one locker)
router.get('/:id', (req, res) => {
  db.get('SELECT * FROM lockers WHERE id = ?', [req.params.id], (err, row) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!row) {
      return res.status(404).json({ error: 'Locker not found' });
    }
    res.status(200).json(row);
  });
});

// POST /lockers (Add a locker with validation)
router.post('/', validateLocker, (req, res) => {
  const { name, floor } = req.body;

  db.run('INSERT INTO lockers (name, floor) VALUES (?, ?)', [name, floor], function (err) {
    if (err) {
      if (err.message.includes('UNIQUE')) {
        return res.status(400).json({ error: 'A locker with that name already exists.' });
      }
      return res.status(500).json({ error: err.message });
    }
    res.status(201).json({
      id: this.lastID,
      name,
      floor
    });
  });
});

// PUT /lockers/:id (Update a locker with validation)
router.put('/:id', validateLocker, (req, res) => {
  const { name, floor } = req.body;
  const { id } = req.params;

  db.run(
    'UPDATE lockers SET name = ?, floor = ? WHERE id = ?',
    [name, floor, id],
    function (err) {
      if (err) {
        if (err.message.includes('UNIQUE')) {
          return res.status(400).json({ error: 'A locker with that name already exists.' });
        }
        return res.status(500).json({ error: err.message });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Locker not found' });
      }
      res.status(200).json({
        id: Number(id),
        name,
        floor
      });
    }
  );
});

// DELETE /lockers/:id (Delete a locker)
router.delete('/:id', (req, res) => {
  db.run('DELETE FROM lockers WHERE id = ?', [req.params.id], function (err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Locker not found' });
    }
    res.status(200).json({ message: 'Locker deleted successfully' });
  });
});

module.exports = router;