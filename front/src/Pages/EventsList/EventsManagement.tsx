import { useState } from "react";
import { useGetEventsQuery } from "Features/ApiSlices/eventSlice";
import EventsHeaderPanel from "./EventsHeaderPanel";
import EventsListTable from "./EventsListTable";
import 'Styles/ListTableStyles.scss';


export default function EventsManagement(): JSX.Element {
  const { data: events = [], isLoading } = useGetEventsQuery();
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

  if (isLoading) return <div>Загрузка...</div>;

  return (
    <div className="EventsContainer ListTableContainer">
      <EventsHeaderPanel onSearch={handleSearch} onSort={handleSort}/>
      <EventsListTable events={filteredEvents} />
    </div>
  );
};
