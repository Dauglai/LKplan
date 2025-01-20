import { useState } from "react";
import PlusIcon from 'assets/icons/plus.svg?react';
import SearchIcon from 'assets/icons/search.svg?react';
import ChevronRightIcon from 'assets/icons/chevron-right.svg?react';
import ArrowIcon from 'assets/icons/arrow-down.svg?react';
import 'Styles/HeaderPanelStyle.scss';
import PageSwitcher from "Widgets/PageSwitcher/PageSwitcher";
import Modal from "Widgets/Modal/Modal";
import { PlannerPageOptions } from "Widgets/PageSwitcher/PlannerPageOptions";

interface TeamsHeaderProps {
    onSearch: (search: string) => void;
    onSort: (order: "asc" | "desc") => void;
}

export default function TeamsHeaderPanel({ onSearch, onSort }: TeamsHeaderProps): JSX.Element {
    const [search, setSearch] = useState("");
    const [isFocused, setIsFocused] = useState(false);
    const [sortTeam, setSortTeam] = useState<"asc" | "desc">("asc");
    const [isModalOpen, setIsModalOpen] = useState(false);

    const openModal = () => setIsModalOpen(true);
    const closeModal = () => setIsModalOpen(false);

    const toggleSortTeam = () => {
        const newTeam = sortTeam === "asc" ? "desc" : "asc";
        setSortTeam(newTeam);
        onSort(newTeam);
    };

    const handleFocus = () => setIsFocused(true);
    const handleBlur = () => setIsFocused(false);

    return (
        <header className="TeamsHeaderPanel HeaderPanel">
        <div className="LeftHeaderPanel">
            <button className="BackButton lfp-btn">
            <ChevronRightIcon width="32" height="32" strokeWidth="2" className="ChevronLeft"/>
            </button>
            <h2 className="HeaderPanelTitle">Команды</h2>
            <PlusIcon 
            width="18" 
            height="18" 
            strokeWidth="1"
            onClick={openModal}
            className="AddButton lfp-btn"
            />
        </div>

        {/*<Modal isOpen={isModalOpen} onClose={closeModal}>
            <CreateProjectForm closeModal={closeModal}/>
        </Modal>*/}
        
        <div className="RightHeaderPanel">
            <div className="SortButton rght-btn" onClick={toggleSortTeam}>
            <span className="SortIcons">
                <ArrowIcon
                    className={`SortIcon ${sortTeam === "asc" ? "active" : ""}`}
                    width="16"
                    height="16"
                />
                <ArrowIcon
                    className={`SortIcon ArrowUp ${sortTeam === "desc" ? "active" : ""}`}
                    width="16"
                    height="16"
                />
                </span>
            Название
            </div>
            <div className="SearchInputWrapper">
            <input
                        type="text"
                        className="SearchInput"
                        value={search}
                        onChange={(e) => {
                        const value = e.target.value;
                        setSearch(value);
                        onSearch(value);
                        }}
                        placeholder={!isFocused && !search ? 'Поиск по названию' : ''}
                        onFocus={handleFocus}
                        onBlur={handleBlur}
                    />
                    {!isFocused && !search && (
                        <SearchIcon className="SearchInputIcon" width="20" height="20" strokeWidth="2"/>
                    )}
                    {(isFocused || search) && (
                        <div className="SearchInputText">Поиск по названию</div>
                    )}
            </div>
            <PageSwitcher options={PlannerPageOptions} />
        </div>
        </header>
    );
};