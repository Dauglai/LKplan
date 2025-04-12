import { useDispatch, useSelector } from 'react-redux';
import { updateEvent, updateEventField } from 'Features/store/eventSetupSlice'; // Подключаем нужные экшены
import { useNavigate } from "react-router-dom";
import { RootState } from 'App/model/store'; // Импортируем тип RootState
import { useState, useEffect } from 'react';
import { Event } from 'Features/ApiSlices/eventSlice';
import SpecializationSelector from 'Widgets/Selectors/SpecializationSelector';
import StageSelector from 'Widgets/Selectors/StageSelector';
import UserSelector from 'Widgets/Selectors/UserSelector';
import ChevronRightIcon from 'assets/icons/chevron-right.svg?react';
import LinkIcon from 'assets/icons/link.svg?react'
import BackButton from 'Widgets/BackButton/BackButton';
import './EventForm.scss';
import NameInputField from 'Components/Forms/NameInputField';
import DescriptionInputField from 'Components/Forms/DescriptioninputField';
import DateInputField from 'Components/Forms/DateInputField';

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
    end_app: '',
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
        stage: existingEvent.stage,
        start: existingEvent.start ? new Date(existingEvent.start).toISOString().split('T')[0] : '',
        end: existingEvent.end ? new Date(existingEvent.end).toISOString().split('T')[0] : '',
        end_app: existingEvent.end_app ? new Date(existingEvent.end_app).toISOString().split('T')[0] : '',
        specializations: existingEvent.s,
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


  const handleStartDateChange = (startDate: string) => {
    setNewEvent((prev) => ({
      ...prev,
      start: startDate,
    }));
    dispatch(updateEventField({ field: 'start', value: startDate }));
  };

  const handleEndDateChange = (endDate: string) => {
    setNewEvent((prev) => ({
      ...prev,
      end: endDate, 
    }));
    dispatch(updateEventField({ field: 'end', value: endDate }));
  };

  const handleEndAppDateChange = (endAppDate: string) => {
    setNewEvent((prev) => ({
      ...prev,
      end_app: endAppDate, // Обновляем только end
    }));
    dispatch(updateEventField({ field: 'end_app', value: endAppDate }));
  };


  /**
   * Обработчик для перехода на следующий шаг (настройка направлений).
   */
  const handleNextStep = () => {
    navigate("/directions-setup")
  };

  return (
    <div className="FormContainer">
      <div className="FormHeader">
          <BackButton />
          <h2>{existingEvent ? 'Редактирование мероприятия' : 'Добавление мероприятия'}</h2>
        </div>
        
      <form className="EventForm Form">

        <div className="NameContainer">
          {/*<NameInputField
            name="name"
            value={newEvent.name}
            onChange={handleInputChange}
            placeholder="Название мероприятия"
            required
          />*/}

          <input 
            name="name"
            value={newEvent.name}
            onChange={handleInputChange}
            placeholder="Название мероприятия *"
            required
            className="Name FormField"
          />
          <textarea
            name="description"
            value={newEvent.description}
            onChange={handleTextArea}
            placeholder="Описание мероприятия"
            className="Description FormField"
          />
          {/*<DescriptionInputField
            name="description"
            value={newEvent.description}
            onChange={handleTextArea}
            placeholder="Описание мероприятия"
          />*/}
        </div>

        <SpecializationSelector
          selectedSpecializations={newEvent.specializations}
          onChange={handleSpecializationsChange}
        />

        <StageSelector
          selectedStage={newEvent.stage}
          onChange={handleStageChange}
        />

        <div className='DateRangeContainer'>
          <DateInputField
            name="start"
            value={newEvent.start}
            onChange={handleStartDateChange}
            placeholder="Дата начала"
            required
            withPlaceholder={true}
          />

          <DateInputField
            name="end"
            value={newEvent.end}
            onChange={handleEndDateChange}
            placeholder="Дата завершения"
            required
            withPlaceholder={true}
          />

          <DateInputField
            name="end_app"
            value={newEvent.end_app}
            onChange={handleEndAppDateChange}
            placeholder="Срок приема заявок"
            required
            withPlaceholder={true}
          />
        </div>

        <div className="FormButtons">
          <button
            className="primary-btn"
            type="button"
            onClick={handleNextStep} // Переход к следующему шагу
          >
            Настройка направлений
            <ChevronRightIcon width="24" height="24" strokeWidth="1" />
          </button>
        </div>
      </form>
    </div>
  );
}

