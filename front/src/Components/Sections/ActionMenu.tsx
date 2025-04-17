import { Dropdown, Menu } from "antd";
import MoreIcon from 'assets/icons/more.svg?react';
import "Styles/components/Common/ActionMenuStyle.scss"


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
    // Фильтруем действия по роли
    const filteredActions = actions.filter(
      (action) => !action.requiredRole || action.requiredRole === role
    );
  
    // Формируем элементы меню
    const menu = (
      <Menu onClick={onClose} className="ActionsMenu">
        {filteredActions.map((action, index) => (
          <Menu.Item key={index} onClick={action.onClick}>
            {action.label}
          </Menu.Item>
        ))}
      </Menu>
    );
  
    return (
      <Dropdown overlay={menu} trigger={["click"]} placement="bottomRight">
        <span className="ThreeDotsButton">
          <MoreIcon width="16" height="16" strokeWidth="1" />
        </span>
      </Dropdown>
    );
  }
