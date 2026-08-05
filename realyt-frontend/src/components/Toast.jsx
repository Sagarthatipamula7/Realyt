import { useEffect, useState } from 'react';

export default function Toast({ message, type = 'success', onClose, duration = 2800 }) {
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setExiting(true);
    }, duration - 300);

    const closeTimer = setTimeout(() => {
      onClose?.();
    }, duration);

    return () => {
      clearTimeout(timer);
      clearTimeout(closeTimer);
    };
  }, [duration, onClose]);

  const handleDismiss = () => {
    setExiting(true);
    setTimeout(() => onClose?.(), 250);
  };

  return (
    <div
      className={`realyt-toast realyt-toast-${type} ${exiting ? 'toast-exit' : 'toast-enter'}`}
      onClick={handleDismiss}
      role="alert"
      aria-live="polite"
    >
      <div className="toast-icon">
        {type === 'success' ? (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        ) : (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        )}
      </div>
      <div className="toast-content">
        <span className="toast-message">{message}</span>
      </div>
      <button type="button" className="toast-dismiss" onClick={handleDismiss} aria-label="Dismiss notification">
        ✕
      </button>
    </div>
  );
}
