import { Application, usePartialUpdateApplicationMutation } from "Features/ApiSlices/applicationSlice";
import { useGetEventsQuery } from "Features/ApiSlices/eventSlice";
import { useGetProjectsQuery } from "Features/ApiSlices/projectSlice";
import { useGetTeamsQuery } from "Features/ApiSlices/teamSlice";
import { useEffect, useMemo, useState } from "react";
import { DragDropContext, Draggable, Droppable, DropResult } from "react-beautiful-dnd";
import RequestDetailsWrapper from "./RequestDetailsWrapper";
import dayjs from 'dayjs';
import "./RequestsKanban.scss";
import { useNotification } from 'Components/Common/Notification/Notification';
import { useGetStatusOrdersByEventQuery } from "Features/ApiSlices/statusOrdersSlice";
import { StatusApp, useGetStatusesAppQuery } from "Features/ApiSlices/statusAppSlice";

interface RequestsKanbanProps {
    requests: Application[];
    eventId: number | null;
}

/**
 * Компонент Kanban-доски для отображения и управления заявками.
 * Позволяет перемещать заявки между статусами, просматривать детали и управлять ими.
 * Интегрируется с данными о проектах, мероприятиях, командах и статусами.
 * 
 * @component
 * @example
 * // Пример использования:
 * <RequestsKanban 
 *   requests={applicationsData} 
 *   eventId={selectedEventId} 
 * />
 *
 * @param {Object} props - Пропсы компонента.
 * @param {Application[]} props.requests - Массив заявок для отображения.
 * @param {number | null} props.eventId - ID текущего мероприятия (null если не выбран).
 *
 * @returns {JSX.Element} Kanban-доска с заявками, сгруппированными по статусам.
 */
