import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useCreateEventMutation, useUpdateEventMutation } from 'Features/ApiSlices/eventSlice';
import { useCreateDirectionMutation, useUpdateDirectionMutation, useGetDirectionsQuery } from 'Features/ApiSlices/directionSlice';
import { useCreateProjectMutation, useUpdateProjectMutation, useGetProjectsQuery } from 'Features/ApiSlices/projectSlice';
import { resetEvent } from 'Features/store/eventSetupSlice';
import { useNotification } from 'Widgets/Notification/Notification';
import BackButton from 'Widgets/BackButton/BackButton';
import "Styles/FormStyle.scss";

const EventSetupSummary = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { showNotification } = useNotification();

  // Получаем данные из Redux
  const { stepEvent, stepDirections, stepProjects, editingEventId } = useSelector((state: any) => state.event);

  // Мутации для создания мероприятия, направлений и проектов
  const [createEvent] = useCreateEventMutation();
  const [createDirection] = useCreateDirectionMutation();
  const [createProject] = useCreateProjectMutation();
  const [updateEvent] = useUpdateEventMutation();  // Добавили мутацию для обновления
  const [updateDirection] = useUpdateDirectionMutation();  // Добавили мутацию для обновления
  const [updateProject] = useUpdateProjectMutation();
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

  return (
    <div className='FormContainer'>
      <div className="FormHeader">
          <BackButton />
          <h2>Итоговая информация о мероприятии</h2>
        </div>
      <div className="FormStage">
        <p><strong>Название:</strong> {stepEvent.name}</p>
        <p><strong>Описание:</strong> {stepEvent.description}</p>
        <p><strong>Дата начала:</strong> {stepEvent.start}</p>
        <p><strong>Дата окончания:</strong> {stepEvent.end}</p>
        <p><strong>Дата окончания приема заявок:</strong> {stepEvent.end_app}</p>
        <p><strong>Выбранные специализации:</strong> {stepEvent.specializations}</p>
      </div>

      <div className="FormStage">
        <h3>Направления</h3>
        <ul>
          {stepDirections.directions.map((direction: any) => (
            <li key={direction.id}>
              <p>Название направления: {direction.name}</p>
              <p>Описание направления: {direction.description}</p>
            </li>
          ))}
        </ul>
      </div>

      <div className="FormStage">
        <h3>Проекты</h3>
        <ul>
          {stepProjects.projects.map((project: any) => {
            // Находим направление по id
            const direction = stepDirections.directions.find(
              (dir: any) => dir.id === project.direction
            );

            return (
              <li key={project.project_id}>
                <p>Название проекта: {project.name}</p>
                <p>Описание проекта: {project.description}</p>
                <p>Направление: {direction ? direction.name : 'Не найдено'}</p>
              </li>
            );
          })}
        </ul>
      </div>

      {error && <p style={{ color: 'red' }}>{error}</p>}
      <div>
        {status && <p>{status}</p>}
      </div>

      <div className="FormButtons">
        <button className="primary-btn"  onClick={handleSave} disabled={loading}>
          {loading ? 'Сохраняем...' : 'Сохранить'}
        </button>
      </div>
    </div>
  );
};

export default EventSetupSummary;
