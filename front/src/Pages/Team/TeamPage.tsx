import { Link, useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState, useRef } from 'react';
import { useGetTeamByIdQuery } from 'Features/ApiSlices/teamSlice';
import { useGetSpecializationsQuery } from 'Features/ApiSlices/specializationSlice';
import { getInitials } from 'Features/utils/getInitials';
import MoreIcon from 'assets/icons/more.svg?react';
import BackButton from "Widgets/BackButton/BackButton";
import 'Styles/pages/common/InfoPageStyle.scss';
import 'Styles/components/Sections/ListTableStyles.scss';

export default function TeamPage() {
    const { teamId } = useParams();
    const teamIdNumber = Number(teamId);

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

    // Запросы
    const { data: team, isLoading: teamLoading, error: teamError } = useGetTeamByIdQuery(teamIdNumber, { skip: isNaN(teamIdNumber) });
    const { data: specializations } = useGetSpecializationsQuery();

    useEffect(() => {
        document.title = team ? `${team.name} - MeetPoint` : "Страница команды - MeetPoint";
    }, [team]);

    const toggleMenu = (id: number) => {
        setOpenMenu(openMenu === id ? null : id);
    };

    const getSpecializationName = (id: number) => {
        return specializations?.find((spec) => spec.id === id)?.name ?? "Неизвестная специализация";
    };

    if (isNaN(teamIdNumber)) {
        return <div>Ошибка: Неверный ID команды</div>;
    }

    if (teamLoading) {
        return <div>Загрузка...</div>;
    }

    if (teamError) {
        return <div>Ошибка загрузки данных</div>;
    }

    return (
      <div className="TeamInfoPage InfoPage">
          <div className="TeamInfoHeader InfoHeader">
              <BackButton />
              <div className="InfoHeaderTitleContainer">
                  <h2>{team?.name}</h2>
                  {team?.project_info?.id && (
                    <Link to={`/project/${team.project_info.id}`}>{team.project_info.name}</Link>
                  )}
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
                  <th></th>
              </tr>
              </thead>
              <tbody>
              {team?.students_info?.map((student) => (
                <tr key={student.id}>
                    <td>
                        <Link to={`/profile/${student.id}`} className="LinkCell">
                            {student.surname} {getInitials(student.name, student.patronymic)}
                        </Link>
                    </td>
                    <td>
                        {student.telegram ? (
                          <a href={`https://t.me/${student.telegram.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="LinkCell">
                              {student.telegram}
                          </a>
                        ) : '-'}
                    </td>
                    <td>
                        {student.vk ? (
                          <a href={student.vk} target="_blank" rel="noopener noreferrer" className="LinkCell">
                              {student.vk}
                          </a>
                        ) : '-'}
                    </td>
                    <td>{student.course ?? '-'}</td>
                    <td>
                        <a href={`mailto:${student.email}`} className="LinkCell">{student.email}</a>
                    </td>
                    <td>
                        <MoreIcon
                          width="16"
                          height="16"
                          strokeWidth="1"
                          onClick={() => toggleMenu(student.id)}
                          className="ThreeDotsButton"
                        />
                        {openMenu === student.id && (
                          <ul ref={menuRef} className="ActionsMenu">
                              <li onClick={() => navigate(`/profile/${student.id}`)}>Подробнее</li>
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
