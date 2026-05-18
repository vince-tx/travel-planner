import { useState, useEffect, forwardRef, useImperativeHandle, useRef } from 'react';
import { getBudgetsByTripId, createBudget, addExpense, deleteBudget } from '../db/budgets';
import Modal from './Modal';
import ConfirmDialog from './ConfirmDialog';
import './Budget.css';

const DEFAULT_CATEGORIES = ['交通', '住宿', '餐饮', '门票', '购物', '其他'];

const Budget = forwardRef(function Budget({ tripId, onRefresh }, ref) {
  const [budgets, setBudgets] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [selectedBudget, setSelectedBudget] = useState(null);
  const [formData, setFormData] = useState({ category: '', budget: '' });
  const [expenseAmount, setExpenseAmount] = useState('');
  const [confirm, setConfirm] = useState({ open: false, id: null });
  const [discardConfirm, setDiscardConfirm] = useState(false);
  const dirtyRef = useRef(false);

  useImperativeHandle(ref, () => ({
    openAddModal: () => { setFormData({ category: '', budget: '' }); dirtyRef.current = false; setShowModal(true); }
  }));

  useEffect(() => { setBudgets(getBudgetsByTripId(tripId)); }, [tripId]);

  const totalBudget = budgets.reduce((sum, b) => sum + (b.budget || 0), 0);
  const totalSpent = budgets.reduce((sum, b) => sum + (b.spent || 0), 0);
  const remaining = totalBudget - totalSpent;
  const fmt = (n) => n % 1 === 0 ? n.toString() : n.toFixed(2);

  const overspent = remaining < 0;

  const handleSubmit = (e) => {
    e.preventDefault();
    createBudget({ tripId, category: formData.category, budget: parseFloat(formData.budget) || 0, spent: 0 });
    setFormData({ category: '', budget: '' });
    dirtyRef.current = false;
    setShowModal(false);
    setBudgets(getBudgetsByTripId(tripId));
    onRefresh?.();
  };

  const handleAddExpense = () => {
    if (selectedBudget && expenseAmount) {
      addExpense(selectedBudget.id, parseFloat(expenseAmount));
      setExpenseAmount('');
      setShowExpenseModal(false);
      setSelectedBudget(null);
      setBudgets(getBudgetsByTripId(tripId));
      onRefresh?.();
    }
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

  const handleCloseBudgetModal = () => {
    if (dirtyRef.current && (formData.category || formData.budget)) {
      setDiscardConfirm(true);
    } else {
      setShowModal(false);
    }
  };

  const discardForm = () => {
    setDiscardConfirm(false);
    dirtyRef.current = false;
    setFormData({ category: '', budget: '' });
    setShowModal(false);
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
          <div className="empty-icon">💰</div>
          <p>还没有预算规划</p>
          <button onClick={() => { setFormData({ category: '', budget: '' }); dirtyRef.current = false; setShowModal(true); }}>添加预算分类</button>
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
                <button className="add-expense-btn" onClick={() => { setSelectedBudget(budget); setShowExpenseModal(true); }}>+ 记一笔</button>
              </div>
            );
          })}
        </div>
      )}

      <button className="add-budget-btn" onClick={() => { setFormData({ category: '', budget: '' }); dirtyRef.current = false; setShowModal(true); }}>+ 添加预算分类</button>

      <Modal isOpen={showModal} title="添加预算分类" onClose={handleCloseBudgetModal}>
        <form onSubmit={handleSubmit} className="budget-form">
          <div className="form-group">
            <label>分类</label>
            <select value={formData.category} onChange={e => { setFormData({...formData, category: e.target.value}); dirtyRef.current = true; }} required>
              <option value="">选择分类</option>
              {DEFAULT_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>预算金额</label>
            <input type="number" value={formData.budget} onChange={e => { setFormData({...formData, budget: e.target.value}); dirtyRef.current = true; }} placeholder="0.00" step="0.01" min="0" />
          </div>
          <button type="submit" className="submit-btn">添加</button>
        </form>
      </Modal>

      <Modal isOpen={showExpenseModal} title={`记一笔 - ${selectedBudget?.category}`} onClose={() => setShowExpenseModal(false)}>
        <form onSubmit={(e) => { e.preventDefault(); handleAddExpense(); }} className="expense-form">
          <div className="form-group">
            <label>金额</label>
            <input type="number" value={expenseAmount} onChange={e => setExpenseAmount(e.target.value)} placeholder="0.00" step="0.01" min="0" required autoFocus />
          </div>
          <button type="submit" className="submit-btn">确认</button>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={confirm.open}
        title="删除预算"
        message="确定删除这个预算分类吗？相关支出记录也会被删除。"
        onConfirm={confirmDelete}
        onCancel={() => setConfirm({ open: false, id: null })}
      />
      <ConfirmDialog
        isOpen={discardConfirm}
        title="放弃编辑"
        message="表单中有未保存的内容，确定要放弃吗？"
        onConfirm={discardForm}
        onCancel={() => setDiscardConfirm(false)}
      />
    </div>
  );
});

export default Budget;
