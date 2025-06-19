import { useLocation, useNavigate } from 'react-router-dom'; // Хуки для навигации
import 'Styles/components/Sections/SideTabs.scss'; // Стили компонента

/**
 * Конфигурация шагов навигации
 * @property {string} title - Отображаемое название шага
 * @property {string} path - Путь для навигации
 */
const steps = [
  { title: 'Настройка Мероприятия', path: '/event-setup' },
  { title: 'Настройка Направлений', path: '/directions-setup' },
  { title: 'Настройка Проектов', path: '/projects-setup' },
  { title: 'Настройка Статусов', path: '/stages-setup' },
  { title: 'Выбранные настройки', path: '/event-setup-save' },
];

/**
 * Компонент боковых вкладок для навигации по шагам настройки мероприятия.
 * Подсвечивает активный шаг и обрабатывает переходы между шагами.
 * 
 * @component
 * @returns {JSX.Element} Компонент боковых вкладок
 * 
 * @example
 * // Пример использования:
 * <SideTabs />
 * 
 * @description
 * Особенности:
 * - Автоматически определяет активный шаг по текущему пути
 * - Поддерживает режим редактирования (/event/:id/edit)
 * - Обеспечивает навигацию между шагами
 */
export default function SideTabs() {
  const location = useLocation(); // Текущий путь
  const navigate = useNavigate(); // Функция навигации

  /**
   * Обработчик клика по вкладке
   * @param {string} path - Путь для перехода
   */
  const handleClick = (path: string) => {
    navigate(path); // Выполняем переход
  };

  // Проверяем, находимся ли мы в режиме редактирования мероприятия
  const isEventEdit = location.pathname.match(/^\/event\/\d+\/edit$/);

  return (
    <div className="SideTabs">
      {steps.map((step) => {
        // Определяем активна ли текущая вкладка
        const isActive =
          location.pathname === step.path ||
          (isEventEdit && step.path === '/event-setup');
        
        return (
          <div
            key={step.path} // Уникальный ключ
            className={`SideTabItem ${isActive ? 'active' : ''}`} // Классы стилей
            onClick={() => handleClick(step.path)} // Обработчик клика
          >
            {step.title}
          </div>
        );
      })}
    </div>
  );
}