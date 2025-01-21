import { Link, useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState, useRef } from 'react';
import { useGetTeamByIdQuery } from 'Features/ApiSlices/teamSlice';
import { useGetProjectByIdQuery } from 'Features/ApiSlices/projectSlice';
import { useGetSpecializationsQuery } from 'Features/ApiSlices/specializationSlice';
import { getInitials } from 'Features/utils/getInitials';
import MoreIcon from 'assets/icons/more.svg?react';
import BackButton from "Widgets/BackButton/BackButton";
import 'Styles/InfoPageStyle.scss';
import 'Styles/ListTableStyles.scss';

export default function TeamPage(): JSX.Element {
    const { id } = useParams<{ id: string }>();
    const teamId = Number(id);
    const [openMenu, setOpenMenu] = useState<number | null>(null);
    const menuRef = useRef<HTMLUListElement | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
        if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
            setOpenMenu(null);
        }
        };
    
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const { data: team, isLoading: teamLoading, error: teamError } = useGetTeamByIdQuery(teamId);
    const { data: specializations, isLoading: specLoading, error: specError } = useGetSpecializationsQuery();
    const { data: project, isLoading: projectLoading, error: projectError } = useGetProjectByIdQuery(team?.project);

    useEffect(() => {
        if (team) {
            document.title = `${team.name} - MeetPoint`;
        } else {
            document.title = `Страница команды - MeetPoint`;
        }
	}, []);

    const toggleMenu = (id: number) => {
        setOpenMenu(openMenu === id ? null : id);
    };

    const getSpecializationName = (id: number): string => {
        const specialization = specializations?.find((spec) => spec.id === id);
        return specialization ? specialization.name : "Неизвестная специализация";
    };

    if (teamLoading || projectLoading) {
        return <div>Загрузка...</div>;
    }

    if (teamError || projectError) {
        return <div>Ошибка загрузки данных</div>;
    }

    return (
        <div className="TeamInfoPage InfoPage">
            <div className="TeamInfoHeader InfoHeader">
                <BackButton />
                <div className="InfoHeaderTitleContainer">
                    <h2>{team?.name}</h2>
                    <Link to={`/project/${team?.project}`}>{project?.name}</Link>
                </div>
            </div>
                <table className="TeamMembersTable ListTable">
                    <thead>
                        <tr>
                            <th>ФИО</th>
                            <th>Телеграм</th>
                            <th>Вконтакте</th>
                            <th>Курс</th>
                            <th>Email</th>
                            <th>Специализации</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {team?.students.map((student) => (
                            <tr key={student.user_id}>
                                <td>
                                    <Link to={`/profile/${student.user_id}`}   className="LinkCell">
                                        {student.surname} {getInitials(student.name, student.patronymic)}
                                    </Link>
                                </td>
                                <td>
                                    {student.telegram ? (
                                        <a href={`https://t.me/${student.telegram.replace('@', '')}`} target="_blank" rel="noopener noreferrer"   className="LinkCell">
                                            {student.telegram}
                                        </a>
                                    ) : '-'}
                                </td>
                                <td>
                                    {student.vk ? (
                                        <a href={student.vk} target="_blank" rel="noopener noreferrer"   className="LinkCell">
                                            student.vk
                                        </a>
                                    ) : '-'}
                                </td>
                                <td>{student.course ?? '-'}</td>
                                <td>
                                    <a href={`mailto:${student.email}`} className="LinkCell">{student.email}</a>
                                </td>
                                <td>
                                    <ul>
                                        {student.specializations.map((specId) => (
                                            <li key={specId} className="HiglightCell">{getSpecializationName(specId)}</li>
                                        ))}
                                    </ul>
                                </td>
                                <td>
                                    <MoreIcon 
                                        width="16" 
                                        height="16" 
                                        strokeWidth="1"
                                        onClick={() => toggleMenu(student.user_id)}
                                        className="ThreeDotsButton"
                                    />
                                    {openMenu === student.user_id && (
                                        <ul ref={menuRef} className="ActionsMenu">
                                            <li onClick={() => navigate(`/profile/${student.user_id}`)}>Подробнее</li>
                                            {/*<li onClick={() => handleEdit(team.id)}>Редактировать</li>*/}
                                            {/*<li onClick={() => handleDelete(team.id)}>Удалить</li>*/}
                                        </ul>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
        </div>
    );
}
