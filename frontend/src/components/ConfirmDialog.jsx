import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';

/**
 * Usage:
 * <ConfirmDialog
 *   open={!!confirmState}
 *   title="Delete score?"
 *   message="This action cannot be undone."
 *   confirmLabel="Delete"
 *   variant="danger"        // "danger" | "warning" | "default"
 *   onConfirm={handleConfirm}
 *   onCancel={() => setConfirmState(null)}
 * />
 */
export default function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'danger',
  onConfirm,
  onCancel,
}) {
  const confirmClass =
    variant === 'danger'
      ? 'bg-red-600 hover:bg-red-500 text-white'
      : variant === 'warning'
      ? 'btn-gold'
      : 'btn-primary';

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={onCancel}
          />

          {/* Dialog */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.15 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-sm px-4"
          >
            <div className="bg-dark-800 border border-dark-600 rounded-2xl p-6 shadow-2xl">
              <div className="flex items-start gap-4 mb-5">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  variant === 'danger' ? 'bg-red-900/40' : 'bg-gold-500/10'
                }`}>
                  <AlertTriangle size={18} className={variant === 'danger' ? 'text-red-400' : 'text-gold-400'} />
                </div>
                <div>
                  <h3 className="text-white font-semibold font-display">{title}</h3>
                  {message && <p className="text-gray-400 text-sm mt-1">{message}</p>}
                </div>
              </div>

              <div className="flex gap-3 justify-end">
                <button
                  onClick={onCancel}
                  className="btn-secondary text-sm py-2 px-4"
                >
                  {cancelLabel}
                </button>
                <button
                  onClick={onConfirm}
                  className={`text-sm py-2 px-4 rounded-xl font-semibold transition-all active:scale-95 ${confirmClass}`}
                >
                  {confirmLabel}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
