import { useEffect, useMemo, useState } from "react";
import { Application, useGetApplicationsQuery } from "Features/ApiSlices/applicationSlice";
import RequestsListTable from "./RequestsListTable";
import 'Styles/components/Sections/ListTableStyles.scss';
import { ChangeStatusModal } from "Components/PageComponents/ChangeStatusModal";
import { Button, Select } from "antd";
import BackButton from "Components/Common/BackButton/BackButton";
import UniversalInput from "Components/Common/UniversalInput";
import { useGetEventsQuery } from "Features/ApiSlices/eventSlice";
import RequestsKanban from "./RequestsKanban";

export default function RequestsManagement(): JSX.Element {
  const { data: requests = [], isLoading } = useGetApplicationsQuery();
  const { data: events = [] } = useGetEventsQuery();
  const [selectedRequests, setSelectedRequests] = useState<Application[]>([]);
  const [isChangeStatusModalOpen, setIsChangeStatusModalOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<'table' | 'kanban'>('table');
  const [selectedEvent, setSelectedEvent] = useState<number | null>(null);

  useEffect(() => {
    document.title = "Список заявок - MeetPoint";
  }, []);

  const handleSearch = (value: string) => setSearch(value.toLowerCase());

  const openStatusModal = (requests: Application[]) => {
    setSelectedRequests(requests);
    setIsChangeStatusModalOpen(true);
  };

  const filteredRequests = useMemo(() => {
    let result = [...requests];
    
    // Фильтр по мероприятию
    if (selectedEvent) {
      result = result.filter(request => 
        request.event?.id === selectedEvent
      );
    }
    
    // Фильтр по поиску
    if (search) {
      result = result.filter(request => {
        const { user } = request;
        const fullName = `${user.surname} ${user.name} ${user.patronymic}`.toLowerCase();
        return fullName.includes(search);
      });
    }
    
    return result;
  }, [requests, selectedEvent, search]);

  const handleStatusChange = async (requestId: number, newStatusId: number) => {
    try {
      // Здесь должна быть ваша функция обновления статуса
      // await updateRequestStatus(requestId, newStatusId);
    } catch (error) {
      console.error('Ошибка при изменении статуса:', error);
    }
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
            <Select
              placeholder="Выберите мероприятие"
              options={events.map(event => ({
                value: event.event_id,
                label: event.name
              }))}
              onChange={(value) => setSelectedEvent(value as number)}
              allowClear
            />
            
            <UniversalInput
              value={search}
              onChange={handleSearch}
              type="text"
              placeholder="Поиск по ФИО"
              withPlaceholder={true}
            />
            
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
            
            <Button
              type="primary"
              onClick={() => setIsChangeStatusModalOpen(true)}
              disabled={selectedRequests.length === 0}
            >
              Изменить статус выбранных
            </Button>
        </div>
      </header>

      {viewMode === 'table' ? (
        <RequestsListTable
          requests={filteredRequests}
          onSelectRequests={setSelectedRequests}
          onOpenStatusModal={openStatusModal}
        />
      ) : (
        <RequestsKanban
          requests={filteredRequests}
          onStatusChange={handleStatusChange}
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
  