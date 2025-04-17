import 'Styles/components/Sections/ListTableStyles.scss';
import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useNotification } from 'Widgets/Notification/Notification';
import { getInitials } from "Features/utils/getInitials";
import { useDeleteApplicationMutation } from 'Features/ApiSlices/applicationSlice';
import { useGetProjectsQuery } from "Features/ApiSlices/projectSlice";
import RequestDetailsWrapper from './RequestDetailsWrapper';
import { Application } from 'Features/ApiSlices/applicationSlice';
import ListTable from 'Components/Sections/ListTable';
import MagnifierIcon from 'assets/icons/magnifier.svg?react';


interface RequestsListTableProps {
    requests: Application[];
    role: string;
}

export default function RequestsListTable({ requests, role }: RequestsListTableProps): JSX.Element {
    const [openMenu, setOpenMenu] = useState<number | null>(null);
    const { data: projects = [], isLoading } = useGetProjectsQuery(); // Получение списка проектов с сервера.
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

    const getProjectById = (id: number) => projects.find(project => project.project_id === id);


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
            render: (request: Application) => (
                <Link to={`/event/${request.event.id}`} className="HiglightCell LinkCell">
                    {request.event.name}
                </Link>
            ),
            sortKey: 'event.name',
            text: 'Нажмите на мероприятие для подробностей',
        },
        {
            header: 'Проект',
            render: (request: Application) => {
              const project = getProjectById(request.project);
              return project ? (
                <Link to={`/project/${project.project_id}`} className="HiglightCell LinkCell">
                  {project.name}
                </Link>
              ) : (
                <span className="HiglightCell">Проект не найден</span>
              );
            },
            text: 'Нажмите на проект для подробностей',        
        },          
        {
            header: 'Статус',
            render: (request: Application) => (
                <span className="HiglightCell">{request.status.name}</span>
            ),
            sortKey: 'status.name',
        },
        {
            header: 'Специализация',
            render: (request: Application) => (
                <span className="HiglightCell">{request.specialization.name}</span>
            ),
            sortKey: 'specialization.name',
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
                data={requests}
                columns={columns}
            />
            {isModalOpen && selectedRequest && (
                <RequestDetailsWrapper onClose={closeModal} request={selectedRequest} open={isModalOpen}/>
            )}
        </>
    );
}
