import 'Styles/components/Sections/ListTableStyles.scss';
import { useState, useEffect, useRef } from 'react';
import { useGetEventsQuery } from 'Features/ApiSlices/eventSlice';
import { useGetProjectsQuery } from 'Features/ApiSlices/projectSlice';
import { Direction } from 'Features/ApiSlices/directionSlice';
import { Link } from 'react-router-dom';
import DirectionForm from "./DirectionForm";
import Modal from "Widgets/Modal/Modal";
import MoreIcon from 'assets/icons/more.svg?react';

interface DirectionsTableProps {
  directions: Direction[];
  onDelete: (id: number) => void;
}

export default function DirectionsListTable({ directions, onDelete }: DirectionsTableProps): JSX.Element {
    const { data: events, isLoading: isLoadingEvents } = useGetEventsQuery();
    const { data: projects, isLoading: isLoadingProjects } = useGetProjectsQuery();

    const [openMenu, setOpenMenu] = useState<number | null>(null);
    const [selectedDirection, setSelectedDirection] = useState<Direction | null>(null);
    const menuRef = useRef<HTMLUListElement | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

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

    const handleEdit = (id: number) => {
        const directionToEdit = directions.find((dir) => dir.id === id);
        if (directionToEdit) {
          setSelectedDirection(directionToEdit);
          setIsModalOpen(true);
        }
    };
    
    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedDirection(null);
    };

    const handleDelete = (id: number) => {
        onDelete(id);
        setOpenMenu(null);
    };

    if (isLoadingEvents || isLoadingProjects) {
        return <span>Загрузка...</span>;
    }

    if (directions.length === 0) {
        return <span className="NullMessage">Направления не найдены</span>;
    }

    const getEventName = (eventId: number): string => {
        const event = events?.find((event) => event.event_id === eventId);
        return event ? event.name : 'Не указано';
    };

    const getProjectsForDirection = (directionId: number) => {
        return projects?.filter((project) => project.direction.id === directionId) || [];
    };

    return (
        <table className="DirectionsListTable ListTable">
            <thead>
                <tr>
                <th>Название</th>
                <th>Мероприятие</th>
                <th>Проекты</th>
                <th></th>
                </tr>
            </thead>
            <tbody>
                {directions.map((direction) => (
                <tr key={direction.id}>
                    <td>{direction.name}</td>
                    <td><Link to={`/event/${direction.event}`} className="HiglightCell">{getEventName(direction.event)}</Link></td>
                    <td>
                        <ul>
                            {getProjectsForDirection(direction.id).map((project) => (
                            <li key={project.project_id}>
                                <Link to={`/project/${project.project_id}`}>{project.name}</Link>
                            </li>
                            ))}
                        </ul>
                    </td>
                    <td>
                        <MoreIcon 
                            width="16" 
                            height="16" 
                            strokeWidth="1"
                            onClick={() => toggleMenu(direction.id)}
                            className="ThreeDotsButton"
                        />
                        {openMenu === direction.id && (
                            <ul ref={menuRef} className="ActionsMenu">
                            <li onClick={() => handleEdit(direction.id)}>Редактировать</li>
                            <li onClick={() => handleDelete(direction.id)}>Удалить</li>
                            </ul>
                        )}
                    </td>
                </tr>
                ))}
            </tbody>
            {isModalOpen && (
                <Modal isOpen={isModalOpen} onClose={closeModal}>
                    <DirectionForm closeModal={closeModal} existingDirection={selectedDirection} />
                </Modal>
            )}
        </table>
    );
}
