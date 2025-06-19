import 'Styles/components/Sections/ListTableStyles.scss';
import { useState, useEffect, useRef, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useNotification } from 'Components/Common/Notification/Notification';
import { getInitials } from "Features/utils/getInitials";
import { useDeleteApplicationMutation } from 'Features/ApiSlices/applicationSlice';
import { useGetProjectsQuery } from "Features/ApiSlices/projectSlice";
import RequestDetailsWrapper from './RequestDetailsWrapper';
import { Application } from 'Features/ApiSlices/applicationSlice';
import ListTable from 'Components/Sections/ListTable';
import MagnifierIcon from 'assets/icons/magnifier.svg?react';
import { useGetEventsQuery } from 'Features/ApiSlices/eventSlice';
import { useGetTeamsQuery } from 'Features/ApiSlices/teamSlice';
import dayjs from 'dayjs';
import { StatusApp, useGetStatusesAppQuery } from 'Features/ApiSlices/statusAppSlice';
import { StatusOrder, useGetStatusOrdersQuery } from 'Features/ApiSlices/statusOrdersSlice';



interface RequestsListTableProps {
    requests: Application[];
    onSelectRequests?: (request: Application[]) => void;
    onOpenStatusModal?: (requests: Application[]) => void;
    showCompleted?: boolean;
}

/**
 * Табличный компонент для отображения списка заявок с возможностью выбора,
 * изменения статуса и удаления. Поддерживает фильтрацию по завершенным заявкам.
 * Интегрирует данные проектов, мероприятий, команд и статусов.
 * 
 * @component
 * @example
 * // Пример использования:
 * <RequestsListTable
 *   requests={filteredRequests}
 *   onSelectRequests={handleSelection}
 *   onOpenStatusModal={openStatusChangeModal}
 *   showCompleted={true}
 * />
 *
 * @param {Object} props - Пропсы компонента.
 * @param {Application[]} props.requests - Массив заявок для отображения.
 * @param {function} [props.onSelectRequests] - Коллбэк при выборе заявок.
 * @param {function} [props.onOpenStatusModal] - Коллбэк открытия модалки статусов.
 * @param {boolean} [props.showCompleted] - Флаг отображения завершенных заявок.
 *
 * @returns {JSX.Element} Таблица с заявками и инструментами управления.
 */
