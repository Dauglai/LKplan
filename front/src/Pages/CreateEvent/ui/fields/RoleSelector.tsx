import { useState } from 'react';
import ChevronRightIcon from 'assets/icons/chevron-right.svg?react';
import { User, mockUsers } from "../mockUsers"

import './RoleSelector.scss'


export default function RoleSelector({
    role }: {
    role: 'Руководитель' | 'Куратор' | 'Проектант';
    }): JSX.Element {
  const [isOpen, setIsOpen] = useState(false);
  const [users, setUsers] = useState(mockUsers)
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const handleSelectUser = (user: User) => {
    setSelectedUser(user);
    setIsOpen(false);
  };

  const filteredUsers = users.filter(user => user.role === role);
  return (
    <div
    className='ListField EventFormField'
    onClick={() => setIsOpen(prev => !prev)}>
      <p>{selectedUser ? `${selectedUser.lastName} ${selectedUser.firstName} ${selectedUser.patronymic}` : role}</p>
      <ChevronRightIcon width="20" height="20" strokeWidth="1" className={`ChevronDown ${isOpen ? 'open' : ''}`} />

      {isOpen && (
        <div className="DropdownList">
          {filteredUsers.map(user => (
            <div key={user.id}
            className="DropdownItem"
            onClick={() => handleSelectUser(user)}>
               {user.lastName} {user.firstName} {user.patronymic}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}