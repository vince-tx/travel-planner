import { getDb, saveDatabase } from './database';

export function getChecklistsByTripId(tripId) {
  const db = getDb();
  if (!db) return [];
  return (db.checklists || [])
    .filter(c => c.tripId === tripId)
    .sort((a, b) => {
      if (a.category !== b.category) return a.category.localeCompare(b.category);
      return a.id - b.id;
    });
}

export function createChecklistItem(item) {
  const db = getDb();
  if (!db) return null;
  const id = Date.now();
  db.checklists.push({ id, ...item, checked: false });
  saveDatabase();
  return id;
}

export function toggleChecklistItem(id, checked) {
  const db = getDb();
  if (!db) return;
  const item = db.checklists.find(c => c.id === id);
  if (item) {
    item.checked = checked;
    saveDatabase();
  }
}

export function deleteChecklistItem(id) {
  const db = getDb();
  if (!db) return;
  db.checklists = db.checklists.filter(c => c.id !== id);
  saveDatabase();
}
