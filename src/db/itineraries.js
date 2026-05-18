import { getDb, saveDatabase } from './database';

export function getItinerariesByTripId(tripId) {
  const db = getDb();
  if (!db) return [];
  const result = db.exec(`SELECT * FROM itineraries WHERE trip_id = ${tripId} ORDER BY date ASC, time ASC`);
  if (!result.length) return [];
  return result[0].values.map(row => ({
    id: row[0], tripId: row[1], date: row[2], time: row[3],
    title: row[4], location: row[5], notes: row[6]
  }));
}

export function createItinerary(item) {
  const db = getDb();
  if (!db) return null;
  db.run('INSERT INTO itineraries (trip_id, date, time, title, location, notes) VALUES (?, ?, ?, ?, ?, ?)',
    [item.tripId, item.date, item.time, item.title, item.location, item.notes]);
  saveDatabase();
  return db.exec('SELECT last_insert_rowid()')[0].values[0][0];
}

export function updateItinerary(id, item) {
  const db = getDb();
  if (!db) return;
  db.run('UPDATE itineraries SET date = ?, time = ?, title = ?, location = ?, notes = ? WHERE id = ?',
    [item.date, item.time, item.title, item.location, item.notes, id]);
  saveDatabase();
}

export function deleteItinerary(id) {
  const db = getDb();
  if (!db) return;
  db.run('DELETE FROM itineraries WHERE id = ?', [id]);
  saveDatabase();
}
