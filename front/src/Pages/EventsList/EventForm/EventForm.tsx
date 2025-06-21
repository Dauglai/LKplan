import { useDispatch, useSelector } from 'react-redux';
import { updateEvent, 
      updateEventField,
      updateDirections,
      updateProjects,
      updateStatuses,
      setEditingEventId,
      resetEvent} from 'Features/store/eventSetupSlice'; // Подключаем нужные экшены
import { parse, format } from 'date-fns';
import { useNavigate } from "react-router-dom";
import { RootState } from 'App/model/store'; // Импортируем тип RootState
import { useEffect, useRef } from 'react';
import { Event, useGetEventByIdQuery } from 'Features/ApiSlices/eventSlice';
import { useParams } from 'react-router-dom';
import StageSelector from 'Components/Selectors/StageSelector';
import ChevronRightIcon from 'assets/icons/chevron-right.svg?react';
import BackButton from 'Components/Common/BackButton/BackButton';
import './EventForm.scss';
import NameInputField from 'Components/Forms/NameInputField';
import DescriptionInputField from 'Components/Forms/DescriptioninputField';
import DateInputField from 'Components/Forms/DateInputField';
import { Project, useGetProjectsQuery } from 'Features/ApiSlices/projectSlice';
import { Direction } from 'Features/ApiSlices/directionSlice';
import SideStepNavigator from 'Components/Sections/SideStepNavigator';
import { useNotification } from 'Components/Common/Notification/Notification';
import SpecializationField from 'Pages/CreateSpecialization/SpecializationField';
import { useGetStatusOrdersByEventQuery } from 'Features/ApiSlices/statusOrdersSlice';
import { StatusApp, useGetStatusesAppQuery } from 'Features/ApiSlices/statusAppSlice';

/**
 * Компонент формы для создания или редактирования мероприятия.
 * @returns {JSX.Element} - Отображение формы для создания или редактирования мероприятия.
 */
