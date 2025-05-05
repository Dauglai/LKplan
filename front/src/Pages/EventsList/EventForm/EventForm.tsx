import { useDispatch, useSelector } from 'react-redux';
import { updateEvent, 
      updateEventField,
      updateDirections,
      updateProjects,
      setEditingEventId,
      resetEvent} from 'Features/store/eventSetupSlice'; // Подключаем нужные экшены
import { parse, format } from 'date-fns';
import { useNavigate } from "react-router-dom";
import { RootState } from 'App/model/store'; // Импортируем тип RootState
import { useEffect, useRef } from 'react';
import { Event, useGetEventByIdQuery } from 'Features/ApiSlices/eventSlice';
import { useParams } from 'react-router-dom';
import SpecializationSelector from 'Components/Selectors/SpecializationSelector';
import StageSelector from 'Components/Selectors/StageSelector';
import ChevronRightIcon from 'assets/icons/chevron-right.svg?react';
import LinkIcon from 'assets/icons/link.svg?react'
import BackButton from 'Components/Common/BackButton/BackButton';
import './EventForm.scss';
import NameInputField from 'Components/Forms/NameInputField';
import DescriptionInputField from 'Components/Forms/DescriptioninputField';
import DateInputField from 'Components/Forms/DateInputField';
import { Project, useGetProjectsQuery } from 'Features/ApiSlices/projectSlice';
import { Direction } from 'Features/ApiSlices/directionSlice';
import SideStepNavigator from 'Components/Sections/SideStepNavigator';

/**
 * Компонент формы для создания или редактирования мероприятия.
 * @returns {JSX.Element} - Отображение формы для создания или редактирования мероприятия.
 */
export default function EventForm(): JSX.Element {
  const dispatch = useDispatch();
  const { id } = useParams();
  const eventId = id ? Number(id) : null;
  const navigate = useNavigate();
  const { stepEvent, editingEventId } = useSelector((state: RootState) => state.event);
  const { data: eventData, isSuccess: isEventSuccess } = useGetEventByIdQuery(eventId!, {
    skip: !eventId,
  });
  const { data: allProjects = [] } = useGetProjectsQuery();
  const hasInitialized = useRef(false);


  useEffect(() => {
    if (eventId && isEventSuccess && eventData && !hasInitialized.current && allProjects.length > 0) {
      if (editingEventId === eventId) return;

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
  
      const directionIds = eventData.directions.map((dir: Direction) => dir.id);
      const relatedProjects = allProjects.filter((project: Project) =>
        directionIds.includes(project.directionSet.id)
      );
  
      const resultsProjects = relatedProjects.map((project: any) => ({
        ...project,
        direction: project.directionSet.id,
        directionSet: undefined,
      }));

      console.log(directionIds)

      console.log(allProjects)
  
      const resultsDirections = eventData.directions.map((direction: any) => ({
        ...direction,
        leader_id: direction.leader,
        event: eventData.event_id,
        leader: undefined,
      }));
  
      dispatch(updateDirections(resultsDirections));
      dispatch(updateProjects(resultsProjects));
      dispatch(setEditingEventId(eventId!));
  
      hasInitialized.current = true;
    } else if (!eventId && !stepEvent) {
      dispatch(updateEvent({
        name: '',
        description: '',
        stage: 'Редактирование',
        start: '',
        end: '',
        end_app: '',
        specializations: [],
      }));
    }
  }, [isEventSuccess, eventData, allProjects, eventId, dispatch]);

  

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
    dispatch(updateEventField({ field: 'end', value: formatToServer(endDate) }));
  };

  const handleEndAppDateChange = (endAppDate: string) => {
    dispatch(updateEventField({ field: 'end_app', value: formatToServer(endAppDate) }));
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

          <SpecializationSelector
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
            />

            <DateInputField
              name="end_app"
              value={stepEvent.end_app}
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
    </div>
  );
}

