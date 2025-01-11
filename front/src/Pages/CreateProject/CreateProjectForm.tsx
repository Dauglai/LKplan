import CreateEventHeader from 'Widgets/CreateFormHeader/CreateFormHeader';
import DateRangePicker from 'Widgets/fields/DateRangePicker';
import SubmitButtons from 'Widgets/buttons/SubmitButtons';
import RoleSelector from 'Widgets/fields/RoleSelector';

import PlusIcon from "assets/icons/plus.svg?react";
import ChevronRightIcon from 'assets/icons/chevron-right.svg?react';
import TrashIcon from 'assets/icons/trash-2.svg?react';


import 'Styles/CreateFormStyle.scss'
import './CreateProjectForm.scss';

import React, { useState } from 'react';
import {
  useGetProjectsQuery,
  useCreateProjectMutation,
  useUpdateProjectMutation,
} from 'Features/ApiSlices/projectSlice';

export default function CreateEventForm(): JSX.Element {

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
  
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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

  const handleTextArea = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const textarea = e.target;
    textarea.style.height = 'auto';
    textarea.style.height = `${textarea.scrollHeight}px`;

    handleInputChange(e);
  };

  return (
    <div className="CreateContainer">
    <div className="CreateFormContainer">
      <form className="CreateProjectForm CreateForm"  onSubmit={handleCreateProject}>
        <CreateEventHeader label="Добавление проекта"/>

        <input
          type="number"
          name="direction"
          value={newProject.direction}
          onChange={handleInputChange}
          placeholder="ID направления"
          className="FormField"
        />

        <div className="CreateNameContainer">
          <input
            type="text"
            placeholder='Название проекта'
            value={newProject.name}
            onChange={handleInputChange}
            className="CreateName TextField FormField"/>
          <textarea
            placeholder='Описание проекта'
            className="CreateDescription TextField FormField"
            onInput={handleTextArea}
            value={newProject.description}/>
        </div>

        {/*<RoleSelector role="Куратор" />

          <div className='ListField EventFormField'>
            <p>Направление</p>
            <ChevronRightIcon width="20" height="20" strokeWidth="1" className='ChevronDown'/>
          </div>

          <div className='ListField EventFormField'>
            <p>Прикрепить к мероприятию</p>
            <PlusIcon width="20" height="20" strokeWidth="1"/>
          </div>

          <DateRangePicker /> */}

        <input
          type="number"
          name="supervisor"
          value={newProject.supervisor || ''}
          onChange={handleInputChange}
          placeholder="ID руководителя"
          className="FormField"
        />
        <input
          type="text"
          name="curators"
          value={newProject.curators.join(', ')}
          onChange={(e) => handleInputChange({ target: { name: 'curators', value: e.target.value.split(', ') } })}
          placeholder="ID кураторов (через запятую)"
          className="FormField"
        />
        <input
          type="number"
          name="creator"
          value={newProject.creator}
          onChange={handleInputChange}
          placeholder="ID создателя"
          className="FormField"
        />

          <SubmitButtons label="Создать" />
      </form>
      </div>

      <div className="ListResults">
      <h3>Список проектов</h3>
      {isLoading ? (
        <p>Загрузка...</p>
      ) : isError ? (
        <p>Ошибка при загрузке проектов.</p>
      ) : (
        <ul>
          {projects?.map((project) => (
            <li key={project.id}>
              <div>
                <h4>{project.name}</h4>
                <p>Описание: {project.description || 'Нет описания'}</p>
                <p>Направление ID: {project.direction}</p>
                <p>Руководитель ID: {project.supervisor}</p>
                <p>Кураторы: {project.curators.join(', ')}</p>
                <p>Создатель ID: {project.creator}</p>
              </div>
              <button onClick={() => handleUpdateProject(project.id)} disabled={isUpdating} className="DeleteButton">
                Обновить
              </button>
            </li>
          ))}
        </ul>
      )}
      </div>
    </div>
  );
}