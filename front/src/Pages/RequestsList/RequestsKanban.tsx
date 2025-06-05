import { Application, usePartialUpdateApplicationMutation } from "Features/ApiSlices/applicationSlice";
import { useGetEventsQuery } from "Features/ApiSlices/eventSlice";
import { useGetProjectsQuery } from "Features/ApiSlices/projectSlice";
import { useGetTeamsQuery } from "Features/ApiSlices/teamSlice";
import { getInitials } from "Features/utils/getInitials";
import { useMemo, useState } from "react";
import { DragDropContext, Draggable, Droppable, DropResult } from "react-beautiful-dnd";
import RequestDetailsWrapper from "./RequestDetailsWrapper";
import dayjs from 'dayjs';
import "./RequestsKanban.scss";
import useNotification from "antd/es/notification/useNotification";
import { useGetStatusOrdersQuery } from "Features/ApiSlices/statusOrdersSlice";
import { StatusApp } from "Features/ApiSlices/statusAppSlice";

interface RequestsKanbanProps {
    requests: Application[];
}

export default function RequestsKanban({ 
    requests, 
}: RequestsKanbanProps): JSX.Element {
    const { data: projects = [] } = useGetProjectsQuery();
    const [updateRequest, { isLoading }] = usePartialUpdateApplicationMutation();
    const { data: events = [] } = useGetEventsQuery();
    const { data: teams = [] } = useGetTeamsQuery();
    const { data: statusOrders = [] } = useGetStatusOrdersQuery();
    const [selectedRequest, setSelectedRequest] = useState<Application | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { showNotification } = useNotification();
    
    // Получаем упорядоченные статусы
    const orderedStatuses = useMemo(() => {
  // Создаем копию массива перед сортировкой
        return [...statusOrders]
            .sort((a, b) => a.number - b.number)
            .map(order => {
            // Находим первый запрос с нужным статусом
            const requestWithStatus = requests.find(r => r.status.id === order.status);
            return requestWithStatus?.status;
            })
            .filter((status): status is StatusApp => status !== undefined);
        }, [statusOrders, requests]);

    // Группируем заявки по статусам
    const requestsByStatus = useMemo(() => {
        const grouped: Record<number, Application[]> = {};
        
        requests.forEach(request => {
            if (!grouped[request.status.id]) {
                grouped[request.status.id] = [];
            }
            grouped[request.status.id].push(request);
        });

        return grouped;
    }, [requests]);

    // Обогащаем данные заявок
    const enrichedRequests = useMemo(() => {
        return requests.map(request => {
            const project = projects.find(p => p.project_id === request.project);
            const event = events.find(e => e.event_id === request.event?.id);
            const team = teams.find(t => t.id === request.team);
            const date_sub = dayjs(request.date_end).format('DD.MM.YYYY');
            const time_sub = dayjs(request.date_end).format('HH:mm');

            return {
                ...request,
                project,
                event,
                team,
                date_sub,
                time_sub
            };
        });
    }, [requests, projects, events, teams]);

    const onDragEnd = async (result: DropResult) => {
        const { destination, source, draggableId } = result;

        if (!destination || destination.droppableId === source.droppableId) return;

        const requestId = parseInt(draggableId.replace('request-', ''));
        const newStatusId = parseInt(destination.droppableId.replace('status-', ''));

        try {
            // Оптимистичное обновление UI
            const updatedRequests = requests.map(request => 
                request.id === requestId 
                    ? { ...request, status: { ...request.status, id: newStatusId } }
                    : request
            );
            
            // Вызываем мутацию
            await updateRequest({
                id: requestId,
                data: { status: newStatusId }
            }).unwrap();

            showNotification('Статус заявки успешно изменен', 'success');
        } catch (error) {
            console.error('Ошибка при изменении статуса:', error);
            showNotification('Не удалось изменить статус заявки', 'error');
        }
    };

    const openModal = (request: Application) => {
        const enriched = enrichedRequests.find(r => r.id === request.id) || request;
        setSelectedRequest(enriched);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedRequest(null);
    };

    return (
        <>
            <DragDropContext onDragEnd={onDragEnd}>
                <div className="kanban-container">
                    {orderedStatuses.map(status => {
                        const columnRequests = requestsByStatus[status.id] || [];
                        return (
                            <div key={`status-${status.id}`} className="kanban-column">
                                <div className="kanban-column-header">
                                    <h3>{status.name}</h3>
                                    <span className="badge">{columnRequests.length}</span>
                                </div>
                                
                                <Droppable droppableId={`status-${status.id}`}>
                                    {(provided) => (
                                        <div
                                            ref={provided.innerRef}
                                            {...provided.droppableProps}
                                            className="kanban-cards"
                                        >
                                            {columnRequests.map((request, index) => {
                                                const enriched = enrichedRequests.find(r => r.id === request.id) || request;
                                                return (
                                                    <Draggable
                                                        key={`request-${request.id}`}
                                                        draggableId={`request-${request.id}`}
                                                        index={index}
                                                        isDragDisabled={isLoading}
                                                    >
                                                        {(provided) => (
                                                            <div
                                                                ref={provided.innerRef}
                                                                {...provided.draggableProps}
                                                                {...provided.dragHandleProps}
                                                                className="kanban-card"
                                                                onClick={() => openModal(request)}
                                                            >
                                                                <div className="card-header">
                                                                    <h4>
                                                                        Мероприятие: {enriched.event?.name || 'Мероприятие не указано'}
                                                                    </h4>
                                                                </div>
                                                                <div className="card-footer">
                                                                    <span className="date">
                                                                        от {enriched.date_sub}
                                                                    </span>
                                                                    <span className="user">
                                                                        {enriched.user.surname} {enriched.user.name} {enriched.user.patronymic}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </Draggable>
                                                );
                                            })}
                                            {provided.placeholder}
                                        </div>
                                    )}
                                </Droppable>
                            </div>
                        );
                    })}
                </div>
            </DragDropContext>

            {isModalOpen && selectedRequest && (
                <RequestDetailsWrapper 
                    onClose={closeModal} 
                    request={selectedRequest} 
                    open={isModalOpen}
                />
            )}
        </>
    );
}