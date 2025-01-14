import { useState } from 'react';

import ChevronRightIcon from 'assets/icons/chevron-right.svg?react';
import PlusIcon from 'assets/icons/plus.svg?react';
import TrashIcon from 'assets/icons/trash-2.svg?react';
import SearchIcon from 'assets/icons/search.svg?react';
import 'Styles/HeaderPanelStyle.scss';


export default function RequestsHeaderPanel({
    searchTerm,
    onSearch,
    onOpenModal,
    }: {
        searchTerm: string;
        onSearch: (term: string) => void;
        onOpenModal: () => void;
    }): JSX.Element {

    const [isFocused, setIsFocused] = useState(false);

    const handleFocus = () => setIsFocused(true);
    const handleBlur = () => setIsFocused(false);


    return (
        <div className="RequestHeaderPanel HeaderPanel">
            <div className="LeftHeaderPanel">
                <button className="BackButton lfp-btn">
                    <ChevronRightIcon width="32" height="32" strokeWidth="2" className="ChevronLeft"/>
                </button>
                <h2 className="HeaderPanelTitle">Список заявок</h2>
                <button className="AddButton lfp-btn">
                    <PlusIcon width="28" height="28" strokeWidth="2"/>
                </button>
                {/*<button className="DeleteButton lfp-btn">
                    <TrashIcon width="20" height="20" strokeWidth="2"/>
                </button>*/}
            </div>
            <div className="SearchInputWrapper">
                <input
                    type="text"
                    className="SearchInput"
                    value={searchTerm}
                    onChange={(e) => onSearch(e.target.value)}
                    placeholder={!isFocused && !searchTerm ? 'Поиск заявок' : ''}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                />
                {!isFocused && !searchTerm && (
                    <SearchIcon className="SearchInputIcon" width="20" height="20" strokeWidth="2"/>
                )}
                {(isFocused || searchTerm) && (
                    <div className="SearchInputText">Поиск заявок</div>
                )}
            </div>
            <button className="ManageButton" onClick={onOpenModal}>
              Ручное управление заявками
              <ChevronRightIcon width="16" height="16" strokeWidth="2"/>
            </button>
        </div>
    );
}
