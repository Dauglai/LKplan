import { useState } from "react";
import { useGetEventsQuery, useDeleteEventMutation } from "Features/ApiSlices/eventSlice";
import EventsHeaderPanel from "./EventsHeaderPanel";
import EventsListTable from "./EventsListTable";

export default function EventsManagement(): JSX.Element {
  const { data: events = [], isLoading } = useGetEventsQuery();
  const [deleteEvent] = useDeleteEventMutation();
  const [search, setSearch] = useState("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

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

  const handleDelete = async (id: number) => {
    await deleteEvent(id);
  };

  if (isLoading) return <div>Загрузка...</div>;

  console.log(filteredEvents);

  return (
    <div className="events-page">
      <EventsHeaderPanel onSearch={handleSearch} onSort={handleSort} />
      <EventsListTable events={filteredEvents} onDelete={handleDelete} />
    </div>
  );
};
