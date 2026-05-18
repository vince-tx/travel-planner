import { getDb, saveDatabase } from './database';

export function getAllTrips() {
  const db = getDb();
  if (!db) return [];
  const result = db.exec('SELECT * FROM trips ORDER BY start_date ASC');
  if (!result.length) return [];
  return result[0].values.map(row => ({
    id: row[0], name: row[1], destination: row[2],
    startDate: row[3], endDate: row[4], createdAt: row[5]
  }));
}

export function getTripById(id) {
  const db = getDb();
  if (!db) return null;
  const result = db.exec(`SELECT * FROM trips WHERE id = ${id}`);
  if (!result.length || !result[0].values.length) return null;
  const row = result[0].values[0];
  return {
    id: row[0], name: row[1], destination: row[2],
    startDate: row[3], endDate: row[4], createdAt: row[5]
  };
}

export function createTrip(trip) {
  const db = getDb();
  if (!db) return null;
  db.run('INSERT INTO trips (name, destination, start_date, end_date) VALUES (?, ?, ?, ?)',
    [trip.name, trip.destination, trip.startDate, trip.endDate]);
  saveDatabase();
  return db.exec('SELECT last_insert_rowid()')[0].values[0][0];
}

export function updateTrip(id, trip) {
  const db = getDb();
  if (!db) return;
  db.run('UPDATE trips SET name = ?, destination = ?, start_date = ?, end_date = ? WHERE id = ?',
    [trip.name, trip.destination, trip.startDate, trip.endDate, id]);
  saveDatabase();
}

export function deleteTrip(id) {
  const db = getDb();
  if (!db) return;
  db.run('DELETE FROM itineraries WHERE trip_id = ?', [id]);
  db.run('DELETE FROM checklists WHERE trip_id = ?', [id]);
  db.run('DELETE FROM budgets WHERE trip_id = ?', [id]);
  db.run('DELETE FROM trips WHERE id = ?', [id]);
  saveDatabase();
}
