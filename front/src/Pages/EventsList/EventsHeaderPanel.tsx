import { useState } from "react";
import { useNavigate } from "react-router-dom";

interface EventsHeaderProps {
  onSearch: (search: string) => void;
  onSort: (order: "asc" | "desc") => void;
}

export default function EventsHeaderPanel({ onSearch, onSort }: EventsHeaderProps): JSX.Element {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  const handleSearch = () => {
    onSearch(search);
  };

  return (
    <header className="events-header">
      <h1>Мероприятия</h1>
      <div className="actions">
        <input
          type="text"
          value={search}
          placeholder="Поиск по названию..."
          onChange={(e) => setSearch(e.target.value)}
        />
        <button onClick={handleSearch}>Поиск</button>
        <button onClick={() => onSort("asc")}>Сортировать ↑</button>
        <button onClick={() => onSort("desc")}>Сортировать ↓</button>
        <button onClick={() => navigate("/create-new-event")}>Создать</button>
      </div>
    </header>
  );
};

