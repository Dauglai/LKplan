import { Event } from "Features/ApiSlices/eventSlice";
import 'Styles/ListTableStyles.scss';
import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from "react-router-dom";
import { getInitials } from "Features/utils/getInitials";
import EventForm from "./EventForm/EventForm";
import Modal from "Widgets/Modal/Modal";


interface EventsTableProps {
  events: Event[];
  //onDelete: (id: number) => void;
}

export default function EventsListTable({ events, /*onDelete,*/ }: EventsTableProps): JSX.Element {
  const navigate = useNavigate();
  const [openMenu, setOpenMenu] = useState<number | null>(null); 
  const menuRef = useRef<HTMLUListElement | null>(null); 
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

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

  /*const handleDelete = (id: number) => {
    onDelete(id);
    setOpenMenu(null);
  };*/

  const handleEdit = (id: number) => {
    const EventToEdit = events.find((dir) => dir.id === id);
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
          <th>Статус</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        {events.map((event) => (
          <tr key={event.id}>
            <td><Link to={`/event/${event.id}`} className="LinkCell">{event.name}</Link></td>
            <td><span className="HiglightCell">{event.start ? new Date(event.start).toLocaleDateString() : "-"}</span></td>
            <td><span className="HiglightCell">{event.end ? new Date(event.end).toLocaleDateString() : "-"}</span></td>
            <td>{event.supervisor.surname} {getInitials(event.supervisor.name, event.supervisor.patronymic)}</td>
            <td>
              <span
                className={`HiglightCell ${event.stage === 'Мероприятие завершено' ? 'HighlightGray' : ''}`}
              >
                {event.stage}
              </span>
            </td>
            <td>
              <div onClick={() => toggleMenu(event.id)} className="ThreeDotsButton">
                &#8230;
              </div>
              {openMenu === event.id && (
                <ul ref={menuRef} className="ActionsMenu">
                  <li onClick={() => navigate(`/event/${event.id}`)}>Подробнее</li>
                  <li onClick={() => handleEdit(event.id)}>Редактировать</li>
                  {/*<li onClick={() => handleDelete(event.id)}>Удалить</li>*/}
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
