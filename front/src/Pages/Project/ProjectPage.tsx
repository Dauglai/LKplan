import { useParams, Link } from 'react-router-dom';
import { useGetProjectByIdQuery } from 'Features/ApiSlices/projectSlice';
import { useGetDirectionByIdQuery } from 'Features/ApiSlices/directionSlice';
import { useGetEventByIdQuery } from 'Features/ApiSlices/eventSlice';
import { useGetTeamsQuery } from 'Features/ApiSlices/teamSlice';
import BackButton from "Widgets/BackButton/BackButton";
import { getInitials } from "Features/utils/getInitials";
import { useEffect } from 'react';

export default function ProjectPage(): JSX.Element {
  const { id } = useParams<{ id: string }>();
  const { data: project, isLoading: isProjectLoading } = useGetProjectByIdQuery(Number(id));
  const { data: direction, isLoading: isDirectionLoading } = useGetDirectionByIdQuery(project?.direction.id || 0, {
    skip: !project,
  });
  const { data: event, isLoading: isEventLoading } = useGetEventByIdQuery(direction?.event || 0, {
    skip: !direction,
  });
  const { data: teams, isLoading: isTeamsLoading } = useGetTeamsQuery();

  useEffect(() => {
    if (project) {
        document.title = `${project.name} - MeetPoint`;
    } else {
        document.title = `Страница проекта - MeetPoint`;
    }
  }, []);

  if (isProjectLoading || isDirectionLoading || isEventLoading || isTeamsLoading) {
    return <div>Загрузка...</div>;
  }

  if (!project) {
    return <div>Проект не найден</div>;
  }
  const projectTeams = teams?.filter((team) => team.project === project.project_id) || [];

  return (
    <div className="ProjectInfoPage InfoPage">
        <div className="ProjectInfoHeader InfoHeader">
          <BackButton />
          <h2>{project.name}</h2>
        </div>


        <div className="ProjectInfo MainInfo">
          <ul className="ProjecInfoList ListInfo">
            <li><strong>Мероприятие: </strong><Link to={`/event/${event.event_id}`}>{event.name}</Link></li>
            <li><strong>Направление: </strong>{direction.name}</li>
            <li><strong>Куратор: </strong>{project.curatorsSet.length > 0 ? 
              <Link to={`/profile/${ project.curatorsSet[0].user_id}`}>
                {project.curatorsSet[0].surname} {getInitials(project.curatorsSet[0].name, project.curatorsSet[0].patronymic)}
              </Link> : "-"}</li>
          </ul>
            <div className="ProjectDescription InfoDescription">{project.description}</div>
            <div className="ProjectContent InfoContent">
              <strong>Команды</strong>
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

    </div>
  );
};
