import { getDb, saveDatabase } from './database';

export function getAllTrips() {
  const db = getDb();
  if (!db) return [];
  return db.trips || [];
}

export function getTripById(id) {
  const db = getDb();
  if (!db) return null;
  return db.trips.find(t => t.id === id) || null;
}

export function createTrip(trip) {
  const db = getDb();
  if (!db) return null;
  const id = Date.now();
  const newTrip = {
    id,
    name: trip.name,
    destination: trip.destination || '',
    startDate: trip.startDate || '',
    endDate: trip.endDate || '',
    createdAt: new Date().toISOString()
  };
  db.trips.push(newTrip);
  saveDatabase();
  return id;
}

export function updateTrip(id, trip) {
  const db = getDb();
  if (!db) return;
  const index = db.trips.findIndex(t => t.id === id);
  if (index !== -1) {
    db.trips[index] = { ...db.trips[index], ...trip };
    saveDatabase();
  }
}

export function deleteTrip(id) {
  const db = getDb();
  if (!db) return;
  db.trips = db.trips.filter(t => t.id !== id);
  db.itineraries = db.itineraries.filter(i => i.tripId !== id);
  db.checklists = db.checklists.filter(c => c.tripId !== id);
  db.budgets = db.budgets.filter(b => b.tripId !== id);
  saveDatabase();
}
