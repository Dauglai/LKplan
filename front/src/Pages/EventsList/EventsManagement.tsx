import { useEffect, useState } from "react";
import { useGetEventsQuery } from "Features/ApiSlices/eventSlice";
import ListsHeaderPanel from "Components/PageComponents/ListsHeaderPanel";
import EventsListTable from "./EventsListTable";
import EventForm from "./EventForm/EventForm";
import 'Styles/ListTableStyles.scss';
import { useGetUserQuery } from "Features/ApiSlices/userSlice";
import { CRMPageOptions } from "Widgets/PageSwitcher/CRMPageOptions";


export default function EventsManagement(): JSX.Element {
  const { data: events = [], isLoading } = useGetEventsQuery();
  const { data: user, isLoading: isUserLoading } = useGetUserQuery();
  const [search, setSearch] = useState("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  useEffect(() => {
    document.title = 'Мероприятия - MeetPoint';
  }, []);

  const handleSearch = (searchValue: string) => {
    setSearch(searchValue.toLowerCase());
  };

  const handleSort = (order: "asc" | "desc") => {
    setSortOrder(order);
  };

  const filteredEvents = events
    .filter((event) => event.name.toLowerCase().includes(search))
    .sort((a, b) =>
      sortOrder === "asc"
        ? a.name.localeCompare(b.name)
        : b.name.localeCompare(a.name)
    );

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
