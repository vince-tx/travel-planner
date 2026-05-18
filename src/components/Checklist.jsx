import { useState, useEffect } from 'react';
import { getChecklistsByTripId, createChecklistItem, toggleChecklistItem, deleteChecklistItem } from '../db/checklists';
import Modal from './Modal';
import './Checklist.css';

const DEFAULT_CATEGORIES = ['衣物', '证件', '洗漱', '电子设备', '药品', '其他'];

export default function Checklist({ tripId, onRefresh }) {
  const [items, setItems] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [category, setCategory] = useState('');
  const [customCategory, setCustomCategory] = useState('');
  const [itemName, setItemName] = useState('');

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
    setCategory(''); setCustomCategory(''); setItemName('');
    setShowModal(false);
    setItems(getChecklistsByTripId(tripId));
    onRefresh?.();
  };

  const handleToggle = (id, checked) => {
    toggleChecklistItem(id, !checked);
    setItems(getChecklistsByTripId(tripId));
    onRefresh?.();
  };

  const handleDelete = (id) => {
    deleteChecklistItem(id);
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
          <p>还没有清单</p>
          <button onClick={() => setShowModal(true)}>添加物品</button>
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
                  <button className="item-delete" onClick={() => handleDelete(item.id)}>×</button>
                </div>
              ))}
            </div>
          </div>
        ))
      )}

      <Modal isOpen={showModal} title="添加物品" onClose={() => setShowModal(false)}>
        <form onSubmit={handleSubmit} className="checklist-form">
          <div className="form-group">
            <label>分类</label>
            <select value={category} onChange={e => setCategory(e.target.value)} required>
              <option value="">选择分类</option>
              {DEFAULT_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              <option value="custom">+ 自定义分类</option>
            </select>
          </div>
          {category === 'custom' && (
            <div className="form-group">
              <label>自定义分类名称</label>
              <input type="text" value={customCategory} onChange={e => setCustomCategory(e.target.value)} placeholder="如：户外装备" required />
            </div>
          )}
          <div className="form-group">
            <label>物品名称</label>
            <input type="text" value={itemName} onChange={e => setItemName(e.target.value)} placeholder="如：护照" required />
          </div>
          <button type="submit" className="submit-btn">添加</button>
        </form>
      </Modal>
    </div>
  );
}
