import { useState } from "react";
import { useNavigate } from "react-router-dom";
import PlusIcon from 'assets/icons/plus.svg?react';
import SearchIcon from 'assets/icons/search.svg?react';
import ChevronRightIcon from 'assets/icons/chevron-right.svg?react';
import ArrowIcon from 'assets/icons/arrow-down.svg?react';
import 'Styles/HeaderPanelStyle.scss';
import PageSwitcher from "Widgets/PageSwitcher/PageSwitcher";
import CreateProjectForm from "./CreateProject/CreateProjectForm";
import Modal from "Widgets/Modal/Modal";

interface ProjectsHeaderProps {
  onSearch: (search: string) => void;
  onSort: (order: "asc" | "desc") => void;
}

const pageOptions = [
  { label: 'Мероприятия', link: '/events-list' },
  { label: 'Проекты', link: '/projects-list' },
];

export default function ProjectsHeaderPanel({ onSearch, onSort }: ProjectsHeaderProps): JSX.Element {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const toggleSortDirection = () => {
    const newDirection = sortDirection === "asc" ? "desc" : "asc";
    setSortDirection(newDirection);
    onSort(newDirection);
  };

  const handleFocus = () => setIsFocused(true);
  const handleBlur = () => setIsFocused(false);

  return (
    <header className="ProjectsHeaderPanel HeaderPanel">
      <div className="LeftHeaderPanel">
        <button className="BackButton lfp-btn">
          <ChevronRightIcon width="32" height="32" strokeWidth="2" className="ChevronLeft"/>
        </button>
        <h2 className="HeaderPanelTitle">Проекты</h2>
        <PlusIcon 
          width="18" 
          height="18" 
          strokeWidth="1"
          onClick={openModal}
          className="AddButton lfp-btn"
        />
      </div>

      <Modal isOpen={isModalOpen} onClose={closeModal}>
        <CreateProjectForm closeModal={closeModal}/>
      </Modal>
      
      <div className="RightHeaderPanel">
        <div className="SortButton rght-btn" onClick={toggleSortDirection}>
          <span className="SortIcons">
              <ArrowIcon
                className={`SortIcon ${sortDirection === "asc" ? "active" : ""}`}
                width="16"
                height="16"
              />
              <ArrowIcon
                className={`SortIcon ArrowUp ${sortDirection === "desc" ? "active" : ""}`}
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
          <PageSwitcher options={pageOptions} />
      </div>
    </header>
  );
};