import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useCreateEventMutation } from 'Features/ApiSlices/eventSlice';
import { useCreateDirectionMutation } from 'Features/ApiSlices/directionSlice';
import { useCreateProjectMutation } from 'Features/ApiSlices/projectSlice';
import { resetEvent } from 'Features/store/eventSetupSlice';

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

  // Обработчик отправки данных на сервер
  const handleSave = async () => {
    setLoading(true);
    setError('');

    try {
      // Сначала создаем мероприятие
      const eventResponse = await createEvent(stepEvent).unwrap();
      const event = eventResponse.id;  // Получаем ID созданного мероприятия

      // Обновляем направления, добавляя eventId в каждое направление
      const updatedDirections = stepDirections.directions.map((direction: any) => ({
        ...direction,
        event,  // Добавляем id мероприятия в каждое направление
      }));

      // После успешного создания мероприятия создаем направления
      const directionPromises = updatedDirections.map((direction: any) =>
        createDirection(direction).unwrap()
      );
      await Promise.all(directionPromises);

      // Затем создаем проекты
      const projectPromises = stepProjects.projects.map((project: any) =>
        createProject(project).unwrap()
      );
      await Promise.all(projectPromises);

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
    <div>
      <h2>Итоговая информация о мероприятии</h2>
      <div>
        <h3>Информация о мероприятии</h3>
        <p><strong>Название:</strong> {stepEvent.name}</p>
        <p><strong>Описание:</strong> {stepEvent.description}</p>
        <p><strong>Ссылка:</strong> {stepEvent.link}</p>
        <p><strong>Дата начала:</strong> {stepEvent.start}</p>
        <p><strong>Дата окончания:</strong> {stepEvent.end}</p>
      </div>

      <div>
        <h3>Направления</h3>
        <ul>
          {stepDirections.directions.map((direction: any) => (
            <li key={direction.id}>{direction.name}</li>
          ))}
        </ul>
      </div>

      <div>
        <h3>Проекты</h3>
        <ul>
          {stepProjects.projects.map((project: any) => (
            <li key={project.project_id}>{project.name}</li>
          ))}
        </ul>
      </div>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      <button onClick={handleSave} disabled={loading}>
        {loading ? 'Сохраняем...' : 'Сохранить'}
      </button>
    </div>
  );
};

export default EventSetupSummary;
