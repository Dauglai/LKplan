import React, { useState } from 'react';
import {
  useGetApplicationsQuery,
  useCreateApplicationMutation,
  useUpdateApplicationMutation,
  useDeleteApplicationMutation,
} from 'Features/ApiSlices/applicationSlice';

export default function ApplicationManagement(): JSX.Element {
  const { data: applications, isLoading, isError } = useGetApplicationsQuery();
  const [createApplication, { isLoading: isCreating }] = useCreateApplicationMutation();
  const [updateApplication, { isLoading: isUpdating }] = useUpdateApplicationMutation();
  const [deleteApplication, { isLoading: isDeleting }] = useDeleteApplicationMutation();

  const [newApplication, setNewApplication] = useState({
    user: 0,
    project: 0,
    event: null,
    direction: null,
    specialization: null,
    team: null,
    message: '',
    dateTime: new Date(),
    status: 1,
    is_link: false,
    is_approved: false,
    comment: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewApplication((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCreateApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newApplication.message.trim()) {
      await createApplication(newApplication);
      setNewApplication({
        user: 0,
        project: 0,
        event: null,
        direction: null,
        specialization: null,
        team: null,
        message: '',
        dateTime: new Date(),
        status: 1,
        is_link: false,
        is_approved: false,
        comment: '',
      });
    }
  };

  const handleUpdateApplication = async (id: number) => {
    const updatedApplication = { ...newApplication, message: 'Updated message' }; // Пример обновления
    await updateApplication({ id, data: updatedApplication });
  };

  const handleDeleteApplication = async (id: number) => {
    await deleteApplication(id);
  };

  return (
    <div>
      <form onSubmit={handleCreateApplication}>
        <h3>Создать новую заявку</h3>
        <input
          type="number"
          name="user"
          value={newApplication.user}
          onChange={handleInputChange}
          placeholder="ID пользователя"
        />
        <input
          type="number"
          name="project"
          value={newApplication.project}
          onChange={handleInputChange}
          placeholder="ID проекта"
        />
        <textarea
          name="message"
          value={newApplication.message}
          onChange={handleInputChange}
          placeholder="Сообщение"
        />
        <input
          type="datetime-local"
          name="dateTime"
          value={newApplication.dateTime.toISOString().slice(0, 16)}
          onChange={(e) => setNewApplication({ ...newApplication, dateTime: new Date(e.target.value) })}
        />
        <button type="submit" disabled={isCreating}>
          Создать
        </button>
      </form>

      <h3>Список заявок</h3>
      {isLoading ? (
        <p>Загрузка...</p>
      ) : isError ? (
        <p>Ошибка при загрузке заявок.</p>
      ) : (
        <ul>
          {applications?.map((application) => (
            <li key={application.id}>
              <h4>Заявка ID: {application.id}</h4>
              <p>Проект ID: {application.project}</p>
              <p>Дата и время: {application.dateTime.toLocaleString()}</p>
              <p>Сообщение: {application.message}</p>
              <p>Статус: {application.status}</p>
              <p>Утверждено: {application.is_approved ? 'Да' : 'Нет'}</p>
              <button onClick={() => handleUpdateApplication(application.id)} disabled={isUpdating}>
                Обновить
              </button>
              <button onClick={() => handleDeleteApplication(application.id)} disabled={isDeleting}>
                Удалить
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
