import 'Styles/components/Sections/ListTableStyles.scss';
import { useState, useEffect, useRef, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useNotification } from 'Widgets/Notification/Notification';
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


interface RequestsListTableProps {
    requests: Application[];
    role: string;
}

export default function RequestsListTable({ requests, role }: RequestsListTableProps): JSX.Element {
    const [openMenu, setOpenMenu] = useState<number | null>(null);
    const { data: projects = []} = useGetProjectsQuery(); // Получение списка проектов с сервера.
    const { data: events = [] } = useGetEventsQuery();
    const { data: teams = [] } = useGetTeamsQuery();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState<Application | null>(null);
    const [deleteRequest] = useDeleteApplicationMutation();
    const menuRef = useRef<HTMLUListElement | null>(null);
    const navigate = useNavigate();
    const { showNotification } = useNotification();

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setOpenMenu(null);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleCloseMenu = () => setOpenMenu(null); // Закрывает открытое меню действий.

    const enrichedRequests = useMemo(() => {
        return requests.map(request => {
          const project = projects.find(p => p.project_id === request.project);
          const event = events.find(e => e.event_id === request.event?.id);
          const team = teams.find(t => t.id === request.team);
          const date_sub = dayjs(request.date_sub).format('DD.MM.YYYY');
          const time_sub = dayjs(request.date_sub).format('HH:mm');
          const datetime_sub = request.date_sub;

      
          return {
            ...request,
            project,
            event,
            team,
            date_sub,
            time_sub,
            datetime_sub
          };
        });
      }, [requests, projects, events, teams]);

    const handleDelete = async (id: number) => {
        await deleteRequest(id);
        showNotification('Заявка удалена', 'success');
        setOpenMenu(null);
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
        },
        {
            header: 'Мероприятие',
            render: (request: Application) => {
                return request.event ? (
                <Link to={`/event/${request.event.event_id}`} className="HiglightCell LinkCell">
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
                <Link to={`/project/${request.project.project_id}`} className="HiglightCell LinkCell">
                  {request.project.name}
                </Link>
              ) : (
                <span>Проект не указан</span>
              );
            },
            sortKey: 'project.name',
            text: 'Нажмите на проект для подробностей',  
            autoFilters: true,      
        },          
        {
            header: 'Статус',
            render: (request: Application) => (
                <span className="HiglightCell">{request.status.name}</span>
            ),
            sortKey: 'status.name',
            autoFilters: true,
        },
        {
            header: 'Специализация',
            render: (request: Application) => (
                <span className="HiglightCell">{request.specialization.name}</span>
            ),
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
                    'Не указана'
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
            />
            {isModalOpen && selectedRequest && (
                <RequestDetailsWrapper onClose={closeModal} request={selectedRequest} open={isModalOpen}/>
            )}
        </>
    );
}
