import { useParams, useNavigate } from 'react-router-dom';
import { useGetEventByIdQuery } from 'Features/ApiSlices/eventSlice';
import { useGetDirectionsQuery } from 'Features/ApiSlices/directionSlice';
import { useGetProjectsQuery } from 'Features/ApiSlices/projectSlice';
//import { useGetTeamsQuery } from 'Features/ApiSlices/teamSlice';
import BackButton from "Widgets/BackButton/BackButton";
import 'Styles/pages/common/InfoPageStyle.scss';
import 'Styles/pages/EventPage.scss';
import { useEffect } from 'react';
import { useNotification } from 'Widgets/Notification/Notification';

import { Collapse } from 'antd';
import { useGetUserQuery } from 'Features/ApiSlices/userSlice';
import { useCreateApplicationMutation } from 'Features/ApiSlices/applicationSlice';
import RequestForm from 'Pages/Request/RequestForm';

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
    //const { data: teams, isLoading: teamsLoading, error: teamsError } = useGetTeamsQuery();

    const [createApplication, { isLoading: isSubmitting, isSuccess, isError }] = useCreateApplicationMutation();

    useEffect(() => {
        if (event) {
            document.title = `${event.name} - MeetPoint`;
        } else {
            document.title = `Страница мероприятия - MeetPoint`;
        }
	}, []);

    const handleSubmit = async (requestData: any) => {
        try {
        await createApplication(requestData).unwrap();
        showNotification('Заявка успешно отправлена!', 'success');
        navigate('/events')
        } catch (error) {
        console.error('Ошибка отправки заявки:', error);
        showNotification(`Ошибка при отправке заявки: ${error.status} ${error.stage}`, 'error');
        }
    };


    if (eventLoading || directionsLoading || projectsLoading || userLoading ) {
        return <div>Загрузка...</div>;
    }

    if (eventError || directionsError || projectsError || userError ) {
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
                                    <p className="InfoDescription">{direction.description}</p>

                                    <Collapse ghost>
                                    {projects?.map((project) => {
                                        if (project.directionSet.id !== direction.id) return null;

                                        return (
                                        <Panel header={project.name} key={project.project_id}>
                                            <p className="InfoDescription">{project.description}</p>
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
                {user.role === "Практикант" && 
                <RequestForm eventId={eventId} userId={user.user_id} onSubmit={handleSubmit} />}
            </div>
        </div>
    );
};



