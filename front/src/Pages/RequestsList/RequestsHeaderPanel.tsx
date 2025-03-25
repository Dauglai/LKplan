import { useState } from "react";
import SearchIcon from "assets/icons/search.svg?react";
import ArrowIcon from "assets/icons/arrow-down.svg?react";
import ChevronRightIcon from "assets/icons/chevron-right.svg?react";
import 'Styles/components/PageComponents/HeaderPanelStyle.scss';
import { FiltersSelector } from "Widgets/Selectors/FiltersSelector";
import BackButton from "Widgets/BackButton/BackButton";

interface RequestsHeaderPanelProps {
  onSearch: (searchValue: string) => void;
  onSort: (order: "asc" | "desc", field: "name" | "date") => void;
  onFilter: (filterType: "status" | "project" | "event" | "direction", value: string | null) => void;
  statuses: { id: number; name: string }[];
  projects: { project_id: number; name: string }[];
  events: { event_id: number; name: string }[];
  directions: { id: number; name: string }[];
}

export default function RequestsHeaderPanel({
  onSearch,
  onSort,
  onFilter,
  statuses,
  projects,
  events,
  directions,
}: RequestsHeaderPanelProps): JSX.Element {
    const [search, setSearch] = useState("");
    const [sortOrderName, setSortOrderName] = useState<"asc" | "desc">("asc");
    const [sortOrderDate, setSortOrderDate] = useState<"asc" | "desc">("asc");

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSearch(value);
        onSearch(value);
    };

    const handleSortChange = (field: "name" | "date") => {
        if (field === "name") {
        const newOrder = sortOrderName === "asc" ? "desc" : "asc";
        setSortOrderName(newOrder);
        onSort(newOrder, "name");
        } else if (field === "date") {
        const newOrder = sortOrderDate === "asc" ? "desc" : "asc";
        setSortOrderDate(newOrder);
        onSort(newOrder, "date");
        }
    };

    const handleFilterChange = (
        type: "status" | "project" | "event" | "direction",
        value: string | null
    ) => {
        onFilter(type, value);
    };

    return (
        <div className="RequestsHeaderPanel HeaderPanel">
            <div className="LeftHeaderPanel">
                <BackButton />
                <h2 className="HeaderPanelTitle">Заявки</h2>
            </div>

            <div className="RightHeaderPanel">
                <div className="SortOptions">
                <div className="SortButton rght-btn" onClick={() => handleSortChange("name")}>
                    <span className="SortIcons">
                    <ArrowIcon
                        className={`SortIcon ${sortOrderName === "asc" ? "active" : ""}`}
                        width="16"
                        height="16"
                    />
                    <ArrowIcon
                        className={`SortIcon ArrowUp ${sortOrderName === "desc" ? "active" : ""}`}
                        width="16"
                        height="16"
                    />
                    </span>
                    Имя
                </div>
                <div className="SortButton rght-btn" onClick={() => handleSortChange("date")}>
                    <span className="SortIcons">
                    <ArrowIcon
                        className={`SortIcon ${sortOrderDate === "asc" ? "active" : ""}`}
                        width="16"
                        height="16"
                    />
                    <ArrowIcon
                        className={`SortIcon ArrowUp ${sortOrderDate === "desc" ? "active" : ""}`}
                        width="16"
                        height="16"
                    />
                    </span>
                    Дата
                </div>
                </div>

                <div className="SearchInputWrapper">
                <input
                    type="text"
                    className="SearchInput"
                    value={search}
                    onChange={handleSearchChange}
                    placeholder="Поиск по ФИО"
                />
                <SearchIcon className="SearchInputIcon" width="20" height="20" />
                </div>

                <div className="FiltersPanel">
                <FiltersSelector
                    options={statuses}
                    placeholder="Статус"
                    onSelect={(value) => handleFilterChange("status", value)}
                />
                <FiltersSelector
                    options={projects.map(({ project_id, name }) => ({
                    id: project_id,
                    name,
                    }))}
                    placeholder="Проект"
                    onSelect={(value) => handleFilterChange("project", value)}
                />
                <FiltersSelector
                    options={events.map(({ event_id, name }) => ({
                    id: event_id,
                    name,
                    }))}
                    placeholder="Мероприятие"
                    onSelect={(value) => handleFilterChange("event", value)}
                />
                <FiltersSelector
                    options={directions}
                    placeholder="Направление"
                    onSelect={(value) => handleFilterChange("direction", value)}
                />
                </div>
            </div>
        </div>
    );
}
