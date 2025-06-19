import { Select, Spin } from 'antd'; // Компоненты Ant Design
import { useGetUsersQuery } from 'Features/ApiSlices/userSlice'; // API-запрос пользователей

/**
 * Интерфейс пропсов компонента UserSelector.
 * 
 * @property {number | null} selectedUserId - ID выбранного пользователя (может быть null).
 * @property {(userId: number) => void} onChange - Колбэк при изменении выбора пользователя.
 * @property {string} label - Текст лейбла по умолчанию.
 * @property {string} [error] - Текст ошибки валидации (опционально).
 */
interface UserSelectorProps {
    selectedUserId: number | null;
    onChange: (userId: number) => void;
    label: string;
    error?: string;
}

/**
 * Компонент выбора пользователя из списка с поддержкой отображения ФИО.
 * Обрабатывает состояния загрузки, ошибок и пустого списка пользователей.
 * 
 * @component
 * @example
 * // Пример использования:
 * <UserSelector
 *   selectedUserId={selectedId}
 *   onChange={(id) => setSelectedId(id)}
 *   label="Выберите пользователя"
 * />
 *
 * @param {UserSelectorProps} props - Пропсы компонента.
 * @returns {JSX.Element} Выпадающий список пользователей с обработкой различных состояний.
 */
export default function UserSelector({
  selectedUserId,
  onChange,
  label,
  error
}: UserSelectorProps): JSX.Element {
  const { data: users, isLoading, errorUsers } = useGetUsersQuery(); // Загрузка списка пользователей

  if (isLoading) {
    return <Spin className="UserSelector FormField" />; // Индикатор загрузки
  }

  // Формирование строки с ФИО выбранного пользователя
  const selectedUserName = users?.find(user => user.user_id === selectedUserId)
    ? `${users.find(user => user.user_id === selectedUserId)?.surname} ${
        users.find(user => user.user_id === selectedUserId)?.name
      } ${users.find(user => user.user_id === selectedUserId)?.patronymic}`
    : label;

  /**
   * Обработка и отображение различных состояний компонента.
   * 
   * @returns {JSX.Element | null} Элемент для отображения ошибки или пустого состояния.
   */
  const renderEmpty = () => {
    if (errorUsers) {
      return (
        <div className="ant-select-selection-placeholder" style={{ color: '#ff4d4f' }}>
          Ошибка загрузки пользователей
        </div>
      );
    }
    if (!users || users.length === 0) {
      return (
        <div className="ant-select-selection-placeholder">
          Пользователи не найдены
        </div>
      );
    }
    return null;
  };

  return (
    <div className="UserSelector">
      <Select
        value={selectedUserId ?? undefined}
        onChange={onChange}
        placeholder={selectedUserName}
        showSearch
        style={{ width: '100%' }}
        status={error ? 'error' : undefined}
        dropdownStyle={!users || users.length === 0 ? { display: 'none' } : undefined}
        notFoundContent={null}
      >
        {users?.map(user => (
          <Select.Option key={user.user_id} value={user.user_id}>
            {`${user.surname} ${user.name} ${user.patronymic}`}
          </Select.Option>
        ))}
      </Select>
      
      {/* Отображаем сообщение об ошибке или пустом состоянии внутри селектора */}
      {(!users || users.length === 0 || errorUsers) && (
        <div className="ant-select-selector" style={{ 
          cursor: 'not-allowed', 
          backgroundColor: '#f5f5f5',
          color: errorUsers ? '#ff4d4f' : 'inherit'
        }}>
          {renderEmpty()}
        </div>
      )}
    </div>
  );
}