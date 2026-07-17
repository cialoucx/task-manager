import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { useEffect, useRef } from 'react';

export default function ConfirmModal({ isOpen, title, message, onConfirm, onCancel }) {
  const cancelBtnRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      cancelBtnRef.current?.focus();
    }
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="modal-overlay" onClick={onCancel}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirm-modal-title"
          >
            <div className="modal-header">
              <h3 id="confirm-modal-title" className="modal-title">{title || 'Confirm Action'}</h3>
              <button onClick={onCancel} className="modal-close-btn" aria-label="Close modal">
                <X size={18} />
              </button>
            </div>
            <div className="modal-body">
              <p style={{ fontSize: '14.5px', color: 'var(--text)' }}>{message}</p>
            </div>
            <div className="modal-footer">
              <button ref={cancelBtnRef} onClick={onCancel} className="btn-secondary">
                Cancel
              </button>
              <button onClick={onConfirm} className="btn-danger">
                Confirm
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
