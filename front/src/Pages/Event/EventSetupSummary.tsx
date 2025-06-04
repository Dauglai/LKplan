import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useCreateEventMutation, useUpdateEventMutation } from 'Features/ApiSlices/eventSlice';
import { useCreateDirectionMutation, useUpdateDirectionMutation, useGetDirectionsQuery } from 'Features/ApiSlices/directionSlice';
import { useCreateProjectMutation, useUpdateProjectMutation, useGetProjectsQuery } from 'Features/ApiSlices/projectSlice';
import { resetEvent } from 'Features/store/eventSetupSlice';
import { useNotification } from 'Components/Common/Notification/Notification';
import BackButton from 'Components/Common/BackButton/BackButton';
import "Styles/FormStyle.scss";
import DateInputField from 'Components/Forms/DateInputField';
import NameInputField from 'Components/Forms/NameInputField';
import DescriptionInputField from 'Components/Forms/DescriptioninputField';
import { useGetSpecializationsQuery } from 'Features/ApiSlices/specializationSlice';
import SideStepNavigator from 'Components/Sections/SideStepNavigator';
import { 
  StatusApp,
  useCreateStatusAppMutation, 
  useDeleteStatusAppMutation, 
  useGetStatusesAppQuery, 
  useUpdateStatusAppMutation } from 'Features/ApiSlices/statusAppSlice';
import { 
  useCreateStatusOrderMutation, 
  useDeleteStatusOrderMutation, 
  useGetStatusOrdersQuery, 
  useUpdateStatusOrderMutation } from 'Features/ApiSlices/statusOrdersSlice';

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
  const [updateStatusApp] = useUpdateStatusAppMutation();
  const [createStatusOrder] = useCreateStatusOrderMutation();
  const [updateStatusOrder] = useUpdateStatusOrderMutation();
  const [deleteStatusOrder] = useDeleteStatusOrderMutation();
  const [deleteStatusApp] = useDeleteStatusAppMutation();
  const { data: existingDirections } = useGetDirectionsQuery();
  const { data: existingProjects } = useGetProjectsQuery();
  const { data: existingStatuses } = useGetStatusesAppQuery();
  const { data: existingStatusOrders } = useGetStatusOrdersQuery();

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
              // Если направление существует, обновляем
              return updateDirection({
                ...direction,
                event: eventId,
              }).unwrap();
            } else {
              return createDirection({
                ...direction,
                event: eventId,
              }).unwrap();
            }
          }

          // Если это новое направление, создаем
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

      if (stepStatuses) {
        try {
          setStatus('Создание статусов...');
          setError('');

          // Создаем статусы строго последовательно
          for (let i = 0; i < stepStatuses.statuses.length; i++) {
            // 1. Создаем сам статус
            const statusResponse = await createStatusApp(stepStatuses.statuses[i]).unwrap();
            
            // 2. Создаем запись о порядке с ОДНИМ И ТЕМ ЖЕ номером (пока не получится)
            let retryCount = 0;
            let success = false;
            
            while (!success && retryCount < 3) { // Пробуем максимум 3 раза
              try {
                await createStatusOrder({
                  number: i + 1, // Всегда номер по порядку (1, 2, 3...)
                  event: eventId,
                  status: statusResponse.id
                }).unwrap();
                success = true;
              } catch (orderError) {
                if (orderError.data?.non_field_errors?.[0]?.includes("Позиция с таким номером уже существует")) {
                  // Если номер занят - ждем немного и пробуем снова
                  await new Promise(resolve => setTimeout(resolve, 300));
                  retryCount++;
                } else {
                  throw orderError; // Другие ошибки прокидываем выше
                }
              }
            }

            if (!success) {
              throw new Error(`Не удалось установить порядок для статуса ${i + 1}`);
            }

            setStatus(`Создан статус ${i + 1}/${stepStatuses.statuses.length}`);
          }

          setStatus('Все статусы созданы!');
          showNotification('Порядок статусов успешно сохранен', 'success');
          
        } catch (error) {
          console.error('Ошибка:', error);
          setError(error.message);
          showNotification('Ошибка при создании статусов', 'error');
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
                disabled
                withPlaceholder
              />
              <DescriptionInputField
                name="description"
                value={stepEvent.description}
                placeholder="Описание мероприятия"
                disabled
                withPlaceholder
              />
            </div>

        <div className="FormStage DatesFormStage">
              <DateInputField
                name="start"
                value={stepEvent.start}
                onChange={() => {}}
                placeholder="Дата начала"
                required
                withPlaceholder={true}
                disabled
              />

              <DateInputField
                name="end"
                value={stepEvent.end}
                onChange={() => {}}
                placeholder="Дата завершения"
                required
                withPlaceholder={true}
                disabled
              />

              <DateInputField
                name="end_app"
                value={stepEvent.end_app}
                onChange={() => {}}
                placeholder="Срок приема заявок"
                required
                withPlaceholder={true}
                disabled
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

        {stepStatuses?.statuses?.length > 0 && (
          <div className="FormStage">
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
          </div>
        )}

        {error && <p style={{ color: 'red' }}>{error}</p>}
        {status && <p>{status}</p>}

        <div className="FormButtons">
          <button className="primary-btn" onClick={handleSave} disabled={loading}>
            {loading ? 'Сохраняем...' : 'Сохранить'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EventSetupSummary;
