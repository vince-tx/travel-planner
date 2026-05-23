import { AppIcon } from './Icons';
import './TabBar.css';

export default function TabBar({ activeTab, onTabChange }) {
  const tabs = [
    { id: 'itinerary', label: '行程', icon: 'calendar' },
    { id: 'checklist', label: '清单', icon: 'checklist' },
    { id: 'budget', label: '预算', icon: 'wallet' }
  ];

  return (
    <div className="tab-bar">
      {tabs.map(tab => (
        <button
          key={tab.id}
          className={`tab-item ${activeTab === tab.id ? 'active' : ''}`}
          onClick={() => onTabChange(tab.id)}
        >
          <AppIcon name={tab.icon} size={18} />
          <span className="tab-label">{tab.label}</span>
        </button>
      ))}
    </div>
  );
}
