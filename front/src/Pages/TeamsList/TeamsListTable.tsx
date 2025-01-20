import 'Styles/ListTableStyles.scss';
import { useState, useEffect, useRef } from 'react';
import { useDeleteTeamMutation } from 'Features/ApiSlices/teamSlice';
import { useGetProjectsQuery } from 'Features/ApiSlices/projectSlice';
import { Team } from 'Features/ApiSlices/teamSlice';
import { useNavigate, Link } from 'react-router-dom';
import { getInitials } from 'Features/utils/getInitials';
import { useNotification } from 'Widgets/Notification/Notification';
//import TeamForm from './TeamForm';
import Modal from 'Widgets/Modal/Modal';

interface TeamsTableProps {
    teams: Team[];
}

export default function TeamsListTable({ teams }: TeamsTableProps): JSX.Element {
    const { data: projects, isLoading: isLoadingProjects } = useGetProjectsQuery();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
    const navigate = useNavigate();
    const [deleteTeam] = useDeleteTeamMutation();
    const { showNotification } = useNotification();
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
        const teamToEdit = teams.find((team) => team.id === id);
        if (teamToEdit) {
        setSelectedTeam(teamToEdit);
        setIsModalOpen(true);
        }
    };

    const handleDelete = async (id: number) => {
        await deleteTeam(id);
        showNotification('Команда удалена', 'success');
        setOpenMenu(null);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedTeam(null);
    };

    if (isLoadingProjects) {
        return <span>Загрузка...</span>;
    }

    if (teams.length === 0) {
        return <span className="NullMessage">Команды не найдены</span>;
    }

    const getProjectName = (projectId: number): string => {
        const project = projects?.find((project) => project.project_id === projectId);
        return project ? project.name : 'Не указано';
    };

    const getCurators = (projectId: number): [] => {
        const project = projects?.find((project) => project.project_id === projectId);
        return project ? project.curatorsSet : ['Не указано'];
    };


    return (
        <table className="TeamsListTable ListTable">
        <thead>
            <tr>
            <th>Название</th>
            <th>Проект</th>
            <th>Куратор</th>
            <th>Участники</th>
            <th></th>
            <th></th>
            </tr>
        </thead>
        <tbody>
            {teams.map((team) => (
            <tr key={team.id}>
                <td>
                    <Link to={`/teams/${team.id}`} className="LinkCell">
                        {team.name}
                    </Link>
                </td>
                <td>
                    <span className="HiglightCell">
                        <Link to={`/project/${team.project}`}  className="LinkCell">{getProjectName(team.project)}</Link>
                    </span>
                </td>
                <td>
                    {getCurators(team.project)
                        .map(
                        (curator) =>
                            <Link to={`/profile/${curator.user_id}`} className="LinkCell">{curator.surname} {getInitials(curator.name, curator.patronymic)}</Link>
                        )}
                </td>
                <td>
                    <ul>
                        {team.students.map((student) => (
                        <li key={student.user_id}>
                            <Link to={`/profile/${student.user_id}`} className="LinkCell">{student.surname} {getInitials(student.name, student.patronymic)}</Link>
                        </li>
                        ))}
                    </ul>
                </td>
                <td className="ButtonsColumn">
                    <button
                        onClick={() => handleEdit(team.id)}
                        className="primary-btn">
                        Добавить участников
                    </button>
                </td>
                <td>
                    <div onClick={() => toggleMenu(team.id)} className="ThreeDotsButton">
                        &#8230;
                    </div>
                    {openMenu === team.id && (
                        <ul ref={menuRef} className="ActionsMenu">
                        <li onClick={() => navigate(`/teams/${team.id}`)}>Подробнее</li>
                        <li onClick={() => handleEdit(team.id)}>Редактировать</li>
                        <li onClick={() => handleDelete(team.id)}>Удалить</li>
                        </ul>
                    )}
                </td>
            </tr>
            ))}
        </tbody>
        {/*isModalOpen && (
            <Modal isOpen={isModalOpen} onClose={closeModal}>
                <TeamForm closeModal={closeModal} existingTeam={selectedTeam} />
            </Modal>
        )*/}
        </table>
    );
}
