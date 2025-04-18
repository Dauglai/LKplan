import { useEffect, useState } from "react";
import { useGetApplicationsQuery } from "Features/ApiSlices/applicationSlice";
import RequestsListTable from "./RequestsListTable";
import 'Styles/components/Sections/ListTableStyles.scss';
import { useGetUserQuery } from "Features/ApiSlices/userSlice";
import ListsHeaderPanel from "Components/PageComponents/ListsHeaderPanel";

export default function RequestsManagement(): JSX.Element {
    const { data: requests = [], isLoading } = useGetApplicationsQuery();
    const { data: user, isLoading: isUserLoading } = useGetUserQuery(); // Получение информации о текущем пользователе.
  
    const [search, setSearch] = useState("");

    useEffect(() => {
        document.title = 'Список заявок - MeetPoint';
    }, []);
  
    const handleSearch = (value: string) => setSearch(value.toLowerCase());

    const filteredRequests = requests
         .filter((request) => {
             const { user } = request;
             const fullName = `${user.surname} ${user.name} ${user.patronymic}`.toLowerCase();
             const matchesSearch = fullName.includes(search);
             return matchesSearch;
         })

  
    if (isLoading) return <div>Загрузка...</div>;
  
    return (
        <div className="RequestsContainer ListTableContainer">
            {/* Панель заголовка со строкой поиска и настройками страницы */}
            <ListsHeaderPanel
                title="Список заявок"
                onSearch={handleSearch}
                //role={user.role}
                //PageOptions={CRMPageOptions}
            />
            <RequestsListTable requests={filteredRequests} role={user.role}/>
        </div>
    );
}
  