import { Event } from "Features/ApiSlices/eventSlice";
import 'Styles/ListTableStyles.scss';
import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from "react-router-dom";
import { getInitials } from "Features/utils/getInitials";
import { useDeleteEventMutation } from "Features/ApiSlices/eventSlice";
import { useNotification } from 'Widgets/Notification/Notification';
import EventForm from "./EventForm/EventForm";
import Modal from "Widgets/Modal/Modal";
import ActionMenu from "Components/Common/ActionMenu";
import 'Styles/components/Sections/ListTableStyles.scss';

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
  const { showNotification } = useNotification()

  const handleCloseMenu = () => setOpenMenu(null);

  const handleDelete = async (id: number) => {
    await deleteEvent(id);
    showNotification('Мероприятие удалено', "success")
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

  if (events.length == 0) {
    return <span className="NullMessage">Мероприятия не найдены</span>
  }

  const actions = (event: Event) => [
    { label: 'Редактировать', onClick: () => handleEdit(event.event_id), requiredRole: 'Организатор' },
    { label: 'Удалить', onClick: () => handleDelete(event.event_id), requiredRole: 'Организатор' },
  ];

  return (
    <table className="EventsListTable ListTable">
      <thead>
        <tr>
          <th>Название</th>
          <th>Дата начала</th>
          <th>Дата окончания</th>
          <th>Организатор</th>
          {/*<th>Чат</th>*/}
          {role === "Организатор" && 
            <th>Статус</th>
          }
          <th></th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        {events.map((event) => (
          <tr key={event.event_id}>
            <td><Link to={role === "Организатор" ? `/event/${event.event_id}` : `/events/submit/${event.event_id}`} className="LinkCell">{event.name}</Link></td>
            <td><span className="HiglightCell">{event.start ? new Date(event.start).toLocaleDateString() : "-"}</span></td>
            <td><span className="HiglightCell">{event.end ? new Date(event.end).toLocaleDateString() : "-"}</span></td>
            <td><Link to={`/profile/${event.creator.user_id}`} className="LinkCell">{event.creator.surname} {getInitials(event.creator.name, event.creator.patronymic)}</Link></td>
            {/*<td><Link to={event.link} className="LinkCell">{event.link}</Link></td>*/}
            {role === "Организатор" && 
              <td>
                <span
                  className={`HiglightCell ${event.stage === 'Мероприятие завершено' ? 'HighlightGray' : ''}`}>
                  {event.stage}
                </span>
              </td>
            }
            {role === "Практикант" && 
              <td className="ButtonsColumn">
                <button
                  onClick={() => navigate(`submit/${event.event_id}`)}
                  className="primary-btn">
                  Подать заявку
                </button>
              </td>
            }
            <td>
              <ActionMenu 
                actions={actions(event)} 
                onClose={handleCloseMenu}
                role={role}
              />
            </td>
          </tr>
        ))}
      </tbody>
      {isModalOpen && (
        <Modal isOpen={isModalOpen} onClose={closeModal}>
          <EventForm closeModal={closeModal} existingEvent={selectedEvent} />
        </Modal>
      )}
    </table>
  );
};
