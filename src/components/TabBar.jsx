import './TabBar.css';

export default function TabBar({ activeTab, onTabChange }) {
  const tabs = [
    { id: 'itinerary', label: '行程', icon: '📅' },
    { id: 'checklist', label: '清单', icon: '📋' },
    { id: 'budget', label: '预算', icon: '💰' }
  ];

  return (
    <div className="tab-bar">
      {tabs.map(tab => (
        <button
          key={tab.id}
          className={`tab-item ${activeTab === tab.id ? 'active' : ''}`}
          onClick={() => onTabChange(tab.id)}
        >
          <span className="tab-icon">{tab.icon}</span>
          <span className="tab-label">{tab.label}</span>
        </button>
      ))}
    </div>
  );
}