export default function RequestsListTable({ 
    requests, 
    onSelectRequests, 
    onOpenStatusModal,
    showCompleted
}: RequestsListTableProps): JSX.Element {
    const { data: projects = [] } = useGetProjectsQuery(); // Данные проектов для связи с заявками
    const { data: events = [] } = useGetEventsQuery(); // Данные мероприятий для отображения
    const { data: teams = [] } = useGetTeamsQuery(); // Данные команд участников
    const { data: allStatuses = [] } = useGetStatusesAppQuery(); // Все возможные статусы заявок
    const { data: statusOrders = [] } = useGetStatusOrdersQuery(); // Порядок статусов
    
    const [isModalOpen, setIsModalOpen] = useState(false); // Состояние видимости модального окна
    const [selectedRequest, setSelectedRequest] = useState<Application | null>(null); // Выбранная заявка
    const [deleteRequest] = useDeleteApplicationMutation(); // Мутация удаления заявки
    const { showNotification } = useNotification(); // Хук для уведомлений

    // Определяем последние положительные статусы для каждого мероприятия
    const lastPositiveStatuses = useMemo(() => {
        const result: Record<number, StatusApp> = {}; // event_id -> status
        
        // Группируем порядки статусов по мероприятиям
        const statusOrdersByEvent: Record<number, StatusOrder[]> = {};
        statusOrders.forEach(order => {
            if (!statusOrdersByEvent[order.event]) {
                statusOrdersByEvent[order.event] = [];
            }
            statusOrdersByEvent[order.event].push(order);
        });

        // Для каждого мероприятия находим последний положительный статус
        Object.entries(statusOrdersByEvent).forEach(([eventId, orders]) => {
            const sortedOrders = [...orders].sort((a, b) => b.number - a.number);
            const lastPositive = sortedOrders.find(order => {
                const status = allStatuses.find(s => s.id === order.status);
                return status?.is_positive;
            });
            
            if (lastPositive) {
                const status = allStatuses.find(s => s.id === lastPositive.status);
                if (status) {
                    result[Number(eventId)] = status;
                }
            }
        });

        return result;
    }, [allStatuses, statusOrders]);

    // Фильтруем и обогащаем заявки
    const enrichedRequests = useMemo(() => {
        return requests
            .filter(request => {
                if (showCompleted || !request.event?.id) return true;
                const lastPositiveStatus = lastPositiveStatuses[request.event.id];
                return !lastPositiveStatus || request.status.id !== lastPositiveStatus.id;
            })
            .map(request => {
                const project = projects.find(p => p.project_id === request.project);
                const event = events.find(e => e.event_id === request.event?.id);
                const team = teams.find(t => t.id === request.team);
                const date_sub = dayjs(request.date_sub).format('DD.MM.YYYY');
                const time_sub = dayjs(request.date_sub).format('HH:mm');
                const datetime_sub = request.date_sub;
                
                // Определяем цвет статуса
                let statusColor = 'blue'; // по умолчанию
                if (request.event?.id) {
                    const lastPositiveStatus = lastPositiveStatuses[request.event.id];
                    if (lastPositiveStatus && request.status.id === lastPositiveStatus.id) {
                        statusColor = 'green';
                    } else if (!request.status.is_positive) {
                        statusColor = 'red';
                    }
                }

                return {
                    ...request,
                    project,
                    event,
                    team,
                    date_sub,
                    time_sub,
                    datetime_sub,
                    _statusColor: statusColor
                };
            });
    }, [requests, projects, events, teams, lastPositiveStatuses, showCompleted]);

    const handleDelete = async (id: number) => {
        await deleteRequest(id);
        showNotification('Заявка удалена', 'success');
    };

    const openModal = (request: Application) => {
        setSelectedRequest(request);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedRequest(null);
    };

    const columns = [
        {
            header: 'ФИО',
            render: (request: Application) => (
                <Link to={`/profile/${request.user.user_id}`} className="LinkCell">
                    {request.user.surname} {getInitials(request.user.name, request.user.patronymic)}
                </Link>
            ),
            sortKey: 'user.surname',
            width: "150px",
        },
        {
            header: 'Мероприятие',
            render: (request: Application) => {
                return request.event ? (
                <Link to={`/event/${request.event.event_id}`} className="LinkCell">
                    {request.event.name}
                </Link>
                ): (
                    <span>Мероприятие не указано</span>
                );
            },
            sortKey: 'event.name',
            autoFilters: true, 
            text: 'Нажмите на мероприятие для подробностей',
        },
        {
            header: 'Проект',
            render: (request: Application) => {
              return request.project ? (
                <Link to={`/project/${request.project.project_id}`} className="LinkCell">
                  {request.project.name}
                </Link>
              ) : (
                <span>-</span>
              );
            },
            sortKey: 'project.name',
            text: 'Нажмите на проект для подробностей',  
            autoFilters: true,      
        },          
        {
            header: 'Статус',
            render: (request: Application & { _statusColor?: string }) => (
                <span
                    className={`HiglightCell ${request._statusColor || 'blue'}`}
                    onClick={() => onOpenStatusModal?.([request])}
                    style={{ cursor: 'pointer' }}
                    title="Изменить статус"
                >
                    {request.status.name}
                </span>
            ),
            sortKey: 'status.name',
            autoFilters: true,
            text: 'Нажмите на статус для изменения',  
        },
        {
            header: 'Специализация',
            render: (request: Application) => {
                return request.specialization ? (
                <span className="HiglightCell">{request.specialization.name}</span>
                ) : (
                  <span>-</span>
                );
              },
            sortKey: 'specialization.name',
            autoFilters: true,
        },
        {
            header: 'Время подачи',
            render: (request: Application) => (
                <span className="HiglightCell">{request.time_sub} {request.date_sub}</span>
            ),
            sortKey: 'datetime_sub',
        },
        {
            header: 'Команда',
            render: (request: Application) =>
                request.team ? (
                    <Link to={`/team/${request.team.id}`} className="LinkCell">
                        {request.team.name}
                    </Link>
                ) : (
                    <span>-</span>
                ),
                //sortKey: 'team.name',
        },
        {
            header: '',
            render: (request: Application) => (
                <MagnifierIcon
                    width="24"
                    height="24"
                    strokeWidth="1"
                    onClick={() => openModal(request)}/>
            )
        },
    ];

    return (
        <>
            <ListTable
                data={enrichedRequests}
                columns={columns}
                onSelectRows={(selected) => onSelectRequests?.(selected)}
            />
            {isModalOpen && selectedRequest && (
                <RequestDetailsWrapper onClose={closeModal} request={selectedRequest} open={isModalOpen}/>
            )}
        </>
    );
}
