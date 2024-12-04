import SearchIcon from 'assets/icons/search.svg?react';
import UserIcon from 'assets/icons/user.svg?react';

export function RequestSearchBar({
    searchTerm,
    onSearch,
    requestCount,
  }: {
    searchTerm: string;
    onSearch: (value: string) => void;
    requestCount: number;
  }): JSX.Element {
    return (
      <div className="RequestSearchBar">
        <SearchIcon className="SearchIcon" width="16" height="16" />
        <input
          type="text"
          placeholder="Поиск заявок"
          className="SearchInput"
          value={searchTerm}
          onChange={(e) => onSearch(e.target.value)}
        />
        <div className="RequestCount">
          <UserIcon width="16" height="16" />
          {requestCount}
        </div>
      </div>
    );
  }
  