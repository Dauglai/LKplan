import { useMemo, useState } from 'react'; // Хуки React
import CloseIcon from 'assets/icons/close.svg?react'; // Иконка закрытия
import PlusIcon from 'assets/icons/plus.svg?react'; // Иконка добавления
import { useGetUsersQuery } from 'Features/ApiSlices/userSlice'; // API-запрос пользователей

/**
 * Интерфейс пропсов компонента UsersSelector.
 * 
 * @property {number[]} selectedUsersId - Массив ID выбранных пользователей.
 * @property {(selectedIds: number[]) => void} onChange - Колбэк при изменении выбора пользователей.
 * @property {string} label - Текст лейбла по умолчанию.
 */
interface UserSelectorProps {
  selectedUsersId: number[];
  onChange: (selectedIds: number[]) => void;
  label: string;
}

/**
 * Компонент множественного выбора пользователей с поиском.
 * Поддерживает добавление/удаление пользователей, поиск по ФИО.
 * 
 * @component
 * @example
 * // Пример использования:
 * <UsersSelector
 *   selectedUsersId={[1, 2]}
 *   onChange={(ids) => setSelectedUsers(ids)}
 *   label="Выберите участников"
 * />
 *
 * @param {UserSelectorProps} props - Пропсы компонента.
 * @returns {JSX.Element} Компонент выбора пользователей с поиском и мультиселектом.
 */
export default function UsersSelector({
  selectedUsersId,
  onChange,
  label
}: UserSelectorProps): JSX.Element {
  const { data: users, isLoading, error } = useGetUsersQuery(); // Загрузка списка пользователей
  const [isOpen, setIsOpen] = useState(false); // Состояние открытия/закрытия списка
  const [search, setSearch] = useState(''); // Состояние поискового запроса

  // Фильтрация пользователей по поисковому запросу
  const filteredUsers = useMemo(() => {
    if (!users) return [];
    const normalizedSearch = search.toLowerCase();
    return users.filter(user =>
      `${user.surname} ${user.name} ${user.patronymic}`
        .toLowerCase()
        .includes(normalizedSearch)
    );
  }, [users, search]);

  /**
   * Переключение выбора пользователя.
   * @param {number} user_id - ID пользователя для добавления/удаления.
   */
  const handleToggleUser = (user_id: number) => {
    if (selectedUsersId.includes(user_id)) {
      onChange(selectedUsersId.filter(id => id !== user_id)); // Удаление пользователя
    } else {
      onChange([...selectedUsersId, user_id]); // Добавление пользователя
    }
    setIsOpen(false);
  };

  /**
   * Удаление выбранного пользователя.
   * @param {number} user_id - ID пользователя для удаления.
   */
  const handleRemoveUser = (user_id: number) => {
    onChange(selectedUsersId.filter(id => id !== user_id));
  };

  if (isLoading) {
    return <div className="UserSelector FormField">Загрузка пользователей...</div>;
  }

  if (error || !users || users.length === 0) {
    return <div className="UserSelector FormField">Пользователи не найдены</div>;
  }

  // Формирование списка ФИО выбранных пользователей
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
