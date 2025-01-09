import React, { useState } from 'react';
import {
  useGetEventsQuery,
  useCreateEventMutation,
  useUpdateEventMutation,
  useDeleteEventMutation,
} from 'Features/ApiSlices/eventSlice';

export default function EventManagement(): JSX.Element {
  const { data: events, isLoading, isError } = useGetEventsQuery();
  const [createEvent, { isLoading: isCreating }] = useCreateEventMutation();
  const [updateEvent, { isLoading: isUpdating }] = useUpdateEventMutation();
  const [deleteEvent, { isLoading: isDeleting }] = useDeleteEventMutation();

  const [newEvent, setNewEvent] = useState({
    name: '',
    specializations: [] as number[],
    statuses: [] as number[],
    description: '',
    link: '',
    start: '',
    end: '',
    supervisor: 0,
    creator: 0,
    stage: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewEvent((prev) => ({
      ...prev,
      [name]: name === 'specializations' || name === 'statuses'
        ? value.split(',').map(Number)
        : value,
    }));
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newEvent.name.trim()) {
      await createEvent({
        ...newEvent,
        start: newEvent.start ? new Date(newEvent.start) : null,
        end: newEvent.end ? new Date(newEvent.end) : null,
      });
      setNewEvent({
        name: '',
        specializations: [],
        statuses: [],
        description: '',
        link: '',
        start: '',
        end: '',
        supervisor: 0,
        creator: 0,
        stage: '',
      });
    }
  };

  const handleDeleteEvent = async (id: number) => {
    await deleteEvent(id);
  };

  return (
    <div>
      <form onSubmit={handleCreateEvent}>
        <h3>Создать новое мероприятие</h3>
        <input
          type="text"
          name="name"
          value={newEvent.name}
          onChange={handleInputChange}
          placeholder="Название мероприятия"
        />
        <input
          type="text"
          name="specializations"
          value={newEvent.specializations.join(', ')}
          onChange={handleInputChange}
          placeholder="ID специализаций через запятую"
        />
        <input
          type="text"
          name="statuses"
          value={newEvent.statuses.join(', ')}
          onChange={handleInputChange}
          placeholder="ID статусов через запятую"
        />
        <textarea
          name="description"
          value={newEvent.description}
          onChange={handleInputChange}
          placeholder="Описание"
        />
        <input
          type="text"
          name="link"
          value={newEvent.link}
          onChange={handleInputChange}
          placeholder="Ссылка (опционально)"
        />
        <input
          type="datetime-local"
          name="start"
          value={newEvent.start}
          onChange={handleInputChange}
          placeholder="Дата начала"
        />
        <input
          type="datetime-local"
          name="end"
          value={newEvent.end}
          onChange={handleInputChange}
          placeholder="Дата окончания"
        />
        <input
          type="number"
          name="supervisor"
          value={newEvent.supervisor}
          onChange={handleInputChange}
          placeholder="ID руководителя"
        />
        <input
          type="number"
          name="creator"
          value={newEvent.creator}
          onChange={handleInputChange}
          placeholder="ID создателя"
        />
        <input
          type="text"
          name="stage"
          value={newEvent.stage}
          onChange={handleInputChange}
          placeholder="Этап мероприятия"
        />
        <button type="submit" disabled={isCreating}>
          Создать
        </button>
      </form>

      <h3>Список мероприятий</h3>
      {isLoading ? (
        <p>Загрузка...</p>
      ) : isError ? (
        <p>Ошибка при загрузке мероприятий.</p>
      ) : (
        <ul>
          {events?.map((event) => (
            <li key={event.id}>
              <h4>{event.name}</h4>
              <p>Описание: {event.description || 'Нет описания'}</p>
              <p>Специализации: {event.specializations.join(', ') || 'Нет'}</p>
              <p>Статусы: {event.statuses.join(', ') || 'Нет'}</p>
              <p>Ссылка: {event.link || 'Нет ссылки'}</p>
              <p>Начало: {event.start ? event.start.toLocaleString() : 'Не указано'}</p>
              <p>Окончание: {event.end ? event.end.toLocaleString() : 'Не указано'}</p>
              <p>Руководитель: {event.supervisor}</p>
              <p>Создатель: {event.creator}</p>
              <p>Этап: {event.stage}</p>
              <button
                onClick={() => handleDeleteEvent(event.id)}
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

    
