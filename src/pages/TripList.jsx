import { useState, useEffect, useRef } from 'react';
import { getAllTrips, createTrip, deleteTrip } from '../db/trips';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import SettingsPanel from '../components/SettingsPanel';
import AreaSelector from '../components/AreaSelector';
import { EmptyIcon } from '../components/Icons';
import './TripList.css';

const hasFormData = (data) => data.destination || data.startDate || data.endDate;

export default function TripList({ onSelectTrip }) {
  const [trips, setTrips] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ name: '', destination: '', startDate: '', endDate: '' });
  const [confirm, setConfirm] = useState({ open: false, id: null });
  const [discardConfirm, setDiscardConfirm] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const dirtyRef = useRef(false);

  const loadTrips = () => setTrips(getAllTrips());

  useEffect(() => { loadTrips(); }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    createTrip(formData);
    setFormData({ name: '', destination: '', startDate: '', endDate: '' });
    dirtyRef.current = false;
    setShowModal(false);
    loadTrips();
  };

  const handleDelete = (id, e) => {
    e.stopPropagation();
    setConfirm({ open: true, id });
  };

  const confirmDelete = () => {
    deleteTrip(confirm.id);
    setConfirm({ open: false, id: null });
    loadTrips();
  };

  const handleCloseModal = () => {
    if (dirtyRef.current && hasFormData(formData)) {
      setDiscardConfirm(true);
    } else {
      setShowModal(false);
    }
  };

  const discardForm = () => {
    setDiscardConfirm(false);
    dirtyRef.current = false;
    setFormData({ name: '', destination: '', startDate: '', endDate: '' });
    setShowModal(false);
  };

  const getDaysRemaining = (startDate) => {
    if (!startDate) return '';
    const start = new Date(startDate);
    const now = new Date();
    const diff = Math.ceil((start - now) / (1000 * 60 * 60 * 24));
    if (diff < 0) return '已结束';
    if (diff === 0) return '今天出发';
    return `${diff}天后出发`;
  };

  return (
    <div className="trip-list-page">
      <div className="trip-list-header">
        <div className="trip-list-header-row">
          <h1>我的旅行</h1>
          <button className="trip-list-settings-btn" onClick={() => setSettingsOpen(true)}>⚙</button>
        </div>
        <p>{trips.length} 趟旅行计划中</p>
      </div>

      <div className="trip-list">
        {trips.length === 0 ? (
          <div className="trip-list-empty">
            <EmptyIcon name="plane" size={64} />
            <p>还没有旅行计划</p>
            <p>点击下方按钮创建第一个旅行</p>
          </div>
        ) : (
          trips.map(trip => (
            <div key={trip.id} className="trip-card" onClick={() => onSelectTrip(trip.id)}>
              <div className="trip-card-header">
                <h3>{trip.name}</h3>
                <button className="trip-card-delete" onClick={(e) => handleDelete(trip.id, e)}>删除</button>
              </div>
              <div className="trip-card-destination">{trip.destination}</div>
              <div className="trip-card-dates">{trip.startDate} - {trip.endDate}</div>
              <div className="trip-card-days">{getDaysRemaining(trip.startDate)}</div>
            </div>
          ))
        )}
      </div>

      <button className="add-trip-btn" onClick={() => { 
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const formatDate = (date) => date.toISOString().split('T')[0];
        setFormData({ name: '', destination: '', startDate: formatDate(today), endDate: formatDate(tomorrow) }); 
        dirtyRef.current = false; 
        setShowModal(true); 
      }}>+ 创建旅行</button>

      <Modal isOpen={showModal} title="创建旅行" onClose={handleCloseModal}>
        <form onSubmit={handleSubmit} className="trip-form">
          <div className="form-group">
            <label>目的地</label>
            <AreaSelector 
              value={formData.destination} 
              onChange={(value) => { 
                const parts = value.split('/');
                const name = parts.length >= 2 ? `${parts[0]}-${parts[1]}` : (parts[0] || '');
                setFormData({...formData, destination: value, name}); 
                dirtyRef.current = true; 
              }} 
            />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>开始日期</label>
              <input type="date" value={formData.startDate} onChange={e => { setFormData({...formData, startDate: e.target.value}); dirtyRef.current = true; }} required />
            </div>
            <div className="form-group">
              <label>结束日期</label>
              <input type="date" value={formData.endDate} onChange={e => { setFormData({...formData, endDate: e.target.value}); dirtyRef.current = true; }} required />
            </div>
          </div>
          <button type="submit" className="submit-btn">创建</button>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={confirm.open}
        title="删除旅行"
        message="确定删除这个旅行计划吗？相关的行程、清单和预算数据也会被删除。"
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
      <SettingsPanel open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </div>
  );
}
