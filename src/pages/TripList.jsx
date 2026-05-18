import { useState, useEffect } from 'react';
import { getAllTrips, createTrip, deleteTrip } from '../db/trips';
import Modal from '../components/Modal';
import './TripList.css';

export default function TripList({ onSelectTrip }) {
  const [trips, setTrips] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ name: '', destination: '', startDate: '', endDate: '' });

  const loadTrips = () => setTrips(getAllTrips());

  useEffect(() => { loadTrips(); }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    createTrip(formData);
    setFormData({ name: '', destination: '', startDate: '', endDate: '' });
    setShowModal(false);
    loadTrips();
  };

  const handleDelete = (id, e) => {
    e.stopPropagation();
    if (confirm('确定删除这个旅行计划吗？')) {
      deleteTrip(id);
      loadTrips();
    }
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
        <h1>我的旅行</h1>
        <p>{trips.length} 趟旅行计划中</p>
      </div>

      <div className="trip-list">
        {trips.length === 0 ? (
          <div className="trip-list-empty">
            <p>还没有旅行计划</p>
            <p>点击下方按钮创建第一个旅行</p>
          </div>
        ) : (
          trips.map(trip => (
            <div key={trip.id} className="trip-card" onClick={() => onSelectTrip(trip.id)}>
              <div className="trip-card-header">
                <h3>{trip.name}</h3>
                <span className="trip-card-destination">{trip.destination}</span>
              </div>
              <div className="trip-card-dates">{trip.startDate} - {trip.endDate}</div>
              <div className="trip-card-days">{getDaysRemaining(trip.startDate)}</div>
              <button className="trip-card-delete" onClick={(e) => handleDelete(trip.id, e)}>删除</button>
            </div>
          ))
        )}
      </div>

      <button className="add-trip-btn" onClick={() => setShowModal(true)}>+ 创建旅行</button>

      <Modal isOpen={showModal} title="创建旅行" onClose={() => setShowModal(false)}>
        <form onSubmit={handleSubmit} className="trip-form">
          <div className="form-group">
            <label>旅行名称</label>
            <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="如：东京之旅" required />
          </div>
          <div className="form-group">
            <label>目的地</label>
            <input type="text" value={formData.destination} onChange={e => setFormData({...formData, destination: e.target.value})} placeholder="如：日本东京" />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>开始日期</label>
              <input type="date" value={formData.startDate} onChange={e => setFormData({...formData, startDate: e.target.value})} required />
            </div>
            <div className="form-group">
              <label>结束日期</label>
              <input type="date" value={formData.endDate} onChange={e => setFormData({...formData, endDate: e.target.value})} required />
            </div>
          </div>
          <button type="submit" className="submit-btn">创建</button>
        </form>
      </Modal>
    </div>
  );
}
