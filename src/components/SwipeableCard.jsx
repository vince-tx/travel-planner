import { useState, useRef, useEffect } from 'react';
import { Trash2, Pencil } from 'lucide-react';
import './SwipeableCard.css';

export default function SwipeableCard({ children, onDelete, onEdit, onClick }) {
  const [offset, setOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const startXRef = useRef(0);
  const currentOffsetRef = useRef(0);
  const cardRef = useRef(null);

  const DELETE_THRESHOLD = 100;
  const MAX_OFFSET = 180;

  const handleTouchStart = (e) => {
    startXRef.current = e.touches[0].clientX;
    currentOffsetRef.current = offset;
    setIsDragging(true);
  };

  const handleTouchMove = (e) => {
    if (!isDragging) return;
    
    const currentX = e.touches[0].clientX;
    const diff = startXRef.current - currentX;
    const newOffset = Math.max(0, Math.min(MAX_OFFSET, currentOffsetRef.current + diff));
    setOffset(newOffset);
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    if (offset > DELETE_THRESHOLD) {
      setOffset(MAX_OFFSET);
    } else {
      setOffset(0);
    }
  };

  const handleMouseDown = (e) => {
    startXRef.current = e.clientX;
    currentOffsetRef.current = offset;
    setIsDragging(true);
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDragging) return;
      
      const currentX = e.clientX;
      const diff = startXRef.current - currentX;
      const newOffset = Math.max(0, Math.min(MAX_OFFSET, currentOffsetRef.current + diff));
      setOffset(newOffset);
    };

    const handleMouseUp = () => {
      if (!isDragging) return;
      setIsDragging(false);
      if (offset > DELETE_THRESHOLD) {
        setOffset(MAX_OFFSET);
      } else {
        setOffset(0);
      }
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, offset]);

  const handleCardClick = () => {
    if (offset > 0) {
      setOffset(0);
      return;
    }
    onClick && onClick();
  };

  const handleDeleteClick = (e) => {
    e.stopPropagation();
    onDelete && onDelete();
  };

  const handleEditClick = (e) => {
    e.stopPropagation();
    setOffset(0);
    onEdit && onEdit();
  };

  return (
    <div className="swipeable-card-container">
      <div className="swipeable-card-actions">
        {onEdit && (
          <div className="action-edit" onClick={handleEditClick}>
            <Pencil size={20} />
            <span>编辑</span>
          </div>
        )}
        {onDelete && (
          <div className="action-delete" onClick={handleDeleteClick}>
            <Trash2 size={20} />
            <span>删除</span>
          </div>
        )}
      </div>
      <div
        ref={cardRef}
        className="swipeable-card-content"
        style={{ transform: `translateX(-${offset}px)` }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onClick={handleCardClick}
      >
        {children}
      </div>
    </div>
  );
}