export default function EventForm(): JSX.Element {
  const dispatch = useDispatch();
  const { id } = useParams();
  const eventId = id ? Number(id) : null;
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const { stepEvent, editingEventId } = useSelector((state: RootState) => state.event);
  const { data: eventData, isSuccess: isEventSuccess } = useGetEventByIdQuery(eventId!, {
    skip: !eventId,
  });
  const { data: allProjects = [] } = useGetProjectsQuery();
  const { data: eventStatuses, isSuccess: isStatusesSuccess } = useGetStatusesAppQuery();
  const { data: eventStatusOrders, isSuccess: isStatusOrdersSuccess } = useGetStatusOrdersByEventQuery(eventId!, {
    skip: !eventId,
  });
  const hasInitialized = useRef(false);

  // Добавляем эффект для отслеживания загрузки статусов
  useEffect(() => {
    if (eventId && isStatusesSuccess && isStatusOrdersSuccess && eventStatuses && eventStatusOrders) {
      const sortedStatusOrders = [...eventStatusOrders]
        .sort((a, b) => a.number - b.number)
        .filter(order => order.event === eventId);

      const orderedStatuses = sortedStatusOrders
        .map(order => {
          const status = eventStatuses.find((s: StatusApp) => s.id === order.status);
          return status ? {
            id: status.id,
            name: status.name,
            description: status.description,
            is_positive: status.is_positive
          } : null;
        })
        .filter((status): status is StatusApp => status !== null);

      if (orderedStatuses.length > 0) {
        dispatch(updateStatuses(orderedStatuses));
      }
    }
  }, [eventId, isStatusesSuccess, isStatusOrdersSuccess, eventStatuses, eventStatusOrders, dispatch]);

  // Основной эффект для инициализации события
  useEffect(() => {
    if (eventId && isEventSuccess && eventData && !hasInitialized.current && allProjects.length > 0) {
      if (editingEventId === eventId) return;

      // 1. Форматируем основные данные мероприятия
      const formattedEventData = {
        ...eventData,
        start: formatDate(new Date(eventData.start)),
        end: formatDate(new Date(eventData.end)),
        end_app: formatDate(new Date(eventData.end_app)),
      };

      dispatch(updateEvent({
        name: formattedEventData.name || '',
        description: formattedEventData.description || '',
        stage: formattedEventData.stage || 'Редактирование',
        start: formattedEventData.start || '',
        end: formattedEventData.end || '',
        end_app: formattedEventData.end_app || '',
        specializations: formattedEventData.specializations || [],
      }));

      // 2. Обрабатываем направления
      const resultsDirections = eventData.directions.map((direction: any) => ({
        ...direction,
        leader_id: direction.leader,
        event: eventData.event_id,
        leader: undefined,
      }));
      dispatch(updateDirections(resultsDirections));

      // 3. Обрабатываем проекты
      const directionIds = eventData.directions.map((dir: Direction) => dir.id);
      const relatedProjects = allProjects.filter((project: Project) =>
        directionIds.includes(project.directionSet.id)
      );
      const resultsProjects = relatedProjects.map((project: any) => ({
        ...project,
        direction: project.directionSet.id,
        directionSet: undefined,
      }));
      dispatch(updateProjects(resultsProjects));

      // 5. Устанавливаем флаг редактирования
      dispatch(setEditingEventId(eventId));
      hasInitialized.current = true;
    } else if (!eventId && !stepEvent) {
      // Сброс состояния для нового мероприятия
      dispatch(updateEvent({
        name: '',
        description: '',
        stage: 'Редактирование',
        start: '',
        end: '',
        end_app: '',
        specializations: [],
      }));
      dispatch(updateDirections([]));
      dispatch(updateProjects([]));
      dispatch(updateStatuses([]));
    }
  }, [
    isEventSuccess, 
    eventData, 
    allProjects, 
    eventId, 
    dispatch,
    editingEventId,
    stepEvent
  ]);

  

  /**
   * Обработчик изменений для текстовых полей ввода.
   * @param {React.ChangeEvent<HTMLInputElement>} e - Событие изменения.
   */
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    dispatch(updateEventField({ field: name as keyof Event, value }));
  };

  /**
   * Обработчик изменений для текстовых полей (textarea).
   * Автоматически изменяет высоту в зависимости от содержимого.
   * @param {React.ChangeEvent<HTMLTextAreaElement>} e - Событие изменения.
   */
  const handleTextArea = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const textarea = e.target;
    dispatch(updateEventField({ field: textarea.name as keyof Event, value: textarea.value }));
  };

  /**
   * Обработчик изменений для выбора специализаций.
   * @param {number[]} selected - Выбранные специализации.
   */
  const handleSpecializationsChange = (selected: number[]) => {
    dispatch(updateEventField({ field: 'specializations', value: selected }));
  };

  /**
   * Обработчик изменений для выбора стадии мероприятия.
   * @param {string} selected - Выбранная стадия.
   */
  const handleStageChange = (selected: string) => {
    dispatch(updateEventField({ field: 'stage', value: selected }));
  };

  const formatDate = (date: Date) => {
    return date ? date.toISOString().slice(0, 10) : ''; // Преобразует в строку "YYYY-MM-DD"
  };

  const formatToServer = (dateStr: string) => {
    try {
      const parsed = parse(dateStr, 'dd.MM.yyyy', new Date());
      return format(parsed, 'yyyy-MM-dd');
    } catch (e) {
      return '';
    }
  };


  const handleStartDateChange = (startDate: string) => {
    dispatch(updateEventField({ field: 'start', value: formatToServer(startDate) }));
  };

  const handleEndDateChange = (endDate: string) => {
    const formattedDate = formatToServer(endDate);
    dispatch(updateEventField({ field: 'end', value: formattedDate }));
    
    // Если дата окончания раньше даты приёма заявок - сбрасываем дату приёма
    if (stepEvent.end_app && new Date(formattedDate) < new Date(stepEvent.end_app)) {
      dispatch(updateEventField({ field: 'end_app', value: '' }));
      showNotification('Дата завершения мероприятия должна быть позже даты окончания приёма заявок', 'error');
    }
  };

  const handleEndAppDateChange = (endAppDate: string) => {
    const formattedDate = formatToServer(endAppDate);
    
    // Проверяем, что дата приёма заявок не позже даты окончания
    if (stepEvent.end && new Date(formattedDate) > new Date(stepEvent.end)) {
      // Можно показать ошибку или просто не обновлять значение
      showNotification('Дата окончания приёма заявок должна быть раньше даты завершения мероприятия', 'error');
      return;
    }
    
    dispatch(updateEventField({ field: 'end_app', value: formattedDate }));
  };


  /**
   * Обработчик для перехода на следующий шаг (настройка направлений).
   */
  const handleNextStep = () => {
    navigate("/directions-setup")
  };

  return (
    <div className="SetupContainer">
      <SideStepNavigator />
      <div className="FormContainer">
        <div className="FormHeader">
            <BackButton onClick={() => dispatch(resetEvent())}/>
            <h2>{isEventSuccess ? 'Редактирование мероприятия' : 'Добавление мероприятия'}</h2>
          </div>
          
        <form className="EventForm Form">

          <div className="NameContainer">
            <NameInputField
              name="name"
              value={stepEvent.name}
              onChange={handleInputChange}
              placeholder="Название мероприятия"
              required
            />
            <DescriptionInputField
              name="description"
              value={stepEvent.description}
              onChange={handleTextArea}
              placeholder="Описание мероприятия"
            />
          </div>

          <SpecializationField
            selectedSpecializations={stepEvent.specializations}
            onChange={handleSpecializationsChange}
          />

          <StageSelector
            selectedStage={stepEvent.stage}
            onChange={handleStageChange}
          />

          <div className='DateRangeContainer'>
            <DateInputField
              name="start"
              value={stepEvent.start}
              onChange={handleStartDateChange}
              placeholder="Дата начала"
              required
              withPlaceholder={true}
            />

            <DateInputField
              name="end"
              value={stepEvent.end}
              onChange={handleEndDateChange}
              placeholder="Дата завершения"
              required
              withPlaceholder={true}
              minDate={stepEvent.end_app ? new Date(stepEvent.end_app) : undefined}
            />

            <DateInputField
              name="end_app"
              value={stepEvent.end_app}
              onChange={handleEndAppDateChange}
              placeholder="Срок приема заявок"
              required
              withPlaceholder={true}
              maxDate={stepEvent.end ? new Date(stepEvent.end) : undefined}
            />
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
    </div>
  );
}

