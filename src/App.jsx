import { useState, useEffect } from 'react';
import { initDatabase } from './db/database';
import { getAllTrips } from './db/trips';
import { ThemeProvider } from './context/ThemeContext';
import Sidebar from './components/Sidebar';
import TripList from './pages/TripList';
import TripPage from './pages/TripPage';
import './App.css';

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTripId, setSelectedTripId] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    async function init() {
      await initDatabase();
      setIsLoading(false);
    }
    init();
  }, []);

  const handleSelectTrip = (tripId) => {
    setSelectedTripId(tripId);
  };

  const handleBack = () => {
    setSelectedTripId(null);
  };

  if (isLoading) {
    return (
      <div className="app-loading">
        <div className="loading-spinner"></div>
        <p>加载中...</p>
      </div>
    );
  }

  return (
    <ThemeProvider>
    <div className="app">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onSelectTrip={handleSelectTrip}
        selectedTripId={selectedTripId}
      />
      <main className="main-content">
        {selectedTripId ? (
          <TripPage tripId={selectedTripId} onBack={handleBack} />
        ) : (
          <TripList onSelectTrip={handleSelectTrip} />
        )}
      </main>
    </div>
    </ThemeProvider>
  );
}
