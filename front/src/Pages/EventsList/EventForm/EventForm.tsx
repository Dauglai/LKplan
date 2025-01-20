import React, { useState, useEffect } from 'react';
import { Event, useCreateEventMutation, useUpdateEventMutation } from 'Features/ApiSlices/eventSlice';
import { useGetUserQuery } from 'Features/ApiSlices/userSlice';
import SpecializationSelector from 'Widgets/Selectors/SpecializationSelector';
import StatusAppSelector from 'Widgets/Selectors/StatusAppSelector';
import StageSelector from 'Widgets/Selectors/StageSelector';
import ChevronRightIcon from 'assets/icons/chevron-right.svg?react';
import DateRangePicker from 'Widgets/fields/DateRangePicker';
import UserSelector from 'Widgets/Selectors/UserSelector';
import './EventForm.scss';
import 'Styles/FormStyle.scss';
import LinkIcon from 'assets/icons/link.svg?react';
import CloseIcon from 'assets/icons/close.svg?react';
import { useNotification } from 'Widgets/Notification/Notification';

export default function EventForm({ 
  closeModal,
  existingEvent,
}: {
  closeModal: () => void;
  existingEvent?: Event;
}): JSX.Element {
  const { data: user } = useGetUserQuery();
  const [createEvent, { isLoading: isCreating }] = useCreateEventMutation();
  const [updateEvent, { isLoading: isUpdating }] = useUpdateEventMutation();
  const { showNotification } = useNotification();

  const [newEvent, setNewEvent] = useState({
    name: '',
    description: '',
    link: '',
    stage: 'Редактирование',
    start: '',
    end: '',
    specializations: [] as number[],
    statuses: [] as number[],
    event_id: 0,
    supervisor: null,
  });

  useEffect(() => {
    if (existingEvent) {
      setNewEvent({
        event_id: existingEvent.event_id,
        name: existingEvent.name,
        description: existingEvent.description,
        link: existingEvent.link,
        stage: existingEvent.stage,
        start: existingEvent.start ? new Date(existingEvent.start).toISOString().split('T')[0] : '',
        end: existingEvent.end ? new Date(existingEvent.end).toISOString().split('T')[0] : '',
        specializations: existingEvent.specializations,
        statuses: existingEvent.statuses,
        supervisor: existingEvent.supervisor,
        creator: existingEvent.creator
      });
    }
  }, [existingEvent]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewEvent((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleTextArea = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const textarea = e.target;
    textarea.style.height = 'auto';
    textarea.style.height = `${textarea.scrollHeight}px`;

    setNewEvent((prev) => ({
      ...prev,
      [textarea.name]: textarea.value,
    }));
  };

  const handleSpecializationsChange = (selected: number[]) => {
    setNewEvent((prev) => ({
      ...prev,
      specializations: selected,
    }));
  };

  const handleStatusesChange = (selected: number[]) => {
    setNewEvent((prev) => ({
      ...prev,
      statuses: selected,
    }));
  };

  const handleStageChange = (selected: string) => {
    setNewEvent((prev) => ({
      ...prev,
      stage: selected,
    }));
  };

  const handleSupervisorChange = (selected: number) => {
    setNewEvent((prev) => ({
      ...prev,
      supervisor: selected,
    }));
  };

  const handleDateChange = (startDate: string, endDate: string) => {
    setNewEvent((prev) => ({
      ...prev,
      start: startDate,
      end: endDate,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      console.error('Пользователь не найден');
      return;
    }

    const eventData = {
      ...newEvent,
      creator: user.user_id,
    };

    try {
      await createEvent(eventData).unwrap();
      setNewEvent({
        name: '',
        description: '',
        link: '',
        stage: 'Редактирование',
        start: '',
        end: '',
        specializations: [],
        statuses: [],
        event_id: 0,
      });
      showNotification('Мероприятие создано!', 'success');
      closeModal();
    } catch (error) {
      console.error('Ошибка при создании мероприятия:', error);
      showNotification(`Ошибка при создании мероприятия: ${error.status} ${error.data.stage}`, 'error');
    }
  };

  const handleUpdateEvent = async (e: React.FormEvent) => {
    e.preventDefault();

    console.log(newEvent)
    if (newEvent.name.trim()) {
      try {
        await updateEvent({ id: newEvent.event_id, data: newEvent }).unwrap();
        showNotification('Мероприятие обновлено!', 'success');
        closeModal();
      } catch (error) {
        showNotification(`Ошибка при обновлении мероприятия: ${error.status} ${error.stage}`, 'error');
      }
    } else {
      showNotification('Пожалуйста, заполните все поля!', 'error');
    }
  };
  

  return (
    <div className="FormContainer">
      <form className="EventForm Form" 
        onSubmit={existingEvent ? handleUpdateEvent : handleSubmit}>
        <div className="ModalFormHeader">
          <h2>{existingEvent ? 'Редактирование мероприятия' : 'Добавление мероприятия'}</h2>
          <CloseIcon width="24" height="24" strokeWidth="1" onClick={closeModal} className="ModalCloseButton"/>
        </div>

        <div className="NameContainer">
          <input
            type="text"
            name="name"
            className='Name FormField'
            value={newEvent.name}
            onChange={handleInputChange}
            required
            placeholder="Название мероприятия*"
          />
          <textarea
            name="description"
            value={newEvent.description}
            onChange={handleTextArea}
            placeholder="Описание мероприятия"
            className='Description FormField'
          />
        </div>

        <SpecializationSelector
          selectedSpecializations={newEvent.specializations}
          onChange={handleSpecializationsChange}
        />
        <StatusAppSelector
          selectedStatusesApp={newEvent.statuses}
          onChange={handleStatusesChange}
        />

        <StageSelector
          selectedStage={newEvent.stage}
          onChange={handleStageChange}
        />

        <UserSelector
          selectedUserId={newEvent.supervisor}
          onChange={handleSupervisorChange}
        />

        <DateRangePicker
          startDate={newEvent.start}
          endDate={newEvent.end}
          onChange={handleDateChange}
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

        <div className="FormButtons">
          <button className="primary-btn" type="submit" disabled={isCreating || isUpdating}>
            {existingEvent ? 'Обновить' : 'Создать'}
            <ChevronRightIcon width="24" height="24" strokeWidth="1" />
          </button>
        </div>
      </form>
    </div>
  );
}
