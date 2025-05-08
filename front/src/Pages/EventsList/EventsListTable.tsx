import { Event } from "Features/ApiSlices/eventSlice";
import { useState } from 'react';
import { useUserRoles } from "Features/context/UserRolesContext";
import { useNavigate, Link } from "react-router-dom";
import { useDeleteEventMutation } from "Features/ApiSlices/eventSlice";
import { useNotification } from 'Components/Common/Notification/Notification';
import ActionMenu from "Components/Sections/ActionMenu";
import ListTable from "Components/Sections/ListTable";

interface EventsTableProps {
  events: Event[];
}

/**
 * Компонент для отображения списка мероприятий с возможностью редактирования, удаления и подачи заявок.
 * Отображает данные о мероприятиях в таблице, с учетом роли пользователя (организатор или практикант).
 * Для организаторов доступна возможность редактирования и удаления мероприятия, а для практикантов — подачи заявки.
 *
 * @component
 * @example
 * // Пример использования:
 * <EventsListTable events={eventsData} role="Организатор" />
 *
 * @param {Object} props - Пропсы компонента.
 * @param {Event[]} props.events - Список мероприятий для отображения.
 *
 * @returns {JSX.Element} Компонент для отображения списка мероприятий.
 */

export default function EventsListTable({ events }: EventsTableProps): JSX.Element {
  const navigate = useNavigate();
  const [openMenu, setOpenMenu] = useState<number | null>(null); // Состояние для отслеживания открытого меню действий
  const [deleteEvent] = useDeleteEventMutation(); // Мутация для удаления мероприятия
  const { showNotification } = useNotification(); // Хук для отображения уведомлений
  const { hasRole, hasPermission } = useUserRoles();


  const handleCloseMenu = () => setOpenMenu(null); // Закрывает открытое меню действий.

  /**
   * Удалить мероприятие по ID.
   * Отправляет запрос на удаление и отображает уведомление.
   * @param {number} id - ID мероприятия для удаления.
   */

  const handleDelete = async (id: number) => {
    await deleteEvent(id);
    showNotification('Мероприятие удалено', "success");
    setOpenMenu(null);
  };

  /**
   * Открыть модальное окно для редактирования мероприятия.
   * @param {number} id - ID мероприятия для редактирования.
   */

  /**
   * Закрыть модальное окно редактирования мероприятия.
   */

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedEvent(null);
  };

  if (events.length === 0) {
    return <span className="NullMessage">Мероприятия не найдены</span>;
  }

  // Колонки для таблицы
  const columns = [
    {
      header: 'Название',
      render: (event: Event) => (
        <Link to={`/event/${event.event_id}`} className="LinkCell">
          {event.name}
        </Link>
      ),
      sortKey: 'name',
      text: 'Нажмите на мероприятие для просмотра детальной информации',
    },
    {
      header: 'Дата начала',
      render: (event: Event) => (
        <span className="HiglightCell">{event.start ? new Date(event.start).toLocaleDateString() : "-"}</span>
      ),
      sortKey: 'start',
    },
    {
      header: 'Дата окончания',
      render: (event: Event) => (
        <span className="HiglightCell">{event.end ? new Date(event.end).toLocaleDateString() : "-"}</span>
      ),
      sortKey: 'end',
    },
    hasRole("organizer") && {
      header: 'Статус',
      render: (event: Event) => (
        <span className={`HiglightCell ${event.stage === 'Мероприятие завершено' ? 'HighlightGray' : ''}`}>
          {event.stage}
        </span>
      ),
      sortKey: 'stage',
      autoFilters: true,
    },
    /*role === "Практикант" && {
      header: '',
      render: (event: Event) => (
        <button onClick={() => navigate(`submit/${event.event_id}`)} className="primary-btn">
          Подать заявку
        </button>
      )
    },*/
    {
      header: 'Список направлений',
      render: (event: Event) => (
        <ul>
          {event.directions.map((direction) => (
            <li key={direction.id}>
                {direction.name}
            </li>
          ))}
        </ul>
      )
    },
    hasPermission("edit_event") && {
      header: '',
      render: (event: Event) => (
        <ActionMenu 
          actions={actions(event)} 
          onClose={handleCloseMenu}
        />
      )
    }
  ].filter(Boolean);

  /**
   * Генерация списка действий для каждой строки таблицы.
   * @param {Event} event - Мероприятие для генерации действий.
   * @returns {Array} Список действий для меню.
   */

  const actions = (event: Event) => [
    { label: 'Редактировать', onClick: () => navigate(`/event/${event.event_id}/edit`), requiredRole: 'Организатор' },
    { label: 'Удалить', onClick: () => handleDelete(event.event_id), requiredRole: 'Организатор' },
  ];

  return (
    <>
      <ListTable
        data={events}
        columns={columns}
      />
    </>
  );
}
