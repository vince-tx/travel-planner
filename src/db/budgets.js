import { getDb, saveDatabase } from './database';

export function getBudgetsByTripId(tripId) {
  const db = getDb();
  if (!db) return [];
  return (db.budgets || [])
    .filter(b => b.tripId === tripId)
    .sort((a, b) => a.category.localeCompare(b.category));
}

export function createBudget(item) {
  const db = getDb();
  if (!db) return null;
  const id = Date.now();
  db.budgets.push({ id, ...item, spent: item.spent || 0 });
  saveDatabase();
  return id;
}

export function updateBudget(id, item) {
  const db = getDb();
  if (!db) return;
  const index = db.budgets.findIndex(b => b.id === id);
  if (index !== -1) {
    db.budgets[index] = { ...db.budgets[index], ...item };
    saveDatabase();
  }
}

export function addExpense(id, amount) {
  const db = getDb();
  if (!db) return;
  const budget = db.budgets.find(b => b.id === id);
  if (budget) {
    budget.spent = (budget.spent || 0) + amount;
    saveDatabase();
  }
}

export function deleteBudget(id) {
  const db = getDb();
  if (!db) return;
  db.budgets = db.budgets.filter(b => b.id !== id);
  saveDatabase();
}
