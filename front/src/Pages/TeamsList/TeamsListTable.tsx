import 'Styles/components/Sections/ListTableStyles.scss';
import { useState, useEffect, useRef } from 'react';
import { useDeleteTeamMutation } from 'Features/ApiSlices/teamSlice';
import { Team } from 'Features/ApiSlices/teamSlice';
import { useNavigate, Link } from 'react-router-dom';
import { getInitials } from 'Features/utils/getInitials';
import { useNotification } from 'Components/Common/Notification/Notification';
import MoreIcon from 'assets/icons/more.svg?react';

interface TeamsTableProps {
    teams: Team[];
}

export default function TeamsListTable({ teams }: TeamsTableProps): JSX.Element {
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

    if (teams.length === 0) {
        return <span className="NullMessage">Команды не найдены</span>;
    }

    return (
      <div className="ListTableContainer">
          <table className="UniversalListTable">
              <thead>
              <tr>
                  <th>Название</th>
                  <th>Проект</th>
                  <th>Куратор</th>
                  <th>Участники</th>
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
                            {team.project ? (
                              <Link to={`/project/${team.project.id}`} className="LinkCell">
                                  {team.project.name}
                              </Link>
                            ) : (
                              "Не указано"
                            )}
                        </span>
                    </td>
                    <td>
                        {team.curator_info.length > 0 ? (
                          team.curator_info.map((curator) => (
                            <Link key={curator.id} to={`/profile/${curator.id}`} className="LinkCell">
                                {curator.surname} {getInitials(curator.name, curator.patronymic)}
                            </Link>
                          ))
                        ) : (
                          "Не указано"
                        )}
                    </td>
                    <td>
                        <ul>
                            {team.students_info.length > 0 ? (
                              team.students_info.map((student) => (
                                <li key={student.id}>
                                    <Link to={`/profile/${student.id}`} className="LinkCell">
                                        {student.surname} {getInitials(student.name, student.patronymic)}
                                    </Link>
                                </li>
                              ))
                            ) : (
                              <li>Нет участников</li>
                            )}
                        </ul>
                    </td>
                    <td>
                        <MoreIcon
                          width="16"
                          height="16"
                          strokeWidth="1"
                          onClick={() => toggleMenu(team.id)}
                          className="ThreeDotsButton"
                        />
                        {openMenu === team.id && (
                          <ul ref={menuRef} className="ActionsMenu">
                              <li onClick={() => navigate(`/team/${team.id}`)}>Подробнее</li>
                              <li onClick={() => handleDelete(team.id)}>Удалить</li>
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
