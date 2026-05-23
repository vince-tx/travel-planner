import { useState, useEffect } from 'react';
import { getItinerariesByTripId, createItinerary, updateItinerary, deleteItinerary } from '../db/itineraries';
import ConfirmDialog from './ConfirmDialog';
import Modal from './Modal';
import LocationPicker from './LocationPicker';
import './ItineraryList.css';

export default function ItineraryList({ tripId, onRefresh }) {
  const [items, setItems] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ date: '', time: '', title: '', location: '', notes: '', coords: null });
  const [confirm, setConfirm] = useState({ open: false, id: null });
  const [modalAddOpen, setModalAddOpen] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [editingData, setEditingData] = useState({});
  const [showLocationPicker, setShowLocationPicker] = useState(false);

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
    setEditingData({ ...item });
    setShowLocationPicker(false);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingData({});
    setShowLocationPicker(false);
  };

  const handleSaveEdit = () => {
    if (!editingData.title) return;
    updateItinerary(editingId, { ...editingData, tripId });
    setEditingId(null);
    setEditingData({});
    setShowLocationPicker(false);
    setItems(getItinerariesByTripId(tripId));
    onRefresh?.();
  };

  const handleEditingChange = (field, value) => {
    setEditingData({ ...editingData, [field]: value });
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

  const getDefaultDateTime = () => {
    const now = new Date();
    const date = now.toISOString().split('T')[0];
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const time = `${hours}:${minutes}`;
    return { date, time };
  };

  const handleOpenAddModal = () => {
    const { date, time } = getDefaultDateTime();
    setFormData({ date, time, title: '', location: '', notes: '', coords: null });
    setShowAdvanced(false);
    setShowLocationPicker(false);
    setModalAddOpen(true);
  };

  const handleCloseAddModal = () => {
    setModalAddOpen(false);
    setFormData({ date: '', time: '', title: '', location: '', notes: '', coords: null });
    setShowAdvanced(false);
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
                <div key={item.id} className={`itinerary-item ${editingId === item.id ? 'editing' : ''}`}>
                  {editingId === item.id ? (
                    <>
                      <div className="itinerary-edit-row">
                        <input
                          type="date"
                          value={editingData.date || ''}
                          onChange={e => handleEditingChange('date', e.target.value)}
                          className="itinerary-edit-date"
                        />
                        <input
                          type="time"
                          value={editingData.time || ''}
                          onChange={e => handleEditingChange('time', e.target.value)}
                          className="itinerary-edit-time"
                        />
                      </div>
                      <div className="itinerary-edit-content">
                        <input
                          type="text"
                          value={editingData.title || ''}
                          onChange={e => handleEditingChange('title', e.target.value)}
                          className="itinerary-edit-title"
                          placeholder="行程标题"
                          required
                        />
                        <div className="location-input-group">
                          <input
                            type="text"
                            value={editingData.location || ''}
                            onChange={e => handleEditingChange('location', e.target.value)}
                            className="itinerary-edit-location"
                            placeholder="地点（选填）"
                          />
                          <button
                            type="button"
                            className="map-picker-btn"
                            onClick={() => setShowLocationPicker(!showLocationPicker)}
                            title="地图选点"
                          >
                            📍
                          </button>
                        </div>
                        
                        {showLocationPicker && (
                          <LocationPicker
                            value={editingData.coords}
                            onChange={(coords, address) => {
                              setEditingData({
                                ...editingData,
                                coords,
                                location: address || editingData.location
                              });
                            }}
                            placeholder="点击地图选择位置"
                          />
                        )}
                        
                        <textarea
                          value={editingData.notes || ''}
                          onChange={e => handleEditingChange('notes', e.target.value)}
                          className="itinerary-edit-notes"
                          placeholder="备注（选填）"
                          rows={2}
                        />
                      </div>
                      <div className="itinerary-edit-actions">
                        <button type="button" className="itinerary-save" onClick={handleSaveEdit}>✓</button>
                        <button type="button" className="itinerary-cancel" onClick={handleCancelEdit}>×</button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="itinerary-time">{item.time || '--:--'}</div>
                      <div className="itinerary-dot">📍</div>
                      <div className="itinerary-content" onClick={() => handleEdit(item)}>
                        <div className="itinerary-title">{item.title}</div>
                        {item.location && <div className="itinerary-location">{item.location}</div>}
                        {item.notes && <div className="itinerary-notes">{item.notes}</div>}
                      </div>
                      <button className="itinerary-delete" onClick={() => handleDelete(item.id)}>×</button>
                    </>
                  )}
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
              <label>日期</label>
              <input
                type="date"
                value={formData.date}
                onChange={e => setFormData({...formData, date: e.target.value})}
                required
              />
            </div>
            <div className="form-group">
              <label>时间</label>
              <input
                type="time"
                value={formData.time}
                onChange={e => setFormData({...formData, time: e.target.value})}
              />
            </div>
          </div>
          <div className="form-group">
            <label>行程标题</label>
            <input
              type="text"
              value={formData.title}
              onChange={e => setFormData({...formData, title: e.target.value})}
              placeholder="例如：参观故宫"
              required
            />
          </div>
          
          {!showAdvanced ? (
            <button 
              type="button" 
              className="show-advanced-btn"
              onClick={() => setShowAdvanced(true)}
            >
              + 添加地点、地图和备注
            </button>
          ) : (
            <div className="advanced-fields">
              <div className="form-group">
                <label>地点（选填）</label>
                <div className="location-input-group">
                  <input
                    type="text"
                    value={formData.location}
                    onChange={e => setFormData({...formData, location: e.target.value})}
                    placeholder="详细地址"
                  />
                  <button
                    type="button"
                    className="map-picker-btn"
                    onClick={() => setShowLocationPicker(!showLocationPicker)}
                    title="地图选点"
                  >
                    📍
                  </button>
                </div>
              </div>
              
              {showLocationPicker && (
                <LocationPicker
                  value={formData.coords}
                  onChange={(coords, address) => {
                    setFormData({
                      ...formData,
                      coords,
                      location: address || formData.location
                    });
                  }}
                  placeholder="点击地图选择位置"
                />
              )}
              
              <div className="form-group">
                <label>备注（选填）</label>
                <textarea
                  value={formData.notes}
                  onChange={e => setFormData({...formData, notes: e.target.value})}
                  placeholder="补充说明"
                  rows={3}
                />
              </div>
              <button 
                type="button" 
                className="hide-advanced-btn"
                onClick={() => setShowAdvanced(false)}
              >
                收起
              </button>
            </div>
          )}
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
