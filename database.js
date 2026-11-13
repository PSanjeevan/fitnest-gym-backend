const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./fitnest.db');

db.serialize(() => {
  // Enable foreign key constraints in SQLite
  db.run('PRAGMA foreign_keys = ON');

  // 1. Members Table
  db.run(`
    CREATE TABLE IF NOT EXISTS members (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL
    )
  `);

  // 2. Lockers Table (Requires name and floor per brief)
  db.run(`
    CREATE TABLE IF NOT EXISTS lockers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      floor INTEGER NOT NULL
    )
  `);

  // 3. Allotments Table (Links members and lockers; prevents duplicate locker assignment)
  db.run(`
    CREATE TABLE IF NOT EXISTS allotments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      member_id INTEGER NOT NULL,
      locker_id INTEGER NOT NULL UNIQUE,
      assigned_date TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE,
      FOREIGN KEY (locker_id) REFERENCES lockers(id) ON DELETE CASCADE
    )
  `);
});

module.exports = db;