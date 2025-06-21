import { useState } from 'react';
import { parse, format } from 'date-fns';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useCreateEventMutation, useUpdateEventMutation } from 'Features/ApiSlices/eventSlice';
import { useCreateDirectionMutation, useUpdateDirectionMutation, useGetDirectionsQuery } from 'Features/ApiSlices/directionSlice';
import { useCreateProjectMutation, useUpdateProjectMutation, useGetProjectsQuery } from 'Features/ApiSlices/projectSlice';
import { resetEvent, updateEventField, } from 'Features/store/eventSetupSlice';
import { useNotification } from 'Components/Common/Notification/Notification';
import BackButton from 'Components/Common/BackButton/BackButton';
import "Styles/FormStyle.scss";
import DateInputField from 'Components/Forms/DateInputField';
import NameInputField from 'Components/Forms/NameInputField';
import DescriptionInputField from 'Components/Forms/DescriptioninputField';
import { useGetSpecializationsQuery } from 'Features/ApiSlices/specializationSlice';
import SideStepNavigator from 'Components/Sections/SideStepNavigator';
import { useCreateStatusAppMutation } from 'Features/ApiSlices/statusAppSlice';
import { useCreateStatusOrderMutation } from 'Features/ApiSlices/statusOrdersSlice';


const EventSetupSummary = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const { data: allSpecializations } = useGetSpecializationsQuery()

  // Получаем данные из Redux
  const { stepEvent, stepDirections, stepProjects, stepStatuses, editingEventId } = useSelector((state: any) => state.event);

  // Мутации для создания мероприятия, направлений и проектов
  const [createEvent] = useCreateEventMutation();
  const [createDirection] = useCreateDirectionMutation();
  const [createProject] = useCreateProjectMutation();
  const [updateEvent] = useUpdateEventMutation();  // Добавили мутацию для обновления
  const [updateDirection] = useUpdateDirectionMutation();  // Добавили мутацию для обновления
  const [updateProject] = useUpdateProjectMutation();
  const [createStatusApp] = useCreateStatusAppMutation();
  const [createStatusOrder] = useCreateStatusOrderMutation();
  const { data: existingDirections } = useGetDirectionsQuery();
  const { data: existingProjects } = useGetProjectsQuery();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [status, setStatus] = useState<string>('');

  const handleSave = async () => {
    setLoading(true);
    setError('');
    setStatus(editingEventId ? 'Редактирование мероприятия...' : 'Создание мероприятия...');

    try {
      let eventId: number;

      if (editingEventId) {
        // Редактирование мероприятия
        const eventResponse = await updateEvent({ id: editingEventId, data: stepEvent }).unwrap();
        eventId = eventResponse.event_id;
      } else {
        // Создание нового мероприятия
        const eventResponse = await createEvent(stepEvent).unwrap();
        eventId = eventResponse.id;
      }


      if (stepDirections) {
        setStatus(editingEventId ? 'Обновление направлений...' : 'Создание направлений...');
      
        // Обновляем существующие направления или создаем новые
        const directionPromises = stepDirections.directions.map((direction: any) => {
          if (editingEventId) {
              const existingDirection = existingDirections.find((existing: any) => existing.id === direction.id);
              
              if (existingDirection) {
                  // Сравниваем, изменилось ли направление
                  const isDirectionChanged = Object.keys(direction).some(key => {
                      // Игнорируем служебные и технические поля
                      if (key === 'id' || key === 'created_at' || key === 'updated_at' || key === 'leader_id') {
                          return false;
                      }

                      // Нормализуем сравнение `leader` (null vs undefined)
                      if (key === 'leader') {
                          const newLeader = direction[key] ?? null;
                          const oldLeader = existingDirection[key] ?? null;
                          return newLeader !== oldLeader;
                      }

                      // Для остальных полей строгое сравнение
                      return direction[key] !== existingDirection[key];
                  });

                  if (isDirectionChanged) {
                      return updateDirection({
                          ...direction,
                          event: eventId,
                      }).unwrap();
                  } else {
                      return Promise.resolve(existingDirection); // Пропускаем неизмененные
                  }
              } else {
                  // Создаем новое направление
                  return createDirection({
                      ...direction,
                      event: eventId,
                  }).unwrap();
              }
          }

          // Режим создания мероприятия
          return createDirection({
              ...direction,
              event: eventId,
          }).unwrap();
      });

        const directionResponses = await Promise.all(directionPromises);

        if (stepProjects) {
          setStatus(editingEventId ? 'Обновление проектов...' : 'Создание проектов...');

          // Теперь обновляем проекты, заменяя временные id направлений на реальные
          const updatedProjects = stepProjects.projects.map((project: any) => {
            const tempDirectionId = project.direction;

            // Ищем направление в stepDirections, чтобы найти название
            const directionToUpdate = stepDirections.directions.find(
              (direction: any) => direction.id === tempDirectionId
            );

            if (directionToUpdate) {
              // Находим соответствующий реальный ID из directionResponses по названию
              const realDirection = directionResponses.find(
                (res: any) => res.name === directionToUpdate.name
              );

              // Если нашли реальный ID, подставляем его
              return {
                ...project,
                direction: realDirection?.id || tempDirectionId, // Если реальный ID не найден, оставляем временный
              };
            }

            // Если не нашли направление с таким ID, оставляем временный ID
            return project;
          });

          // Обновляем существующие проекты или создаем новые
          const resultProjects = updatedProjects.map((project: any) => {
            if (editingEventId) {
              const existingProject = existingProjects.find((existing: any) => existing.id === project.id);

              if (existingProject) {
                // Если проект существует, обновляем
                return updateProject(project).unwrap();
              } else {
                return createProject(project).unwrap();
              }
            }
            
              // Если это новый проект, создаем
              return createProject(project).unwrap();
            }
          );

          await Promise.all(resultProjects);
        }
      }

      if (stepStatuses && !editingEventId) {
        try {
          setStatus('Создание статусов...');
          setError('');

          // Создаем все статусы сразу
          const statusCreationPromises = stepStatuses.statuses.map(statusApp => 
            createStatusApp(statusApp).unwrap()
          );
          const createdStatuses = await Promise.all(statusCreationPromises);

          // Создаем порядок статусов
          const statusOrderPromises = createdStatuses.map((status, index) => 
            createStatusOrder({
              number: index + 1,
              event: eventId,
              status: status.id
            }).unwrap()
          );
          await Promise.all(statusOrderPromises);

          setStatus('Все статусы успешно созданы!');
          
        } catch (error) {
          console.error('Ошибка создания статусов:', error);
          setError(`Ошибка при создании статусов: ${error.message}`);
          showNotification('Ошибка создания статусов', 'error');
          throw error; // Пробрасываем ошибку дальше
        }
      }

      setStatus('Все данные успешно сохранены!');

      // Если все прошло успешно, сбрасываем данные в Redux
      dispatch(resetEvent());

      // Перенаправляем на страницу с успехом
      navigate('/events');
    } catch (error: any) {
    
      // Устанавливаем сообщение об ошибке
      setError(`Произошла ошибка при отправке данных. Детали: ${error.data[0]}`);
      
      // Логируем ошибку в консоль для отладки
      console.error(`Ошибка при отправке данных:  Детали: ${error.data[0]}`);
    
      // Показываем уведомление
      showNotification(`Ошибка при отправке данных:  Детали: ${error.data[0]}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const selectedSpecNames = allSpecializations?.filter(spec => stepEvent.specializations.includes(spec.id))

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

  return (
    <div className="SetupContainer">
      <SideStepNavigator />
      <div className='FormContainer'>
        <div className="FormHeader">
            <BackButton />
            <h2>Итоговая информация о мероприятии</h2>
        </div>
        <div className="FormStage NameContainer">
              <NameInputField
                name="name"
                value={stepEvent.name}
                placeholder="Название мероприятия"
                onChange={handleInputChange}
                withPlaceholder
                required
              />
              <DescriptionInputField
                name="description"
                value={stepEvent.description}
                placeholder="Описание мероприятия"
                onChange={handleTextArea}
                withPlaceholder
              />
            </div>

        <div className="FormStage DatesFormStage">
              <DateInputField
                name="start"
                value={stepEvent.start}
                placeholder="Дата начала"
                required
                withPlaceholder={true}
                onChange={handleStartDateChange}
              />

              <DateInputField
                name="end"
                value={stepEvent.end}
                placeholder="Дата завершения"
                required
                withPlaceholder={true}
                onChange={handleEndDateChange}
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

        {selectedSpecNames?.length > 0 && (
          <div className="FormStage">
            <h3>Выбранные специализации:</h3>
            <ul className="SelectedList">
              {selectedSpecNames.map((spec) => (
                <li
                  key={spec.id}
                  className="SelectedListItem"
                >
                  {spec.name}
                </li>
              ))}
            </ul>
          </div>
        )}

        {stepDirections?.directions?.length > 0 && (
          <div className="FormStage">
            <h3>Созданные направления:</h3>
            <ul className="SelectedList">
              {stepDirections?.directions?.map((direction) => (
                <li
                  key={direction.id}
                  className="SelectedListItem"
                >
                  {direction.name}
                </li>
              ))}
            </ul>
          </div>
        )}

        {stepProjects?.projects?.length > 0 && (
          <div className="FormStage">
            <h3>Проекты</h3>
            <ul className="SelectedList">
              {stepProjects.projects.map((project) => (
                <li key={project.project_id} className="SelectedListItem">
                {project.name}
              </li>)
              )}
            </ul>
          </div>
        )}

        <div className="FormStage">
        {/* Показываем список статусов, если они есть */}
        {stepStatuses?.statuses?.length > 0 && (
          <>
            <h3>Созданные статусы:</h3>
            <ul className="SelectedList StatusesList">
              {stepStatuses.statuses.map((status, index) => (
                <li
                  key={status.id}
                  className={`SelectedListItem ${status.is_positive ? 'positive' : 'negative'}`}
                >
                  {index + 1}. {status.name} {status.description ? `(${status.description})` : ""}
                </li>
              ))}
            </ul>
          </>
        )}
        
        {/* Предупреждение показываем ТОЛЬКО при создании нового мероприятия */}
        {!editingEventId && stepStatuses?.statuses?.length === 0 && (
          <div style={{ 
            color: '#ff4d4f', 
            fontSize: '16px',
            fontWeight: '500',
            marginBottom: '20px'
          }}>
            Для успешного создания мероприятия необходимо добавить хотя бы один статус
          </div>
        )}
      </div>

      {error && <p style={{ color: 'red' }}>{error}</p>}
      {status && <p>{status}</p>}

      <div className="FormButtons">
        <button 
          className="primary-btn" 
          onClick={handleSave} 
          disabled={
            loading || 
            (!editingEventId && stepStatuses?.statuses?.length === 0) // Блокируем только при создании, если нет статусов
          }
        >
          {loading ? 'Сохраняем...' : 'Сохранить'}
        </button>
      </div>
      </div>
    </div>
  );
};

export default EventSetupSummary;
