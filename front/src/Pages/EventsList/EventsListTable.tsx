import { Event } from "Features/ApiSlices/eventSlice";
import 'Styles/ListTableStyles.scss';
import { useState, useEffect, useRef } from 'react';


interface EventsTableProps {
  events: Event[];
  onDelete: (id: number) => void;
}

export default function EventsListTable({ events, onDelete, onEdit }: EventsTableProps): JSX.Element {

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

  const handleDelete = (id: number) => {
    onDelete(id);
    setOpenMenu(null);
  };

  const handleEdit = (id: number) => {
    onEdit(id);
    setOpenMenu(null);
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
          <th>Организатор</th>
          <th>Статус</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        {events.map((event) => (
          <tr key={event.id}>
            <td>{event.name}</td>
            <td><span className="HiglightCell">{event.start ? new Date(event.start).toLocaleDateString() : "-"}</span></td>
            <td><span className="HiglightCell">{event.end ? new Date(event.end).toLocaleDateString() : "-"}</span></td>
            <td>{event.creator}</td>
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
                  <li onClick={() => handleDelete(event.id)}>Удалить</li>
                  <li onClick={() => handleEdit(event.id)}>Редактировать</li>
                </ul>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};
