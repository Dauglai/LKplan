import React, { useState } from 'react';
import {
  useGetDirectionsQuery,
  useCreateDirectionMutation,
  useDeleteDirectionMutation,
} from 'Features/ApiSlices/directionSlice';

export default function DirectionManagement(): JSX.Element {
  const { data: directions, isLoading, isError } = useGetDirectionsQuery();
  const [createDirection, { isLoading: isCreating }] = useCreateDirectionMutation();
  const [deleteDirection, { isLoading: isDeleting }] = useDeleteDirectionMutation();

  const [newDirection, setNewDirection] = useState({
    event: 0,
    name: '',
    description: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewDirection((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCreateDirection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newDirection.name.trim()) {
      await createDirection(newDirection);
      setNewDirection({ event: 0, name: '', description: '' });
    }
  };

  const handleDeleteDirection = async (id: number) => {
    await deleteDirection(id);
  };

  return (
    <div>
      <form onSubmit={handleCreateDirection}>
        <h3>Создать новое направление</h3>
        <input
          type="number"
          name="event"
          value={newDirection.event}
          onChange={handleInputChange}
          placeholder="ID мероприятия"
        />
        <input
          type="text"
          name="name"
          value={newDirection.name}
          onChange={handleInputChange}
          placeholder="Название направления"
        />
        <textarea
          name="description"
          value={newDirection.description}
          onChange={handleInputChange}
          placeholder="Описание (опционально)"
        />
        <button type="submit" disabled={isCreating}>
          Создать
        </button>
      </form>

      <h3>Список направлений</h3>
      {isLoading ? (
        <p>Загрузка...</p>
      ) : isError ? (
        <p>Ошибка при загрузке направлений.</p>
      ) : (
        <ul>
          {directions?.map((direction) => (
            <li key={direction.id}>
              <h4>{direction.name}</h4>
              <p>Описание: {direction.description || 'Нет описания'}</p>
              <p>Мероприятие ID: {direction.event}</p>
              <button
                onClick={() => handleDeleteDirection(direction.id)}
                disabled={isDeleting}
              >
                Удалить
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
