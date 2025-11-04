import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

interface ToastContextType {
  showToast: (toast: Omit<Toast, 'id'>) => void;
  hideToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substring(7);
    const newToast = { ...toast, id };

    setToasts((prev) => [...prev, newToast]);

    const duration = toast.duration || 5000;
    setTimeout(() => {
      hideToast(id);
    }, duration);
  }, []);

  const hideToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const icons = {
    success: CheckCircle2,
    error: AlertCircle,
    info: Info,
    warning: AlertTriangle,
  };

  const colors = {
    success: {
      bg: 'bg-success-50',
      border: 'border-success-200',
      icon: 'text-success-600',
      iconBg: 'bg-success-100',
      text: 'text-success-900',
    },
    error: {
      bg: 'bg-error-50',
      border: 'border-error-200',
      icon: 'text-error-600',
      iconBg: 'bg-error-100',
      text: 'text-error-900',
    },
    info: {
      bg: 'bg-info-50',
      border: 'border-info-200',
      icon: 'text-info-600',
      iconBg: 'bg-info-100',
      text: 'text-info-900',
    },
    warning: {
      bg: 'bg-warning-50',
      border: 'border-warning-200',
      icon: 'text-warning-600',
      iconBg: 'bg-warning-100',
      text: 'text-warning-900',
    },
  };

  return (
    <ToastContext.Provider value={{ showToast, hideToast }}>
      {children}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-3 pointer-events-none">
        <AnimatePresence>
          {toasts.map((toast) => {
            const Icon = icons[toast.type];
            const color = colors[toast.type];

            return (
              <motion.div
                key={toast.id}
                initial={{ opacity: 0, x: 100, scale: 0.8 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 100, scale: 0.8 }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                className={`
                  pointer-events-auto max-w-md rounded-xl shadow-lg border-2
                  ${color.bg} ${color.border}
                `}
              >
                <div className="flex items-start gap-4 p-4">
                  <div className={`p-2 rounded-lg ${color.iconBg}`}>
                    <Icon className={`w-5 h-5 ${color.icon}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`font-bold ${color.text}`}>{toast.title}</p>
                    {toast.message && (
                      <p className={`text-sm mt-1 ${color.text} opacity-90`}>
                        {toast.message}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => hideToast(toast.id)}
                    className={`${color.icon} hover:opacity-70 transition-opacity`}
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}
