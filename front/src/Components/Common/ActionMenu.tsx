import { useState, useRef, MouseEvent, useEffect } from 'react';
import MoreIcon from 'assets/icons/more.svg?react';


interface ActionMenuProps {
  actions: { label: string, onClick: () => void, requiredRole?: string }[];
  onClose: () => void;
  role?: string;
}

/**
 * Компонент для отображения меню действий с фильтрацией по ролям.
 * Меню открывается по клику на иконку с тремя точками, и закрывается при клике вне его.
 *
 * @component
 * @example
 * // Пример использования
 * <ActionMenu
 *   actions={[
 *     { label: 'Редактировать', onClick: handleEdit, requiredRole: 'Администратор' },
 *     { label: 'Удалить', onClick: handleDelete }
 *   ]}
 *   onClose={handleCloseMenu}
 *   role="Администратор"
 * />
 * 
 * @param {Object} props - Свойства компонента.
 * @param {Array} props.actions - Массив объектов с действиями для отображения в меню.
 * @param {string} props.actions.label - Текст, который отображается для каждого действия.
 * @param {Function} props.actions.onClick - Функция, которая вызывается при клике на действие.
 * @param {string} [props.actions.requiredRole] - Роль, необходимая для выполнения действия (необязательное поле).
 * @param {Function} props.onClose - Функция для закрытия меню.
 * @param {string} [props.role] - Роль текущего пользователя, используется для фильтрации доступных действий.
 * @returns {JSX.Element} Компонент меню действий.
 */

export default function ActionMenu({ actions, onClose, role }: ActionMenuProps): JSX.Element {
    const [open, setOpen] = useState(false);
    const menuRef = useRef<HTMLUListElement | null>(null);

    const filteredActions = actions.filter(action => 
        !action.requiredRole || action.requiredRole === role
    );

    const toggleMenu = () => {
        setOpen(prev => !prev);
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
          if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
            setOpen(false);
          }
        };
    
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <>
            <MoreIcon 
                        width="16" 
                        height="16" 
                        strokeWidth="1"
                        onClick={() => toggleMenu()}
                        className="ThreeDotsButton"
                />
            {open && (
                <ul ref={menuRef} className="ActionsMenu">
                {filteredActions.map((action, index) => (
                    <li key={index} onClick={() => { action.onClick(); onClose(); }}>
                    {action.label}
                    </li>
                ))}
                </ul>
            )}
        </>
    );
};
