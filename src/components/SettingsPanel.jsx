import { useTheme } from '../context/ThemeContext';
import { AppIcon } from './Icons';
import './SettingsPanel.css';

const themes = [
  { value: 'light', label: '浅色', icon: 'sun' },
  { value: 'dark', label: '深色', icon: 'moon' },
  { value: 'system', label: '跟随系统', icon: 'monitor' },
];

export default function SettingsPanel({ open, onClose }) {
  const { theme, setTheme } = useTheme();

  if (!open) return null;

  return (
    <>
      <div className="settings-backdrop" onClick={onClose} />
      <div className="settings-panel">
        <div className="settings-panel-header">
          <h3>设置</h3>
          <button className="settings-panel-close" onClick={onClose}>✕</button>
        </div>
        <div className="settings-section">
          <div className="settings-section-title">外观</div>
          <div className="theme-options">
            {themes.map(t => (
              <button
                key={t.value}
                className={`theme-option ${theme === t.value ? 'active' : ''}`}
                onClick={() => setTheme(t.value)}
              >
                <AppIcon name={t.icon} size={20} />
                <span className="theme-option-label">{t.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
