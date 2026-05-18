import { getDb, saveDatabase } from './database';

export function getBudgetsByTripId(tripId) {
  const db = getDb();
  if (!db) return [];
  const result = db.exec(`SELECT * FROM budgets WHERE trip_id = ${tripId} ORDER BY category ASC`);
  if (!result.length) return [];
  return result[0].values.map(row => ({
    id: row[0], tripId: row[1], category: row[2], budget: row[3], spent: row[4]
  }));
}

export function createBudget(item) {
  const db = getDb();
  if (!db) return null;
  db.run('INSERT INTO budgets (trip_id, category, budget, spent) VALUES (?, ?, ?, ?)',
    [item.tripId, item.category, item.budget, item.spent || 0]);
  saveDatabase();
  return db.exec('SELECT last_insert_rowid()')[0].values[0][0];
}

export function updateBudget(id, item) {
  const db = getDb();
  if (!db) return;
  db.run('UPDATE budgets SET category = ?, budget = ?, spent = ? WHERE id = ?',
    [item.category, item.budget, item.spent, id]);
  saveDatabase();
}

export function addExpense(id, amount) {
  const db = getDb();
  if (!db) return;
  db.run('UPDATE budgets SET spent = spent + ? WHERE id = ?', [amount, id]);
  saveDatabase();
}

export function deleteBudget(id) {
  const db = getDb();
  if (!db) return;
  db.run('DELETE FROM budgets WHERE id = ?', [id]);
  saveDatabase();
}
