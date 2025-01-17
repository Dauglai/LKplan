import 'Styles/ListTableStyles.scss';
import { useState, useEffect, useRef } from 'react';
import { useGetEventsQuery } from 'Features/ApiSlices/eventSlice';
import { useGetProjectsQuery } from 'Features/ApiSlices/projectSlice';
import { Direction } from 'Features/ApiSlices/directionSlice';
import { Link } from 'react-router-dom';

interface DirectionsTableProps {
  directions: Direction[];
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
}

export default function DirectionsListTable({ directions, onEdit, onDelete }: DirectionsTableProps): JSX.Element {
    const { data: events, isLoading: isLoadingEvents } = useGetEventsQuery();
    const { data: projects, isLoading: isLoadingProjects } = useGetProjectsQuery();

    const [openMenu, setOpenMenu] = useState<number | null>(null);
    const menuRef = useRef<HTMLUListElement | null>(null);

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
        onEdit(id);
        setOpenMenu(null);
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
        const event = events?.find((evt) => evt.id === eventId);
        return event ? event.name : 'Не указано';
    };

    const getProjectsForDirection = (directionId: number) => {
        return projects?.filter((project) => project.direction === directionId) || [];
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
                        <li key={project.id}>
                            <Link to={`/project/${project.id}`}>{project.name}</Link>
                        </li>
                        ))}
                    </ul>
                </td>
                <td>
                <div onClick={() => toggleMenu(direction.id)} className="ThreeDotsButton">
                    &#8230;
                </div>
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
        </table>
    );
}
