import { useParams, Link, useNavigate } from 'react-router-dom';
import { useGetProjectByIdQuery } from 'Features/ApiSlices/projectSlice';
import { useGetDirectionByIdQuery } from 'Features/ApiSlices/directionSlice';
import { useGetEventByIdQuery } from 'Features/ApiSlices/eventSlice';
import { useGetTeamsQuery } from 'Features/ApiSlices/teamSlice';
import BackButton from "Components/Common/BackButton/BackButton";
import { Button } from 'antd';
import { getInitials } from "Features/utils/getInitials";
import 'Styles/pages/common/InfoPageStyle.scss';
import { useEffect, useState } from 'react';
import EditProjectModal from 'Pages/ProjectForm/EditProjectModal';
import { useDeleteProjectMutation } from 'Features/ApiSlices/projectSlice';
import { useNotification } from 'Components/Common/Notification/Notification';
import { useUserRoles } from 'Features/context/UserRolesContext';

export default function ProjectPage(): JSX.Element {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showNotification } = useNotification()
  const { data: project, isLoading: isProjectLoading, refetch: refetchProject, } = useGetProjectByIdQuery(Number(id));
  const { data: direction, isLoading: isDirectionLoading } = useGetDirectionByIdQuery(project?.directionSet.id || 0, {
    skip: !project,
  });
  const { data: event, isLoading: isEventLoading } = useGetEventByIdQuery(direction?.event || 0, {
    skip: !direction,
  });
  const { data: teams, isLoading: isTeamsLoading } = useGetTeamsQuery();
  const [deleteProject] = useDeleteProjectMutation();
  const { hasRole, hasPermission, getRoleForObject } = useUserRoles();

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const handleDelete = async (id: number) => {
    await deleteProject(id);
    showNotification('Проект удалён', 'success');
    navigate('/projects');
  };

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

  const canEditProject = () => {
    console.log('Checking permissions for project:', project);
    // Организатор может редактировать все проекты
    if (hasPermission('edit_project') && hasRole('organizer')) {
      return true;
    }

    // Руководитель направления может редактировать проект, если у него есть доступ к направлению
    if (hasPermission('edit_project') && getRoleForObject('direction_leader', project?.directionSet.id, 'crm.direction')) {
      return true;
    }

    // В остальных случаях - не может редактировать проект
    return false;
  };

  return (
    <div className="ProjectInfoPage InfoPage">
        <div className="ProjectInfoHeader ListsHeaderPanel HeaderPanel">
          <div className="LeftHeaderPanel">
            <BackButton />
            <h2>{project.name}</h2>
          </div>
          
            {canEditProject() && (
              <div className="RightHeaderPanel">
                <Button onClick={() => setIsEditModalOpen(true)}>Редактировать</Button>
                <Button danger onClick={() => handleDelete(project.project_id)}>Удалить</Button>
              </div>)}
        </div>


        <div className="ProjectInfo MainInfo">
          <ul className="ProjecInfoList ListInfo">
            <li><strong>Мероприятие: </strong><Link to={`/event/${event.event_id}`}>{event.name}</Link></li>
            <li><strong>Направление: </strong>{direction.name}</li>
            {/*<li><strong>Куратор: </strong>{project.curatorsSet.length > 0 ? 
              <Link to={`/profile/${ project.curatorsSet[0].user_id}`}>
                {project.curatorsSet[0].surname} {getInitials(project.curatorsSet[0].name, project.curatorsSet[0].patronymic)}
              </Link> : "-"}</li>*/}
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

        {isEditModalOpen && (
          <EditProjectModal
            isOpen={isEditModalOpen}
            onClose={() => setIsEditModalOpen(false)}
            project={project}
            onSuccess={refetchProject}
          />
        )}
    </div>
  );
};
