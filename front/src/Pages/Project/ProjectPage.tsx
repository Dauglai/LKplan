import { useParams, Link } from 'react-router-dom';
import { useGetProjectByIdQuery } from 'Features/ApiSlices/projectSlice';
import { useGetDirectionByIdQuery } from 'Features/ApiSlices/directionSlice';
import { useGetEventByIdQuery } from 'Features/ApiSlices/eventSlice';
import { useGetTeamsQuery } from 'Features/ApiSlices/teamSlice';

export default function ProjectPage(): JSX.Element {
  const { id } = useParams<{ id: string }>();
  const { data: project, isLoading: isProjectLoading } = useGetProjectByIdQuery(Number(id));
  const { data: direction, isLoading: isDirectionLoading } = useGetDirectionByIdQuery(project?.direction || 0, {
    skip: !project,
  });
  const { data: event, isLoading: isEventLoading } = useGetEventByIdQuery(direction?.event || 0, {
    skip: !direction,
  });
  const { data: teams, isLoading: isTeamsLoading } = useGetTeamsQuery();

  if (isProjectLoading || isDirectionLoading || isEventLoading || isTeamsLoading) {
    return <div>Загрузка...</div>;
  }

  if (!project) {
    return <div>Проект не найден</div>;
  }
  const projectTeams = teams?.filter((team) => team.project === project.id) || [];

  return (
    <div className="ProjectInfoPage InfoPage">
        <div className="ProjectInfoHeader InfoHeader">
            <h2>{project.name}</h2>
        </div>

        <div className="ProjectInfo MainInfo">
            <p><strong>Создатель:</strong> {project.creator}</p>
            <p><strong>Руководитель:</strong> {project.supervisor || 'Не назначен'}</p>
            <p><strong>Кураторы:</strong> {project.curators.length ? project.curators.join(', ') : 'Нет кураторов'}</p>
            <div className="ProjectDescription InfoDescription">{project.description}</div>
        </div>

        {direction && (
            <div>
            <h2>Направление</h2>
            <p>{direction.name}</p>
            </div>
        )}

        {event && (
            <div>
            <h2>Мероприятие</h2>
            <Link to={`/event/${event.id}`}>{event.name}</Link>
            </div>
        )}

        <div>
            <h2>Команды</h2>
            {projectTeams.length ? (
            <ul>
                {projectTeams.map((team) => (
                <li key={team.id}>
                    <Link to={`/team/${team.id}`}>{team.name}</Link>
                </li>
                ))}
            </ul>
            ) : (
            <p>Команд нет</p>
            )}
        </div>
    </div>
  );
};
