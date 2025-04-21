import { useState } from "react";
import { useNavigate } from 'react-router-dom'; 
import PlusIcon from 'assets/icons/plus.svg?react';
import PageSwitcher, { PageOption } from "Widgets/PageSwitcher/PageSwitcher";
import BackButton from "Widgets/BackButton/BackButton";
import UniversalInput from "Components/Common/UniversalInput";
import 'Styles/components/PageComponents/HeaderPanelStyle.scss';

interface ListsHeaderProps {
  title: string;
  onSearch: (search: string) => void;
  role?: string;
  PageOptions?: PageOption[];
  searchPlaceholder?: string;
  link?: string;
  onAddClick?: () => void;
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
 *   role="Организатор"
 *   PageOptions={pageOptions}
 *   searchPlaceholder="Поиск по названию"
 * />
 *
 * @param {Object} props - Свойства компонента.
 * @param {string} props.title - Заголовок панели.
 * @param {Function} props.onSearch - Функция, которая вызывается при изменении значения в поисковом поле.
 * @param {string} [props.role] - Роль пользователя. Используется для отображения кнопки добавления только для организатора.
 * @param {PageOption[]} [props.PageOptions] - Опции для переключателя страниц.
 * @param {string} [props.searchPlaceholder="Поиск по названию"] - Текст, который будет отображаться в поле поиска.
 * @param {string} [props.link] - Ссылка, на которую будет происходить переход после нажатия кнопки Создать +.
 * @returns {JSX.Element} Компонент заголовка списка с поиском и добавлением.
 */

export default function ListsHeaderPanel({
    title,
    onSearch,
    role,
    PageOptions,
    searchPlaceholder = "Поиск",
    link,
    onAddClick,
    }: ListsHeaderProps): JSX.Element {
    const [search, setSearch] = useState(""); // Локальное состояние строки поиска
    const navigate = useNavigate(); // Навигация по маршрутам

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

    return (
        <header className="ListsHeaderPanel HeaderPanel">
        <div className="LeftHeaderPanel">
            <BackButton />
            <h2 className="HeaderPanelTitle">{title}</h2>
            {role === "Организатор" && link &&
                <PlusIcon 
                width="18" 
                height="18" 
                strokeWidth="1"
                onClick={handleAddButtonClick}
                className="AddButton lfp-btn"
            />}
        </div>

        <div className="RightHeaderPanel">
            <UniversalInput
                value={search}
                onChange={handleSearch}
                type="text"
                placeholder={searchPlaceholder}
                withPlaceholder={true}
            />

            {role === "Организатор" && 
                <PageSwitcher options={PageOptions} />
            }
        </div>
        </header>
    );
}
