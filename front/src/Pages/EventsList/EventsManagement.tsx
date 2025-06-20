import { useEffect, useState } from "react";
import { useGetEventsQuery } from "Features/ApiSlices/eventSlice";

import ListsHeaderPanel from "Components/PageComponents/ListsHeaderPanel";
import EventsListTable from "./EventsListTable";
import { CRMPageOptions } from "Components/Sections/PageSwitcher/CRMpageOptions";
import { normalizeSearchQuery, filterItemsBySearch } from "Features/utils/searchUtils";

/**
 * Компонент для управления мероприятиями.
 * Загружает и отображает список мероприятий с возможностью поиска.
 * Использует данные о пользователе для отображения компонентов в зависимости от роли.
 *
 * @component
 * @example
 * // Пример использования:
 * <EventsManagement />
 *
 * @returns {JSX.Element} Компонент для управления мероприятиями.
 */
export default function EventsManagement(): JSX.Element {
  const { data: events = [], isLoading } = useGetEventsQuery(); // Получение списка мероприятий с сервера.
  const [search, setSearch] = useState(""); // Состояние для хранения строки поиска.
  const [showActiveOnly, setShowActiveOnly] = useState(true); // По умолчанию показываем только активные


  useEffect(() => {
    document.title = 'Мероприятия - MeetPoint'; // Устанавливает заголовок страницы при монтировании компонента.
  }, []);

  /**
   * Обработчик изменения строки поиска.
   * Преобразует значение в нижний регистр и обновляет состояние.
   * 
   * @param {string} searchValue - Значение поискового запроса.
   */
  const handleSearch = (searchValue: string) => {
    setSearch(normalizeSearchQuery(searchValue));
  };

  /**
   * Фильтрация списка мероприятий по названию.
   * Если название мероприятия содержит подстроку из поиска, оно отображается.
   */

  const filteredEvents = filterItemsBySearch(events, search, "name");

   
  if (isLoading) return <div>Загрузка...</div>;  // Отображение индикатора загрузки, если данные еще не загружены.

  return (
    <div className="EventsContainer ListTableContainer">
      {/* Панель заголовка со строкой поиска и настройками страницы */}
      <ListsHeaderPanel
        title="Мероприятия"
        onSearch={handleSearch}
        PageOptions={CRMPageOptions}
        link="/event-setup"
        permission="create_event"
        showSwitch={true}
        switchChecked={!showActiveOnly}
        onSwitchChange={() => setShowActiveOnly(!showActiveOnly)}
        switchLabel="Показать неактивные"
      />

      {/* Таблица с мероприятиями */}
      <EventsListTable 
        events={filteredEvents}
        showActiveOnly={showActiveOnly}
      />
    </div>
  );
};
