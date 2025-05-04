import { useParams, useNavigate } from 'react-router-dom';
import { useGetEventByIdQuery } from 'Features/ApiSlices/eventSlice';
import { useGetDirectionsQuery } from 'Features/ApiSlices/directionSlice';
import { useGetProjectsQuery } from 'Features/ApiSlices/projectSlice';
//import { useGetTeamsQuery } from 'Features/ApiSlices/teamSlice';
import BackButton from "Widgets/BackButton/BackButton";
import 'Styles/pages/common/InfoPageStyle.scss';
import 'Styles/pages/EventPage.scss';
import { List } from 'antd';
import { useEffect, useState } from 'react';
import { useNotification } from 'Widgets/Notification/Notification';

import { Collapse } from 'antd';
import { useGetUserQuery } from 'Features/ApiSlices/userSlice';
import { Application, useCreateApplicationMutation } from 'Features/ApiSlices/applicationSlice';
import RequestForm from 'Pages/Request/RequestForm';
import { useGetTeamsQuery } from 'Features/ApiSlices/teamSlice';

const { Panel } = Collapse;


export default function EventPage(): JSX.Element {
    const { id } = useParams<{ id: string }>();
    const eventId = Number(id);
    const { data: user, isLoading: userLoading, error: userError } = useGetUserQuery();
    const { showNotification } = useNotification();
    const navigate = useNavigate();
  
    const { data: event, isLoading: eventLoading, error: eventError } = useGetEventByIdQuery(eventId);
    const { data: directions, isLoading: directionsLoading, error: directionsError } = useGetDirectionsQuery();
    const { data: projects, isLoading: projectsLoading, error: projectsError } = useGetProjectsQuery();
    const { data: teams, isLoading: teamsLoading, error: teamsError } = useGetTeamsQuery();
  
    const [createApplication, { isLoading: isSubmitting }] = useCreateApplicationMutation();
    const [localApplication, setLocalApplication] = useState<Application | null>(null);
  
    useEffect(() => {
      if (event) {
        document.title = `${event.name} - MeetPoint`;
      } else {
        document.title = `Страница мероприятия - MeetPoint`;
      }
    }, [event]);
  
    const existingApplication = event?.applications?.find(app => 
      app.user?.user_id === user.user_id
    );  
  
    const applicationToShow = localApplication || existingApplication;
  
    const selectedProject = projects?.find(p => p.project_id === applicationToShow?.project);
    const selectedTeam = teams?.find(t => t.id === applicationToShow?.team);
  
    const handleSubmit = async (requestData: any) => {
      try {
        const createdApplication = await createApplication(requestData).unwrap();
        showNotification('Заявка успешно отправлена!', 'success');
        setLocalApplication(createdApplication);
      } catch (error) {
        console.error('Ошибка отправки заявки:', error);
        showNotification(`Ошибка при отправке заявки: ${error.status} ${error.stage}`, 'error');
      }
    };
  
    if (eventLoading || directionsLoading || projectsLoading || userLoading || teamsLoading) {
      return <div>Загрузка...</div>;
    }
  
    if (eventError || directionsError || projectsError || userError) {
      return <div>Ошибка загрузки данных</div>;
    }
  
    return (
      <div className="EventInfoPage InfoPage">
        <div className="EventInfoHeader InfoHeader">
          <BackButton />
          <h2>{event?.name}</h2>
        </div>
        <div className="EventContainer">
          <div className="EventInfo MainInfo">
            <ul className="EventInfoList ListInfo">
              <li><strong>Дата начала: </strong>{event.start ? new Date(event.start).toLocaleDateString() : "-"}</li>
              <li><strong>Дата окончания: </strong>{event.end ? new Date(event.end).toLocaleDateString() : "-"}</li>
              <li><strong>Срок приема заявок: </strong>{event.end_app ? new Date(event.end_app).toLocaleDateString() : "-"}</li>
              <li><strong>Текущий этап: </strong>{event.stage}</li>
            </ul>
            <div className="EventDescription InfoDescription">{event?.description}</div>
            <div className="EventContent InfoContent">
              <strong>Направления - Проекты</strong>
              <Collapse ghost>
                {directions?.map((direction) => {
                  if (direction.event !== eventId) return null;
                  return (
                    <Panel header={direction.name} key={direction.id}>
                      {direction.description ? <p className="InfoDescription">{direction.description}</p> : <span></span>}
                      <Collapse ghost>
                        {projects?.map((project) => {
                          if (project.directionSet.id !== direction.id) return null;
                          return (
                            <Panel header={project.name} key={project.project_id}>
                              {project.description ? <p className="InfoDescription">{project.description}</p> : <span></span>}
                            </Panel>
                          );
                        })}
                      </Collapse>
                    </Panel>
                  );
                })}
              </Collapse>
            </div>
          </div>
  
          {user.role === "Практикант" && (
            applicationToShow ? (
              <List
                header={<h3>Вы уже подали заявку</h3>}
                className="FormContainer RequestFormContainer"
                dataSource={[
                  { label: 'Статус', value: applicationToShow.status.name },
                  { label: 'Направление', value: applicationToShow.direction?.name || "—" },
                  { label: 'Проект', value: selectedProject?.name || "—" },
                  { label: 'Команда', value: selectedTeam?.name || "—" },
                  { label: 'Специализация', value: applicationToShow.specialization?.name || "—" },
                  { label: 'Сообщение', value: applicationToShow.message || "—" },
                  { label: 'Ответ', value: applicationToShow.comment || "—" },
                ]}
                renderItem={(item) => (
                  <List.Item>
                    <strong>{item.label}:</strong> {item.value}
                  </List.Item>
                )}
              />
            ) : (
              <RequestForm
                eventId={eventId}
                userId={user.user_id}
                onSubmit={handleSubmit}
              />
            )
          )}
        </div>
      </div>
    );
  }



