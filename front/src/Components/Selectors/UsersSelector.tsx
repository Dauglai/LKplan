import { useMemo, useState } from 'react';
import CloseIcon from 'assets/icons/close.svg?react';
import PlusIcon from 'assets/icons/plus.svg?react';
import { useGetUsersQuery } from 'Features/ApiSlices/userSlice'; 

interface UserSelectorProps {
  selectedUsersId: number[];
  onChange: (selectedIds: number[]) => void;
  label: string;
}

export default function UsersSelector({
  selectedUsersId,
  onChange,
  label
}: UserSelectorProps): JSX.Element {
  const { data: users, isLoading, error } = useGetUsersQuery();
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');

  const filteredUsers = useMemo(() => {
    if (!users) return [];
    const normalizedSearch = search.toLowerCase();
    return users.filter(user =>
      `${user.surname} ${user.name} ${user.patronymic}`
        .toLowerCase()
        .includes(normalizedSearch)
    );
  }, [users, search]);

  const handleToggleUser = (user_id: number) => {
    if (selectedUsersId.includes(user_id)) {
      onChange(selectedUsersId.filter(id => id !== user_id));
    } else {
      onChange([...selectedUsersId, user_id]);
    }
    setIsOpen(false);
  };

  const handleRemoveUser = (user_id: number) => {
    onChange(selectedUsersId.filter(id => id !== user_id));
  };

  if (isLoading) {
    return <div className="UserSelector FormField">Загрузка пользователей...</div>;
  }

  if (error || !users || users.length === 0) {
    return <div className="UserSelector FormField">Пользователи не найдены</div>;
  }

  const selectedUserNames = selectedUsersId
    .map(id => {
      const user = users.find(user => user.user_id === id);
      return user ? `${user.surname} ${user.name} ${user.patronymic}` : null;
    })
    .filter(Boolean);

  return (
    <div className="MultiUserSelector SelectorContainer">
      <div className="ListField FormField" onClick={() => setIsOpen(prev => !prev)}>
        <p>{label}</p>
        <PlusIcon width="20" height="20" strokeWidth="1" />

        {isOpen && (
          <div className="DropdownList" onClick={e => e.stopPropagation()}>
            <input
              type="text"
              className="SearchField FormField"
              placeholder="Поиск по ФИО..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              onClick={e => e.stopPropagation()}
            />
            {filteredUsers.map(user => (
              <div
                key={user.user_id}
                className={`DropdownItem ${
                  selectedUsersId.includes(user.user_id) ? 'selected' : ''
                }`}
                onClick={() => handleToggleUser(user.user_id)}
              >
                {`${user.surname} ${user.name} ${user.patronymic}`}
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedUserNames.length > 0 && (
        <ul className="SelectedUsers SelectedList">
          {selectedUsersId.map(user_id => {
            const user = users.find(user => user.user_id === user_id);
            return user ? (
              <li className="SelectedListItem" key={user_id}>
                {`${user.surname} ${user.name} ${user.patronymic}`}
                <CloseIcon
                  className="RemoveIcon"
                  width="16"
                  height="16"
                  strokeWidth="1.5"
                  onClick={() => handleRemoveUser(user_id)}
                />
              </li>
            ) : null;
          })}
        </ul>
      )}
    </div>
  );
}
