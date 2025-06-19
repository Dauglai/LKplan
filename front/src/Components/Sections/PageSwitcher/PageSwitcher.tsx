import { Link } from 'react-router-dom'; // Компонент для навигации
import './PageSwitcher.scss'; // Стили компонента
import { useLocation } from 'react-router-dom'; // Хук для получения текущего пути

/**
 * Интерфейс для опции страницы
 * @property {string} label - Текст ссылки
 * @property {string} link - URL путь
 */
export interface PageOption {
  label: string;
  link: string;
}

/**
 * Пропсы компонента переключателя страниц
 * @property {PageOption[]} options - Массив опций для отображения
 */
interface PageSwitcherProps {
  options: PageOption[];
}

/**
 * Компонент переключателя между страницами с визуальным выделением активной страницы
 * @component
 * @param {PageSwitcherProps} props - Пропсы компонента
 * @returns {JSX.Element} Компонент переключателя страниц
 *
 * @example
 * const pages = [
 *   { label: 'Профиль', link: '/profile' },
 *   { label: 'Настройки', link: '/settings' }
 * ];
 * 
 * <PageSwitcher options={pages} />
 */
export default function PageSwitcher({ options }: PageSwitcherProps): JSX.Element {
    const location = useLocation(); // Получаем текущий путь

    return (
        <div className="PageSwitcher">
        {options.map(option => (
            <Link
            key={option.link} // Уникальный ключ для каждой ссылки
            to={option.link} // URL назначения
            className={`PageSwitcherButton ${location.pathname === option.link ? 'active' : ''}`} // Добавляем класс active для текущей страницы
            >
            {option.label}
            </Link>
        ))}
        </div>
    );
}
