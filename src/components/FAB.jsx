import { useState } from 'react';
import { AppIcon } from './Icons';
import './FAB.css';

export default function FAB({ onAdd }) {
  const [isOpen, setIsOpen] = useState(false);

  const handleClick = () => setIsOpen(!isOpen);
  const handleOptionClick = (type) => { setIsOpen(false); onAdd(type); };

  return (
    <div className={`fab-container ${isOpen ? 'open' : ''}`}>
      {isOpen && (
        <div className="fab-menu">
          <button className="fab-option" onClick={() => handleOptionClick('itinerary')}><AppIcon name="calendar" size={16} /> 添加行程</button>
          <button className="fab-option" onClick={() => handleOptionClick('checklist')}><AppIcon name="checklist" size={16} /> 添加物品</button>
          <button className="fab-option" onClick={() => handleOptionClick('budget')}><AppIcon name="wallet" size={16} /> 添加预算</button>
        </div>
      )}
      <button className="fab" onClick={handleClick}>{isOpen ? '×' : '+'}</button>
    </div>
  );
}
