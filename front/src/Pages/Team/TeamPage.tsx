import { Link, useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState, useRef } from 'react';
import { useGetTeamByIdQuery } from 'Features/ApiSlices/teamSlice';
import { useGetSpecializationsQuery } from 'Features/ApiSlices/specializationSlice';
import { getInitials } from 'Features/utils/getInitials';
import MoreIcon from 'assets/icons/more.svg?react';
import BackButton from "Widgets/BackButton/BackButton";
import 'Styles/pages/common/InfoPageStyle.scss';
import 'Styles/components/Sections/ListTableStyles.scss';
import { useGetUserQuery } from 'Features/ApiSlices/userSlice.ts';
import  './TeamCard.scss'
import { Button, Input, Table } from 'antd';

export default function TeamPage() {
    const { teamId } = useParams();
    const teamIdNumber = Number(teamId);

    const [openMenu, setOpenMenu] = useState<number | null>(null);
    const menuRef = useRef<HTMLUListElement | null>(null);
    const navigate = useNavigate();
    const { data: team, isLoading: teamLoading, error: teamError } = useGetTeamByIdQuery(teamIdNumber, { skip: isNaN(teamIdNumber) });
    const { data: specializations } = useGetSpecializationsQuery();
    const currentUser = useGetUserQuery()
    const isCurator = currentUser?.id === team?.curator;

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setOpenMenu(null);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const [isEditing, setIsEditing] = useState(false);
    const [editableTeam, setEditableTeam] = useState({
        name: team?.name || '',
        chat_link: team?.chat_link || 'Нет ссылки',
        curator: {
            full_name: `${team?.curator_info?.surname} ${team?.curator_info?.name} ${team?.curator_info?.patronymic}`  || '',
            telegram: team?.curator_info?.telegram || 'Нет телеграмма',
        },
    });

    const handleChange = (field: string, value: string) => {
        setEditableTeam(prev => ({
            ...prev,
            [field]: value,
        }));
    };

    const handleCuratorChange = (field: string, value: string) => {
        setEditableTeam(prev => ({
            ...prev,
            curator: {
                ...prev.curator,
                [field]: value,
            },
        }));
    };

    const handleSave = () => {
        // сюда вставим PATCH-запрос
        setIsEditing(false);
    };


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
      <div className="TeamCard">
          <div className="Tabs">
              <Button className="Tab active">Информация</Button>
              <Button className="Tab">Результаты</Button>
              <Button className="Tab">Собрания</Button>
          </div>

          <div className="TeamForm">
              <div className="FormGroup">
                  <label>Название команды</label>
                  {isEditing && isCurator ? (
                    <input
                      type="text"
                      value={editableTeam.name}
                      onChange={e => handleChange('name', e.target.value)}
                    />
                  ) : (
                    <div className="TextBlock">{editableTeam.name}</div>
                  )}
              </div>

              <div className="FormGroup curator-group">
                  <label>Куратор</label>
                  <div className="TwoColumns">
                      {isEditing && isCurator ? (
                        <>
                            <Input
                              type="text"
                              value={editableTeam.curator.full_name}
                              onChange={e => handleCuratorChange('full_name', e.target.value)}
                            />
                            <Input
                              type="text"
                              value={editableTeam.curator.telegram}
                              onChange={e => handleCuratorChange('telegram', e.target.value)}
                            />
                        </>
                      ) : (
                        <>
                            <div className="TextBlock">{editableTeam.curator.full_name}</div>
                            <div className="TextBlock">{editableTeam.curator.telegram}</div>
                        </>
                      )}
                  </div>
              </div>

              <div className="FormGroup">
                  <label>Ссылка на чат</label>
                  {isEditing && isCurator ? (
                    <input
                      type="text"
                      value={editableTeam.chat_link}
                      onChange={e => handleChange('chat_link', e.target.value)}
                    />
                  ) : (
                    <div className="TextBlock Link">{editableTeam.chat_link}</div>
                  )}
              </div>
          </div>

          <Table className="TeamMembersTable">
              <thead>
              <tr>
                  <th>Фамилия</th>
                  <th>Имя</th>
                  <th>Отчество</th>
                  <th>Роль</th>
                  <th>Телеграм</th>
                  <th>Группа</th>
                  {isCurator && <th>Действия</th>}
              </tr>
              </thead>
              <tbody>
              {team.students_info.map(student => (
                <tr key={student.id}>
                    <td>{student.surname}</td>
                    <td>{student.name}</td>
                    <td>{student.patronymic}</td>
                    <td>{student.role}</td>
                    <td>{student.telegram}</td>
                    <td>{student.group}</td>
                    {isCurator && (
                      <td>
                          <button>✏</button>
                          <button>Удалить</button>
                      </td>
                    )}
                </tr>
              ))}
              </tbody>
          </Table>

          {isCurator && (
            <div className="ActionsRow">
                <button className="delete">Удалить</button>
                <button className="save" onClick={isEditing ? handleSave : () => setIsEditing(true)}>
                    {isEditing ? 'Сохранить' : 'Редактировать'}
                </button>
            </div>
          )}
      </div>
    );
}