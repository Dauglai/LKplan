import { useParams, Link } from 'react-router-dom';
import { useGetEventByIdQuery } from 'Features/ApiSlices/eventSlice';
import { useGetDirectionsQuery } from 'Features/ApiSlices/directionSlice';
import { useGetProjectsQuery } from 'Features/ApiSlices/projectSlice';
import { useGetTeamsQuery } from 'Features/ApiSlices/teamSlice';
import BackButton from "Widgets/BackButton/BackButton";
import 'Styles/InfoPageStyle.scss';
import { useEffect } from 'react';

export default function EventPage(): JSX.Element {
    const { id } = useParams<{ id: string }>();
    const eventId = Number(id);

    const { data: event, isLoading: eventLoading, error: eventError } = useGetEventByIdQuery(eventId);
    const { data: directions, isLoading: directionsLoading, error: directionsError } = useGetDirectionsQuery();
    const { data: projects, isLoading: projectsLoading, error: projectsError } = useGetProjectsQuery();
    const { data: teams, isLoading: teamsLoading, error: teamsError } = useGetTeamsQuery();

    useEffect(() => {
        if (event) {
            document.title = `${event.name} - MeetPoint`;
        } else {
            document.title = `Страница мероприятия - MeetPoint`;
        }
	}, []);


    if (eventLoading || directionsLoading || projectsLoading || teamsLoading) {
        return <div>Загрузка...</div>;
    }

    if (eventError || directionsError || projectsError || teamsError) {
        return <div>Ошибка загрузки данных</div>;
    }

    return (
        <div className="EventInfoPage InfoPage">
            <div className="EventInfoHeader InfoHeader">
                <BackButton />
                <h2>{event?.name}</h2>
            </div>
            <div className="EventInfo MainInfo">
                    <ul className="EventInfoList ListInfo">
                        <li><strong>Дата начала: </strong>{event.start ? new Date(event.start).toLocaleDateString() : "-"}</li>
                        <li><strong>Дата окончания: </strong>{event.end ? new Date(event.end).toLocaleDateString() : "-"}</li>
                        <li><strong>Срок приема заявок: </strong>{event.end_app ? new Date(event.end_app).toLocaleDateString() : "-"}</li>
                        <li><strong>Текущий этап: </strong>{event.stage}</li>
                    </ul>
                <div className="EventDescription InfoDescription">{event?.description}</div>
                <div className="EventContent InfoContent">
                    <strong>Направления - Проекты - Команды</strong>
                    {directions?.map((direction) => {
                        if (direction.event === eventId) {
                        return (
                            <div key={direction.id} className='EventDirection InfoLevel InfoLevelOne'>
                            <h3>{direction.name}</h3>
                
                            {projects?.map((project) => {
                                if (project.directionSet.id === direction.id) {
                                return (
                                    <div key={project.project_id} className='EventProject InfoLevel InfoLevelTwo'>
                                        <Link 
                                            to={`/project/${project.project_id}`}
                                            key={project.project_id}>
                                                {project.name}
                                        </Link>
                
                                    {teams?.map((team) => {
                                        if (team.project === project.project_id) {
                                        return <Link 
                                            to={`/team/${team.id}`}
                                            key={team.id}
                                            className='EventTeam InfoLevel InfoLevelThree'>
                                                {team.name}
                                            </Link>;
                                        }
                                        return null;
                                    })}
                                    </div>
                                );
                                }
                                return null;
                            })}
                            </div>
                        );
                        }
                        return null;
                    })}
                </div>
            </div>
        </div>
    );
};



