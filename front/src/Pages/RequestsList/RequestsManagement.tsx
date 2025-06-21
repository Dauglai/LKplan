import { useEffect, useMemo, useState } from "react";
import { Application, useGetApplicationsQuery } from "Features/ApiSlices/applicationSlice";
import RequestsListTable from "./RequestsListTable";
import 'Styles/components/Sections/ListTableStyles.scss';
import { ChangeStatusModal } from "Components/PageComponents/ChangeStatusModal";
import { Button, Select, Switch } from "antd";
import BackButton from "Components/Common/BackButton/BackButton";
import UniversalInput from "Components/Common/UniversalInput";
import { Event, useGetEventsQuery } from "Features/ApiSlices/eventSlice";
import RequestsKanban from "./RequestsKanban";

/**
 * Компонент управления заявками с возможностью просмотра в табличном виде или Kanban,
 * фильтрации по мероприятиям, поиска и изменения статусов. 
 * Является основным компонентом раздела управления заявками.
 *
 * @component
 * @example
 * // Пример использования:
 * <RequestsManagement />
 *
 * @returns {JSX.Element} Компонент управления заявками с переключением режимов просмотра
 */
export default function RequestsManagement(): JSX.Element {
  const { data: requests = [], isLoading } = useGetApplicationsQuery(); // Загрузка списка заявок
  const { data: events = [] } = useGetEventsQuery(); // Загрузка списка мероприятий
  const [selectedRequests, setSelectedRequests] = useState<Application[]>([]); // Выбранные заявки
  const [isChangeStatusModalOpen, setIsChangeStatusModalOpen] = useState(false); // Видимость модалки статусов
  const [search, setSearch] = useState(""); // Текст поиска
  const [viewMode, setViewMode] = useState<'table' | 'kanban'>('table'); // Режим просмотра
  const [selectedEvent, setSelectedEvent] = useState<number | null>(null); // Выбранное мероприятие
  const [showCompletedRequests, setShowCompletedRequests] = useState(false); // Флаг показа завершенных заявок

  /**
   * Установка заголовка страницы и выбор мероприятия по умолчанию
   */
  useEffect(() => {
    document.title = "Список заявок - MeetPoint";
    if (events.length > 0 && selectedEvent === null) {
      const defaultEventId = getDefaultEvent(events);
      setSelectedEvent(defaultEventId);
    }
  }, [events, selectedEvent]);

  /**
   * Обработчик поиска по заявкам
   * @param {string} value - Строка поиска
   */
  const handleSearch = (value: string) => setSearch(value.toLowerCase());

  /**
   * Открытие модального окна изменения статуса
   * @param {Application[]} requests - Массив заявок для изменения статуса
   */
  const openStatusModal = (requests: Application[]) => {
    setSelectedRequests(requests);
    setIsChangeStatusModalOpen(true);
  };

  // Фильтрация заявок
    const filteredRequests = useMemo(() => {
        let result = [...requests];
        
        // Фильтр по мероприятию (только для режима kanban)
        if (viewMode === 'kanban' && selectedEvent) {
            result = result.filter(request => 
                request.event?.id === selectedEvent
            );
        }
        
        // Фильтр по поиску (работает в обоих режимах)
        if (search) {
            result = result.filter(request => {
                const { user } = request;
                const fullName = `${user.surname} ${user.name} ${user.patronymic}`.toLowerCase();
                return fullName.includes(search.toLowerCase());
            });
        }
        
        return result;
    }, [requests, selectedEvent, search, viewMode]);

  const handleStatusChange = async (requestId: number, newStatusId: number) => {
    try {
      // Здесь должна быть ваша функция обновления статуса
      // await updateRequestStatus(requestId, newStatusId);
    } catch (error) {
      console.error('Ошибка при изменении статуса:', error);
    }
  };

  const getDefaultEvent = (events: Event[]): number | null => {
      if (events.length === 0) return null;
      
      const now = new Date();
      
      // 1. Ищем текущие мероприятия (которые уже начались, но еще не закончились)
      const ongoingEvents = events.filter(event => {
          const start = event.start ? new Date(event.start) : null;
          const end = event.end ? new Date(event.end) : null;
          
          return start && end && start <= now && end >= now;
      });
      
      if (ongoingEvents.length > 0) {
          // Если есть текущие мероприятия, берем первое
          return ongoingEvents[0].event_id;
      }
      
      // 2. Ищем ближайшее будущее мероприятие
      const futureEvents = events
          .filter(event => {
              const start = event.start ? new Date(event.start) : null;
              return start && start > now;
          })
          .sort((a, b) => {
              const aStart = a.start ? new Date(a.start) : new Date(0);
              const bStart = b.start ? new Date(b.start) : new Date(0);
              return aStart.getTime() - bStart.getTime();
          });
      
      if (futureEvents.length > 0) {
          return futureEvents[0].event_id;
      }
      
      // 3. Если ничего не найдено, берем последнее завершенное мероприятие
      const pastEvents = events
          .filter(event => {
              const end = event.end ? new Date(event.end) : null;
              return end && end < now;
          })
          .sort((a, b) => {
              const aEnd = a.end ? new Date(a.end) : new Date(0);
              const bEnd = b.end ? new Date(b.end) : new Date(0);
              return bEnd.getTime() - aEnd.getTime();
          });
      
      return pastEvents[0]?.event_id || null;
  };

  if (isLoading) return <div>Загрузка...</div>;

  return (
    <div className="RequestsContainer ListTableContainer">
      <header className="ListsHeaderPanel HeaderPanel">
        <div className="LeftHeaderPanel">
          <BackButton />
          <h2 className="HeaderPanelTitle">Список заявок</h2>
        </div>

        <div className="RightHeaderPanel">
            {viewMode === 'kanban' ? (
              <Select
                placeholder="Выберите мероприятие"
                options={events.map(event => ({
                  value: event.event_id,
                  label: event.name
                }))}
                onChange={(value) => setSelectedEvent(value as number)}
                value={selectedEvent}
              />
                ) : (
                <div className="table-controls">
                  <Switch 
                    checked={showCompletedRequests}
                    onChange={setShowCompletedRequests}
                    />
                  <span>Показать завершенные</span>
                </div>
            )}
            
            <UniversalInput
              value={search}
              onChange={handleSearch}
              type="text"
              placeholder="Поиск по ФИО"
              withPlaceholder={true}
            />
            
            <Button
              type="primary"
              onClick={() => setIsChangeStatusModalOpen(true)}
              disabled={selectedRequests.length === 0}
            >
              Изменить статус выбранных
            </Button>

            <Button.Group>
              <Button 
                type={viewMode === 'table' ? 'primary' : 'default'}
                onClick={() => setViewMode('table')}
              >
                Таблица
              </Button>
              <Button 
                type={viewMode === 'kanban' ? 'primary' : 'default'}
                onClick={() => setViewMode('kanban')}
              >
                Канбан
              </Button>
            </Button.Group>
        </div>
      </header>

      {viewMode === 'table' ? (
        <RequestsListTable
          requests={filteredRequests}
          onSelectRequests={setSelectedRequests}
          onOpenStatusModal={openStatusModal}
          showCompleted={showCompletedRequests}
        />
      ) : (
        <RequestsKanban
          requests={filteredRequests}
          eventId={selectedEvent}
        />
      )}

      {isChangeStatusModalOpen && (
        <ChangeStatusModal
          open={isChangeStatusModalOpen}
          onClose={() => setIsChangeStatusModalOpen(false)}
          requests={selectedRequests}
        />
      )}
    </div>
  );
}
  