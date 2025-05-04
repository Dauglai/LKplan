import { useEffect, useState } from "react";
import { useGetProjectsQuery } from "Features/ApiSlices/projectSlice";
import ProjectsListTable from "./ProjectsListTable";
import 'Styles/components/Sections/ListTableStyles.scss';
import ListsHeaderPanel from "Components/PageComponents/ListsHeaderPanel";
import { useGetUserQuery } from "Features/ApiSlices/userSlice";
import { CRMPageOptions } from 'Widgets/PageSwitcher/CRMpageOptions.tsx';
import CreateProjectModal from "Pages/ProjectForm/CreateProjectModal";


/**
 * Компонент для управления проектами.
 * Загружает и отображает список проектов с возможностью поиска.
 * Использует компонент для отображения заголовка с панелью поиска.
 *
 * @component
 * @example
 * // Пример использования:
 * <ProjectsManagement />
 *
 * @returns {JSX.Element} Компонент для управления проектами.
 */

export default function ProjectsManagement(): JSX.Element {
  const { data: projects = [], isLoading } = useGetProjectsQuery(); // Получение списка проектов с сервера.
  const { data: user, isLoading: isUserLoading } = useGetUserQuery(); // Получение информации о текущем пользователе.
  const [search, setSearch] = useState(""); // Состояние для хранения строки поиска.
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    document.title = 'Проекты - MeetPoint'; // Устанавливает заголовок страницы при монтировании компонента.
  }, []);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  /**
   * Обработчик изменения строки поиска.
   * Преобразует значение в нижний регистр и обновляет состояние.
   * 
   * @param {string} searchValue - Значение поискового запроса.
   */
  const handleSearch = (searchValue: string) => {
    setSearch(searchValue.toLowerCase()); // Преобразует строку поиска в нижний регистр.
  };

  /**
   * Фильтрация списка проектов по названию.
   * Если название проекта содержит подстроку из поиска, оно отображается.
   */
  const filteredProjects = projects.filter((project) =>
    project.name.toLowerCase().includes(search)
  );

  if (isLoading) return <div>Загрузка...</div>;  // Отображение индикатора загрузки, если данные еще не загружены.

  return (
    <div className="ProjectsContainer ListTableContainer">
      {/* Панель заголовка со строкой поиска и настройками страницы */}
      <ListsHeaderPanel
        title="Проекты"
        onSearch={handleSearch}
        role={user.role}
        PageOptions={CRMPageOptions}
        onAddClick={openModal}
      />
      
      {/* Таблица с проектами */}
      <ProjectsListTable projects={filteredProjects} role={user.role}/>
      <CreateProjectModal isOpen={isModalOpen} onClose={closeModal} />
    </div>
  );
}