export default function RequestsKanban({ 
    requests,
    eventId
}: RequestsKanbanProps): JSX.Element {
    const { data: projects = [] } = useGetProjectsQuery(); // Данные проектов для отображения в карточках заявок
    const [updateRequest, { isLoading }] = usePartialUpdateApplicationMutation(); // Мутация для обновления статуса заявки
    const { data: events = [] } = useGetEventsQuery(); // Данные мероприятий для отображения в карточках
    const { data: teams = [] } = useGetTeamsQuery(); // Данные команд для отображения в карточках
    const { data: allStatuses = [] } = useGetStatusesAppQuery(); // Все возможные статусы заявок
    const [selectedRequest, setSelectedRequest] = useState<Application | null>(null); // Состояние выбранной заявки для модального окна
    const [isModalOpen, setIsModalOpen] = useState(false); // Состояние видимости модального окна
    const { showNotification } = useNotification(); // Хук для показа уведомлений
    
    // Получение порядка статусов для конкретного мероприятия
    const { data: eventStatusOrders = [], isLoading: isLoadingStatuses } = useGetStatusOrdersByEventQuery(
        eventId ?? 0,
        { skip: !eventId }
    );

    // Локальное состояние заявок для оптимистичных обновлений
    const [localRequests, setLocalRequests] = useState<Application[]>(requests);

    // Синхронизируем с props
    useEffect(() => {
        setLocalRequests(requests);
    }, [requests]);

    const hasNoStatuses = !isLoadingStatuses && eventStatusOrders.length === 0 && eventId;
    
    // Определяем последний положительный статус для текущего мероприятия
    const lastPositiveStatusId = useMemo(() => {
        if (!eventId) return null;
        
        const sortedOrders = [...eventStatusOrders]
            .sort((a, b) => b.number - a.number);
            
        const lastPositive = sortedOrders.find(order => {
            const status = allStatuses.find(s => s.id === order.status);
            return status?.is_positive;
        });
        
        return lastPositive?.status || null;
    }, [eventStatusOrders, allStatuses, eventId]);
    
    
    
    // Создаем копию массива статусов для сортировки
    const orderedStatuses = useMemo(() => {
        // Создаем новый массив, а не мутируем существующий
        const statusOrdersCopy = [...eventStatusOrders];
        
        return statusOrdersCopy
            .sort((a, b) => a.number - b.number)
            .map(order => {
                const status = allStatuses.find(s => s.id === order.status);
                if (!status) return null;
                
                let color = 'blue';
                if (status.id === lastPositiveStatusId) {
                    color = 'green';
                } else if (!status.is_positive) {
                    color = 'red';
                }
                
                return {
                    ...status,
                    _color: color,
                    _orderId: order.id
                };
            })
            .filter(Boolean) as Array<StatusApp & { _color: string; _orderId: number }>;
    }, [eventStatusOrders, allStatuses, lastPositiveStatusId]);
    
    // Группируем заявки по статусам (с созданием нового объекта)
    const requestsByStatus = useMemo(() => {
        const grouped: Record<number, Application[]> = {};
        
        localRequests.forEach(request => {
            const statusId = request.status.id;
            if (!grouped[statusId]) {
                grouped[statusId] = [];
            }
            grouped[statusId].push(request);
        });
        
        return grouped;
    }, [localRequests]);
    
    // Обогащаем данные заявок (с созданием нового массива)
    const enrichedRequests = useMemo(() => {
        return localRequests.map(request => {
            const project = projects.find(p => p.project_id === request.project);
            const event = events.find(e => e.event_id === request.event?.id);
            const team = teams.find(t => t.id === request.team);
            
            return {
                ...request,
                project,
                event,
                team,
                date_sub: dayjs(request.date_end).format('DD.MM.YYYY'),
                time_sub: dayjs(request.date_end).format('HH:mm')
            };
        });
    }, [localRequests, projects, events, teams]);
    
    // Оптимизированное перетаскивание с валидацией ID
    const onDragEnd = async (result: DropResult) => {
        const { destination, source, draggableId } = result;
        
        if (!destination || destination.droppableId === source.droppableId || isLoading) {
            return;
        }
        
        const requestIdMatch = draggableId.match(/request-(\d+)/);
        const requestId = requestIdMatch ? parseInt(requestIdMatch[1]) : NaN;
        
        const statusIdMatch = destination.droppableId.match(/status-(\d+)/);
        const newStatusId = statusIdMatch ? parseInt(statusIdMatch[1]) : NaN;
        
        if (isNaN(requestId) || isNaN(newStatusId)) {
            showNotification('Ошибка перемещения', 'error');
            return;
        }
        
        // Находим перемещаемую заявку
        const requestToMove = localRequests.find(r => r.id === requestId);
        if (!requestToMove) return;
        
        // Оптимистичное обновление UI
        setLocalRequests(prev => {
            const newRequests = [...prev];
            const requestIndex = newRequests.findIndex(r => r.id === requestId);
            
            if (requestIndex !== -1) {
                // Создаем обновленную заявку
                const updatedRequest = {
                    ...newRequests[requestIndex],
                    status: {
                        ...newRequests[requestIndex].status,
                        id: newStatusId,
                        name: allStatuses.find(s => s.id === newStatusId)?.name || newRequests[requestIndex].status.name
                    }
                };
                
                newRequests[requestIndex] = updatedRequest;
            }
            
            return newRequests;
        });
        
        try {
            await updateRequest({
                id: requestId,
                data: { status: newStatusId }
            }).unwrap();
            
            // Не нужно обновлять состояние, так как мы уже синхронизированы с сервером
        } catch (error) {
            // Откатываем изменения при ошибке
            setLocalRequests(requests);
            showNotification('Не удалось изменить статус', 'error');
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
    
    if (!eventId) {
        return (
            <div className="empty-state">
                <p>Выберите мероприятие для отображения канбан-доски</p>
            </div>
        );
    }

    if (hasNoStatuses) {
        return (
            <div className="empty-state">
                <h3>Для выбранного мероприятия нет статусов</h3>
                <p>Добавьте статусы в настройках мероприятия</p>
            </div>
        );
    }
    
    
    return (
        <>
            <DragDropContext onDragEnd={onDragEnd}>
                <div className="kanban-container">
                    {orderedStatuses.map(status => {
                        const columnRequests = requestsByStatus[status.id] || [];
                        return (
                            <div key={`status-${status.id}`} className="kanban-column">
                                <div className={"kanban-column-header " + `${status._color}`}>
                                    <h3>{status.name}</h3>
                                    <span className="badge">{columnRequests.length}</span>
                                </div>
                                
                                <Droppable 
                                    droppableId={`status-${status.id}`}
                                    isDropDisabled={isLoading}
                                >
                                    {(provided, snapshot) => (
                                        <div
                                            ref={provided.innerRef}
                                            {...provided.droppableProps}
                                            className={`kanban-cards ${snapshot.isDraggingOver ? 'dragging-over' : ''}`}
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
                                                        {(provided, snapshot) => (
                                                            <div
                                                                ref={provided.innerRef}
                                                                {...provided.draggableProps}
                                                                {...provided.dragHandleProps}
                                                                className={`kanban-card ${snapshot.isDragging ? 'is-moving' : ''}`}
                                                                onClick={() => openModal(request)}
                                                            >
                                                                <div className="card-header">
                                                                    <h4>
                                                                        {enriched.event?.name || 'Мероприятие не указано'}
                                                                    </h4>
                                                                    {enriched.project && (
                                                                        <span className="project-tag">
                                                                            {enriched.project.name}
                                                                        </span>
                                                                    )}
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