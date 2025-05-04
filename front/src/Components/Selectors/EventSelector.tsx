import { Event, useGetEventsQuery } from 'Features/ApiSlices/eventSlice';
import { Select, Spin } from 'antd';
import "Styles/FormSelectorStyle.scss";

const { Option } = Select;

interface EventSelectorProps {
  selectedEvent?: Event | number | null;
  onChange: (event: Event) => void;
}

export default function EventSelector({
  selectedEvent,
  onChange,
}: EventSelectorProps): JSX.Element {
  const { data: events, isLoading } = useGetEventsQuery();

  if (isLoading) {
    return <Spin />;
  }

  if (!events || events.length === 0) {
    return <div>Мероприятия не найдены</div>;
  }

  const selectedEventId = typeof selectedEvent === 'number' 
    ? selectedEvent 
    : selectedEvent?.event_id;

  return (
    <Select
      value={selectedEventId ?? undefined}
      onChange={(id) => {
        const selected = events.find((e) => e.event_id === id);
        if (selected) onChange(selected);
      }}
      placeholder="Выберите мероприятие"
      style={{ width: '100%' }}
      optionFilterProp="children"
      showSearch
    >
      {events.map((event) => (
        <Option key={event.event_id} value={event.event_id}>
          {event.name}
        </Option>
      ))}
    </Select>
  );
}

