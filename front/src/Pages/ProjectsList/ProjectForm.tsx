import EventHeader from 'Widgets/FormHeader/FormHeader';
import DateRangePicker from 'Widgets/fields/DateRangePicker';
import RoleSelector from 'Widgets/fields/RoleSelector';
import DirectionSelector from 'Widgets/Selectors/DirectionSelector';
import { useGetUserQuery } from 'Features/ApiSlices/userSlice';
import { useNotification } from 'Widgets/Notification/Notification';
import { useEffect } from 'react';

import PlusIcon from "assets/icons/plus.svg?react";
import ChevronRightIcon from 'assets/icons/chevron-right.svg?react';
import CloseIcon from 'assets/icons/close.svg?react';

import 'Styles/FormStyle.scss'

import React, { useState } from 'react';
import { 
  Project, 
  useCreateProjectMutation,
  useUpdateProjectMutation } from 'Features/ApiSlices/projectSlice';

export default function ProjectForm({ 
  closeModal,
  existingProject,
}:{
  closeModal: () => void; 
  existingProject?: Project;}): JSX.Element {
  const { data: user } = useGetUserQuery();
  const [createProject, { isLoading: isCreating }] = useCreateProjectMutation();
  const [updateProject, { isLoading: isUpdating }] = useUpdateProjectMutation();
  const { showNotification } = useNotification();
  
    const [newProject, setNewProject] = useState({
      direction: 0,
      name: '',
      description: '',
      supervisor: null,
      curators: [],
      creator: 0,
    });

    useEffect(() => {
        if (existingProject) {
          setNewProject(existingProject);
        }
      }, [existingProject]);
  
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;
      setNewProject((prev) => ({
        ...prev,
        [name]: value,
      }));
    };
  
    const handleCreateProject = async (e: React.FormEvent) => {
      e.preventDefault();

      const eventData = {
        ...newProject,
        creator: user.user_id,
        supervisor: user.user_id,
      };

      try {
        await createProject(eventData).unwrap();
        setNewProject({ direction: 0, name: '', description: '', supervisor: null, curators: [], creator: 0 });
        showNotification('Проект создан!', 'success');
        closeModal();
      } catch (error) {
        console.error('Ошибка при создании проекта:', error);
        showNotification(`Ошибка при создании проекта: ${error.status} ${error.data.stage}`, 'error');
      }
    };

    const handleUpdateProject = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newProject.name.trim()) {
          await updateProject(newProject);
          showNotification('Проект обновлен!', 'success');
          closeModal();
        }
    };

    const handleDirectionChange = (selected: number) => {
      setNewProject((prev) => ({
        ...prev,
        direction: selected,
      }));
    };

  const handleTextArea = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const textarea = e.target;
    textarea.style.height = 'auto';
    textarea.style.height = `${textarea.scrollHeight}px`;

    setNewProject((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <div className="FormContainer">
        <form 
          className="ProjectForm Form"
          onSubmit={existingProject ? handleUpdateProject : handleCreateProject}>

          <div className="ModalFormHeader">
            <h2>{existingProject ? 'Редактирование проекта' : 'Добавление проекта'}</h2>
            <CloseIcon width="24" height="24" strokeWidth="1" onClick={closeModal} className="ModalCloseButton"/>
          </div>

          <DirectionSelector
            selectedDirectionId={newProject.direction}
            onChange={handleDirectionChange}
          />

          <div className="NameContainer">
            <input
              type="text"
              name="name"
              placeholder='Название проекта'
              value={newProject.name}
              onChange={handleInputChange}
              className="Name TextField FormField"/>
            <textarea
              placeholder='Описание проекта'
              className="Description TextField FormField"
              name="description"
              value={newProject.description}
              onChange={handleTextArea}/>
          </div>

          <input
            type="text"
            name="curators"
            value={newProject.curators.join(', ')}
            onChange={(e) => handleInputChange({ target: { name: 'curators', value: e.target.value.split(', ') } })}
            placeholder="ID кураторов (через запятую)"
            className="FormField"
          />

          <div className="FormButtons">
            <button className="primary-btn" type="submit" disabled={isCreating || isUpdating}>
              {existingProject ? 'Обновить' : 'Создать'}
              <ChevronRightIcon width="24" height="24" strokeWidth="1"/>
            </button>
          </div>
        </form>
    </div>
  );
}