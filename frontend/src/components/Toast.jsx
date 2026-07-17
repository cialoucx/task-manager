import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export default function ToastStack({ toasts, onClose }) {
  return (
    <div className="toast-stack">
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.85, y: -10, transition: { duration: 0.15 } }}
            layout
            className="toast"
            role="alert"
          >
            {t.type === 'success' && <CheckCircle2 className="toast-icon-success" size={18} />}
            {t.type === 'danger' && <AlertCircle style={{ color: 'var(--priority-high)' }} size={18} />}
            {(t.type === 'info' || !t.type) && <Info className="toast-icon-info" size={18} />}
            
            <span style={{ flexGrow: 1, marginRight: '8px' }}>{t.message}</span>
            
            <button
              onClick={() => onClose(t.id)}
              className="modal-close-btn"
              style={{ display: 'flex', alignItems: 'center' }}
              aria-label="Close notification"
            >
              <X size={16} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
