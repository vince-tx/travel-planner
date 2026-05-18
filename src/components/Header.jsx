import './Header.css';

export default function Header({ tripName, onMenuClick, onBack }) {
  return (
    <header className="header">
      <button className="header-menu-btn" onClick={onBack || onMenuClick}>
        {onBack ? '←' : '☰'}
      </button>
      <h1 className="header-title">{tripName || '选择旅行'}</h1>
      <div className="header-spacer" />
    </header>
  );
}
