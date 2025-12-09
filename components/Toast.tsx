'use client';

import React, { useState, useEffect, createContext, useContext, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';

// Toast types
export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

// Toast context
interface ToastContextType {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
  success: (title: string, message?: string) => void;
  error: (title: string, message?: string) => void;
  warning: (title: string, message?: string) => void;
  info: (title: string, message?: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

// Hook to use toast
export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

// Toast Provider Component
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newToast: Toast = {
      ...toast,
      id,
      duration: toast.duration ?? 5000,
    };
    setToasts((prev) => [...prev, newToast]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const success = useCallback((title: string, message?: string) => {
    addToast({ type: 'success', title, message });
  }, [addToast]);

  const error = useCallback((title: string, message?: string) => {
    addToast({ type: 'error', title, message, duration: 8000 });
  }, [addToast]);

  const warning = useCallback((title: string, message?: string) => {
    addToast({ type: 'warning', title, message });
  }, [addToast]);

  const info = useCallback((title: string, message?: string) => {
    addToast({ type: 'info', title, message });
  }, [addToast]);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast, success, error, warning, info }}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  );
}

// Toast Container (renders all toasts)
function ToastContainer({ toasts, removeToast }: { toasts: Toast[]; removeToast: (id: string) => void }) {
  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 max-w-md">
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
        ))}
      </AnimatePresence>
    </div>
  );
}

// Individual Toast Item
function ToastItem({ toast, onClose }: { toast: Toast; onClose: () => void }) {
  useEffect(() => {
    if (toast.duration && toast.duration > 0) {
      const timer = setTimeout(onClose, toast.duration);
      return () => clearTimeout(timer);
    }
  }, [toast.duration, onClose]);

  const icons = {
    success: <CheckCircle className="w-5 h-5" />,
    error: <XCircle className="w-5 h-5" />,
    warning: <AlertTriangle className="w-5 h-5" />,
    info: <Info className="w-5 h-5" />,
  };

  const styles = {
    success: {
      bg: 'bg-emerald-500/10',
      icon: 'text-emerald-400',
      border: 'border-l-emerald-500',
      text: 'text-white',
    },
    error: {
      bg: 'bg-red-500/10',
      icon: 'text-red-400',
      border: 'border-l-red-500',
      text: 'text-white',
    },
    warning: {
      bg: 'bg-amber-500/10',
      icon: 'text-amber-400',
      border: 'border-l-amber-500',
      text: 'text-white',
    },
    info: {
      bg: 'bg-blue-500/10',
      icon: 'text-blue-400',
      border: 'border-l-blue-500',
      text: 'text-white',
    },
  };

  const style = styles[toast.type];

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, x: 100, scale: 0.9 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      className={`flex items-start gap-3 p-4 rounded-xl border-l-4 backdrop-blur-xl ${style.bg} ${style.border}`}
      style={{ 
        background: 'rgba(26, 26, 36, 0.95)',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.05)'
      }}
    >
      <div className={`flex-shrink-0 mt-0.5 ${style.icon}`}>{icons[toast.type]}</div>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-semibold ${style.text}`}>{toast.title}</p>
        {toast.message && (
          <p className="text-sm text-zinc-400 mt-1 line-clamp-2">{toast.message}</p>
        )}
      </div>
      <button
        onClick={onClose}
        className="flex-shrink-0 p-1.5 rounded-lg hover:bg-white/10 transition-colors"
      >
        <X className="w-4 h-4 text-zinc-400" />
      </button>
    </motion.div>
  );
}

// Standalone toast function for use outside React components
let toastFn: ToastContextType | null = null;

export function setToastRef(ref: ToastContextType) {
  toastFn = ref;
}

export function toast(type: ToastType, title: string, message?: string) {
  if (toastFn) {
    toastFn.addToast({ type, title, message });
  } else {
    console.warn('Toast not initialized');
  }
}

export default ToastProvider;
