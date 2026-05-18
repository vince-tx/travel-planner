import { getDb, saveDatabase } from './database';

export function getItinerariesByTripId(tripId) {
  const db = getDb();
  if (!db) return [];
  return (db.itineraries || [])
    .filter(i => i.tripId === tripId)
    .sort((a, b) => {
      if (a.date !== b.date) return a.date.localeCompare(b.date);
      return (a.time || '').localeCompare(b.time || '');
    });
}

export function createItinerary(item) {
  const db = getDb();
  if (!db) return null;
  const id = Date.now();
  db.itineraries.push({ id, ...item });
  saveDatabase();
  return id;
}

export function updateItinerary(id, item) {
  const db = getDb();
  if (!db) return;
  const index = db.itineraries.findIndex(i => i.id === id);
  if (index !== -1) {
    db.itineraries[index] = { ...db.itineraries[index], ...item };
    saveDatabase();
  }
}

export function deleteItinerary(id) {
  const db = getDb();
  if (!db) return;
  db.itineraries = db.itineraries.filter(i => i.id !== id);
  saveDatabase();
}
