import { Calendar, ListChecks, Wallet } from 'lucide-react';
import './TabBar.css';

const icons = {
  itinerary: Calendar,
  checklist: ListChecks,
  budget: Wallet
};

export default function TabBar({ activeTab, onTabChange }) {
  const tabs = [
    { id: 'itinerary', label: '行程' },
    { id: 'checklist', label: '清单' },
    { id: 'budget', label: '预算' }
  ];

  return (
    <div className="tab-bar">
      {tabs.map(tab => {
        const Icon = icons[tab.id];
        return (
          <button
            key={tab.id}
            className={`tab-item ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => onTabChange(tab.id)}
          >
            <span className="tab-icon"><Icon size={18} /></span>
            <span className="tab-label">{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}
