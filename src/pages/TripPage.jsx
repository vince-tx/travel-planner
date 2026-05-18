import { useState, useEffect } from 'react';
import { getTripById } from '../db/trips';
import ItineraryList from '../components/ItineraryList';
import Checklist from '../components/Checklist';
import Budget from '../components/Budget';
import Header from '../components/Header';
import TabBar from '../components/TabBar';
import FAB from '../components/FAB';
import './TripPage.css';

export default function TripPage({ tripId, onBack }) {
  const [trip, setTrip] = useState(null);
  const [activeTab, setActiveTab] = useState('itinerary');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (tripId) setTrip(getTripById(tripId));
  }, [tripId]);

  const handleRefresh = () => setRefreshKey(k => k + 1);

  const renderContent = () => {
    if (!tripId) return null;
    switch (activeTab) {
      case 'itinerary': return <ItineraryList key={`it-${refreshKey}`} tripId={tripId} onRefresh={handleRefresh} />;
      case 'checklist': return <Checklist key={`cl-${refreshKey}`} tripId={tripId} onRefresh={handleRefresh} />;
      case 'budget': return <Budget key={`bd-${refreshKey}`} tripId={tripId} onRefresh={handleRefresh} />;
      default: return null;
    }
  };

  if (!tripId) return null;

  return (
    <div className="trip-page">
      <Header tripName={trip?.name || '加载中...'} onMenuClick={() => setSidebarOpen(true)} />
      <TabBar activeTab={activeTab} onTabChange={setActiveTab} />
      <div className="trip-page-content">{renderContent()}</div>
      <FAB onAdd={(type) => { if (type !== activeTab) setActiveTab(type); }} />
    </div>
  );
}
