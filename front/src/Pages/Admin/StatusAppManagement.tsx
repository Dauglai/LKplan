import { useState } from 'react';
import {
  useCreateStatusAppMutation,
  useGetStatusesAppQuery,
  useDeleteStatusAppMutation,
} from 'Features/ApiSlices/statusAppSlice';

export default function StatusAppManagement (): JSX.Element {
  const [createStatus, { isLoading: isCreating }] = useCreateStatusAppMutation();
  const { data: statusesApp, isLoading, isError } = useGetStatusesAppQuery();
  const [deleteStatus] = useDeleteStatusAppMutation();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const handleCreateStatus = async (e: React.FormEvent) => {
    e.preventDefault();

    if (name.trim() && description.trim()) {
      await createStatus({ name, description });
      setName('');
      setDescription('');
    }
  };

  const handleDeleteStatus = (id: number) => {
    deleteStatus(id);
  };

  return (
    <div>
      <form onSubmit={handleCreateStatus}>
        <h3>Создать новый статус</h3>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Название статуса"
          required
        />
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Описание статуса"
          required
        />
        <button type="submit" disabled={isCreating}>Создать</button>
      </form>

      <h3>Существующие статусы</h3>
      {isLoading ? (
        <p>Загрузка...</p>
      ) : isError ? (
        <p>Ошибка при загрузке статусов.</p>
      ) : (
        <ul>
          {statusesApp?.map((status) => (
            <li key={status.id}>
              <strong>{status.name}</strong>
              <p>{status.description}</p>
              <button onClick={() => handleDeleteStatus(status.id)}>
                Удалить
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
