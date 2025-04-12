import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useCreateEventMutation } from 'Features/ApiSlices/eventSlice';
import { useCreateDirectionMutation } from 'Features/ApiSlices/directionSlice';
import { useCreateProjectMutation } from 'Features/ApiSlices/projectSlice';
import { resetEvent } from 'Features/store/eventSetupSlice';
import BackButton from 'Widgets/BackButton/BackButton';
import "Styles/FormStyle.scss";

const EventSetupSummary = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Получаем данные из Redux
  const { stepEvent, stepDirections, stepProjects } = useSelector((state: any) => state.event);

  // Мутации для создания мероприятия, направлений и проектов
  const [createEvent] = useCreateEventMutation();
  const [createDirection] = useCreateDirectionMutation();
  const [createProject] = useCreateProjectMutation();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [status, setStatus] = useState<string>('');

  const handleSave = async () => {
    setLoading(true);
    setError('');
    setStatus('Создание мероприятия...');

    try {
      // Сначала создаем мероприятие
      const eventResponse = await createEvent(stepEvent).unwrap();
      const event = eventResponse.id;  // Получаем ID созданного мероприятия

      setStatus('Создание направлений...');
      
      console.log(stepDirections)

      // Обновляем направления, добавляя eventId в каждое направление
      const updatedDirections = stepDirections.directions.map((direction: any) => ({
        ...direction,
        event,  // Добавляем id мероприятия в каждое направление
      }));

      console.log(updatedDirections)

      // После успешного создания мероприятия создаем направления
      const directionPromises = updatedDirections.map((direction: any) =>
        createDirection(direction).unwrap()
      );
      const directionResponses = await Promise.all(directionPromises);

      console.log(directionResponses);

      setStatus('Создание проектов...');

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
    
      // Затем создаем проекты
      const projectPromises = updatedProjects.map((project: any) =>
        createProject(project).unwrap()
      );
      await Promise.all(projectPromises);

      setStatus('Все данные успешно сохранены!');

      // Если все прошло успешно, сбрасываем данные в Redux
      dispatch(resetEvent());

      // Перенаправляем на страницу с успехом
      navigate('/events');
    } catch (err) {
      setError('Произошла ошибка при отправке данных.');
      console.error('Ошибка при отправке данных:', err);
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
