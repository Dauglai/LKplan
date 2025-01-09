import React, { useState } from 'react';
import {
  useGetTeamsQuery,
  useCreateTeamMutation,
} from 'Features/ApiSlices/teamSlice';

export default function TeamManagement(): JSX.Element {
  const { data: teams, isLoading, isError } = useGetTeamsQuery();
  const [createTeam, { isLoading: isCreating, isError: isCreateError }] = useCreateTeamMutation();

  console.log(teams)
  
  const [newTeamData, setNewTeamData] = useState({
    name: '',
    project: null,
    students: [] as number[],
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewTeamData((prev) => ({
      ...prev,
      [name]:
        name === 'students'
          ? value.split(',').map((v) => parseInt(v.trim(), 10)).filter((v) => !isNaN(v))
          : name === 'project'
          ? (value ? Number(value) : null)
          : value,
    }));
  };

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newTeamData.name.trim()) {
      try {
        await createTeam(newTeamData).unwrap();
        setNewTeamData({ name: '', project: null, students: [] });
      } catch (error) {
        console.error('Ошибка при создании команды:', error);
      }
    }
  };

  return (
    <div>
      <form onSubmit={handleCreateTeam}>
        <h3>Создать новую команду</h3>
        <input
          type="text"
          name="name"
          value={newTeamData.name}
          onChange={handleInputChange}
          placeholder="Название команды"
        />
        <input
          type="text"
          name="project"
          value={newTeamData.project ?? ''}
          onChange={handleInputChange}
          placeholder="ID проекта (опционально)"
        />
        <input
          type="text"
          name="students"
          value={newTeamData.students.join(', ')}
          onChange={handleInputChange}
          placeholder="ID студентов через запятую"
        />
        <button type="submit" disabled={isCreating}>
          {isCreating ? 'Создаю...' : 'Создать'}
        </button>
      </form>

      {isCreateError && <p style={{ color: 'red' }}>Ошибка при создании команды. Попробуйте снова.</p>}

      <h3>Существующие команды</h3>
      {isLoading ? (
        <p>Загрузка...</p>
      ) : isError ? (
        <p>Ошибка при загрузке команд.</p>
      ) : (
        <ul>
          {teams?.map((team) => (
            <li key={team.id}>
              <h3>{team.name}</h3>
              <p>Проект: {team.project || 'Не назначен'}</p>
              <p>Студенты: {team.students.length > 0 ? team.students.join(', ') : 'Нет студентов'}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
