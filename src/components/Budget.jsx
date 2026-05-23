import { useState, useEffect } from 'react';
import { getBudgetsByTripId, createBudget, addExpense, deleteBudget } from '../db/budgets';
import ConfirmDialog from './ConfirmDialog';
import Modal from './Modal';
import { EmptyIcon } from './Icons';
import './Budget.css';

const DEFAULT_CATEGORIES = ['交通', '住宿', '餐饮', '门票', '购物', '其他'];

export default function Budget({ tripId, onRefresh }) {
  const [budgets, setBudgets] = useState([]);
  const [showExpenseInput, setShowExpenseInput] = useState(null);
  const [expenseAmount, setExpenseAmount] = useState('');
  const [confirm, setConfirm] = useState({ open: false, id: null });
  const [newCategory, setNewCategory] = useState('');
  const [newBudget, setNewBudget] = useState('');
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => { setBudgets(getBudgetsByTripId(tripId)); }, [tripId]);

  const totalBudget = budgets.reduce((sum, b) => sum + (b.budget || 0), 0);
  const totalSpent = budgets.reduce((sum, b) => sum + (b.spent || 0), 0);
  const remaining = totalBudget - totalSpent;
  const fmt = (n) => n % 1 === 0 ? n.toString() : n.toFixed(2);

  const overspent = remaining < 0;

  const handleAddBudget = (e) => {
    e.preventDefault();
    if (!newCategory || !newBudget) return;
    createBudget({ tripId, category: newCategory, budget: parseFloat(newBudget) || 0, spent: 0 });
    setNewCategory('');
    setNewBudget('');
    setBudgets(getBudgetsByTripId(tripId));
    onRefresh?.();
  };

  const handleOpenModal = () => {
    setNewCategory('');
    setNewBudget('');
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setNewCategory('');
    setNewBudget('');
  };

  const handleModalSubmit = (e) => {
    e.preventDefault();
    if (!newCategory || !newBudget) return;
    createBudget({ tripId, category: newCategory, budget: parseFloat(newBudget) || 0, spent: 0 });
    setNewCategory('');
    setNewBudget('');
    setBudgets(getBudgetsByTripId(tripId));
    onRefresh?.();
    handleCloseModal();
  };

  const handleAddExpense = (budgetId) => {
    if (!expenseAmount) return;
    addExpense(budgetId, parseFloat(expenseAmount));
    setExpenseAmount('');
    setShowExpenseInput(null);
    setBudgets(getBudgetsByTripId(tripId));
    onRefresh?.();
  };

  const handleDelete = (id) => {
    setConfirm({ open: true, id });
  };

  const confirmDelete = () => {
    deleteBudget(confirm.id);
    setConfirm({ open: false, id: null });
    setBudgets(getBudgetsByTripId(tripId));
    onRefresh?.();
  };

  return (
    <div className="budget">
      <div className="budget-summary">
        <div className="summary-item">
          <span className="summary-label">总预算</span>
          <span className="summary-value">¥{fmt(totalBudget)}</span>
        </div>
        <div className="summary-item">
          <span className="summary-label">已花费</span>
          <span className="summary-value spent">¥{fmt(totalSpent)}</span>
        </div>
        <div className="summary-item">
          <span className="summary-label">剩余</span>
          <span className={`summary-value ${overspent ? 'overspent' : ''}`}>¥{fmt(remaining)}</span>
        </div>
      </div>

      {budgets.length === 0 ? (
        <div className="budget-empty">
          <EmptyIcon name="wallet" size={64} />
          <p>还没有预算规划</p>
        </div>
      ) : (
        <div className="budget-list">
          {budgets.map(budget => {
            const pct = budget.budget > 0 ? (budget.spent / budget.budget) * 100 : 0;
            const isOver = budget.spent > budget.budget;
            return (
              <div key={budget.id} className="budget-item">
                <div className="budget-item-header">
                  <span className="budget-category">{budget.category}</span>
                  <button className="budget-delete" onClick={() => handleDelete(budget.id)}>×</button>
                </div>
                <div className="budget-item-row">
                  <span>预算: ¥{fmt(budget.budget)}</span>
                  <span>已花: ¥{fmt(budget.spent)}</span>
                </div>
                <div className="budget-progress-bg">
                  <div className={`budget-progress-fill ${isOver ? 'over' : ''}`} style={{ width: `${Math.min(pct, 100)}%` }}></div>
                </div>
                {showExpenseInput === budget.id ? (
                  <div className="inline-expense-form">
                    <input
                      type="number"
                      inputMode="decimal"
                      value={expenseAmount}
                      onChange={e => setExpenseAmount(e.target.value)}
                      placeholder="金额"
                      step="0.01"
                      min="0"
                      autoFocus
                    />
                    <button onClick={() => handleAddExpense(budget.id)} className="inline-expense-confirm">确认</button>
                    <button onClick={() => { setShowExpenseInput(null); setExpenseAmount(''); }} className="inline-expense-cancel">取消</button>
                  </div>
                ) : (
                  <button className="add-expense-btn" onClick={() => { setShowExpenseInput(budget.id); setExpenseAmount(''); }}>+ 记一笔</button>
                )}
              </div>
            );
          })}
        </div>
      )}

      <Modal
        isOpen={modalOpen}
        title="添加预算分类"
        onClose={handleCloseModal}
      >
        <form onSubmit={handleModalSubmit} className="modal-form">
          <div className="form-group">
            <select
              value={newCategory}
              onChange={e => setNewCategory(e.target.value)}
              className="modal-select"
              required
            >
              <option value="">选择分类</option>
              {DEFAULT_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </div>
          <div className="form-group">
            <input
              type="number"
              inputMode="decimal"
              value={newBudget}
              onChange={e => setNewBudget(e.target.value)}
              placeholder="预算金额"
              step="0.01"
              min="0"
              required
              className="modal-input"
            />
          </div>
          <button type="submit" className="modal-submit-btn">添加</button>
        </form>
      </Modal>

      <button className="add-item-btn" onClick={handleOpenModal}>+ 添加预算</button>

      <ConfirmDialog
        isOpen={confirm.open}
        title="删除预算"
        message="确定删除这个预算分类吗？相关支出记录也会被删除。"
        onConfirm={confirmDelete}
        onCancel={() => setConfirm({ open: false, id: null })}
      />
    </div>
  );
}
