import React, { useEffect, useState } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import ProjectSelector from 'Widgets/Selectors/ProjectSelector';
import DirectionSelector from 'Widgets/Selectors/DirectionSelector';
import { useCreateTeamMutation, useGetTeamsQuery } from 'Features/ApiSlices/teamSlice';
import './TeamCreationPage.scss';
import {useGetApplicationsUsersQuery } from 'Features/ApiSlices/applicationSlice.ts';
import { Input, Select } from 'antd';
import { useGetUsersQuery } from 'Features/ApiSlices/userSlice.ts';
import PlanButton from '../../../Components/PlanButton/PlanButton.tsx';
import { useGetDirectionsQuery } from 'Features/ApiSlices/directionSlice.ts';
import { useGetProjectsQuery } from 'Features/ApiSlices/projectSlice.ts';

interface User {
  user_id: number;
  fullName: string;
  team: number | null;
}

export default function TeamCreationPage() {
  const [directionId, setDirectionId] = useState<number | null>(null);
  const [projectId, setProjectId] = useState<number | null>(null);
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  const [teamUsers, setTeamUsers] = useState<User[]>([]);

  const [teamName, setTeamName] = useState('');
  const [curator, setCurator] = useState<number | null>(null);
  const [chatLink, setChatLink] = useState('');

  const { data: applications = [] } = useGetApplicationsUsersQuery({ is_approved: true });
  const { data: users } = useGetUsersQuery();
  const { data: projects = [] } = useGetProjectsQuery();
  const {data: directions = []} = useGetDirectionsQuery();
  const [createTeam] = useCreateTeamMutation();

  useEffect(() => {
    // application: { user: { user_id, surname, name, patronymic }, project, direction, team? }
    const initial = applications
      .map(app => ({
        user_id: app.user.user_id,
        fullName: `${app.user.surname} ${app.user.name} ${app.user.patronymic}`,
        projectId: app.project,
        directionId: app.direction,
        team: app.team || null
      }))
      // только те, кто без команды в этом проекте
      .filter(u => u.team === null || u.projectId !== projectId);
    setAvailableUsers(initial);
  }, [applications, projectId]);

  const [search, setSearch] = useState('');

  const filteredUsers = availableUsers.filter((user) => {
    const matchesDirection = !directionId || user.directionId === directionId;
    const matchesProject = !projectId || user.projectId === projectId;
    const matchesSearch = user.fullName.toLowerCase().includes(search.toLowerCase());
    return matchesDirection && matchesProject && matchesSearch;
  });

  const onDragEnd = (result: any) => {
    const { source, destination } = result;
    if (!destination) return;

    const sourceList = source.droppableId === 'available' ? availableUsers : teamUsers;
    const destList = destination.droppableId === 'team' ? teamUsers : availableUsers;

    const [moved] = sourceList.splice(source.index, 1);

    if (source.droppableId === 'available') {
      setAvailableUsers(sourceList);
      setTeamUsers([...teamUsers, moved]);
    } else {
      setTeamUsers(sourceList);
      setAvailableUsers([...availableUsers, moved]);
    }
  };

  const handleCreate = async () => {
    try {
      await createTeam({
        name: teamName,
        curator,
        chat: chatLink,
        students: teamUsers.map((u) => u.user_id),
        project: projectId,
      }).unwrap();

      console.log('Команда создана');
      // Очистка формы
      setTeamName('');
      setCurator(null);
      setChatLink('');
      setTeamUsers([]);
      if (availableUsers) {
        const withoutTeam = availableUsers.filter((u: User) => !u.team);
        setAvailableUsers(withoutTeam);
      }
    } catch (error) {
      console.error('Ошибка при создании команды', error);
    }
  };

  return (
    <div className="TeamCreationPage">
      <div className="selectors" style={{ display: 'flex', gap: '16px', marginBottom: 16 }}>
        <Select
          style={{ flex: 1 }}
          placeholder="Выберите направление"
          onChange={setDirectionId}
          options={directions.map((d) => ({ label: d.name, value: d.id }))}
        />
        <Select
          style={{ flex: 1 }}
          placeholder="Выберите проект"
          onChange={setProjectId}
          options={projects.map((p) => ({ label: p.name, value: p.id }))}
        />
      </div>

      <DragDropContext
        onDragEnd={(result) => {
          const { source, destination } = result;
          if (!destination) return;

          if (source.droppableId === destination.droppableId && source.index === destination.index) return;

          const sourceList = source.droppableId === 'available' ? [...availableUsers] : [...teamUsers];
          const destList = destination.droppableId === 'available' ? [...availableUsers] : [...teamUsers];

          const [moved] = sourceList.splice(source.index, 1);

          if (source.droppableId === destination.droppableId) {
            destList.splice(destination.index, 0, moved);
          } else {
            destList.splice(destination.index, 0, moved);
          }

          if (source.droppableId === 'available') {
            setAvailableUsers(sourceList);
            setTeamUsers(destList);
          } else {
            setTeamUsers(sourceList);
            setAvailableUsers(destList);
          }
        }}
      >
        <div className="drag-container" style={{ display: 'flex', gap: '24px' }}>
          <Droppable droppableId="available">
            {(provided) => (
              <div className="user-list" ref={provided.innerRef} {...provided.droppableProps}>
                <h3>Доступные участники</h3>
                <Input
                  placeholder="Поиск по участникам"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  style={{ marginBottom: '16px', maxWidth: 500 }}
                />
                {filteredUsers.map((user, index) => (
                  <Draggable key={`user-${user.user_id}`} draggableId={`user-${user.user_id}`} index={index}>
                    {(provided) => (
                      <div
                        className="user-item"
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                      >
                        <span className="user-drag-handle" {...provided.dragHandleProps}>⇅</span>
                        <span className="user-name">{user.fullName}</span>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>

          <Droppable droppableId="team">
            {(provided) => (
              <div className="team-form" ref={provided.innerRef} {...provided.droppableProps}>
                <h3>Формирование команды</h3>
                <Input
                  placeholder="Название команды"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                />
                <Select
                  style={{ width: '100%', marginBottom: 12 }}
                  showSearch
                  placeholder="Выберите куратора"
                  optionFilterProp="children"
                  value={curator ?? undefined}
                  onChange={(id) => setCurator(id)}
                  filterOption={(input, option) =>
                    (option?.children as string).toLowerCase().includes(input.toLowerCase())
                  }
                >
                  {users?.map((u) => (
                    <Option key={u.user_id} value={u.user_id}>
                      {u.surname} {u.name} {u.patronymic}
                    </Option>
                  ))}
                </Select>

                <Input
                  placeholder="Ссылка на групповой чат"
                  value={chatLink}
                  onChange={(e) => setChatLink(e.target.value)}
                  style={{ marginBottom: 12 }}
                />

                <Select
                  style={{ width: '100%', marginBottom: 12 }}
                  mode="multiple"
                  placeholder="Добавьте исполнителей">
                  {users?.map((a) => (
                    <Option key={a.user_id} value={a.user_id}>
                      {a.surname} {a.name} {a.patronymic}
                    </Option>
                  ))}
                </Select>

                <div className="team-users">
                  {teamUsers.map((user, index) => (
                    <Draggable key={`user-${user.user_id}`} draggableId={`user-${user.user_id}`} index={index}>
                      {(provided) => (
                        <div
                          className="user-item"
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                        >
                          <span className="user-drag-handle" {...provided.dragHandleProps}>⇅</span>
                          <span className="user-name">{user.fullName}</span>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              </div>
            )}
          </Droppable>
        </div>
      </DragDropContext>

      <div className="actions">
        <PlanButton onClick={handleCreate}>Создать</PlanButton>
        <PlanButton className="secondary-btn" onClick={() => window.location.reload()}>Отмена</PlanButton>
      </div>
    </div>
  );
}