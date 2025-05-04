import { useState, useMemo } from 'react';
import { Select, Input, Spin } from 'antd';
import { useGetUsersQuery } from 'Features/ApiSlices/userSlice';

interface UserSelectorProps {
    selectedUserId: number | null;
    onChange: (userId: number) => void;
    label: string;
}

export default function UserSelector({
    selectedUserId,
    onChange,
    label,
  }: UserSelectorProps): JSX.Element {
    const { data: users, isLoading, error } = useGetUsersQuery();
  
    if (isLoading) {
      return <Spin className="UserSelector FormField" />;
    }
  
    if (error || !users || users.length === 0) {
      return <div className="UserSelector FormField">Пользователи не найдены</div>;
    }
  
    const selectedUserName = users.find(user => user.user_id === selectedUserId)
      ? `${users.find(user => user.user_id === selectedUserId)?.surname} ${
          users.find(user => user.user_id === selectedUserId)?.name
        } ${users.find(user => user.user_id === selectedUserId)?.patronymic}`
      : label;
  
    return (
      <div className="UserSelector">
        <Select
          value={selectedUserId ?? undefined}
          onChange={onChange}
          placeholder={selectedUserName}
          showSearch
          style={{ width: '100%' }}
        >
          {users.map(user => (
            <Select.Option key={user.user_id} value={user.user_id}>
              {`${user.surname} ${user.name} ${user.patronymic}`}
            </Select.Option>
          ))}
        </Select>
      </div>
    );
}