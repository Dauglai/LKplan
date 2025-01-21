import { useEffect, useState } from "react";
import { useGetApplicationsQuery } from "Features/ApiSlices/applicationSlice";
import RequestsHeaderPanel from "./RequestsHeaderPanel";
import RequestsListTable from "./RequestsListTable";
import 'Styles/ListTableStyles.scss';
import { useGetStatusesAppQuery } from "Features/ApiSlices/statusAppSlice";
import { useGetProjectsQuery } from "Features/ApiSlices/projectSlice";
import { useGetEventsQuery } from "Features/ApiSlices/eventSlice";
import { useGetDirectionsQuery } from "Features/ApiSlices/directionSlice";

export default function RequestsManagement(): JSX.Element {
    const { data: requests = [], isLoading } = useGetApplicationsQuery();
    const { data: statuses = [] } = useGetStatusesAppQuery();
    const { data: projects = [] } = useGetProjectsQuery();
    const { data: events = [] } = useGetEventsQuery();
    const { data: directions = [] } = useGetDirectionsQuery();
  
    const [search, setSearch] = useState("");
    const [sortField, setSortField] = useState<"name" | "date">("name");
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
    const [filters, setFilters] = useState({
        status: "",
        project: "",
        event: "",
        direction: "",
    });

    useEffect(() => {
        document.title = 'Список заявок - MeetPoint';
    }, []);
  
    const handleSearch = (value: string) => setSearch(value.toLowerCase());
    const handleSort = (order: "asc" | "desc", field: "name" | "date") => {
        setSortField(field);
        setSortOrder(order);
    };
    const handleFilter = (type: string, value: string) => {
        setFilters((prev) => ({ ...prev, [type]: value }));
    };
  
    const filteredRequests = requests
        .filter((request) => {
            const { user, status, project, event, direction } = request;
            const fullName = `${user.surname} ${user.name} ${user.patronymic}`.toLowerCase();
            const matchesSearch = fullName.includes(search);
            const matchesFilters =
            (!filters.status || status.id === +filters.status) &&
            (!filters.project || project.project_id === +filters.project) &&
            (!filters.event || event.id === +filters.event) &&
            (!filters.direction || direction.id === +filters.direction);
            return matchesSearch && matchesFilters;
        })
        .sort((a, b) => {
            if (sortField === "name") {
            return sortOrder === "asc"
                ? a.user.surname.localeCompare(b.user.surname)
                : b.user.surname.localeCompare(a.user.surname);
            }
            return sortOrder === "asc"
            ? new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime()
            : new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime();
        });
  
    if (isLoading) return <div>Загрузка...</div>;
  
    return (
        <div className="RequestsContainer ListTableContainer">
            <RequestsHeaderPanel
            onSearch={handleSearch}
            onSort={handleSort}
            onFilter={handleFilter}
            statuses={statuses}
            projects={projects}
            events={events}
            directions={directions}
            />
            <RequestsListTable requests={filteredRequests} />
        </div>
    );
}
  
  