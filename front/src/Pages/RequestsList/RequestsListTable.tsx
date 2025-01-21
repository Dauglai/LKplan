import 'Styles/ListTableStyles.scss';
import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useNotification } from 'Widgets/Notification/Notification';
import { getInitials } from "Features/utils/getInitials";
import { useDeleteApplicationMutation } from 'Features/ApiSlices/applicationSlice';
import Modal from 'Widgets/Modal/Modal';
import { Request } from 'Pages/Requests/typeRequests';
import MoreIcon from 'assets/icons/more.svg?react';


interface RequestsListTableProps {
    requests: Request[];
}

export default function RequestsListTable({ requests }: RequestsListTableProps): JSX.Element {
    const [openMenu, setOpenMenu] = useState<number | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);
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

    const toggleMenu = (id: number) => {
        setOpenMenu(openMenu === id ? null : id);
    };

    const handleDelete = async (id: number) => {
        await deleteRequest(id);
        showNotification('Заявка удалена', 'success');
        setOpenMenu(null);
    };

    const openModal = (request: Request) => {
        setSelectedRequest(request);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedRequest(null);
    };

    if (requests.length === 0) {
        return <span className="NullMessage">Заявки не найдены</span>;
    }

    return (
        <table className="RequestsListTable ListTable">
            <thead>
                <tr>
                    <th>ФИО</th>
                    <th>Мероприятие</th>
                    <th>Проект</th>
                    <th>Статус</th>
                    <th>Специализация</th>
                    <th>Команда</th>
                    <th></th>
                    <th></th>
                </tr>
            </thead>
            <tbody>
                {requests.map((request) => (
                    <tr key={request.id}>
                        <td>
                            <Link to={`/profile/${request.user.user_id}`} className="LinkCell">{request.user.surname} {getInitials(request.user.name, request.user.patronymic)}</Link>
                        </td>
                        <td>
                            <Link to={`/event/${request.event.id}`} className="HiglightCell LinkCell">
                                {request.event.name}
                            </Link>
                        </td>
                        <td>
                            <Link to={`/project/${request.project.project_id}`} className="HiglightCell LinkCell">
                                {request.project.name}
                            </Link>
                        </td>
                        <td>
                            <span className="HiglightCell">{request.status.name}</span>
                        </td>
                        <td>
                            <span className="HiglightCell">{request.specialization.name}</span>
                        </td>
                        <td>{request.team ? request.team : 'Не указана'}</td>
                        <td className="ButtonsColumn">
                            <button
                                onClick={() => openModal(request)}
                                className="primary-btn">
                                Заявка
                            </button>
                        </td>
                        <td>
                            <MoreIcon 
                                width="16" 
                                height="16" 
                                strokeWidth="1"
                                onClick={() => toggleMenu(request.id)}
                                className="ThreeDotsButton"
                            />
                            {openMenu === request.id && (
                                <ul ref={menuRef} className="ActionsMenu">
                                    <li onClick={() => navigate(`/profile/${request.id}`)}>Профиль</li>
                                    <li onClick={() => navigate(`/request/${request.id}`)}>Полная информация</li>
                                    <li onClick={() => handleDelete(request.id)}>Удалить</li>
                                </ul>
                            )}
                        </td>
                    </tr>
                ))}
            </tbody>
            {/*isModalOpen && selectedRequest && (
                <Modal isOpen={isModalOpen} onClose={closeModal}>
                    <div>
                        <h2>Заявка: {selectedRequest.fullName}</h2>
                        <p>Мероприятие: {selectedRequest.event}</p>
                        <p>Проект: {selectedRequest.project}</p>
                        <button onClick={closeModal}>Закрыть</button>
                    </div>
                </Modal>
            )*/}
        </table>
    );
}
