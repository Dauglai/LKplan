import React, { createContext, useContext, useState, ReactNode } from 'react'; // Базовые React-импорты
import './Notification.scss'; // Стили компонента
import SuccessIcon from 'assets/icons/success.svg?react'; // Иконка успеха
import ErrorIcon from 'assets/icons/error.svg?react'; // Иконка ошибки
import InfoIcon from 'assets/icons/alert-circle.svg?react'; // Иконка информации
import CloseIcon from 'assets/icons/close-notification.svg?react'; // Иконка закрытия

/**
 * Интерфейс для уведомления
 * @property {string} message - Текст уведомления
 * @property {'success' | 'error' | 'info'} type - Тип уведомления
 */
interface Notification {
  message: string;
  type: 'success' | 'error' | 'info';
}

/**
 * Интерфейс контекста уведомлений
 * @property {function} showNotification - Функция показа уведомления
 */
interface NotificationContextType {
  showNotification: (message: string, type: 'success' | 'error' | 'info') => void;
}

/**
 * Контекст для работы с уведомлениями
 */
const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

/**
 * Хук для доступа к функциям уведомлений
 * @throws {Error} Если используется вне NotificationProvider
 * @returns {NotificationContextType} Контекст уведомлений
 */
export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

/**
 * Провайдер контекста уведомлений
 * @component
 * @param {Object} props - Свойства компонента
 * @param {ReactNode} props.children - Дочерние элементы
 * 
 * @example
 * <NotificationProvider>
 *   <App />
 * </NotificationProvider>
 */
export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [notification, setNotification] = useState<Notification | null>(null); // Состояние текущего уведомления

  /**
   * Показывает уведомление с заданным сообщением и типом
   * @param {string} message - Текст уведомления
   * @param {'success' | 'error' | 'info'} type - Тип уведомления
   */
  const showNotification = (message: string, type: 'success' | 'error' | 'info') => {
    setNotification({ message, type }); // Устанавливаем новое уведомление
    setTimeout(() => setNotification(null), 3000); // Автоматическое скрытие через 3 секунды
  };

  return (
    <NotificationContext.Provider value={{ showNotification }}>
      {children}
      {notification && (
        <div className={`Notification Notification-${notification.type}`}>
          <div className='img'>
            {notification.type === 'success' && 
              <SuccessIcon 
                width="20px"
                height="20px"
                strokeWidth="2" />}

            {notification.type === 'error' && 
              <ErrorIcon 
                width="20px"
                height="20px"
                strokeWidth="2" />}

            {notification.type === 'info' && 
              <InfoIcon 
                width="20px"
                height="20px"
                strokeWidth="2" 
                stroke="white"/>}
            
          </div>
          <div className="message">{notification.message}</div>
          <CloseIcon 
            className="close-btn"
            width="20px"
            height="20px"
            strokeWidth="2" 
            onClick={() => setNotification(null)} 
            aria-label="Закрыть"/>
        </div>
      )}
    </NotificationContext.Provider>
  );
};
