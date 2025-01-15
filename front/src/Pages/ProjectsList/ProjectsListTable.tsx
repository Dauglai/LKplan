import 'Styles/ListTableStyles.scss';
import { useGetDirectionsQuery } from 'Features/ApiSlices/directionSlice';
import { useGetEventsQuery } from 'Features/ApiSlices/eventSlice';
import { useGetTeamsQuery } from 'Features/ApiSlices/teamSlice';
import { Project } from 'Features/ApiSlices/projectSlice';

interface ProjectsTableProps {
  projects: Project[];
  onEdit: (id: number) => void;
}

export default function ProjectsListTable({ projects, onEdit }: ProjectsTableProps): JSX.Element {
  const { data: directions, isLoading: isLoadingDirections } = useGetDirectionsQuery();
  const { data: events, isLoading: isLoadingEvents } = useGetEventsQuery();
  const { data: teams, isLoading: isLoadingTeams } = useGetTeamsQuery();

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

  const getTeamsCount = (project: number): number => {
    return teams?.filter(team => team.project === project).length || 0;
  };

  return (
    <table className="ProjectsListTable ListTable">
      <thead>
        <tr>
          <th>Название</th>
          <th>Мероприятие</th>
          <th>Куратор</th>
          <th>Количество команд</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        {projects.map((project) => (
          <tr key={project.id}>
            <td>{project.name}</td>
            <td>
            <span className="HiglightCell">{getEventName(project.direction)}</span></td>
            <td>{project.curators.map(curator => `${curator}`).join(', ')}</td>
            <td>{getTeamsCount(project.id)}</td>
            <td>
              <button onClick={() => onEdit(project.id)}>Редактировать</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
