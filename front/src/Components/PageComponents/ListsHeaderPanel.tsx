import { useState } from "react";
import Modal from "Widgets/Modal/Modal";
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
  SearchPlaceholder?: string;
  FormComponent?: React.ElementType;
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
 *   SearchPlaceholder="Поиск по названию"
 *   FormComponent={FormComponent}
 * />
 *
 * @param {Object} props - Свойства компонента.
 * @param {string} props.title - Заголовок панели.
 * @param {Function} props.onSearch - Функция, которая вызывается при изменении значения в поисковом поле.
 * @param {string} [props.role] - Роль пользователя. Используется для отображения кнопки добавления только для организатора.
 * @param {PageOption[]} [props.PageOptions] - Опции для переключателя страниц.
 * @param {string} [props.SearchPlaceholder="Поиск по названию"] - Текст, который будет отображаться в поле поиска.
 * @param {React.ElementType} [props.FormComponent] - Компонент формы, который будет отображаться в модальном окне при нажатии кнопки "Добавить".
 * @returns {JSX.Element} Компонент заголовка списка с поиском и добавлением.
 */

export default function ListsHeaderPanel({
    title,
    onSearch,
    role,
    PageOptions,
    SearchPlaceholder = "Поиск по названию",
    FormComponent,
    }: ListsHeaderProps): JSX.Element {
    const [search, setSearch] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleSearch = (value: string) => {
        setSearch(value);
        onSearch(value);
    };
      

    const openModal = () => setIsModalOpen(true);
    const closeModal = () => setIsModalOpen(false);

    return (
        <header className="ListsHeaderPanel HeaderPanel">
        <div className="LeftHeaderPanel">
            <BackButton />
            <h2 className="HeaderPanelTitle">{title}</h2>
            {role === "Организатор" && 
                <PlusIcon 
                width="18" 
                height="18" 
                strokeWidth="1"
                onClick={openModal}
                className="AddButton lfp-btn"
            />}
        </div>

        <Modal isOpen={isModalOpen} onClose={closeModal}>
            {FormComponent && <FormComponent closeModal={closeModal} />}
        </Modal>

        <div className="RightHeaderPanel">
            <UniversalInput
                value={search}
                onChange={handleSearch}
                type="text"
                placeholder={SearchPlaceholder}
                withPlaceholder={true}
            />

            {role === "Организатор" && 
                <PageSwitcher options={PageOptions} />
            }
        </div>
        </header>
    );
}
