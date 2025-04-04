import { useState } from "react";
import PlusIcon from 'assets/icons/plus.svg?react';
import SearchIcon from 'assets/icons/search.svg?react';
import ArrowIcon from 'assets/icons/arrow-down.svg?react';

import PageSwitcher from "Widgets/PageSwitcher/PageSwitcher";
import DirectionForm from "./DirectionForm";
import Modal from "Widgets/Modal/Modal";
import { CRMPageOptions } from "Widgets/PageSwitcher/CRMPageOptions";
import BackButton from "Widgets/BackButton/BackButton";

interface DirectionsHeaderProps {
  onSearch: (search: string) => void;
  onSort: (order: "asc" | "desc") => void;
}

export default function DirectionsHeaderPanel({ onSearch, onSort }: DirectionsHeaderProps): JSX.Element {
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
    <header className="DirectionsHeaderPanel HeaderPanel">
      <div className="LeftHeaderPanel">
        <BackButton />
        <h2 className="HeaderPanelTitle">Направления</h2>
        <PlusIcon
          width="18" 
          height="18" 
          strokeWidth="1"
          onClick={openModal}
          className="AddButton lfp-btn"
        />
      </div>

      <Modal isOpen={isModalOpen} onClose={closeModal}>
        <DirectionForm closeModal={closeModal}/>
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
          <PageSwitcher options={CRMPageOptions} />
      </div>
    </header>
  );
};