import { useState, useEffect } from 'react';
import { getItinerariesByTripId, createItinerary, updateItinerary, deleteItinerary } from '../db/itineraries';
import Modal from './Modal';
import './ItineraryList.css';

export default function ItineraryList({ tripId, onRefresh }) {
  const [items, setItems] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ date: '', time: '', title: '', location: '', notes: '' });

  useEffect(() => { setItems(getItinerariesByTripId(tripId)); }, [tripId]);

  const groupedByDate = items.reduce((acc, item) => {
    const date = item.date || '未指定';
    if (!acc[date]) acc[date] = [];
    acc[date].push(item);
    return acc;
  }, {});

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingId) {
      updateItinerary(editingId, { ...formData, tripId });
    } else {
      createItinerary({ ...formData, tripId });
    }
    setShowModal(false);
    setEditingId(null);
    setFormData({ date: '', time: '', title: '', location: '', notes: '' });
    setItems(getItinerariesByTripId(tripId));
    onRefresh?.();
  };

  const handleEdit = (item) => {
    setEditingId(item.id);
    setFormData({ date: item.date, time: item.time, title: item.title, location: item.location, notes: item.notes });
    setShowModal(true);
  };

  const handleDelete = (id) => {
    if (confirm('确定删除这个行程吗？')) {
      deleteItinerary(id);
      setItems(getItinerariesByTripId(tripId));
      onRefresh?.();
    }
  };

  const openNewModal = () => {
    setEditingId(null);
    setFormData({ date: '', time: '', title: '', location: '', notes: '' });
    setShowModal(true);
  };

  return (
    <div className="itinerary-list">
      {items.length === 0 ? (
        <div className="itinerary-empty">
          <p>还没有行程安排</p>
          <button onClick={openNewModal}>添加第一个行程</button>
        </div>
      ) : (
        Object.entries(groupedByDate).map(([date, dateItems]) => (
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
        ))
      )}

      <Modal isOpen={showModal} title={editingId ? '编辑行程' : '添加行程'} onClose={() => setShowModal(false)}>
        <form onSubmit={handleSubmit} className="itinerary-form">
          <div className="form-row">
            <div className="form-group">
              <label>日期</label>
              <input type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} required />
            </div>
            <div className="form-group">
              <label>时间</label>
              <input type="time" value={formData.time} onChange={e => setFormData({...formData, time: e.target.value})} />
            </div>
          </div>
          <div className="form-group">
            <label>标题</label>
            <input type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} placeholder="如：游览浅草寺" required />
          </div>
          <div className="form-group">
            <label>地点</label>
            <input type="text" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} placeholder="如：东京都台东区" />
          </div>
          <div className="form-group">
            <label>备注</label>
            <textarea value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} placeholder="额外信息..." rows={3} />
          </div>
          <button type="submit" className="submit-btn">{editingId ? '保存' : '添加'}</button>
        </form>
      </Modal>
    </div>
  );
}
