import { useParams, Link } from 'react-router-dom';
import { useGetEventByIdQuery } from 'Features/ApiSlices/eventSlice';
import { useGetDirectionsQuery } from 'Features/ApiSlices/directionSlice';
import { useGetProjectsQuery } from 'Features/ApiSlices/projectSlice';
import { useGetTeamsQuery } from 'Features/ApiSlices/teamSlice';
import 'Styles/InfoPageStyle.scss';

export default function EventPage(): JSX.Element {
    const { id } = useParams<{ id: string }>();
    const eventId = Number(id);

    const { data: event, isLoading: eventLoading, error: eventError } = useGetEventByIdQuery(eventId);
    const { data: directions, isLoading: directionsLoading, error: directionsError } = useGetDirectionsQuery();
    const { data: projects, isLoading: projectsLoading, error: projectsError } = useGetProjectsQuery();
    const { data: teams, isLoading: teamsLoading, error: teamsError } = useGetTeamsQuery();


    if (eventLoading || directionsLoading || projectsLoading || teamsLoading) {
        return <div>Загрузка...</div>;
    }

    if (eventError || directionsError || projectsError || teamsError) {
        return <div>Ошибка загрузки данных</div>;
    }

    return (
        <div className="EventInfoPage InfoPage">
            <div className="EventInfoHeader InfoHeader">
                <h2>{event?.name}</h2>
            </div>
            <div className="EventInfo MainInfo">
                <div className="EventDescription InfoDescription">{event?.description}</div>
                <div className="EventContent InfoContent">
                    {directions?.map((direction) => {
                        if (direction.event === eventId) {
                        return (
                            <div key={direction.id} className='EventDirection InfoLevel InfoLevelOne'>
                            <h3>{direction.name}</h3>
                
                            {projects?.map((project) => {
                                if (project.direction === direction.id) {
                                return (
                                    <div key={project.id} className='EventProject InfoLevel InfoLevelTwo'>
                                    <h4>{project.name}</h4>
                
                                    {teams?.map((team) => {
                                        if (team.project === project.id) {
                                        return <Link 
                                            to=""
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



