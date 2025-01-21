import React, { createContext, useContext, useState, ReactNode } from 'react';
import './Notification.scss';
import SuccessIcon from 'assets/icons/alert-circle.svg?react';
import ErrorIcon from 'assets/icons/x-octagon.svg?react';
import InfoIcon from 'assets/icons/check-circle.svg?react';

interface Notification {
  message: string;
  type: 'success' | 'error' | 'info';
}

interface NotificationContextType {
  showNotification: (message: string, type: 'success' | 'error' | 'info') => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [notification, setNotification] = useState<Notification | null>(null);

  const showNotification = (message: string, type: 'success' | 'error' | 'info') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000); // Убираем уведомление через 3 секунды
  };

  return (
    <NotificationContext.Provider value={{ showNotification }}>
      {children}
      {notification && (
        <div className={`Notification Notification-${notification.type}`}>
          <div className='img'>
            {notification.type === 'success' && 
              <SuccessIcon 
                width="16px"
                height="16px"
                strokeWidth="1" />}

            {notification.type === 'error' && 
              <ErrorIcon 
                width="16px"
                height="16px"
                strokeWidth="1" />}

            {notification.type === 'info' && 
              <InfoIcon 
                width="16px"
                height="16px"
                strokeWidth="1" />}
            
          </div>
          {notification.message}
        </div>
      )}
    </NotificationContext.Provider>
  );
};
