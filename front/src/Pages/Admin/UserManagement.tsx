import React, { useState } from 'react';
import {
  useGetUsersQuery,
  useUpdateUserMutation,
} from 'Features/ApiSlices/userSlice';

export default function UserManagement(): JSX.Element {
  const { data: users, isLoading, isError } = useGetUsersQuery();
  const [updateUser, { isLoading: isUpdating }] = useUpdateUserMutation();

  const [editingUser, setEditingUser] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    telegram: '',
    email: '',
    name: '',
    surname: '',
    patronymic: '',
    course: '',
    university: '',
    vk: '',
    job: '',
    specialization: null,
  });

  const handleEditClick = (user: typeof formData & { id: number }) => {
    setEditingUser(user.id);
    setFormData({
      telegram: user.telegram,
      email: user.email,
      name: user.name,
      surname: user.surname,
      patronymic: user.patronymic || '',
      course: user.course,
      university: user.university,
      specialization: user.specialization,
      vk: user.vk,
      job: user.job,
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveClick = async () => {
    if (editingUser !== null) {
      await updateUser({ id: editingUser, data: formData });
      setEditingUser(null);
    }
  };

  return (
    <div>
      <h2>Управление пользователями</h2>
      {isLoading ? (
        <p>Загрузка...</p>
      ) : isError ? (
        <p>Ошибка при загрузке пользователей.</p>
      ) : (
        <ul>
          {users?.map((user) => (
            <li key={user.id}>
              {editingUser === user.id ? (
                <div>
                  <input
                    type="text"
                    name="telegram"
                    value={formData.telegram}
                    onChange={handleInputChange}
                    placeholder="Telegram"
                  />
                  <input
                    type="text"
                    name="vk"
                    value={formData.vk}
                    onChange={handleInputChange}
                    placeholder="Vk"
                  />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Email"
                  />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Имя"
                  />
                  <input
                    type="text"
                    name="surname"
                    value={formData.surname}
                    onChange={handleInputChange}
                    placeholder="Фамилия"
                  />
                  <input
                    type="text"
                    name="patronymic"
                    value={formData.patronymic}
                    onChange={handleInputChange}
                    placeholder="Отчество"
                  />
                  <input
                    type="text"
                    name="course"
                    value={formData.course}
                    onChange={handleInputChange}
                    placeholder="Курс"
                  />
                  <input
                    type="text"
                    name="university"
                    value={formData.university}
                    onChange={handleInputChange}
                    placeholder="Университет"
                  />
                  <input
                    type="text"
                    name="job"
                    value={formData.job}
                    onChange={handleInputChange}
                    placeholder="Место работы"
                  />
                  <button onClick={handleSaveClick} disabled={isUpdating}>
                    Сохранить
                  </button>
                </div>
              ) : (
                <div>
                  <p>
                    <strong>{user.name} {user.surname}</strong>
                  </p>
                  <p>Email: {user.email}</p>
                  <p>Telegram: {user.telegram}</p>
                  <p>Университет: {user.university}</p>
                  <button onClick={() => handleEditClick(user)}>Редактировать</button>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
