import { useState } from "react";
import { useGetDirectionsQuery, useDeleteDirectionMutation } from "Features/ApiSlices/directionSlice";
import DirectionsHeaderPanel from "./DirectionsHeaderPanel";
import DirectionsListTable from "./DirectionsListTable";
import 'Styles/ListTableStyles.scss';
import { useNotification } from 'Widgets/Notification/Notification';

export default function DirectionsManagement(): JSX.Element {
  const { data: Directions = [], isLoading } = useGetDirectionsQuery();
  const [deleteDirection] = useDeleteDirectionMutation();
  const [search, setSearch] = useState("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const { showNotification } = useNotification()

  const handleSearch = (searchValue: string) => {
    setSearch(searchValue.toLowerCase());
  };

  const handleSort = (order: "asc" | "desc") => {
    setSortOrder(order);
  };

  const handleDelete = async (id: number) => {
    await deleteDirection(id);
    showNotification('Направление удалено', "success")
  };

  const filteredDirections = Directions
    .filter((direction) => direction.name.toLowerCase().includes(search))
    .sort((a, b) =>
      sortOrder === "asc"
        ? a.name.localeCompare(b.name)
        : b.name.localeCompare(a.name)
    );

  if (isLoading) return <div>Загрузка...</div>;

  console.log(filteredDirections);

  return (
    <div className="DirectionsContainer ListTableContainer">
      <DirectionsHeaderPanel onSearch={handleSearch} onSort={handleSort} />
      <DirectionsListTable directions={filteredDirections} onDelete={handleDelete} />
    </div>
  );
};