import React, { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { XIcon } from 'lucide-react';

export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  width = 'max-w-lg'








}: {open: boolean;onClose: () => void;title: string;description?: string;children: React.ReactNode;footer?: React.ReactNode;width?: string;}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (open) window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open &&
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
          className="absolute inset-0 bg-slate-900/40"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
          onClick={onClose} />
        
          <motion.div
          role="dialog"
          aria-modal="true"
          aria-label={title}
          className={`relative w-full ${width} overflow-hidden rounded-2xl bg-white shadow-pop`}
          initial={{ opacity: 0, scale: 0.96, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.98, y: 4 }}
          transition={{ duration: 0.22, ease: [0.23, 1, 0.32, 1] }}>
          
            <header className="flex items-start justify-between gap-4 border-b border-line px-5 py-4">
              <div>
                <h2 className="text-[15px] font-semibold text-ink">{title}</h2>
                {description &&
              <p className="mt-0.5 text-[13px] text-ink-muted">{description}</p>
              }
              </div>
              <button
              type="button"
              onClick={onClose}
              aria-label="Close dialog"
              className="rounded-lg p-1.5 text-ink-faint transition-colors duration-150 ease-out hover:bg-slate-100 hover:text-ink">
              
                <XIcon className="h-4 w-4" />
              </button>
            </header>
            <div className="max-h-[64vh] overflow-y-auto px-5 py-4">{children}</div>
            {footer &&
          <footer className="flex items-center justify-end gap-2 border-t border-line bg-slate-50 px-5 py-3">
                {footer}
              </footer>
          }
          </motion.div>
        </div>
      }
    </AnimatePresence>);

}