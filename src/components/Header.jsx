import { useState } from 'react';
import { Settings } from 'lucide-react';
import SettingsPanel from './SettingsPanel';
import './Header.css';

export default function Header({ tripName, onMenuClick, onBack }) {
  const [settingsOpen, setSettingsOpen] = useState(false);

  return (
    <>
      <header className="header">
        <button className="header-menu-btn" onClick={onBack || onMenuClick}>
          {onBack ? '←' : '☰'}
        </button>
        <h1 className="header-title">{tripName || '选择旅行'}</h1>
        <button className="header-settings-btn" onClick={() => setSettingsOpen(true)}>
          <Settings size={18} />
        </button>
      </header>
      <SettingsPanel open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </>
  );
}
