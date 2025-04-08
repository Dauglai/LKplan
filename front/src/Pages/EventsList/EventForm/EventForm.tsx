import { useDispatch, useSelector } from 'react-redux';
import { updateEvent, updateEventField } from 'Features/store/eventSetupSlice'; // Подключаем нужные экшены
import { useNavigate } from "react-router-dom";
import { RootState } from 'App/model/store'; // Импортируем тип RootState
import { useState, useEffect } from 'react';
import { Event } from 'Features/ApiSlices/eventSlice';
import SpecializationSelector from 'Widgets/Selectors/SpecializationSelector';
import StageSelector from 'Widgets/Selectors/StageSelector';
import UserSelector from 'Widgets/Selectors/UserSelector';
import DateRangePicker from 'Widgets/fields/DateRangePicker';
import ChevronRightIcon from 'assets/icons/chevron-right.svg?react';
import LinkIcon from 'assets/icons/link.svg?react'
import BackButton from 'Widgets/BackButton/BackButton';
import './EventForm.scss';

/**
 * Компонент формы для создания или редактирования мероприятия.
 * @param {Object} props - Свойства компонента.
 * @param {Event} [props.existingEvent] - Существующее мероприятие, если требуется редактировать.
 * @returns {JSX.Element} - Отображение формы для создания или редактирования мероприятия.
 */
export default function EventForm({
  existingEvent,
}: {
  existingEvent?: Event;
}): JSX.Element {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const eventState = useSelector((state: RootState) => state.event); // Получаем состояние события из store

  /**
   * Состояние для нового мероприятия.
   * @type {Object}
   */
  const [newEvent, setNewEvent] = useState({
    name: '',
    description: '',
    link: '',
    stage: 'Редактирование',
    start: '',
    end: '',
    specializations: [] as number[],
    statuses: [1] as number[],
    event_id: 0,
    supervisor: null,
  });

  /**
   * Эффект для инициализации данных существующего события, если они переданы.
   */
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
    } else {
      setNewEvent(eventState.stepEvent); // Заполняем форму из Redux, если нет существующего события
    }
  }, [existingEvent, eventState.stepEvent]);

  /**
   * Обработчик изменений для текстовых полей ввода.
   * @param {React.ChangeEvent<HTMLInputElement>} e - Событие изменения.
   */
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewEvent((prev) => ({
      ...prev,
      [name]: value,
    }));
    dispatch(updateEventField({ field: name as keyof Event, value }));
  };

  /**
   * Обработчик изменений для текстовых полей (textarea).
   * Автоматически изменяет высоту в зависимости от содержимого.
   * @param {React.ChangeEvent<HTMLTextAreaElement>} e - Событие изменения.
   */
  const handleTextArea = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const textarea = e.target;
    textarea.style.height = 'auto';
    textarea.style.height = `${textarea.scrollHeight}px`;

    setNewEvent((prev) => ({
      ...prev,
      [textarea.name]: textarea.value,
    }));
    dispatch(updateEventField({ field: textarea.name as keyof Event, value: textarea.value }));
  };

  /**
   * Обработчик изменений для выбора специализаций.
   * @param {number[]} selected - Выбранные специализации.
   */
  const handleSpecializationsChange = (selected: number[]) => {
    setNewEvent((prev) => ({
      ...prev,
      specializations: selected,
    }));
    dispatch(updateEventField({ field: 'specializations', value: selected }));
  };

  /**
   * Обработчик изменений для выбора статусов.
   * @param {number[]} selected - Выбранные статусы.
   */
  const handleStatusesChange = (selected: number[]) => {
    setNewEvent((prev) => ({
      ...prev,
      statuses: selected,
    }));
    dispatch(updateEventField({ field: 'statuses', value: selected }));
  };

  /**
   * Обработчик изменений для выбора стадии мероприятия.
   * @param {string} selected - Выбранная стадия.
   */
  const handleStageChange = (selected: string) => {
    setNewEvent((prev) => ({
      ...prev,
      stage: selected,
    }));
    dispatch(updateEventField({ field: 'stage', value: selected }));
  };

  /**
   * Обработчик изменений для выбора руководителя.
   * @param {number} selected - ID выбранного руководителя.
   */
  const handleSupervisorChange = (selected: number) => {
    setNewEvent((prev) => ({
      ...prev,
      supervisor: selected,
    }));
    dispatch(updateEventField({ field: 'supervisor', value: selected }));
  };

  /**
   * Обработчик изменений для выбора даты начала и окончания мероприятия.
   * @param {string} startDate - Дата начала мероприятия.
   * @param {string} endDate - Дата окончания мероприятия.
   */
  const handleDateChange = (startDate: string, endDate: string) => {
    setNewEvent((prev) => ({
      ...prev,
      start: startDate,
      end: endDate,
    }));
    dispatch(updateEventField({ field: 'start', value: startDate }));
    dispatch(updateEventField({ field: 'end', value: endDate }));
  };

  /**
   * Обработчик для перехода на следующий шаг (настройка направлений).
   */
  const handleNextStep = () => {
    navigate("/directions-setup")
  };

  return (
    <div className="FormContainer">
      <form className="EventForm Form">
        <div className="FormHeader">
          <BackButton />
          <h2>{existingEvent ? 'Редактирование мероприятия' : 'Добавление мероприятия'}</h2>
        </div>

        <div className="NameContainer">
          <input
            type="text"
            name="name"
            className="Name FormField"
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
            className="Description FormField"
          />
        </div>

        <SpecializationSelector
          selectedSpecializations={newEvent.specializations}
          onChange={handleSpecializationsChange}
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
          <button
            className="primary-btn"
            type="button"
            onClick={handleNextStep} // Переход к следующему шагу
          >
            Далее
            <ChevronRightIcon width="24" height="24" strokeWidth="1" />
          </button>
        </div>
      </form>
    </div>
  );
}

