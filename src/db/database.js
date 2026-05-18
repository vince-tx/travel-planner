// 简化的数据库实现 - 使用 localStorage
const STORAGE_KEY = 'travelPlannerData';

const defaultData = {
  trips: [],
  itineraries: [],
  checklists: [],
  budgets: []
};

let db = null;

export async function initDatabase() {
  if (db) return db;

  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      db = JSON.parse(saved);
    } else {
      db = { ...defaultData };
      saveDatabase();
    }
    return db;
  } catch (error) {
    console.error('Database init error:', error);
    db = { ...defaultData };
    return db;
  }
}

export function saveDatabase() {
  if (!db) return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
  } catch (error) {
    console.error('Save database error:', error);
  }
}

export function getDb() {
  return db;
}
