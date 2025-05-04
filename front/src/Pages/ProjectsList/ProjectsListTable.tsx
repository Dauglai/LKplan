import 'Styles/components/Sections/ListTableStyles.scss';
import { useState, useRef } from 'react';
import { useGetDirectionsQuery } from 'Features/ApiSlices/directionSlice';
import { useGetEventsQuery } from 'Features/ApiSlices/eventSlice';
import { useGetTeamsQuery } from 'Features/ApiSlices/teamSlice';
import { Project, useDeleteProjectMutation } from 'Features/ApiSlices/projectSlice';
import { useNavigate, Link } from "react-router-dom";
import { useNotification } from 'Widgets/Notification/Notification';
import ActionMenu from 'Components/Sections/ActionMenu';
import ListTable from "Components/Sections/ListTable";
import EditProjectModal from 'Pages/ProjectForm/EditProjectModal';

interface ProjectsTableProps {
  projects: Project[];
  role: string;
}

export default function ProjectsListTable({ projects, role }: ProjectsTableProps): JSX.Element {
  const { data: directions, isLoading: isLoadingDirections } = useGetDirectionsQuery();
  const { data: events, isLoading: isLoadingEvents } = useGetEventsQuery();
  const { data: teams, isLoading: isLoadingTeams } = useGetTeamsQuery();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  
  const [deleteProject] = useDeleteProjectMutation();
  const { showNotification } = useNotification()
  const [openMenu, setOpenMenu] = useState<number | null>(null); 
  const menuRef = useRef<HTMLUListElement | null>(null); 

  const handleCloseMenu = () => setOpenMenu(null); // Закрывает открытое меню действий.

  const handleEdit = (id: number) => {
    const projectToEdit = projects.find((project) => project.project_id === id);
    if (projectToEdit) {
      setSelectedProject(projectToEdit);
      setIsModalOpen(true);
    }
  };

  const handleDelete = async (id: number) => {
    await deleteProject(id);
    showNotification('Проект удален', "success")
    setOpenMenu(null);
  };

  const closeModal = () => {
      setIsModalOpen(false);
      setSelectedProject(null);
  };

  if (isLoadingDirections || isLoadingEvents || isLoadingTeams) {
    return <span>Загрузка...</span>;
  }

  if (projects.length === 0) {
    return <span className="NullMessage">Проекты не найдены</span>;
  }

  const getEventName = (directionId: number): string => {
    const direction = directions?.find(direction => direction.id === directionId);
    const event = events?.find(event => event.event_id === direction?.event);
    return event ? event.name : 'Не указано';
  };

  const getEventId = (directionId: number): string => {
    const direction = directions?.find(direction => direction.id === directionId);
    const event = events?.find(event => event.event_id === direction?.event);
    return event ? event.event_id : '';
  };
  
  // Колонки для таблицы
    const columns = [
      {
        header: 'Название',
        render: (project: Project) => (
          <Link to={`/project/${project.project_id}`} className="LinkCell">{project.name}</Link>
        ),
        sortKey: 'name',
      },
      {
        header: 'Мероприятие',
        render: (project: Project) => (
          <Link to={`/event/${getEventId(project.directionSet.id)}`} className="HiglightCell LinkCell">{getEventName(project.directionSet.id)}</Link>
        ),
        text: 'Нажмите на мероприятие для подробностей',
      },
      {
        header: 'Направление',
        render: (project: Project) => (
          <span>{project.directionSet.name}</span>
        ),
      },
      /*{
        header: 'Куратор',
        render: (project: Project) => (
          <div>
            {project.curatorsSet.map(curator => (
              <Link to={`/profile/${curator.user_id}`} className="LinkCell">
                {curator.surname} {getInitials(curator.name, curator.patronymic)}
              </Link>
            ))}
          </div>
        ),
      },*/
      {
        header: 'Команды',
        render: (project: Project) => (
          <ul>
            {teams?.map((team) => {
              if (team.project === project.project_id) {
                return <li><Link to={`/team/${team.id}`}>{team.name}</Link></li>
              }
            })}
          </ul>
        ),
        text: 'Нажмите на команду из списка, чтобы ознакомиться подробнее',
      },
      {
        header: '',
        render: (project: Project) => (
          <ActionMenu 
            actions={actions(project)} 
            onClose={handleCloseMenu}
            role={role}
          />
        )
      }
    ].filter(Boolean);
  
    /**
     * Генерация списка действий для каждой строки таблицы.
     * @param {Project} project - Проект для генерации действий.
     * @returns {Array} Список действий для меню.
     */
  
    const actions = (project: Project) => [
      { label: 'Редактировать', onClick: () => handleEdit(project.project_id), requiredRole: 'Организатор'},
      { label: 'Удалить', onClick: () => handleDelete(project.project_id), requiredRole: 'Организатор' },
    ];

  return (
    <>
      <ListTable
        data={projects}
        columns={columns}
      />
      {isModalOpen && (
        <EditProjectModal 
          project={selectedProject} 
          isOpen={isModalOpen}
          onClose={closeModal}/>
      )}
    </>
  );
}
