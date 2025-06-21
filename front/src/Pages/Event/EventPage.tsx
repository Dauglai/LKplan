import { useParams, useNavigate } from 'react-router-dom'; // Хуки маршрутизации
import { useGetEventByIdQuery, useDeleteEventMutation } from 'Features/ApiSlices/eventSlice'; // API мероприятий
import { useGetDirectionsQuery } from 'Features/ApiSlices/directionSlice'; // API направлений
import { useGetProjectsQuery } from 'Features/ApiSlices/projectSlice'; // API проектов
import BackButton from "Components/Common/BackButton/BackButton"; // Кнопка "Назад"
import 'Styles/pages/common/InfoPageStyle.scss'; // Общие стили страниц
import 'Styles/pages/EventPage.scss'; // Стили страницы мероприятия
import { List } from 'antd'; // Компоненты Ant Design
import { useEffect, useState } from 'react'; // Хуки React
import { useNotification } from 'Components/Common/Notification/Notification'; // Уведомления
import { useUserRoles } from 'Features/context/UserRolesContext'; // Контекст ролей пользователя
import { Collapse, Button } from 'antd'; // Компоненты Ant Design
import { useGetUserQuery } from 'Features/ApiSlices/userSlice'; // API пользователя
import { Application, useCreateApplicationMutation } from 'Features/ApiSlices/applicationSlice'; // API заявок
import RequestForm from 'Pages/Request/RequestForm'; // Форма заявки
import { useGetTeamsQuery } from 'Features/ApiSlices/teamSlice'; // API команд

const { Panel } = Collapse; // Компонент панели Collapse

/**
 * Страница мероприятия с подробной информацией о событии.
 * Отображает данные мероприятия, направления, проекты и позволяет подавать заявки.
 * 
 * @component
 * @example
 * // Пример использования через маршрутизацию:
 * <Route path="/events/:id" element={<EventPage />} />
 *
 * @returns {JSX.Element} Страница мероприятия с детальной информацией.
 */
export default function EventPage(): JSX.Element {
    const { id } = useParams<{ id: string }>(); // Получение ID мероприятия из URL
    const eventId = Number(id); // Конвертация ID в число
    const { data: user, isLoading: userLoading, error: userError } = useGetUserQuery(); // Данные текущего пользователя
    const { showNotification } = useNotification(); // Хук уведомлений
    const navigate = useNavigate(); // Хук навигации
    const { hasPermission } = useUserRoles(); // Проверка прав пользователя
    const [isRefreshing, setIsRefreshing] = useState(false);

    // Запросы данных
    const { data: event, isLoading: eventLoading, error: eventError } = useGetEventByIdQuery(eventId);
    const { refetch: refetchEvent } = useGetEventByIdQuery(eventId);
    const { data: directions, isLoading: directionsLoading, error: directionsError } = useGetDirectionsQuery();
    const { data: projects, isLoading: projectsLoading, error: projectsError } = useGetProjectsQuery();
    const { data: teams, isLoading: teamsLoading, error: teamsError } = useGetTeamsQuery();
    const { refetch: refetchDirections } = useGetDirectionsQuery();
    const { refetch: refetchProjects } = useGetProjectsQuery();
    const { refetch: refetchTeams } = useGetTeamsQuery();

    // Мутации
    const [createApplication, { isLoading: isSubmitting }] = useCreateApplicationMutation();
    const [deleteEvent] = useDeleteEventMutation();
    const [localApplication, setLocalApplication] = useState<Application | null>(null); // Локальное состояние заявки

    // Установка заголовка страницы
    useEffect(() => {
      if (event) {
        document.title = `${event.name} - MeetPoint`;
      } else {
        document.title = `Страница мероприятия - MeetPoint`;
      }
    }, [event]);

    // Поиск существующей заявки пользователя
    const existingApplication = event?.applications?.find(app => 
      app.user?.user_id === user?.user_id
    );  

    // Определение заявки для отображения
    const applicationToShow = localApplication || existingApplication;

    // Поиск выбранного проекта и команды
    const selectedProject = projects?.find(p => p.project_id === applicationToShow?.project);
    const selectedTeam = teams?.find(t => t.id === applicationToShow?.team);

    /**
     * Обработчик отправки заявки.
     * @param {Object} requestData - Данные заявки
     */
    const handleSubmit = async (requestData: any) => {
      try {
        setIsRefreshing(true);
        const createdApplication = await createApplication(requestData).unwrap();
        showNotification('Заявка успешно отправлена!', 'success');
        setLocalApplication(createdApplication);
        await refetchEvent();
        await Promise.all([refetchDirections(), refetchProjects(), refetchTeams()]);
      } catch (error) {
        console.error('Ошибка отправки заявки:', error);
        showNotification(`Ошибка при отправке заявки: ${error.status} ${error.stage}`, 'error');
      } finally {
        setIsRefreshing(false);
      }
    };

    /**
     * Обработчик удаления мероприятия.
     */
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

    // Состояние загрузки
    if (eventLoading || directionsLoading || projectsLoading || userLoading || teamsLoading) {
      return <div>Загрузка...</div>;
    }

    // Состояние ошибки
    if (eventError || directionsError || projectsError || userError) {
      return <div>Ошибка загрузки данных</div>;
    }

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
            ) : event.stage === 'Набор участников' && new Date() <= new Date(event.end_app) ? (
                applicationToShow ? (
                    <List
                      header={<h3>Вы уже подали заявку</h3>}
                      className="FormContainer RequestFormContainer"
                      loading={isRefreshing}
                      dataSource={[
                        { label: 'Статус', value: applicationToShow?.status?.name || "—" },
                        { label: 'Направление', value: applicationToShow?.direction?.name || selectedProject?.directionSet?.name || "—" },
                        { label: 'Проект', value: selectedProject?.name || "—" },
                        { label: 'Команда', value: selectedTeam?.name || "—" },
                        { label: 'Специализация', value: applicationToShow?.specialization?.name || "—" },
                        { label: 'Сообщение', value: applicationToShow?.message || "—" },
                        { label: 'Ответ', value: applicationToShow?.comment || "—" },
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
                    {event.stage === 'Проведение мероприятия' || new Date() > new Date(event.end_app) ? (
                        <>
                            <h3 className='MessageHeader'>Приём заявок закрыт</h3>
                            <p>
                                {new Date() > new Date(event.end_app) 
                                    ? "Срок приёма заявок истёк" 
                                    : `Мероприятие находится на этапе "${event.stage}"`}
                            </p>
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



