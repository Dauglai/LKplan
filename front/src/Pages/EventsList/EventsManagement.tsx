import { useEffect, useState } from "react";
import { useGetEventsQuery } from "Features/ApiSlices/eventSlice";
import ListsHeaderPanel from "Components/PageComponents/ListsHeaderPanel";
import EventsListTable from "./EventsListTable";
import EventForm from "./EventForm/EventForm";
import { useGetUserQuery } from "Features/ApiSlices/userSlice";
import { CRMPageOptions } from "Widgets/PageSwitcher/CRMPageOptions";

/**
 * Компонент для управления мероприятиями.
 * Загружает и отображает список мероприятий с возможностью поиска.
 * Использует данные о пользователе для отображения компонентов в зависимости от роли.
 *
 * @component
 * @example
 * // Пример использования:
 * <EventsManagement />
 *
 * @returns {JSX.Element} Компонент для управления мероприятиями.
 */
export default function EventsManagement(): JSX.Element {
  const { data: events = [], isLoading } = useGetEventsQuery();
  const { data: user, isLoading: isUserLoading } = useGetUserQuery();
  const [search, setSearch] = useState("");

  useEffect(() => {
    document.title = 'Мероприятия - MeetPoint';
  }, []);

  const handleSearch = (searchValue: string) => {
    setSearch(searchValue.toLowerCase());
  };

  const filteredEvents = events
    .filter((event) => event.name.toLowerCase().includes(search))

  if (isLoading) return <div>Загрузка...</div>;

  return (
    <div className="EventsContainer ListTableContainer">
      <ListsHeaderPanel
        title="Мероприятия"
        onSearch={handleSearch}
        role={user.role}
        PageOptions={CRMPageOptions}
        FormComponent={EventForm}
      />
      <EventsListTable events={filteredEvents} role={user.role}/>
    </div>
  );
};
