import { useParams, useNavigate } from 'react-router-dom';
import { useGetEventByIdQuery, useDeleteEventMutation  } from 'Features/ApiSlices/eventSlice';
import { useGetDirectionsQuery } from 'Features/ApiSlices/directionSlice';
import { useGetProjectsQuery } from 'Features/ApiSlices/projectSlice';
//import { useGetTeamsQuery } from 'Features/ApiSlices/teamSlice';
import BackButton from "Components/Common/BackButton/BackButton";
import 'Styles/pages/common/InfoPageStyle.scss';
import 'Styles/pages/EventPage.scss';
import { List } from 'antd';
import { useEffect, useState } from 'react';
import { useNotification } from 'Components/Common/Notification/Notification';
import { useUserRoles } from 'Features/context/UserRolesContext';

import { Collapse, Button } from 'antd';
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
    const { hasPermission } = useUserRoles();
  
    const { data: event, isLoading: eventLoading, error: eventError } = useGetEventByIdQuery(eventId);
    const { data: directions, isLoading: directionsLoading, error: directionsError } = useGetDirectionsQuery();
    const { data: projects, isLoading: projectsLoading, error: projectsError } = useGetProjectsQuery();
    const { data: teams, isLoading: teamsLoading, error: teamsError } = useGetTeamsQuery();
  
    const [createApplication, { isLoading: isSubmitting }] = useCreateApplicationMutation();
    const [deleteEvent] = useDeleteEventMutation();
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

    const handleDeleteEvent = async () => {
      try {
        await deleteEvent(eventId).unwrap();
        showNotification('Мероприятие успешно удалено!', 'success');
        navigate("/events");
      } catch (error) {
        console.error('Ошибка при удалении мероприятия:', error);
        showNotification(`Ошибка при удалении мероприятия: ${error.status}`, 'error');
      }
    };
  
    if (eventLoading || directionsLoading || projectsLoading || userLoading || teamsLoading) {
      return <div>Загрузка...</div>;
    }
  
    if (eventError || directionsError || projectsError || userError) {
      return <div>Ошибка загрузки данных</div>;
    }

    console.log(event)
  
    return (
      <div className="EventInfoPage InfoPage">
        <div className="EventInfoHeader ListsHeaderPanel HeaderPanel">
          <div className="LeftHeaderPanel">
            <BackButton />
            <h2>{event?.name}</h2>
          </div>
          {hasPermission('edit_event') && (
            <div className="RightHeaderPanel">
              <Button onClick={() => navigate(`/event/${event.event_id}/edit`)}>Редактировать</Button>
              <Button danger onClick={handleDeleteEvent}>Удалить</Button>
            </div>
          )}
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
  
          {hasPermission('submit_application') && (
            event.stage === 'Редактирование' ? (
              <div className="FormContainer RequestFormContainer">
                <h3 className='MessageHeader'>Мероприятие в подготовке</h3>
                <p>Приём заявок ещё не начался</p>
              </div>
            ) : event.stage === 'Набор участников' ? (
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
                  event={event}
                  userId={user.user_id}
                  onSubmit={handleSubmit}
                />
              )
            ) : (
              <div className="FormContainer RequestFormContainer">
                {event.stage === 'Формирование команд' || event.stage === 'Проведение мероприятия' ? (
                  <>
                    <h3 className='MessageHeader'>Приём заявок закрыт</h3>
                    <p>Мероприятие находится на этапе "{event.stage}"</p>
                  </>
                ) : event.stage === 'Мероприятие завершено' ? (
                  <>
                    <h3 className='MessageHeader'>Мероприятие завершено</h3>
                    <p>Это мероприятие уже завершилось</p>
                  </>
                ) : (
                  <>
                    <h3 className='MessageHeader'>Мероприятие не доступно</h3>
                    <p>Текущий статус мероприятия: "{event.stage}"</p>
                  </>
                )}
              </div>
            )
          )}
        </div>
      </div>
    );
  }



