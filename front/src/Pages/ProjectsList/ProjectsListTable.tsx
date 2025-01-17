import 'Styles/ListTableStyles.scss';
import { useState, useEffect, useRef } from 'react';
import { useGetDirectionsQuery } from 'Features/ApiSlices/directionSlice';
import { useGetEventsQuery } from 'Features/ApiSlices/eventSlice';
import { useGetTeamsQuery } from 'Features/ApiSlices/teamSlice';
import { Project } from 'Features/ApiSlices/projectSlice';
import { useNavigate, Link } from "react-router-dom";

interface ProjectsTableProps {
  projects: Project[];
  onEdit: (id: number) => void;
}

export default function ProjectsListTable({ projects, onEdit }: ProjectsTableProps): JSX.Element {
  const { data: directions, isLoading: isLoadingDirections } = useGetDirectionsQuery();
  const { data: events, isLoading: isLoadingEvents } = useGetEventsQuery();
  const { data: teams, isLoading: isLoadingTeams } = useGetTeamsQuery();
  const navigate = useNavigate();

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
    onEdit(id);
    setOpenMenu(null);
  };

  if (isLoadingDirections || isLoadingEvents || isLoadingTeams) {
    return <span>Загрузка...</span>;
  }

  if (projects.length === 0) {
    return <span className="NullMessage">Проекты не найдены</span>;
  }

  const getEventName = (directionId: number): string => {
    const direction = directions?.find(dir => dir.id === directionId);
    const event = events?.find(evt => evt.id === direction?.event);
    return event ? event.name : 'Не указано';
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
          <tr key={project.id}>
            <td><Link to={`/projects/${project.id}`} className="LinkCell">{project.name}</Link></td>
            <td><span className="HiglightCell">{getEventName(project.direction)}</span></td>
            <td>{project.curators.map(curator => `${curator}`).join(', ')}</td>
            <td>
              <ul>
                {teams?.map((team) => {
                  if (team.project === project.id) {
                    return <li><Link to={`/teams/${team.id}`}>{team.name}</Link></li>
                  }
                })}
              </ul>
            </td>
            <td>
              <div onClick={() => toggleMenu(project.id)} className="ThreeDotsButton">
                &#8230;
              </div>
              {openMenu === project.id && (
                <ul ref={menuRef} className="ActionsMenu">
                  <li onClick={() => navigate(`/projects/${project.id}`)}>Подробнее</li>
                  <li onClick={() => handleEdit(project.id)}>Редактировать</li>
                </ul>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
