import { useState, useEffect } from 'react';
import { getAllTrips } from '../db/trips';
import { AppIcon } from './Icons';
import './Sidebar.css';

export default function Sidebar({ isOpen, onClose, onSelectTrip, selectedTripId }) {
  const [trips, setTrips] = useState([]);

  useEffect(() => {
    setTrips(getAllTrips());
  }, [selectedTripId]);

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
    <>
      <div className={`sidebar-overlay ${isOpen ? 'open' : ''}`} onClick={onClose} />
      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <h2>我的旅行</h2>
        </div>
        <nav className="sidebar-nav">
          {trips.length === 0 ? (
            <div className="sidebar-empty">暂无旅行计划</div>
          ) : (
            trips.map(trip => (
              <div
                key={trip.id}
                className={`sidebar-item ${selectedTripId === trip.id ? 'active' : ''}`}
                onClick={() => { onSelectTrip(trip.id); onClose(); }}
              >
                <AppIcon name="plane" size={20} />
                <div className="sidebar-item-content">
                  <span className="sidebar-item-name">{trip.name}</span>
                  <span className="sidebar-item-days">{getDaysRemaining(trip.startDate)}</span>
                </div>
              </div>
            ))
          )}
        </nav>
      </aside>
    </>
  );
}
