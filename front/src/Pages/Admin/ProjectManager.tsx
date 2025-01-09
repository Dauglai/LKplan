import React, { useState } from 'react';
import {
  useGetProjectsQuery,
  useCreateProjectMutation,
  useUpdateProjectMutation,
} from 'Features/ApiSlices/projectSlice';

export default function ProjectManagement(): JSX.Element {
  const { data: projects, isLoading, isError } = useGetProjectsQuery();
  const [createProject, { isLoading: isCreating }] = useCreateProjectMutation();
  const [updateProject, { isLoading: isUpdating }] = useUpdateProjectMutation();

  const [newProject, setNewProject] = useState({
    direction: 0,
    name: '',
    description: '',
    supervisor: null,
    curators: [],
    creator: 0,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewProject((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newProject.name.trim()) {
      await createProject(newProject);
      setNewProject({ direction: 0, name: '', description: '', supervisor: null, curators: [], creator: 0 });
    }
  };

  const handleUpdateProject = async (id: number) => {
    const updatedProject = { ...newProject, name: 'Updated Name' };
    await updateProject({ id, data: updatedProject });
  };

  return (
    <div>
      <form onSubmit={handleCreateProject}>
        <h3>Создать новый проект</h3>
        <input
          type="number"
          name="direction"
          value={newProject.direction}
          onChange={handleInputChange}
          placeholder="ID направления"
        />
        <input
          type="text"
          name="name"
          value={newProject.name}
          onChange={handleInputChange}
          placeholder="Название проекта"
        />
        <textarea
          name="description"
          value={newProject.description}
          onChange={handleInputChange}
          placeholder="Описание проекта (опционально)"
        />
        <input
          type="number"
          name="supervisor"
          value={newProject.supervisor || ''}
          onChange={handleInputChange}
          placeholder="ID руководителя"
        />
        <input
          type="text"
          name="curators"
          value={newProject.curators.join(', ')}
          onChange={(e) => handleInputChange({ target: { name: 'curators', value: e.target.value.split(', ') } })}
          placeholder="ID кураторов (через запятую)"
        />
        <input
          type="number"
          name="creator"
          value={newProject.creator}
          onChange={handleInputChange}
          placeholder="ID создателя"
        />
        <button type="submit" disabled={isCreating}>
          Создать
        </button>
      </form>

      <h3>Список проектов</h3>
      {isLoading ? (
        <p>Загрузка...</p>
      ) : isError ? (
        <p>Ошибка при загрузке проектов.</p>
      ) : (
        <ul>
          {projects?.map((project) => (
            <li key={project.id}>
              <h4>{project.name}</h4>
              <p>Описание: {project.description || 'Нет описания'}</p>
              <p>Направление ID: {project.direction}</p>
              <p>Руководитель ID: {project.supervisor}</p>
              <p>Кураторы: {project.curators.join(', ')}</p>
              <p>Создатель ID: {project.creator}</p>
              <button onClick={() => handleUpdateProject(project.id)} disabled={isUpdating}>
                Обновить
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
