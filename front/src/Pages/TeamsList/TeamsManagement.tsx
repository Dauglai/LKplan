import { useEffect, useState } from "react";
import { useGetTeamsQuery } from "Features/ApiSlices/teamSlice";
import TeamsHeaderPanel from "./TeamsHeaderPanel";
import TeamsListTable from "./TeamsListTable";
import 'Styles/ListTableStyles.scss';


export default function TeamsManagement(): JSX.Element {
    const { data: Teams = [], isLoading } = useGetTeamsQuery();
    const [search, setSearch] = useState("");
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

    useEffect(() => {
        document.title = 'Команды - MeetPoint';
    }, []);

    const handleSearch = (searchValue: string) => {
        setSearch(searchValue.toLowerCase());
    };

    const handleSort = (order: "asc" | "desc") => {
        setSortOrder(order);
    };

    const filteredTeams = Teams
        .filter((event) => event.name.toLowerCase().includes(search))
        .sort((a, b) =>
        sortOrder === "asc"
            ? a.name.localeCompare(b.name)
            : b.name.localeCompare(a.name)
        );

    if (isLoading) return <div>Загрузка...</div>;

    return (
        <div className="TeamsContainer ListTableContainer">
        <TeamsHeaderPanel onSearch={handleSearch} onSort={handleSort}/>
        <TeamsListTable teams={filteredTeams} />
        </div>
    );
};