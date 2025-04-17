import { List, Typography, Button, Space } from 'antd';
import { Application, usePartialUpdateApplicationMutation } from 'Features/ApiSlices/applicationSlice';
import { useState } from 'react';
import EventSelector from 'Widgets/Selectors/EventSelector';
import StatusAppSelector from 'Widgets/Selectors/StatusAppSelector';
import ProjectSelector from 'Widgets/Selectors/ProjectSelector';
import TeamSelector from 'Widgets/Selectors/TeamSelector';
const { Text } = Typography;

interface RequestDetailsProps {
  request: Application;
}

export default function RequestDetailsModal({ request }: RequestDetailsProps): JSX.Element {
  const [partialUpdateApplication] = usePartialUpdateApplicationMutation();
  const [isEditing, setIsEditing] = useState(false);
  const [statusApp, setStatusApp] = useState(request.status);
  const [event, setEvent] = useState(request.event);
  const [project, setProject] = useState(request.project);
  const [team, setTeam] = useState(request.team);

  const handleSave = async () => {
    const updateData: any = {};
  
    if (statusApp.id !== request.status.id) {
      updateData.status = statusApp.id;
    }
  
    if (event.id !== request.event.id) {
      updateData.event = event.id;
    }

    if (project.id !== request.project) {
      updateData.project = project.id;
    }


    if (team.id !== request.team.id) {
      updateData.team = team.id;
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

  const infoItems = [
    { label: 'Статус', value: request.status.name },
    { label: 'Мероприятие', value: request.event.name },
    { label: 'Направление', value: request.direction?.name || 'Не указано' },
    { label: 'Проект', value: request.project?.name || 'Не указан' },
    { label: 'Команда', value: request.team?.name || 'Не указана' },
    { label: 'Специальность', value: request.specialization?.name || 'Не указана' },
    { label: 'Место работы', value: request.user.work_place || 'Не указано' },
    { label: 'Учебное заведение', value: request.user.education_place || 'Не указано' },
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
              <div className="ListItemWithSelector">
                <Text>
                  <strong>{label}:</strong>
                </Text>
                <EventSelector
                  selectedEvent={event}
                  onChange={(newEvent) => setEvent(newEvent)}
                />
              </div>
            ) : label === 'Проект' && isEditing ? (
              <div className="ListItemWithSelector">
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
