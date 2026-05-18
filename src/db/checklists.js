import { getDb, saveDatabase } from './database';

export function getChecklistsByTripId(tripId) {
  const db = getDb();
  if (!db) return [];
  const result = db.exec(`SELECT * FROM checklists WHERE trip_id = ${tripId} ORDER BY category ASC, id ASC`);
  if (!result.length) return [];
  return result[0].values.map(row => ({
    id: row[0], tripId: row[1], category: row[2], item: row[3], checked: row[4] === 1
  }));
}

export function createChecklistItem(item) {
  const db = getDb();
  if (!db) return null;
  db.run('INSERT INTO checklists (trip_id, category, item, checked) VALUES (?, ?, ?, ?)',
    [item.tripId, item.category, item.item, item.checked ? 1 : 0]);
  saveDatabase();
  return db.exec('SELECT last_insert_rowid()')[0].values[0][0];
}

export function toggleChecklistItem(id, checked) {
  const db = getDb();
  if (!db) return;
  db.run('UPDATE checklists SET checked = ? WHERE id = ?', [checked ? 1 : 0, id]);
  saveDatabase();
}

export function deleteChecklistItem(id) {
  const db = getDb();
  if (!db) return;
  db.run('DELETE FROM checklists WHERE id = ?', [id]);
  saveDatabase();
}
