import { useEffect, useState } from 'react';
import { Icon } from './Icon.jsx';

export const Alert = ({ type, message, duration = 5000, onClose }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (duration) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        onClose?.();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  if (!isVisible) return null;

  const alertStyles = {
    success: {
      background: '#5d7d57',
      color: '#fff',
      icon: 'check',
    },
    error: {
      background: '#bf6440',
      color: '#fff',
      icon: 'alert',
    },
    warning: {
      background: '#b1832f',
      color: '#fff',
      icon: 'alert',
    },
    info: {
      background: '#4d8580',
      color: '#fff',
      icon: 'info',
    },
  };

  const style = alertStyles[type] || alertStyles.info;

  return (
    <div style={{
      position: 'fixed',
      top: '20px',
      right: '20px',
      zIndex: 1000,
      animation: 'slideIn 0.3s ease-out',
    }}>
      <div style={{
        background: style.background,
        color: style.color,
        padding: '12px 20px',
        borderRadius: '12px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        minWidth: '300px',
      }}>
        <Icon name={style.icon} size={20} />
        <span style={{ flex: 1, fontSize: '13px', fontWeight: 500 }}>{message}</span>
        <button
          onClick={() => {
            setIsVisible(false);
            onClose?.();
          }}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'inherit',
            cursor: 'pointer',
            padding: '4px',
          }}
        >
          <Icon name="close" size={16} />
        </button>
      </div>
      <style>{`
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};