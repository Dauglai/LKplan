import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { baseURL } from 'App/config/api';
import { mockUsers } from 'Pages/CreateEvent/ui/mockUsers';
import { allDirections } from 'Pages/CreateEvent/ui/fields/DirectionSelector';

interface Event {
  id: number;
  name: string;
  description: string;
  start: string;
  end: string;
  supervisor: number;
  link: string;
  directions: { id: number; name: string }[];
}

export default function EventListPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [users, setUsers] = useState([]);
  useEffect(() => {
    async function fetchEvents() {
      try {
        const response = await axios.get(`${baseURL}/api/events`, {
          withCredentials: true,
        });
        setEvents(response.data.results);
        console.log(response.data);
      } catch (error) {
        console.error('Ошибка при получении мероприятий:', error);
      }
    }
    async function fetchUsers() {
      try {
        const response = await axios.get(`${baseURL}/api/profile`, {
          withCredentials: true,
        });
        setUsers(response.data.results);
        console.log(response.data);
      } catch (error) {
        console.error('Ошибка при получении профилей:', error);
      }
    }
    fetchEvents();
    fetchUsers();
  }, []);

  const handleEventClick = (event: Event) => {
    setSelectedEvent(event);
  };

  return (
    <div className="EventListPage">
      <h1>Список мероприятий</h1>

      <div className="EventList">
        {events.map((event) => (
          <div
            key={event.id}
            className="EventItem"
            onClick={() => handleEventClick(event)}
          >
            <h2>{event.name}</h2>
            <p>
              {event.start} - {event.end}
            </p>
          </div>
        ))}
      </div>

      {selectedEvent && (
        <div className="EventDetails">
          <h2>Детали мероприятия: {selectedEvent.name}</h2>
          <p>{selectedEvent.description}</p>
          <p>
            <strong>Дата начала:</strong> {selectedEvent.start}
          </p>
          <p>
            <strong>Дата окончания:</strong> {selectedEvent.end}
          </p>
          <p>
            <strong>Руководитель:</strong>{' '}
            {
              users.find((user) => user.author.id === selectedEvent.supervisor)
                ?.name
            }{' '}
            {
              users.find((user) => user.author.id === selectedEvent.supervisor)
                ?.surname
            }
          </p>
          <p>
            <strong>Ссылка на орг.чат:</strong> {selectedEvent.link}
          </p>
          <p>
            <strong>Направления:</strong>
            {selectedEvent.directions?.map((direction) => {
              return direction ? `${direction.name}, ` : null;
            })}
          </p>
        </div>
      )}
    </div>
  );
}
