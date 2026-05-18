import { useState, useEffect } from 'react';
import { getItinerariesByTripId, createItinerary, updateItinerary, deleteItinerary } from '../db/itineraries';
import ConfirmDialog from './ConfirmDialog';
import Modal from './Modal';
import './ItineraryList.css';

export default function ItineraryList({ tripId, onRefresh }) {
  const [items, setItems] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ date: '', time: '', title: '', location: '', notes: '' });
  const [confirm, setConfirm] = useState({ open: false, id: null });
  const [modalAddOpen, setModalAddOpen] = useState(false);

  useEffect(() => { setItems(getItinerariesByTripId(tripId)); }, [tripId]);

  const groupedByDate = items.reduce((acc, item) => {
    const date = item.date || '未指定';
    if (!acc[date]) acc[date] = [];
    acc[date].push(item);
    return acc;
  }, {});

  const sortedDates = Object.keys(groupedByDate).sort((a, b) => {
    if (a === '未指定') return 1;
    if (b === '未指定') return -1;
    return a.localeCompare(b);
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title) return;
    if (editingId) {
      updateItinerary(editingId, { ...formData, tripId });
      setEditingId(null);
    } else {
      createItinerary({ ...formData, tripId });
    }
    setFormData({ date: '', time: '', title: '', location: '', notes: '' });
    setItems(getItinerariesByTripId(tripId));
    onRefresh?.();
  };

  const handleEdit = (item) => {
    setEditingId(item.id);
    setFormData({ date: item.date, time: item.time, title: item.title, location: item.location, notes: item.notes });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setFormData({ date: '', time: '', title: '', location: '', notes: '' });
  };

  const handleDelete = (id) => {
    setConfirm({ open: true, id });
  };

  const confirmDelete = () => {
    deleteItinerary(confirm.id);
    setConfirm({ open: false, id: null });
    if (editingId === confirm.id) {
      setEditingId(null);
      setFormData({ date: '', time: '', title: '', location: '', notes: '' });
    }
    setItems(getItinerariesByTripId(tripId));
    onRefresh?.();
  };

  const handleOpenAddModal = () => {
    setFormData({ date: '', time: '', title: '', location: '', notes: '' });
    setModalAddOpen(true);
  };

  const handleCloseAddModal = () => {
    setModalAddOpen(false);
    setFormData({ date: '', time: '', title: '', location: '', notes: '' });
  };

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!formData.title) return;
    createItinerary({ ...formData, tripId });
    setItems(getItinerariesByTripId(tripId));
    onRefresh?.();
    handleCloseAddModal();
  };

  return (
    <div className="itinerary-list">
      {items.length === 0 && !editingId ? (
        <div className="itinerary-empty">
          <div className="empty-icon">📅</div>
          <p>还没有行程安排</p>
        </div>
      ) : (
        sortedDates.map(date => {
          const dateItems = groupedByDate[date].sort((a, b) => (a.time || '').localeCompare(b.time || ''));
          return (
          <div key={date} className="itinerary-date-group">
            <div className="itinerary-date-header">{date}</div>
            <div className="itinerary-timeline">
              {dateItems.map(item => (
                <div key={item.id} className="itinerary-item">
                  <div className="itinerary-time">{item.time || '--:--'}</div>
                  <div className="itinerary-dot">📍</div>
                  <div className="itinerary-content" onClick={() => handleEdit(item)}>
                    <div className="itinerary-title">{item.title}</div>
                    {item.location && <div className="itinerary-location">{item.location}</div>}
                    {item.notes && <div className="itinerary-notes">{item.notes}</div>}
                  </div>
                  <button className="itinerary-delete" onClick={() => handleDelete(item.id)}>×</button>
                </div>
              ))}
            </div>
          </div>
        )})
      )}

      <Modal
        isOpen={modalAddOpen}
        title="添加行程"
        onClose={handleCloseAddModal}
      >
        <form onSubmit={handleAddSubmit} className="modal-form">
          <div className="form-row">
            <div className="form-group">
              <input
                type="date"
                value={formData.date}
                onChange={e => setFormData({...formData, date: e.target.value})}
              />
            </div>
            <div className="form-group">
              <input
                type="time"
                value={formData.time}
                onChange={e => setFormData({...formData, time: e.target.value})}
              />
            </div>
          </div>
          <div className="form-group">
            <input
              type="text"
              value={formData.title}
              onChange={e => setFormData({...formData, title: e.target.value})}
              placeholder="行程标题"
              required
            />
          </div>
          <div className="form-group">
            <input
              type="text"
              value={formData.location}
              onChange={e => setFormData({...formData, location: e.target.value})}
              placeholder="地点（选填）"
            />
          </div>
          <div className="form-group">
            <textarea
              value={formData.notes}
              onChange={e => setFormData({...formData, notes: e.target.value})}
              placeholder="备注（选填）"
              rows={3}
            />
          </div>
          <button type="submit" className="modal-submit-btn">添加</button>
        </form>
      </Modal>

      <button className="add-item-btn" onClick={handleOpenAddModal}>+ 添加行程</button>

      <ConfirmDialog
        isOpen={confirm.open}
        title="删除行程"
        message="确定删除这个行程吗？"
        onConfirm={confirmDelete}
        onCancel={() => setConfirm({ open: false, id: null })}
      />
    </div>
  );
}
