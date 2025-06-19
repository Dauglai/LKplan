import { List, Typography, Button, Space } from 'antd'; // Компоненты Ant Design
import { Application, usePartialUpdateApplicationMutation } from 'Features/ApiSlices/applicationSlice'; // Тип заявки и мутация
import { useState } from 'react'; // Хук состояния
import EventSelector from 'Components/Selectors/EventSelector'; // Селектор мероприятий
import StatusAppSelector from 'Components/Selectors/StatusAppSelector'; // Селектор статусов
import ProjectSelector from 'Components/Selectors/ProjectSelector'; // Селектор проектов
import TeamSelector from 'Components/Selectors/TeamSelector'; // Селектор команд
import DirectionSelector from 'Components/Selectors/DirectionSelector'; // Селектор направлений
const { Text } = Typography; // Компонент текста

interface RequestDetailsProps {
  request: Application; // Объект заявки
  onClose: () => void; // Функция закрытия модального окна
}

/**
 * Модальное окно с деталями заявки и возможностью редактирования.
 * Позволяет просматривать и изменять статус, направление, проект, команду и мероприятие заявки.
 * Поддерживает частичное обновление данных через API.
 * 
 * @component
 * @example
 * // Пример использования:
 * <RequestDetailsModal 
 *   request={selectedRequest} 
 *   onClose={handleCloseModal}
 * />
 *
 * @param {RequestDetailsProps} props - Свойства компонента
 * @param {Application} props.request - Объект заявки для отображения
 * @param {function} props.onClose - Функция закрытия модального окна
 * @returns {JSX.Element} Модальное окно с деталями заявки
 */
export default function RequestDetailsModal({ request, onClose }: RequestDetailsProps): JSX.Element {
  const [partialUpdateApplication] = usePartialUpdateApplicationMutation(); // Мутация обновления заявки
  const [isEditing, setIsEditing] = useState(false); // Режим редактирования
  const [statusApp, setStatusApp] = useState(request.status); // Состояние статуса
  const [direction, setDirection] = useState(request.direction); // Состояние направления
  const [project, setProject] = useState(request.project); // Состояние проекта
  const [team, setTeam] = useState(request.team); // Состояние команды
  const [event, setEvent] = useState(request.event); // Состояние мероприятия

  /**
   * Обработчик сохранения изменений заявки.
   * Формирует объект с измененными полями и отправляет на сервер.
   * 
   * @async
   * @returns {Promise<void>}
   */
  const handleSave = async () => {
    const updateData: any = {};
  
    if (statusApp.id !== request.status.id) {
      updateData.status = statusApp.id?.toString();
    }
  
    if (event.event_id !== request.event.id) {
      updateData.event = event.event_id?.toString();
    }

    if (project && project.id !== request.project) {
      updateData.project = project.id?.toString();
    }

    if (direction && direction.id !== request.direction) {
      updateData.direction = direction.id?.toString();
    }

    if (team && team.id !== request.team) {
      updateData.team = team.id?.toString();
    }
  
    if (Object.keys(updateData).length > 0) {
      try {
        await partialUpdateApplication({
          id: request.id,
          data: updateData,
        }).unwrap();
        setIsEditing(false);
      } catch (error) {
        console.error('Ошибка обновления', error);
      }
    } else {
      setIsEditing(false);
    }
  };

  /**
   * Массив элементов информации о заявке.
   * @type {Array<{label: string, value: string}>}
   */
  const infoItems = [
    { label: 'Статус', value: statusApp.name },
    { label: 'Время подачи', value: `${request.time_sub} ${request.date_sub}` },
    { label: 'Мероприятие', value: event?.name || 'Не указано' },
    { label: 'Направление', value: direction?.name || 'Не указано' },
    { label: 'Проект', value: project?.name || 'Не указан' },
    { label: 'Команда', value: team?.name || 'Не указана' },
    { label: 'Специальность', value: request.specialization?.name || 'Не указана' },
    { label: 'Место работы', value: request.user.job || 'Не указано' },
    { label: 'Учебное заведение', value: request.user.university || 'Не указано' },
    { label: 'Ссылка в TG', value: request.user.telegram || 'Не указана' },
    { label: 'Ссылка в VK', value: request.user.vk || 'Не указана' },
  ];
  
  

  return (
    <>
      <List
        dataSource={infoItems}
        renderItem={({ label, value }) => (
          <List.Item>
            {label === 'Статус' && isEditing ? (
              <div className="ListItemWithSelector">
                <Text>
                  <strong>{label}:</strong>
                </Text>
                <StatusAppSelector
                  selectedStatusApp={statusApp}
                  onChange={(newStatus) => setStatusApp(newStatus)}
                />
              </div>
            ) : label === 'Мероприятие' && isEditing ? (
              <div className="ListItemWithSelector event ">
                <Text>
                  <strong>{label}:</strong>
                </Text>
                <EventSelector
                  selectedEvent={event}
                  onChange={(newEvent) => setEvent(newEvent)}
                />
              </div>
            ) : label === 'Направление' && isEditing ? (
              <div className="ListItemWithSelector direction">
                <Text><strong>{label}:</strong></Text>
                <DirectionSelector
                  selectedDirection={direction}
                  onChange={(newDirection) => setDirection(newDirection)}
                  sourceType='remote'
                />
              </div>
            ) : label === 'Проект' && isEditing ? (
              <div className="ListItemWithSelector project">
                <Text><strong>{label}:</strong></Text>
                <ProjectSelector
                  selectedProject={project}
                  onChange={(newProject) => setProject(newProject)}
                />
              </div>
            ) : label === 'Команда' && isEditing ? (
              <div className="ListItemWithSelector">
                <Text><strong>{label}:</strong></Text>
                <TeamSelector
                  selectedTeam={team}
                  onChange={(newTeam) => setTeam(newTeam)}
                />
              </div>
            ) : (
              <Text>
                <strong>{label}:</strong> {value}
              </Text>
            )}
          </List.Item>
        )}
      />

      {!isEditing ? (
        <Button type="primary" block onClick={() => setIsEditing(true)}>
          Редактировать
        </Button>
      ) : (
        <Space direction="horizontal" className="Buttons">
          <Button block onClick={() => setIsEditing(false)}>
            Отмена
          </Button>
          <Button type="primary" block onClick={handleSave}>
            Сохранить
          </Button>
        </Space>
      )}
    </>
  );
}
