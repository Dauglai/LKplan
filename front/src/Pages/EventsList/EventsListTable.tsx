import { Event } from "Features/ApiSlices/eventSlice";
import 'Styles/ListTableStyles.scss';
import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from "react-router-dom";
import { getInitials } from "Features/utils/getInitials";
import { useDeleteEventMutation } from "Features/ApiSlices/eventSlice";
import { useNotification } from 'Widgets/Notification/Notification';
import EventForm from "./EventForm/EventForm";
import Modal from "Widgets/Modal/Modal";
import MoreIcon from 'assets/icons/more.svg?react';


interface EventsTableProps {
  events: Event[];
  role: string;
}

export default function EventsListTable({ events, role }: EventsTableProps): JSX.Element {
  const navigate = useNavigate();
  const [openMenu, setOpenMenu] = useState<number | null>(null); 
  const menuRef = useRef<HTMLUListElement | null>(null); 
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteEvent] = useDeleteEventMutation();
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const { showNotification } = useNotification()

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

  return (
    <table className="EventsListTable ListTable">
      <thead>
        <tr>
          <th>Название</th>
          <th>Дата начала</th>
          <th>Дата окончания</th>
          <th>Руководитель</th>
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
            <td><Link to={`/profile/${event.supervisorOne.user_id}`} className="LinkCell">{event.supervisorOne.surname} {getInitials(event.supervisorOne.name, event.supervisorOne.patronymic)}</Link></td>
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
              <MoreIcon 
                width="16" 
                height="16" 
                strokeWidth="1"
                onClick={() => toggleMenu(event.event_id)}
                className="ThreeDotsButton"
              />
              {openMenu === event.event_id && (
                <ul ref={menuRef} className="ActionsMenu">
                  {role === "Организатор" && 
                    <>
                      <li onClick={() => navigate(`/event/${event.event_id}`)}>Подробнее</li>
                      <li onClick={() => handleEdit(event.event_id)}>Редактировать</li>
                      <li onClick={() => handleDelete(event.event_id)}>Удалить</li>
                    </>
                  }
                  {role === "Практикант" && 
                    <li onClick={() => navigate(`submit/${event.event_id}`)}>Подробнее</li>
                  }
                </ul>
              )}
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
