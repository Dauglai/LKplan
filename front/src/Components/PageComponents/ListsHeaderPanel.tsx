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
