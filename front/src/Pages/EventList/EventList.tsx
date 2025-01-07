import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {baseURL} from 'App/config/api';
import { mockUsers } from 'Pages/CreateEvent/ui/mockUsers'
import { allDirections } from 'Pages/CreateEvent/ui/fields/DirectionSelector';

interface Event {
  id: number;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  supervisorId: number;
  chatlink:string;
  directions: number[];
}

export default function EventListPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  useEffect(() => {
    async function fetchEvents() {
      try {
        const response = await axios.get(`${baseURL}/api/events`, {
          withCredentials: true,
        });
        setEvents(response.data);
      } catch (error) {
        console.error('Ошибка при получении мероприятий:', error);
      }
    }
    fetchEvents();
  }, []);

  const handleEventClick = (event: Event) => {
    setSelectedEvent(event);
  };

  return (
    <div className="EventListPage">
      <h1>Список мероприятий</h1>

      <div className="EventList">
        {events.map(event => (
          <div
            key={event.id}
            className="EventItem"
            onClick={() => handleEventClick(event)}
          >
            <h2>{event.name}</h2>
            <p>{event.startDate} - {event.endDate}</p>
          </div>
        ))}
      </div>

      {selectedEvent && (
        <div className="EventDetails">
          <h2>Детали мероприятия: {selectedEvent.name}</h2>
          <p>{selectedEvent.description}</p>
          <p><strong>Дата начала:</strong> {selectedEvent.startDate}</p>
          <p><strong>Дата окончания:</strong> {selectedEvent.endDate}</p>
          <p><strong>Руководитель:</strong> {mockUsers.find(user => user.id === selectedEvent.supervisorId)?.firstName} {mockUsers.find(user => user.id === selectedEvent.supervisorId)?.lastName}</p>
          <p><strong>Ссылка на орг.чат:</strong> {selectedEvent.chatlink}</p>
          <p><strong>Направления:</strong> 
            {selectedEvent.directions?.map(directionId => {
                const direction = allDirections.find(d => d.id === directionId);
                return direction ? `${direction.name}, ` : null;
            })}
            </p>
        </div>
      )}
    </div>
  );
}