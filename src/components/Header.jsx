import './Header.css';

export default function Header({ tripName, onMenuClick }) {
  return (
    <header className="header">
      <button className="header-menu-btn" onClick={onMenuClick}>☰</button>
      <h1 className="header-title">{tripName || '选择旅行'}</h1>
      <button className="header-settings-btn">⚙️</button>
    </header>
  );
}
