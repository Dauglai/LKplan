import CreateEventHeader from 'Widgets/CreateFormHeader/CreateFormHeader';
import DateRangePicker from 'Widgets/fields/DateRangePicker';
import RoleSelector from 'Widgets/fields/RoleSelector';

import PlusIcon from "assets/icons/plus.svg?react";
import ChevronRightIcon from 'assets/icons/chevron-right.svg?react';

import 'Styles/CreateFormStyle.scss'

import React, { useState } from 'react';
import { useCreateProjectMutation } from 'Features/ApiSlices/projectSlice';

export default function CreateProjectForm({ closeModal }: { closeModal: () => void }): JSX.Element {
    const [createProject, { isLoading: isCreating }] = useCreateProjectMutation();
  
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

          <div className="FormButtons">
            <button className="primary-btn" type="submit">
              Создать
              <ChevronRightIcon width="24" height="24" strokeWidth="1"/>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}