import { Event, useGetEventsQuery } from 'Features/ApiSlices/eventSlice'; // Тип Event и API-запрос мероприятий
import { Select, Spin } from 'antd'; // Компоненты Ant Design
import "Styles/FormSelectorStyle.scss"; // Стили компонента

const { Option } = Select; // Деструктуризация Option из Select

/**
 * Интерфейс пропсов компонента EventSelector.
 * 
 * @property {Event | number | null} [selectedEvent] - Выбранное мероприятие (может быть объектом, ID или null).
 * @property {(event: Event) => void} onChange - Колбэк при изменении выбора мероприятия.
 */
interface EventSelectorProps {
  selectedEvent?: Event | number | null;
  onChange: (event: Event) => void;
}

/**
 * Компонент выбора мероприятия из списка.
 * Загружает список мероприятий с сервера и предоставляет интерфейс для выбора.
 * 
 * @component
 * @example
 * // Пример использования:
 * <EventSelector
 *   selectedEvent={currentEvent}
 *   onChange={(event) => setCurrentEvent(event)}
 * />
 *
 * @param {EventSelectorProps} props - Пропсы компонента.
 * @returns {JSX.Element} Выпадающий список мероприятий или состояние загрузки/ошибки.
 */
export default function EventSelector({
  selectedEvent,
  onChange,
}: EventSelectorProps): JSX.Element {
  const { data: events, isLoading } = useGetEventsQuery(); // Получаем список мероприятий с сервера

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

