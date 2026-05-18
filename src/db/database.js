import initSqlJs from 'sql.js';

let db = null;

export async function initDatabase() {
  if (db) return db;

  const SQL = await initSqlJs({
    locateFile: file => `https://sql.js.org/dist/${file}`
  });

  const saved = localStorage.getItem('travelPlannerDb');
  if (saved) {
    const data = Uint8Array.from(atob(saved), c => c.charCodeAt(0));
    db = new SQL.Database(data);
  } else {
    db = new SQL.Database();
    initSchema();
  }

  return db;
}

function initSchema() {
  db.run(`
    CREATE TABLE IF NOT EXISTS trips (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      destination TEXT,
      start_date TEXT,
      end_date TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS itineraries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      trip_id INTEGER NOT NULL,
      date TEXT NOT NULL,
      time TEXT,
      title TEXT NOT NULL,
      location TEXT,
      notes TEXT,
      FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS checklists (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      trip_id INTEGER NOT NULL,
      category TEXT NOT NULL,
      item TEXT NOT NULL,
      checked INTEGER DEFAULT 0,
      FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS budgets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      trip_id INTEGER NOT NULL,
      category TEXT NOT NULL,
      budget REAL DEFAULT 0,
      spent REAL DEFAULT 0,
      FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE
    );
  `);
}

export function saveDatabase() {
  if (!db) return;
  const data = db.export();
  const binary = String.fromCharCode(...data);
  localStorage.setItem('travelPlannerDb', btoa(binary));
}

export function getDb() {
  return db;
}
