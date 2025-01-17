import React, { useState } from 'react';
import { useCreateEventMutation } from 'Features/ApiSlices/eventSlice';
import { useGetUserQuery } from 'Features/ApiSlices/userSlice';
import SpecializationSelector from 'Widgets/Selectors/SpecializationSelector';
import StatusAppSelector from 'Widgets/Selectors/StatusAppSelector';
import StageSelector from 'Widgets/Selectors/StageSelector';
import ChevronRightIcon from 'assets/icons/chevron-right.svg?react';
import './CreateEventForm.scss';
import 'Styles/CreateFormStyle.scss';
import LinkIcon from 'assets/icons/link.svg?react';
import CloseIcon from 'assets/icons/close.svg?react';
import { useNotification } from 'Widgets/Notification/Notification';

export default function CreateEventForm({ closeModal }: { closeModal: () => void }): JSX.Element {
  const { data: user } = useGetUserQuery();
  const [createEvent] = useCreateEventMutation();
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
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewEvent((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleTextAtea = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      console.error('Пользователь не найден');
      return;
    }

    const eventData = {
      ...newEvent,
      start: newEvent.start ? new Date(newEvent.start).toISOString().split('T')[0] : null,
      end: newEvent.end ? new Date(newEvent.end).toISOString().split('T')[0] : null,
      creator: user.user_id,
      supervisor: user.user_id,
      user: user.user_id,
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
      });
      showNotification('Мероприятие создано!', 'success');
      closeModal();
    } catch (error) {
      console.error('Ошибка при создании мероприятия:', error);
      showNotification(`Ошибка при создании мероприятия: ${error.status} ${error.data.stage}`, 'error');
    }
  };

  return (
    <div className="CreateFormContainer">
      <form className="CreateEventForm CreateForm" onSubmit={handleSubmit}>
        <div className="ModalFormHeader">
          <h2>Добавление мероприятия</h2>
          <CloseIcon width="24" height="24" strokeWidth="1" onClick={closeModal} className="ModalCloseButton"/>
        </div>
        <div className="CreateNameContainer">
          <input
            type="text"
            name="name"
            className='CreateName FormField'
            value={newEvent.name}
            onChange={handleInputChange}
            required
            placeholder="Название мероприятия"
          />
          <textarea
            name="description"
            value={newEvent.description}
            onChange={handleTextAtea}
            placeholder="Описание мероприятия"
            className='CreateDescription FormField'
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
        <div>
        
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

          <input
            type="date"
            name="start"
            value={newEvent.start}
            onChange={handleInputChange}
            placeholder="Дата начала"
            className='FormField'
          />
          <input
            type="date"
            name="end"
            value={newEvent.end}
            onChange={handleInputChange}
            placeholder="Дата окончания"
            className='FormField'
          />

          <StageSelector
            selectedStage={newEvent.stage}
            onChange={handleStageChange}
          />
        </div>
        <div className="FormButtons">
          <button className="primary-btn" type="submit">
            Создать
            <ChevronRightIcon width="24" height="24" strokeWidth="1"/>
          </button>
        </div>
      </form>
    </div>
  );
}
