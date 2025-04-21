import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState, useRef } from 'react';
import { useGetTeamByIdQuery,  usePartialUpdateTeamMutation } from 'Features/ApiSlices/teamSlice';
import 'Styles/pages/common/InfoPageStyle.scss';
import 'Styles/components/Sections/ListTableStyles.scss';
import { useGetUserQuery, User } from 'Features/ApiSlices/userSlice.ts';
import  './TeamCard.scss'
import { Button, Input} from 'antd';

import TeamMembersTable from 'Pages/Team/TeamMembersTable.tsx';
import ResultsTab from './ResultsTab';
import AddStudentModal from './AddStudentModal'; // модалка выбора студентов

export default function TeamPage() {
    const { teamId } = useParams();
    const teamIdNumber = Number(teamId);
    const [activeTab, setActiveTab] = useState<'info' | 'results' | 'meetings'>('info');

    const [openMenu, setOpenMenu] = useState<number | null>(null);
    const menuRef = useRef<HTMLUListElement | null>(null);
    const navigate = useNavigate();
    const { data: team, isLoading: teamLoading, error: teamError } = useGetTeamByIdQuery(teamIdNumber, { skip: isNaN(teamIdNumber) });
    const [updateTeam] = usePartialUpdateTeamMutation();
    const { data: currentUser } = useGetUserQuery();
    const isCurator = currentUser?.user_id === team?.curator_info?.user_id;

    const [isEditing, setIsEditing] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [members, setMembers] = useState<User[]>([]);


    const handleAddStudents = (newStudents: User[]) => {
        const existingIds = new Set(members.map(m => m.user_id));
        const updated = [...members, ...newStudents.filter(s => !existingIds.has(s.user_id))];
        console.log('Добавляем:', updated);
        setMembers(updated);
    };

    useEffect(() => {
        if (team?.students_info) {
            setMembers(team.students_info);
        }
    }, [team?.students_info]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setOpenMenu(null);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const [editableTeam, setEditableTeam] = useState({
        name: team?.name || '',
        chat: team?.chat || 'Нет ссылки',
        curator: {
            full_name: `${team?.curator_info?.surname} ${team?.curator_info?.name} ${team?.curator_info?.patronymic}`  || '',
            telegram: team?.curator_info?.telegram || 'Нет телеграмма',
        },
    });

    useEffect(() => {
        if (team) {
            setEditableTeam({
                name: team.name || '',
                chat: team.chat || 'Нет ссылки',
                curator: {
                    full_name: `${team.curator_info?.surname ?? ''} ${team.curator_info?.name ?? ''} ${team.curator_info?.patronymic ?? ''}`.trim(),
                    telegram: team.curator_info?.telegram || 'Нет телеграмма',
                },
            });
        }
    }, [team]);


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

    const handleSave = async () => {
        try {
            const data = {
                name: editableTeam.name,
                chat: editableTeam.chat,
                students: members.map((s) => s.user_id),
            };
            console.log("Отправляем данные на сервер:", data);
            await updateTeam({ id: teamIdNumber, data }).unwrap();
            setIsEditing(false);
        } catch (err) {
            console.error('Ошибка обновления команды:', err);
        }
    };

    useEffect(() => {
        document.title = team ? `${team.name} - MeetPoint` : "Страница команды - MeetPoint";
    }, [team]);

    if (isNaN(teamIdNumber)) {
        return <div>Ошибка: Неверный ID команды</div>;
    }

    if (teamLoading) {
        return <div>Загрузка...</div>;
    }

    if (teamError) {
        return <div>Ошибка загрузки данных</div>;
    }
    const testStudents = [
        { id: 1, surname: "Тестов", name: "Тест", patronymic: "Тестович", role: "Тест", telegram: "@test", group: "Т-21" }
    ];

    return (
      <div className="TeamCard">
          <div className="Tabs">
              <Button className={activeTab === 'info' ? 'Tab active' : 'Tab'}
                      onClick={() => setActiveTab('info')}>Информация</Button>
              <Button className={activeTab === 'results' ? 'Tab active' : 'Tab'}
                      onClick={() => setActiveTab('results')}>Результаты</Button>
              <Button className={activeTab === 'meetings' ? 'Tab active' : 'Tab'}
                      onClick={() => setActiveTab('meetings')}>Собрания</Button>
          </div>

          {activeTab === 'info' && (
            <>
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
                            value={editableTeam.chat}
                            onChange={e => handleChange('chat_link', e.target.value)}
                          />
                        ) : (
                          <div className="TextBlock Link">{editableTeam.chat}</div>
                        )}
                    </div>
                </div>

                <TeamMembersTable
                  isCurator={isCurator}
                  isEditing={isEditing}
                  students={members}
                  onUpdate={setMembers}
                />

                {isCurator && (
                  <div className="ActionsRow">
                      {isEditing && (
                        <button className="add" onClick={() => {
                            console.log('Открываем модалку');
                            setIsModalVisible(true);
                        }}>
                            Добавить участника
                        </button>
                      )}
                      <button className="save" onClick={isEditing ? handleSave : () => setIsEditing(true)}>
                          {isEditing ? 'Сохранить' : 'Редактировать'}
                      </button>
                  </div>
                )}

                <AddStudentModal
                  visible={isModalVisible}
                  onClose={() => {
                      console.log('Закрываем модалку');
                      setIsModalVisible(false);
                  }}
                  onAdd={handleAddStudents}
                />
            </>
          )}

          {activeTab === 'results' && (
            <ResultsTab isCurator={isCurator} />
          )}
      </div>
    );
}