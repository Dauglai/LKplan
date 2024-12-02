import { useState } from 'react';
import ChevronLeftIcon from 'assets/icons/chevron-left.svg?react';
import ChevronRightIcon from 'assets/icons/chevron-right.svg?react';
import PlusIcon from 'assets/icons/plus.svg?react';
import TrashIcon from 'assets/icons/trash-2.svg?react';
import SearchIcon from 'assets/icons/search.svg?react';
import './RequestsHeaderPanel.scss';

export default function RequestsHeaderPanel(): JSX.Element {
  const [search, setSearch] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const handleFocus = () => setIsFocused(true);
  const handleBlur = () => setIsFocused(false);

  return (
    <div className="HeaderPanel">
        <div className="LeftHeaderPanel">
            <button className="BackButton lfp-btn">
                <ChevronLeftIcon />
            </button>
            <h2 className="RequestsTitle">Список заявок</h2>
            <button className="AddButton lfp-btn">
                <PlusIcon />
            </button>
            <button className="DeleteButton lfp-btn">
                <TrashIcon />
            </button>
        </div>
        <div className="SearchInputWrapper">
        <input
          type="text"
          className="SearchInput"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={!isFocused && !search ? 'Поиск заявок' : ''}
          onFocus={handleFocus}
          onBlur={handleBlur}
        />
        {!isFocused && !search && (
          <SearchIcon className="SearchInputIcon" />
        )}
        {(isFocused || search) && (
          <div className="SearchInputText">Поиск заявок</div>
        )}
      </div>
        <button className="ManageButton">Ручное управление заявками
            <ChevronRightIcon />
        </button>
    </div>
  );
}
