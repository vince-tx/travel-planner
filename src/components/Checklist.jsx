import { useState, useEffect } from 'react';
import { ListChecks, X } from 'lucide-react';
import { getChecklistsByTripId, createChecklistItem, toggleChecklistItem, deleteChecklistItem } from '../db/checklists';
import ConfirmDialog from './ConfirmDialog';
import Modal from './Modal';
import './Checklist.css';

const DEFAULT_CATEGORIES = ['衣物', '证件', '洗漱', '电子设备', '药品', '其他'];

export default function Checklist({ tripId, onRefresh }) {
  const [items, setItems] = useState([]);
  const [category, setCategory] = useState('衣物');
  const [customCategory, setCustomCategory] = useState('');
  const [itemName, setItemName] = useState('');
  const [confirm, setConfirm] = useState({ open: false, id: null });
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => { setItems(getChecklistsByTripId(tripId)); }, [tripId]);

  const groupedByCategory = items.reduce((acc, item) => {
    const cat = item.category;
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(item);
    return acc;
  }, {});

  const totalItems = items.length;
  const checkedItems = items.filter(i => i.checked).length;
  const progress = totalItems > 0 ? Math.round((checkedItems / totalItems) * 100) : 0;

  const handleSubmit = (e) => {
    e.preventDefault();
    const finalCategory = category === 'custom' ? customCategory : category;
    if (!finalCategory || !itemName) return;
    createChecklistItem({ tripId, category: finalCategory, item: itemName, checked: false });
    setItemName('');
    if (category === 'custom') setCustomCategory('');
    setItems(getChecklistsByTripId(tripId));
    onRefresh?.();
  };

  const handleOpenModal = () => {
    setCategory('衣物');
    setCustomCategory('');
    setItemName('');
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setItemName('');
    setCustomCategory('');
  };

  const handleModalSubmit = (e) => {
    e.preventDefault();
    const finalCategory = category === 'custom' ? customCategory : category;
    if (!finalCategory || !itemName) return;
    createChecklistItem({ tripId, category: finalCategory, item: itemName, checked: false });
    setItemName('');
    if (category === 'custom') setCustomCategory('');
    setItems(getChecklistsByTripId(tripId));
    onRefresh?.();
    handleCloseModal();
  };

  const handleToggle = (id, checked) => {
    toggleChecklistItem(id, !checked);
    setItems(getChecklistsByTripId(tripId));
    onRefresh?.();
  };

  const handleDelete = (id) => {
    setConfirm({ open: true, id });
  };

  const confirmDelete = () => {
    deleteChecklistItem(confirm.id);
    setConfirm({ open: false, id: null });
    setItems(getChecklistsByTripId(tripId));
    onRefresh?.();
  };

  return (
    <div className="checklist">
      <div className="checklist-progress">
        <div className="progress-info">
          <span>打包进度</span>
          <span>{checkedItems}/{totalItems}</span>
        </div>
        <div className="progress-bar-bg">
          <div className="progress-bar-fill" style={{ width: `${progress}%` }}></div>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="checklist-empty">
          <div className="empty-icon"><ListChecks size={32} /></div>
          <p>还没有清单</p>
        </div>
      ) : (
        Object.entries(groupedByCategory).map(([cat, catItems]) => (
          <div key={cat} className="checklist-category">
            <div className="category-header">
              <span className="category-name">{cat}</span>
              <span className="category-count">{catItems.filter(i => i.checked).length}/{catItems.length}</span>
            </div>
            <div className="category-items">
              {catItems.map(item => (
                <div key={item.id} className={`checklist-item ${item.checked ? 'checked' : ''}`}>
                  <label className="checkbox-container">
                    <input type="checkbox" checked={item.checked} onChange={() => handleToggle(item.id, item.checked)} />
                    <span className="checkmark"></span>
                  </label>
                  <span className="item-name">{item.item}</span>
                  <button className="item-delete" onClick={() => handleDelete(item.id)}><X size={14} /></button>
                </div>
              ))}
            </div>
          </div>
        ))
      )}

      <Modal
        isOpen={modalOpen}
        title="添加物品"
        onClose={handleCloseModal}
      >
        <form onSubmit={handleModalSubmit} className="modal-form">
          <div className="form-group">
            <select
              value={category}
              onChange={e => setCategory(e.target.value)}
              className="modal-select"
            >
              {DEFAULT_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              <option value="custom">自定义</option>
            </select>
          </div>
          {category === 'custom' && (
            <div className="form-group">
              <input
                type="text"
                value={customCategory}
                onChange={e => setCustomCategory(e.target.value)}
                placeholder="自定义分类名称"
                required
                className="modal-input"
              />
            </div>
          )}
          <div className="form-group">
            <input
              type="text"
              value={itemName}
              onChange={e => setItemName(e.target.value)}
              placeholder="物品名称"
              required
              className="modal-input"
            />
          </div>
          <button type="submit" className="modal-submit-btn">添加</button>
        </form>
      </Modal>

      <button className="add-item-btn" onClick={handleOpenModal}>+ 添加物品</button>

      <ConfirmDialog
        isOpen={confirm.open}
        title="删除物品"
        message="确定删除这个物品吗？"
        onConfirm={confirmDelete}
        onCancel={() => setConfirm({ open: false, id: null })}
      />
    </div>
  );
}
