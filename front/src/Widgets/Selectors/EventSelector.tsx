import { useState } from 'react';
import { useGetEventsQuery } from 'Features/ApiSlices/eventSlice';
import ChevronRightIcon from 'assets/icons/chevron-right.svg?react';

interface EventSelectorProps {
  selectedEventId: number | null;
  onChange: (eventId: number) => void;
}

export default function EventSelector({
  selectedEventId,
  onChange,
}: EventSelectorProps): JSX.Element {
  const { data: events, isLoading, error } = useGetEventsQuery();
  const [isOpen, setIsOpen] = useState(false);

  const handleSelectEvent = (eventId: number) => {
    onChange(eventId);
  };

  if (isLoading) {
    return <div className="EventSelector">Загрузка мероприятий...</div>;
  }

  if (error || !events || events.length === 0) {
    return <div className="EventSelector">Мероприятия не найдены</div>;
  }

  const selectedEventName = events.find(event => event.id === selectedEventId)?.name || 'Выбрать мероприятие';

  return (
    <div className="EventSelector">
      <div
        className="ListField FormField"
        onClick={() => setIsOpen(prev => !prev)}
      >
        <p>{selectedEventName}</p>
        <ChevronRightIcon
          width="20"
          height="20"
          strokeWidth="1"
          className={`ChevronDown ${isOpen ? 'open' : ''}`}
        />

        {isOpen && (
          <div className="DropdownList">
            {events.map(event => (
              <div
                key={event.id}
                className={`DropdownItem ${selectedEventId === event.id ? 'selected' : ''}`}
                onClick={() => handleSelectEvent(event.id)}
              >
                {event.name}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
