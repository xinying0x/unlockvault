import { useState, useEffect } from 'react';

type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastProps {
  id: string;
  type: ToastType;
  title: string;
  message: string;
  duration?: number;
  onClose: (id: string) => void;
}

export interface ToastContextType {
  toasts: ToastProps[];
  addToast: (toast: Omit<ToastProps, 'id' | 'onClose'>) => void;
  removeToast: (id: string) => void;
}

const Toast: React.FC<ToastProps> = ({ id, type, title, message, duration = 5000, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    // Animate in
    setTimeout(() => setIsVisible(true), 10);

    // Auto dismiss
    const timer = setTimeout(() => {
      handleClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration]);

  const handleClose = () => {
    setIsLeaving(true);
    setTimeout(() => {
      onClose(id);
    }, 300);
  };

  const getToastStyles = () => {
    switch (type) {
      case 'success':
        return {
          bg: 'from-green-500/20 to-emerald-600/20',
          border: 'border-green-500/30',
          icon: '✅',
          iconBg: 'from-green-500 to-emerald-600'
        };
      case 'error':
        return {
          bg: 'from-red-500/20 to-rose-600/20',
          border: 'border-red-500/30',
          icon: '❌',
          iconBg: 'from-red-500 to-rose-600'
        };
      case 'warning':
        return {
          bg: 'from-yellow-500/20 to-orange-600/20',
          border: 'border-yellow-500/30',
          icon: '⚠️',
          iconBg: 'from-yellow-500 to-orange-600'
        };
      case 'info':
        return {
          bg: 'from-blue-500/20 to-cyan-600/20',
          border: 'border-blue-500/30',
          icon: 'ℹ️',
          iconBg: 'from-blue-500 to-cyan-600'
        };
      default:
        return {
          bg: 'from-gray-500/20 to-slate-600/20',
          border: 'border-gray-500/30',
          icon: '📢',
          iconBg: 'from-gray-500 to-slate-600'
        };
    }
  };

  const styles = getToastStyles();

  return (
    <div
      className={`relative flex items-start gap-3 p-4 bg-gradient-to-r ${styles.bg} backdrop-blur-sm border ${styles.border} rounded-xl shadow-2xl transition-all duration-300 transform ${
        isVisible && !isLeaving
          ? 'translate-x-0 opacity-100 scale-100'
          : isLeaving
          ? 'translate-x-full opacity-0 scale-95'
          : '-translate-x-full opacity-0 scale-95'
      }`}
    >
      {/* Icon */}
      <div className={`w-10 h-10 bg-gradient-to-r ${styles.iconBg} rounded-full flex items-center justify-center text-lg shadow-lg flex-shrink-0`}>
        {styles.icon}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <h4 className="text-white font-semibold text-sm mb-1">{title}</h4>
        <p className="text-gray-300 text-sm leading-relaxed">{message}</p>
      </div>

      {/* Close Button */}
      <button
        onClick={handleClose}
        className="flex-shrink-0 w-6 h-6 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white/60 hover:text-white transition-all duration-200 text-sm"
      >
        ✕
      </button>

      {/* Progress Bar */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10 rounded-b-xl overflow-hidden">
        <div
          className={`h-full bg-gradient-to-r ${styles.iconBg} transition-all duration-100 ease-linear`}
          style={{
            width: isVisible ? '0%' : '100%',
            transition: `width ${duration}ms linear`
          }}
        />
      </div>
    </div>
  );
};

export default Toast;

// Toast Manager Hook
export function useToast() {
  const [toasts, setToasts] = useState<Array<{
    id: string;
    message: string;
    type: ToastType;
  }>>([]);

  const showToast = (message: string, type: ToastType = 'info') => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, message, type }]);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const ToastContainer = () => (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map((toast, index) => (
        <div
          key={toast.id}
          style={{ transform: `translateY(${index * 80}px)` }}
          className="transition-transform duration-300"
        >
          <Toast
            id={toast.id}
            type={toast.type}
            title={toast.id}
            message={toast.message}
            onClose={removeToast}
          />
        </div>
      ))}
    </div>
  );

  return {
    showToast,
    ToastContainer
  };
} 