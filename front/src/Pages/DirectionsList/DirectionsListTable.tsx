import 'Styles/components/Sections/ListTableStyles.scss';
import { useState, useEffect, useRef } from 'react';
import { useGetEventsQuery } from 'Features/ApiSlices/eventSlice';
import { useGetProjectsQuery } from 'Features/ApiSlices/projectSlice';
import { useGetUsersQuery } from 'Features/ApiSlices/userSlice';
import { Direction } from 'Features/ApiSlices/directionSlice';
import { Link } from 'react-router-dom';
import { getInitials } from "Features/utils/getInitials";
import { useUserRoles } from 'Features/context/UserRolesContext';
import ActionMenu from 'Components/Sections/ActionMenu';
import ListTable from "Components/Sections/ListTable";
import EditDirectionModal from 'Pages/DirectionForm/EditDirectionModal';

interface DirectionsTableProps {
  directions: Direction[];
  onDelete: (id: number) => void;
}

/**
 * Компонент для отображения списка направлений с возможностью редактирования и удаления.
 * Отображает данные о направлениях, связанными с мероприятиями и проектами.
 * Для каждого направления доступны действия редактирования и удаления.
 * 
 * @component
 * @example
 * // Пример использования:
 * <DirectionsListTable directions={directionsData} onDelete={handleDelete} />
 *
 * @param {Object} props - Пропсы компонента.
 * @param {Direction[]} props.directions - Список направлений для отображения.
 * @param {function} props.onDelete - Функция для удаления направления.
 *
 * @returns {JSX.Element} Компонент для отображения списка направлений.
 */

export default function DirectionsListTable({ directions, onDelete }: DirectionsTableProps): JSX.Element {
    const { data: events, isLoading: isLoadingEvents } = useGetEventsQuery();
    const { data: projects, isLoading: isLoadingProjects } = useGetProjectsQuery();
    const { data: users, isLoading, error } = useGetUsersQuery();
    const { hasPermission, getRoleForObject, hasRole } = useUserRoles();

    const [openMenu, setOpenMenu] = useState<number | null>(null);
    const [selectedDirection, setSelectedDirection] = useState<Direction | null>(null);
    const menuRef = useRef<HTMLUListElement | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

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

    /**
   * Открыть модальное окно для редактирования направления.
   * @param {number} id - ID направления для редактирования.
   */
    const handleEdit = (id: number) => {
        const directionToEdit = directions.find((dir) => dir.id === id);
        if (directionToEdit) {
          setSelectedDirection(directionToEdit);
          setIsModalOpen(true);
        }
    };

    /**
   * Закрыть модальное окно редактирования направления.
   */
    
    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedDirection(null);
    };

    /**
   * Удалить направление по ID.
   * @param {number} id - ID направления для удаления.
   */

    const handleDelete = (id: number) => {
        onDelete(id);
        setOpenMenu(null);
    };

    if (isLoadingEvents || isLoadingProjects) {
        return <span>Загрузка...</span>;
    }

    if (directions.length === 0) {
        return <span className="NullMessage">Направления не найдены</span>;
    }

    /**
   * Получить название мероприятия по ID.
   * @param {number} eventId - ID мероприятия.
   * @returns {string} Название мероприятия.
   */
    const getEventName = (eventId: number): string => {
        const event = events?.find((event) => event.event_id === eventId);
        return event ? event.name : 'Не указано';
    };

    /**
   * Получить список проектов, связанных с направлением.
   * @param {number} directionId - ID направления.
   * @returns {Array} Список проектов для данного направления.
   */
    const getProjectsForDirection = (directionId: number) => {
        return projects?.filter((project) => project.directionSet.id === directionId) || [];
    };

    /**
     * Проверяет, может ли пользователь редактировать конкретное направление.
     * 
     * @param direction - Объект направления.
     * @returns {boolean} - Возвращает true, если пользователь имеет доступ к редактированию.
     */
    const canEditDirection = (direction: Direction) => {
      // Если пользователь - организатор, разрешение глобальное, доступ к всем направлениям
      if (hasPermission('edit_direction') && hasRole('organizer')) {
        return true;
      }
    
      // Если пользователь - руководитель направления, проверяем доступ к конкретному объекту
      if (hasPermission('edit_direction') && getRoleForObject('direction_leader', direction.id, 'crm.direction')) {
        return true;
      }
    
      // В остальных случаях возвращаем false
      return false;
    };

    // Генерация колонок для таблицы
  const columns = [
    {
      header: 'Название',
      render: (direction: Direction) => direction.name,
      sortKey: 'name',
      text: 'Название направления',
      width: '200px',
    },
    {
      header: 'Мероприятие',
      render: (direction: Direction) => (
        <Link to={`/event/${direction.event}`} className="HiglightCell">
          {getEventName(direction.event)}
        </Link>
      ),
      sortKey: 'event',
      text: 'Нажмите на мероприятие для подробностей',
      width: '200px',
    },
    {
      header: 'Руководитель',
      render: (direction: Direction) => {
        // Ищем пользователя по ID руководителя
        const leader = users?.find(user => user.user_id === direction.leader);
  
        // Если нашли, выводим фамилию и инициалы, если нет — выводим сообщение о том, что руководитель не найден
        if (leader) {
          return (
            <Link to={`/profile/${leader.user_id}`} className="LinkCell">
              {leader.surname} {getInitials(leader.name, leader.patronymic)}
            </Link>
          );
        } else {
          return 'Руководитель не найден';
        }
      },
      text: 'Нажмите на руководителя для просмотра детальной информации',
      width: '200px',
    },
    {
      header: 'Проекты',
      render: (direction: Direction) => (
        <ul>
          {getProjectsForDirection(direction.id).map((project) => (
            <li key={project.project_id}>
              <Link to={`/project/${project.project_id}`} className="LinkCell">
                {project.name}
              </Link>
            </li>
          ))}
        </ul>
      ),
      text: 'Нажмите на проект из списка, чтобы узнать подробнее',
    },
    hasPermission("edit_direction") && {
      header: '',
      render: (direction: Direction) =>
        canEditDirection(direction) && (
          <ActionMenu 
            actions={actions(direction)} 
            onClose={() => setOpenMenu(null)} 
          />
        ),
    },
  ].filter(Boolean);

  /**
   * Генерация списка действий для каждой строки таблицы.
   * @param {Direction} direction - Направление для генерации действий.
   * @returns {Array} Список действий для меню.
   */
  const actions = (direction: Direction) => [
    { label: 'Редактировать', onClick: () => handleEdit(direction.id) },
    { label: 'Удалить', onClick: () => handleDelete(direction.id) },
  ];

  return (
    <>
      <ListTable data={directions} columns={columns} />
      {isModalOpen && (
          <EditDirectionModal 
          direction={selectedDirection} 
          isOpen={isModalOpen}
          onClose={closeModal}/>
      )}
    </>
  );
}
