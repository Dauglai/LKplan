import { Event } from "Features/ApiSlices/eventSlice";
import 'Styles/ListTableStyles.scss';
import { useState } from "react";

interface EventsTableProps {
  events: Event[];
  onDelete: (id: number) => void;
}

export default function EventsListTable({ events, onDelete, onEdit }: EventsTableProps): JSX.Element {

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
              <button onClick={() => onDelete(event.id)}>Удалить</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};
