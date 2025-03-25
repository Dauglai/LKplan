import { Event } from "Features/ApiSlices/eventSlice";
import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from "react-router-dom";
import { getInitials } from "Features/utils/getInitials";
import { useDeleteEventMutation } from "Features/ApiSlices/eventSlice";
import { useNotification } from 'Widgets/Notification/Notification';
import EventForm from "./EventForm/EventForm";
import Modal from "Widgets/Modal/Modal";
import ActionMenu from "Components/Common/ActionMenu";
import ListTable from "Components/Sections/ListsTable";

interface EventsTableProps {
  events: Event[];
  role: string;
}

export default function EventsListTable({ events, role }: EventsTableProps): JSX.Element {
  const navigate = useNavigate();
  const [openMenu, setOpenMenu] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteEvent] = useDeleteEventMutation();
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const { showNotification } = useNotification();

  const handleCloseMenu = () => setOpenMenu(null);

  const handleDelete = async (id: number) => {
    await deleteEvent(id);
    showNotification('Мероприятие удалено', "success");
    setOpenMenu(null);
  };

  const handleEdit = (id: number) => {
    const EventToEdit = events.find((event) => event.event_id === id);
    if (EventToEdit) {
      setSelectedEvent(EventToEdit);
      setIsModalOpen(true);
    }
  };

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
        <Link to={role === "Организатор" ? `/event/${event.event_id}` : `/events/submit/${event.event_id}`} className="LinkCell">
          {event.name}
        </Link>
      ),
      sortKey: 'name',
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
    {
      header: 'Организатор',
      render: (event: Event) => (
        <Link to={`/profile/${event.creator.user_id}`} className="LinkCell">
          {event.creator.surname} {getInitials(event.creator.name, event.creator.patronymic)}
        </Link>
      ),
      sortKey: 'creator.surname',
    },
    role === "Организатор" && {
      header: 'Статус',
      render: (event: Event) => (
        <span className={`HiglightCell ${event.stage === 'Мероприятие завершено' ? 'HighlightGray' : ''}`}>
          {event.stage}
        </span>
      ),
      sortKey: 'stage',
    },
    role === "Практикант" && {
      header: '',
      render: (event: Event) => (
        <button onClick={() => navigate(`submit/${event.event_id}`)} className="primary-btn">
          Подать заявку
        </button>
      )
    },
    {
      header: '',
      render: (event: Event) => (
        <ActionMenu 
          actions={actions(event)} 
          onClose={handleCloseMenu}
          role={role}
        />
      )
    }
  ].filter(Boolean); // Убираем пустые элементы для ненужных столбцов

  // Действия для каждого мероприятия
  const actions = (event: Event) => [
    { label: 'Редактировать', onClick: () => handleEdit(event.event_id), requiredRole: 'Организатор' },
    { label: 'Удалить', onClick: () => handleDelete(event.event_id), requiredRole: 'Организатор' },
  ];

  return (
    <>
      <ListTable
        data={events}
        columns={columns}
      />
      {isModalOpen && (
        <Modal isOpen={isModalOpen} onClose={closeModal}>
          <EventForm closeModal={closeModal} existingEvent={selectedEvent} />
        </Modal>
      )}
    </>
  );
}
