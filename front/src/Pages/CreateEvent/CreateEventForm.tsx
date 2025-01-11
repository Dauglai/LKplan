import { useState } from 'react';
import axios from 'axios';
import CreateEventHeader from 'Widgets/CreateFormHeader/CreateFormHeader';
import DateRangePicker from 'Widgets/fields/DateRangePicker';
import SubmitButtons from 'Widgets/buttons/SubmitButtons';
import RoleSelector from 'Widgets/fields/RoleSelector';
import DirectionSelector from 'Widgets/fields/DirectionSelector';
import { baseURL } from 'App/config/api';

import PlusIcon from 'assets/icons/plus.svg?react';
import LinkIcon from 'assets/icons/link.svg?react';
import ChevronRightIcon from 'assets/icons/chevron-right.svg?react';
import UsersIcon from 'assets/icons/users.svg?react';
import TrashIcon from 'assets/icons/trash-2.svg?react';

import {
  useGetEventsQuery,
  useCreateEventMutation,
  useUpdateEventMutation,
  useDeleteEventMutation,
} from 'Features/ApiSlices/eventSlice';

import 'Styles/CreateFormStyle.scss';
import './CreateEventForm.scss';

export default function CreateEventForm(): JSX.Element {
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

  const handleTextAtea = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const textarea = e.target;
    textarea.style.height = 'auto';
    textarea.style.height = `${textarea.scrollHeight}px`;

    handleInputChange(e);
  };

  console.log(events)
  return (
    <div className="CreateContainer">
    <div className="CreateFormContainer">
      <form className="CreateEventForm CreateForm" onSubmit={handleCreateEvent}>
        <CreateEventHeader label="Добавление мероприятия" />
        <div className="CreateNameContainer">
          <input
            type="text"
            name="name"
            value={newEvent.name}
            onChange={handleInputChange}
            required
            placeholder="Название мероприятия"
            className="CreateName TextField FormField"
          />
          <textarea
            placeholder="Описание мероприятия"
            className="CreateDescription TextField FormField"
            name="description"
            value={newEvent.description}
            onInput={handleTextAtea}
          />
        </div>

        {/*<RoleSelector role="Руководитель" onChange={handleSupervisorChange} />

        <DirectionSelector
          selectedDirections={formData.directions}
          onChange={handleDirectionsChange}
        />

        <DateRangePicker
          startDate={newEvent.start}
          endDate={newEvent.end}
          onChange={handleDatesChange}
        />*/}

        <input
          type="text"
          name="specializations"
          value={newEvent.specializations.join(', ')}
          onChange={handleInputChange}
          placeholder="ID специализаций через запятую"
          className='FormField'
        />
        <input
          type="number"
          name="supervisor"
          value={newEvent.supervisor}
          onChange={handleInputChange}
          placeholder="ID руководителя"
          className='FormField'
        />
        <input
          type="number"
          name="creator"
          value={newEvent.creator}
          onChange={handleInputChange}
          placeholder="ID создателя"
          className='FormField'
        />
        <input
          type="text"
          name="statuses"
          value={newEvent.statuses.join(', ')}
          onChange={handleInputChange}
          placeholder="ID статусов через запятую"
          className='FormField'
        />
        <input
          type="text"
          name="stage"
          value={newEvent.stage}
          onChange={handleInputChange}
          placeholder="Этап мероприятия"
          className='FormField'
        />

        <div className="LinkField FormField">
          <input
            type="text"
            placeholder="Ссылка на орг. чат"
            className="LinkInput"
            name="link"
            value={newEvent.link}
            onChange={handleInputChange}
          />
          <LinkIcon width="16" height="16" strokeWidth="1" />
        </div>

        <SubmitButtons label="Создать" />
      </form>
    </div>


    <div className="ListResults">
      <h3>Список мероприятий</h3>
        {isLoading ? (
          <p>Загрузка...</p>
        ) : isError ? (
          <p>Ошибка при загрузке мероприятий.</p>
        ) : (
          <ul>
            {events?.map((event) => (
              <li key={event.id}>
                <div>
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
                </div>
                <button 
                  className="DeleteButton lfp-btn"
                  onClick={() => handleDeleteEvent(event.id)}
                  disabled={isDeleting}>
                  <TrashIcon width="20" height="20" strokeWidth="2"/>
                </button>
              </li>
            ))}
          </ul>
        )}
    </div>
    </div>
  );
}
