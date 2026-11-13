const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, '../fitnest.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error connecting to SQLite database:', err.message);
  } else {
    console.log('Connected to the FitNest SQLite database.');
  }
});

db.serialize(() => {
  db.run('PRAGMA foreign_keys = ON');

  db.run(`
    CREATE TABLE IF NOT EXISTS members (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS lockers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      floor INTEGER NOT NULL
    )
  `);

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

  db.get('SELECT COUNT(*) AS count FROM lockers', (err, row) => {
    if (!err && row && row.count === 0) {
      db.serialize(() => {
        db.run(`INSERT INTO members (name, email) VALUES ('Alice Johnson', 'alice@fitnest.com'), ('Bob Smith', 'bob@fitnest.com')`);
        db.run(`INSERT INTO lockers (name, floor) VALUES ('Locker C03', 2), ('Locker A01', 1), ('Locker B02', 1)`);
        db.run(`INSERT INTO allotments (member_id, locker_id) VALUES (1, 2)`);
      });
    }
  });
});

module.exports = db;
