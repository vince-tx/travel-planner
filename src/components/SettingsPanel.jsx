import { useTheme } from '../context/ThemeContext';
import { Sun, Moon, Monitor, X } from 'lucide-react';
import './SettingsPanel.css';

const themeIcons = {
  light: Sun,
  dark: Moon,
  system: Monitor
};

const themes = [
  { value: 'light', label: '浅色' },
  { value: 'dark', label: '深色' },
  { value: 'system', label: '跟随系统' },
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
          <button className="settings-panel-close" onClick={onClose}><X size={18} /></button>
        </div>
        <div className="settings-section">
          <div className="settings-section-title">外观</div>
          <div className="theme-options">
            {themes.map(t => {
              const Icon = themeIcons[t.value];
              return (
                <button
                  key={t.value}
                  className={`theme-option ${theme === t.value ? 'active' : ''}`}
                  onClick={() => setTheme(t.value)}
                >
                  <span className="theme-option-icon"><Icon size={18} /></span>
                  <span className="theme-option-label">{t.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}
