import { Event } from "Features/ApiSlices/eventSlice";
import { useMemo, useState } from 'react';
import { useUserRoles } from "Features/context/UserRolesContext";
import { useNavigate, Link } from "react-router-dom";
import { useDeleteEventMutation } from "Features/ApiSlices/eventSlice";
import { useNotification } from 'Components/Common/Notification/Notification';
import ActionMenu from "Components/Sections/ActionMenu";
import ListTable from "Components/Sections/ListTable";

interface EventsTableProps {
  events: Event[];
  showActiveOnly?: boolean;
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

export default function EventsListTable({ events, showActiveOnly = false }: EventsTableProps): JSX.Element {
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
   * Вспомогательная функция для определения активного мероприятия.
   * Отправляет запрос на удаление и отображает уведомление.
   * @param {number} id - ID мероприятия.
   */
  const isEventActive = (event: Event): boolean => {
    const now = new Date();
    const endDate = event.end ? new Date(event.end) : null;
    
    // Если есть дата окончания и она в прошлом - мероприятие неактивно
    if (endDate && endDate < now) return false;
    
    // Если статус явно указывает на завершение
    if (event.stage === "Мероприятие завершено") return false;
    
    // Статусы, которые считаем активными
    const activeStatuses = [
      "Набор участников",
      "Проведение мероприятия",
      "Редактирование"
    ];
    
    return activeStatuses.includes(event.stage);
  };


  const filteredEvents = useMemo(() => {
    let result = [...events];
    
    if (hasRole("projectant")) {
      // Для проектантов показываем только мероприятия, где открыт набор
      result = result.filter(event => event.stage === "Набор участников");
    } else if (!showActiveOnly) {
      // Для организаторов: если showActiveOnly=false, показываем все
      return result;
    }
    
    // Фильтруем по активности (для организаторов при showActiveOnly=true)
    return result.filter(isEventActive);
  }, [events, hasRole, showActiveOnly]);

  const defaultSort = hasRole("organizer") 
  ? { 
      key: "start" as const, 
      direction: "asc" as const,
      customSort: (a: Event, b: Event) => {
        // Сначала активные, потом неактивные
        const aActive = isEventActive(a);
        const bActive = isEventActive(b);
        
        if (aActive && !bActive) return -1;
        if (!aActive && bActive) return 1;
        
        // Затем сортируем по дате начала
        return new Date(a.start).getTime() - new Date(b.start).getTime();
      }
    }
  : undefined;

  if (filteredEvents.length === 0) {
    return (
        <div className={`empty-message ${hasRole("projectant") ? "for-projectant" : ""}`}>
            {hasRole("projectant") 
                ? "В данный момент нет доступных мероприятий для подачи заявки"
                : "Мероприятия не найдены"}
        </div>
    );
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
        data={filteredEvents}
        columns={columns}
        defaultSort={defaultSort}
      />
    </>
  );
}
