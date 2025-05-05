import { useEffect, useState } from "react";
import { useGetDirectionsQuery, useDeleteDirectionMutation } from "Features/ApiSlices/directionSlice";
import DirectionsListTable from "./DirectionsListTable";
import 'Styles/components/Sections/ListTableStyles.scss';
import { useNotification } from 'Components/Common/Notification/Notification';
import { filterItemsBySearch } from "Features/utils/searchUtils";
import ListsHeaderPanel from "Components/PageComponents/ListsHeaderPanel";
import { CRMPageOptions } from "Components/Sections/PageSwitcher/CRMpageOptions";
import { useGetUserQuery } from "Features/ApiSlices/userSlice";
import CreateDirectionModal from "Pages/DirectionForm/CreateDirectionModal";

/**
 * Компонент для управления направлениями.
 * Загружает и отображает список направлений с возможностью поиска.
 *
 * @component
 * @example
 * // Пример использования:
 * <DirectionsManagement />
 *
 * @returns {JSX.Element} Компонент для управления направлениями.
 */
export default function DirectionsManagement(): JSX.Element {
  const { data: directions = [], isLoading } = useGetDirectionsQuery(); // Получение направлений с сервера.
  const { data: user, isLoading: isUserLoading } = useGetUserQuery(); // Получение информации о текущем пользователе.
  const [deleteDirection] = useDeleteDirectionMutation(); // Мутация для удаления направления.
  const { showNotification } = useNotification(); // Вызов уведомлений.
  const [search, setSearch] = useState(""); // Состояние строки поиска.
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    document.title = "Направления - MeetPoint"; // Устанавливаем заголовок страницы.
  }, []);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  /**
   * Обработчик изменения строки поиска.
   * @param {string} searchValue - Значение поискового запроса.
   */
  const handleSearch = (searchValue: string) => {
    setSearch(searchValue.trim().toLowerCase());
  };

  /**
   * Удаляет направление по ID.
   * После успешного удаления показывает уведомление.
   * @param {number} id - ID удаляемого направления.
   */
  const handleDelete = async (id: number) => {
    await deleteDirection(id);
    showNotification("Направление удалено", "success");
  };

  // Фильтрация направлений по названию
  const filteredDirections = filterItemsBySearch(directions, search, "name");

  if (isLoading || isUserLoading) return <div>Загрузка...</div>;  // Отображение индикатора загрузки, если данные еще не загружены.

  return (
    <div className="DirectionsContainer ListTableContainer">
      <ListsHeaderPanel
        title="Направления"
        onSearch={handleSearch}
        role={user.role}
        PageOptions={CRMPageOptions}
        onAddClick={openModal}
      />
      <DirectionsListTable directions={filteredDirections} onDelete={handleDelete} />
      <CreateDirectionModal isOpen={isModalOpen} onClose={closeModal} />
    </div>
  );
}