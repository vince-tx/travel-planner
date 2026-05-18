import { useTheme } from '../context/ThemeContext';
import './SettingsPanel.css';

const themes = [
  { value: 'light', label: '浅色', icon: '☀️' },
  { value: 'dark', label: '深色', icon: '🌙' },
  { value: 'system', label: '跟随系统', icon: '💻' },
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
                <span className="theme-option-icon">{t.icon}</span>
                <span className="theme-option-label">{t.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
