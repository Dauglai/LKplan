import 'Styles/components/Sections/ListTableStyles.scss';
import { useState, useEffect, useRef } from 'react';
import { useGetDirectionsQuery } from 'Features/ApiSlices/directionSlice';
import { useGetEventsQuery } from 'Features/ApiSlices/eventSlice';
import { useGetTeamsQuery } from 'Features/ApiSlices/teamSlice';
import { Project, useDeleteProjectMutation } from 'Features/ApiSlices/projectSlice';
import { useNavigate, Link } from "react-router-dom";
import { getInitials } from "Features/utils/getInitials";
import { useNotification } from 'Widgets/Notification/Notification';
import ProjectForm from "./ProjectForm";
import Modal from "Widgets/Modal/Modal";
import MoreIcon from 'assets/icons/more.svg?react';

interface ProjectsTableProps {
  projects: Project[];
}

export default function ProjectsListTable({ projects}: ProjectsTableProps): JSX.Element {
  const { data: directions, isLoading: isLoadingDirections } = useGetDirectionsQuery();
  const { data: events, isLoading: isLoadingEvents } = useGetEventsQuery();
  const { data: teams, isLoading: isLoadingTeams } = useGetTeamsQuery();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const navigate = useNavigate();
  const [deleteProject] = useDeleteProjectMutation();
  const { showNotification } = useNotification()
  const [openMenu, setOpenMenu] = useState<number | null>(null); 
  const menuRef = useRef<HTMLUListElement | null>(null); 

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpenMenu(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleMenu = (id: number) => {
    setOpenMenu(openMenu === id ? null : id);
  };

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

  return (
    <table className="ProjectsListTable ListTable">
      <thead>
        <tr>
          <th>Название</th>
          <th>Мероприятие</th>
          <th>Куратор</th>
          <th>Команды</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        {projects.map((project) => (
          <tr key={project.project_id}>
            <td><Link to={`/project/${project.project_id}`} className="LinkCell">{project.name}</Link></td>
            <td><Link to={`/event/${getEventId(project.direction.id)}`} className=" HiglightCell LinkCell">{getEventName(project.direction.id)}</Link></td>
            <td>{project.curatorsSet.map(curator => 
              <Link to={`/profile/${curator.user_id}`} className="LinkCell">{curator.surname} {getInitials(curator.name, curator.patronymic)}</Link>)}</td>
            <td>
              <ul>
                {teams?.map((team) => {
                  if (team.project === project.project_id) {
                    return <li><Link to={`/team/${team.id}`}>{team.name}</Link></li>
                  }
                })}
              </ul>
            </td>
            <td>
              <MoreIcon 
                width="16" 
                height="16" 
                strokeWidth="1"
                onClick={() => toggleMenu(project.project_id)}
                className="ThreeDotsButton"
              />
              {openMenu === project.project_id && (
                <ul ref={menuRef} className="ActionsMenu">
                  <li onClick={() => navigate(`/project/${project.project_id}`)}>Подробнее</li>
                  {/*<li onClick={() => handleEdit(project.project_id)}>Редактировать</li>*/}
                  <li onClick={() => handleDelete(project.project_id)}>Удалить</li>
                </ul>
              )}
            </td>
          </tr>
        ))}
      </tbody>
      {isModalOpen && (
        <Modal isOpen={isModalOpen} onClose={closeModal}>
          <ProjectForm closeModal={closeModal} existingProject={selectedProject} />
        </Modal>
      )}
    </table>
  );
}
