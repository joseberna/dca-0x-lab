import React, { useEffect, useState } from 'react';
import { Toast as ToastType } from '../store/useToastStore';

interface ToastProps {
  toast: ToastType;
  onClose: () => void;
}

const iconMap = {
  success: '✓',
  error: '✕',
  warning: '⚠',
  info: 'ℹ',
};

const colorMap = {
  success: 'from-green-500/20 to-green-600/20 border-green-500/50',
  error: 'from-red-500/20 to-red-600/20 border-red-500/50',
  warning: 'from-yellow-500/20 to-yellow-600/20 border-yellow-500/50',
  info: 'from-blue-500/20 to-blue-600/20 border-blue-500/50',
};

const iconColorMap = {
  success: 'bg-green-500 text-white',
  error: 'bg-red-500 text-white',
  warning: 'bg-yellow-500 text-black',
  info: 'bg-blue-500 text-white',
};

export const Toast: React.FC<ToastProps> = ({ toast, onClose }) => {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsExiting(true);
      setTimeout(onClose, 300); // Match animation duration
    }, toast.duration || 5000);

    return () => clearTimeout(timer);
  }, [toast.duration, onClose]);

  return (
    <div
      className={`
        flex items-start gap-3 p-4 rounded-xl border backdrop-blur-md
        bg-gradient-to-br ${colorMap[toast.type]}
        shadow-lg transition-all duration-300 min-w-[320px] max-w-md
        ${isExiting ? 'opacity-0 translate-x-full' : 'opacity-100 translate-x-0'}
      `}
    >
      {/* Icon */}
      <div className={`
        flex items-center justify-center w-8 h-8 rounded-full
        ${iconColorMap[toast.type]} flex-shrink-0 font-bold text-lg
      `}>
        {iconMap[toast.type]}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <h4 className="font-semibold text-white text-sm mb-1">
          {toast.title}
        </h4>
        {toast.message && (
          <p className="text-xs text-white/80 leading-relaxed">
            {toast.message}
          </p>
        )}
      </div>

      {/* Close button */}
      <button
        onClick={() => {
          setIsExiting(true);
          setTimeout(onClose, 300);
        }}
        className="text-white/60 hover:text-white transition-colors flex-shrink-0"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
};
