import { useState, useEffect, forwardRef, useImperativeHandle, useRef } from 'react';
import { getItinerariesByTripId, createItinerary, updateItinerary, deleteItinerary } from '../db/itineraries';
import Modal from './Modal';
import ConfirmDialog from './ConfirmDialog';
import './ItineraryList.css';

const hasFormData = (d, editingId) => editingId ? (d.title || d.location || d.notes) : (d.date || d.time || d.title || d.location || d.notes);

const ItineraryList = forwardRef(function ItineraryList({ tripId, onRefresh }, ref) {
  const [items, setItems] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ date: '', time: '', title: '', location: '', notes: '' });
  const [confirm, setConfirm] = useState({ open: false, id: null });
  const [discardConfirm, setDiscardConfirm] = useState(false);
  const dirtyRef = useRef(false);

  useImperativeHandle(ref, () => ({
    openAddModal: openNewModal
  }));

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
    if (editingId) {
      updateItinerary(editingId, { ...formData, tripId });
    } else {
      createItinerary({ ...formData, tripId });
    }
    setShowModal(false);
    setEditingId(null);
    setFormData({ date: '', time: '', title: '', location: '', notes: '' });
    dirtyRef.current = false;
    setItems(getItinerariesByTripId(tripId));
    onRefresh?.();
  };

  const handleEdit = (item) => {
    setEditingId(item.id);
    setFormData({ date: item.date, time: item.time, title: item.title, location: item.location, notes: item.notes });
    dirtyRef.current = false;
    setShowModal(true);
  };

  const handleDelete = (id) => {
    setConfirm({ open: true, id });
  };

  const confirmDelete = () => {
    deleteItinerary(confirm.id);
    setConfirm({ open: false, id: null });
    setItems(getItinerariesByTripId(tripId));
    onRefresh?.();
  };

  const openNewModal = () => {
    setEditingId(null);
    setFormData({ date: '', time: '', title: '', location: '', notes: '' });
    dirtyRef.current = false;
    setShowModal(true);
  };

  const handleCloseModal = () => {
    if (dirtyRef.current && hasFormData(formData, editingId)) {
      setDiscardConfirm(true);
    } else {
      setShowModal(false);
    }
  };

  const discardForm = () => {
    setDiscardConfirm(false);
    dirtyRef.current = false;
    setFormData({ date: '', time: '', title: '', location: '', notes: '' });
    setEditingId(null);
    setShowModal(false);
  };

  const markDirty = (updater) => {
    dirtyRef.current = true;
    return updater;
  };

  return (
    <div className="itinerary-list">
      {items.length === 0 ? (
        <div className="itinerary-empty">
          <div className="empty-icon">📅</div>
          <p>还没有行程安排</p>
          <button onClick={openNewModal}>添加第一个行程</button>
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

      <Modal isOpen={showModal} title={editingId ? '编辑行程' : '添加行程'} onClose={handleCloseModal}>
        <form onSubmit={handleSubmit} className="itinerary-form">
          <div className="form-row">
            <div className="form-group">
              <label>日期</label>
              <input type="date" value={formData.date} onChange={e => setFormData(markDirty({...formData, date: e.target.value}))} required />
            </div>
            <div className="form-group">
              <label>时间</label>
              <input type="time" value={formData.time} onChange={e => setFormData(markDirty({...formData, time: e.target.value}))} />
            </div>
          </div>
          <div className="form-group">
            <label>标题</label>
            <input type="text" value={formData.title} onChange={e => setFormData(markDirty({...formData, title: e.target.value}))} placeholder="如：游览浅草寺" required />
          </div>
          <div className="form-group">
            <label>地点</label>
            <input type="text" value={formData.location} onChange={e => setFormData(markDirty({...formData, location: e.target.value}))} placeholder="如：东京都台东区" />
          </div>
          <div className="form-group">
            <label>备注</label>
            <textarea value={formData.notes} onChange={e => setFormData(markDirty({...formData, notes: e.target.value}))} placeholder="额外信息..." rows={3} />
          </div>
          <button type="submit" className="submit-btn">{editingId ? '保存' : '添加'}</button>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={confirm.open}
        title="删除行程"
        message="确定删除这个行程吗？"
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

export default ItineraryList;
