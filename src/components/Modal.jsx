import { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import './Modal.css';

export default function Modal({ isOpen, title, onClose, children, actions }) {
  const [mounted, setMounted] = useState(false);
  const [animating, setAnimating] = useState(false);
  const overlayRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setMounted(true);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setAnimating(true);
        });
      });
    } else if (mounted) {
      setAnimating(false);
    }
  }, [isOpen]);

  const handleTransitionEnd = () => {
    if (!animating) {
      setMounted(false);
    }
  };

  if (!mounted) return null;

  return (
    <div
      ref={overlayRef}
      className={`modal-overlay ${animating ? 'open' : ''}`}
      onClick={onClose}
      onTransitionEnd={handleTransitionEnd}
    >
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{title}</h3>
          <div className="modal-header-actions">{actions}</div>
          <button className="modal-close" onClick={onClose}><X size={18} /></button>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
}
