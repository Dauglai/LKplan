import { Select, Input, Spin } from 'antd';
import { useGetUsersQuery } from 'Features/ApiSlices/userSlice';

interface UserSelectorProps {
    selectedUserId: number | null;
    onChange: (userId: number) => void;
    label: string;
    error?: string;
}

export default function UserSelector({
  selectedUserId,
  onChange,
  label,
  error
}: UserSelectorProps): JSX.Element {
  const { data: users, isLoading, errorUsers } = useGetUsersQuery();

  if (isLoading) {
    return <Spin className="UserSelector FormField" />;
  }

  const selectedUserName = users?.find(user => user.user_id === selectedUserId)
    ? `${users.find(user => user.user_id === selectedUserId)?.surname} ${
        users.find(user => user.user_id === selectedUserId)?.name
      } ${users.find(user => user.user_id === selectedUserId)?.patronymic}`
    : label;

  // Обработка ошибок и пустого состояния
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