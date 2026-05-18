import { useState, useEffect, useRef } from 'react';
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
  const [addTrigger, setAddTrigger] = useState(0);
  const itineraryRef = useRef(null);
  const checklistRef = useRef(null);
  const budgetRef = useRef(null);

  useEffect(() => {
    if (tripId) setTrip(getTripById(tripId));
  }, [tripId]);

  const handleRefresh = () => setRefreshKey(k => k + 1);

  const handleFABAdd = (type) => {
    setActiveTab(type);
    setAddTrigger(t => t + 1);
  };

  useEffect(() => {
    if (addTrigger === 0) return;
    const ref = { itinerary: itineraryRef, checklist: checklistRef, budget: budgetRef }[activeTab];
    ref?.current?.openAddModal?.();
  }, [addTrigger, activeTab]);

  const renderContent = () => {
    if (!tripId) return null;
    switch (activeTab) {
      case 'itinerary': return <ItineraryList ref={itineraryRef} key={`it-${refreshKey}`} tripId={tripId} onRefresh={handleRefresh} />;
      case 'checklist': return <Checklist ref={checklistRef} key={`cl-${refreshKey}`} tripId={tripId} onRefresh={handleRefresh} />;
      case 'budget': return <Budget ref={budgetRef} key={`bd-${refreshKey}`} tripId={tripId} onRefresh={handleRefresh} />;
      default: return null;
    }
  };

  if (!tripId) return null;

  return (
    <div className="trip-page">
      <Header tripName={trip?.name || '加载中...'} onMenuClick={() => setSidebarOpen(true)} onBack={onBack} />
      <TabBar activeTab={activeTab} onTabChange={setActiveTab} />
      <div className="trip-page-content">{renderContent()}</div>
      <FAB onAdd={handleFABAdd} />
    </div>
  );
}
