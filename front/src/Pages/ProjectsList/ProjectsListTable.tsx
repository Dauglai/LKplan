import 'Styles/components/Sections/ListTableStyles.scss'; // Стили таблицы
import { useState } from 'react'; // Хук состояния
import { useGetDirectionsQuery } from 'Features/ApiSlices/directionSlice'; // Запрос направлений
import { useGetEventsQuery } from 'Features/ApiSlices/eventSlice'; // Запрос мероприятий
import { useGetTeamsQuery } from 'Features/ApiSlices/teamSlice'; // Запрос команд
import { Project, useDeleteProjectMutation } from 'Features/ApiSlices/projectSlice'; // Тип проекта и мутация удаления
import { Link } from "react-router-dom"; // Компонент ссылки
import { useUserRoles } from "Features/context/UserRolesContext"; // Контекст ролей пользователя
import { useNotification } from 'Components/Common/Notification/Notification'; // Хук уведомлений
import ActionMenu from 'Components/Sections/ActionMenu'; // Меню действий
import ListTable from "Components/Sections/ListTable"; // Компонент таблицы
import EditProjectModal from 'Pages/ProjectForm/EditProjectModal'; // Модальное окно редактирования

interface ProjectsTableProps {
  projects: Project[]; // Массив проектов для отображения
}

/**
 * Таблица списка проектов с возможностями редактирования и удаления.
 * Отображает проекты с информацией о связанных направлениях и мероприятиях.
 * Поддерживает CRUD операции через API и проверку прав доступа.
 * 
 * @component
 * @example
 * // Пример использования:
 * const projects = [...] // массив проектов
 * <ProjectsListTable projects={projects} />
 *
 * @param {ProjectsTableProps} props - Свойства компонента
 * @param {Project[]} props.projects - Массив проектов для отображения
 * @returns {JSX.Element} Таблица с списком проектов и управляющими элементами
 */
export default function ProjectsListTable({ projects }: ProjectsTableProps): JSX.Element {
  const { data: directions, isLoading: isLoadingDirections } = useGetDirectionsQuery(); // Данные направлений
  const { data: events, isLoading: isLoadingEvents } = useGetEventsQuery(); // Данные мероприятий
  const { data: teams, isLoading: isLoadingTeams } = useGetTeamsQuery(); // Данные команд
  const [isModalOpen, setIsModalOpen] = useState(false); // Состояние модального окна
  const [selectedProject, setSelectedProject] = useState<Project | null>(null); // Выбранный проект
  
  const [deleteProject] = useDeleteProjectMutation(); // Мутация удаления проекта
  const { showNotification } = useNotification(); // Хук уведомлений
  const [openMenu, setOpenMenu] = useState<number | null>(null); // ID открытого меню действий
  const { hasRole, hasPermission, getRoleForObject } = useUserRoles(); // Функции проверки прав

  /**
   * Закрывает открытое меню действий.
   */
  const handleCloseMenu = () => setOpenMenu(null);

  /**
   * Открывает модальное окно редактирования для выбранного проекта.
   * 
   * @param {number} id - ID проекта для редактирования
   */
  const handleEdit = (id: number) => {
    const projectToEdit = projects.find((project) => project.project_id === id);
    if (projectToEdit) {
      setSelectedProject(projectToEdit);
      setIsModalOpen(true);
    }
  };

  /**
   * Удаляет проект по ID с подтверждением и уведомлением.
   * 
   * @async
   * @param {number} id - ID проекта для удаления
   */
  const handleDelete = async (id: number) => {
    await deleteProject(id);
    showNotification('Проект удален', "success");
    setOpenMenu(null);
  };

  /**
   * Закрывает модальное окно редактирования и сбрасывает выбранный проект.
   */
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedProject(null);
  };

  // Состояние загрузки данных
  if (isLoadingDirections || isLoadingEvents || isLoadingTeams) {
    return <span>Загрузка...</span>;
  }

  // Пустой список проектов
  if (projects.length === 0) {
    return <span className="NullMessage">Проекты не найдены</span>;
  }

  /**
   * Возвращает название мероприятия по ID направления.
   * 
   * @param {number} directionId - ID направления
   * @returns {string} Название мероприятия или 'Не указано'
   */
  const getEventName = (directionId: number): string => {
    const direction = directions?.find(direction => direction.id === directionId);
    const event = events?.find(event => event.event_id === direction?.event);
    return event ? event.name : 'Не указано';
  };

  /**
   * Возвращает ID мероприятия по ID направления.
   * 
   * @param {number} directionId - ID направления
   * @returns {string} ID мероприятия или пустая строка
   */
  const getEventId = (directionId: number): string => {
    const direction = directions?.find(direction => direction.id === directionId);
    const event = events?.find(event => event.event_id === direction?.event);
    return event ? event.event_id : '';
  };

  /**
   * Проверяет, может ли пользователь редактировать конкретный проект.
   * @param project - Объект проекта.
   * @returns {boolean} - Возвращает true, если пользователь имеет доступ к редактированию проекта.
   */
  const canEditProject = (project: Project) => {
    // Если пользователь - организатор, разрешение глобальное, доступ ко всем проектам
    if (hasPermission('edit_project') && hasRole('organizer')) {
      return true;
    }

    // Если пользователь - руководитель направления, проверяем доступ к направлению проекта
    if (hasPermission('edit_project') && getRoleForObject('direction_leader', project.directionSet.id, 'crm.direction')) {
      return true;
    }

    //if (hasPermission('edit_project') && getRoleForObject('curator', project.project_id, 'crm.project')) {
      //return true;
    //}

    // В остальных случаях возвращаем false
    return false;
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
      hasPermission("edit_project") && {
        header: '',
        render: (project: Project) =>
          canEditProject(project) && (
            <ActionMenu 
              actions={actions(project)} 
              onClose={handleCloseMenu} 
            />
          ),
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
