import { Event } from "Features/ApiSlices/eventSlice";

interface EventsTableProps {
  events: Event[];
  onDelete: (id: number) => void;
}

export default function EventsListTable({ events, onDelete }: EventsTableProps): JSX.Element {
  return (
    <table className="events-table">
      <thead>
        <tr>
          <th>Название</th>
          <th>Дата начала</th>
          <th>Дата окончания</th>
          <th>Организатор</th>
          <th>Статус</th>
          <th>Действия</th>
        </tr>
      </thead>
      <tbody>
        {events.map((event) => (
          <tr key={event.id}>
            <td>{event.name}</td>
            <td>{event.start ? new Date(event.start).toLocaleDateString() : "-"}</td>
            <td>{event.end ? new Date(event.end).toLocaleDateString() : "-"}</td>
            <td>{event.creator}</td>
            <td>{event.stage}</td>
            <td>
              <button onClick={() => onDelete(event.id)}>Удалить</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};
