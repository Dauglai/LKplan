import { useState, useMemo } from 'react';
import { useGetUsersQuery } from 'Features/ApiSlices/userSlice';
import ChevronRightIcon from 'assets/icons/chevron-right.svg?react';

interface UserSelectorProps {
    selectedUserId: number | null;
    onChange: (userId: number) => void;
}

export default function UserSelector({
    selectedUserId,
    onChange,
}: UserSelectorProps): JSX.Element {
    const { data: users, isLoading, error } = useGetUsersQuery();
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState('');

    const filteredUsers = useMemo(() => {
        if (!users) return [];
        const normalizedSearch = search.toLowerCase();
        console.log(users);
        return users.filter(user =>
        `${user.surname} ${user.name} ${user.patronymic}`
            .toLowerCase()
            .includes(normalizedSearch)
        );
    }, [users, search]);

    const handleSelectUser = (userId: number) => {
        onChange(userId);
        setIsOpen(false);
    };

    if (isLoading) {
        return <div className="UserSelector FormField">Загрузка пользователей...</div>;
    }

    if (error || !users || users.length === 0) {
        return <div className="UserSelector FormField">Пользователи не найдены</div>;
    }

    const selectedUserName =
        users.find(user => user.user_id === selectedUserId)
        ? `${users.find(user => user.user_id === selectedUserId)?.surname} ${
            users.find(user => user.user_id === selectedUserId)?.name
            } ${users.find(user => user.user_id === selectedUserId)?.patronymic}`
        : 'Выбрать пользователя*';

    return (
    <div className="UserSelector">
        <div
        className="ListField FormField"
        onClick={() => setIsOpen(prev => !prev)}
        >
        <p>{selectedUserName}</p>
        <ChevronRightIcon
            width="20"
            height="20"
            strokeWidth="1"
            className={`ChevronDown ${isOpen ? 'open' : ''}`}
        />

        {isOpen && (
            <div
            className="DropdownList"
            onClick={e => e.stopPropagation()} // Остановить всплытие события
            >
            <input
                type="text"
                className="SearchField FormField"
                placeholder="Поиск по ФИО..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                onClick={e => e.stopPropagation()} // Остановить всплытие события для поля ввода
            />
            {filteredUsers.map(user => (
                <div
                key={user.user_id}
                className={`DropdownItem ${
                    selectedUserId === user.user_id ? 'selected' : ''
                }`}
                onClick={() => handleSelectUser(user.user_id)}
                >
                {`${user.surname} ${user.name} ${user.patronymic}`}
                </div>
            ))}
            </div>
        )}
        </div>
    </div>
    );
}