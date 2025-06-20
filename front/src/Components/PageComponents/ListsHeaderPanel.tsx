import { useState } from "react";
import { useNavigate } from 'react-router-dom'; 
import PlusIcon from 'assets/icons/plus.svg?react';
import PageSwitcher, { PageOption } from "Components/Sections/PageSwitcher/PageSwitcher";
import BackButton from "Components/Common/BackButton/BackButton";
import UniversalInput from "Components/Common/UniversalInput";
import 'Styles/components/PageComponents/HeaderPanelStyle.scss';
import { Permission } from "Features/ApiSlices/roleSlice";
import { useUserRoles } from "Features/context/UserRolesContext";
import { Switch } from "antd";

interface ListsHeaderProps {
    title: string;
    onSearch: (search: string) => void;
    PageOptions?: PageOption[];
    searchPlaceholder?: string;
    link?: string;
    permission?: Permission;
    onAddClick?: () => void;
    showSwitch?: boolean;
    switchChecked?: boolean;
    onSwitchChange?: () => void;
    switchLabel?: string;
}

/**
 * Шапка с заголовком для списков, включающий поисковое поле и кнопку для добавления.
 * Отображает элементы в зависимости от роли пользователя и предоставляет функционал для поиска и переключения страниц.
 *
 * @component
 * @example
 * // Пример использования:
 * <ListsHeaderPanel 
 *   title="Список мероприятий"
 *   onSearch={handleSearch}
 *   PageOptions={pageOptions}
 *   permission="create_event"
 *   searchPlaceholder="Поиск по названию"
 * />
 *
 * @param {Object} props - Свойства компонента.
 * @param {string} props.title - Заголовок панели.
 * @param {Function} props.onSearch - Функция, которая вызывается при изменении значения в поисковом поле.
 * @param {PageOption[]} [props.PageOptions] - Опции для переключателя страниц.
 * @param {string} [props.searchPlaceholder="Поиск по названию"] - Текст, который будет отображаться в поле поиска.
 * @param {string} [props.link] - Ссылка, на которую будет происходить переход после нажатия кнопки Создать +.
 * @param {UserRole['role_type'][]} [props.allowedRoles] - Роли, которым доступна кнопка добавления.
 * @returns {JSX.Element} Компонент заголовка списка с поиском и добавлением.
 */

export default function ListsHeaderPanel({
    title,
    onSearch,
    PageOptions,
    searchPlaceholder = "Поиск",
    link,
    onAddClick,
    permission,
    showSwitch = false,
    switchChecked = false,
    onSwitchChange,
    switchLabel = "",
    }: ListsHeaderProps): JSX.Element {
    const [search, setSearch] = useState(""); // Локальное состояние строки поиска
    const navigate = useNavigate(); // Навигация по маршрутам
    const { hasRole, hasPermission } = useUserRoles();

    // Обработка поиска
    const handleSearch = (value: string) => {
        setSearch(value);
        onSearch(value);
    };

    // Обработка нажатия на кнопку добавления
    const handleAddButtonClick = () => {
        if (link) {
        navigate(link);
        } else if (onAddClick) {
            onAddClick();
        }
    };

    // Проверка доступа для отображения кнопки
    const canSeeAddButton = permission ? hasPermission(permission) : true;

    return (
        <header className="ListsHeaderPanel HeaderPanel">
        <div className="LeftHeaderPanel">
            <BackButton />
            <h2 className="HeaderPanelTitle">{title}</h2>
            {canSeeAddButton && (
                <PlusIcon 
                    width="18" 
                    height="18" 
                    strokeWidth="1"
                    onClick={handleAddButtonClick}
                    className="AddButton lfp-btn"
                />
            )}
        </div>

        <div className="RightHeaderPanel">

            <div className="table-controls">
                {showSwitch && hasRole("organizer") && (
                    <>
                        <Switch 
                            checked={switchChecked}
                            onChange={onSwitchChange}
                        />
                        <span>{switchLabel}</span>
                    </>
                )}
            </div>
            <UniversalInput
                value={search}
                onChange={handleSearch}
                type="text"
                placeholder={searchPlaceholder}
                withPlaceholder={true}
            />

            {PageOptions && !hasRole("projectant") &&
                <PageSwitcher options={PageOptions} />
            }
        </div>
        </header>
    );
}
