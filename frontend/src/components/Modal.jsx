import React, { useEffect } from 'react';
import { FiX } from 'react-icons/fi';

const Modal = ({ isOpen, onClose, title, subtitle, children, maxWidth = '560px' }) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        style={{ maxWidth }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="card-header">
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>{title}</h3>
            {subtitle && <p className="text-secondary" style={{ fontSize: '0.85rem', marginTop: 3 }}>{subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            className="btn-icon btn-ghost"
            style={{ borderRadius: '50%' }}
            aria-label="Close modal"
          >
            <FiX style={{ fontSize: '1.2rem' }} />
          </button>
        </div>

        <div className="card-body">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
