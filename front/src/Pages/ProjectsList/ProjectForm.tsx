import DirectionSelector from 'Widgets/Selectors/DirectionSelector';
import { useGetUserQuery } from 'Features/ApiSlices/userSlice';
import { useNotification } from 'Widgets/Notification/Notification';
import { useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import UserSelector from 'Widgets/Selectors/UserSelector';
import BackButton from 'Widgets/BackButton/BackButton';
import NameInputField from 'Components/Forms/NameInputField';
import DescriptionInputField from 'Components/Forms/DescriptioninputField';
import CloseIcon from 'assets/icons/close.svg?react';
import ChevronRightIcon from 'assets/icons/chevron-right.svg?react';
import 'Styles/FormStyle.scss'
import React, { useState } from 'react';
import { 
  Project,
  useUpdateProjectMutation } from 'Features/ApiSlices/projectSlice';
import { useDispatch, useSelector } from 'react-redux';
import { addProject, updateProjects, removeProject } from 'Features/store/eventSetupSlice';

export default function ProjectForm({ 
  existingProject,
}:{
  existingProject?: Project;
}): JSX.Element {
  const { data: user } = useGetUserQuery();
  const [updateProject, { isLoading: isUpdating }] = useUpdateProjectMutation();
  const { stepProjects } = useSelector((state: any) => state.event);
  const { showNotification } = useNotification();
  const dispatch = useDispatch(); // Для использования экшенов Redux
  const navigate = useNavigate();
  
  const [newProject, setNewProject] = useState({
    direction: 0,
    directionSet: 0,
    name: '',
    description: '',
    supervisorSet: null,
    curators: 0,
    creator: 0,
    project_id: 0,
  });

  useEffect(() => {
    if (existingProject) {
      setNewProject({
        directionSet: existingProject.directionSet.id,
        name: existingProject.name,
        description: existingProject.description,
        curators: existingProject.curatorsSet,
        creator: existingProject.creator,
        project_id: existingProject.project_id,
      });
    }
  }, [existingProject]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewProject((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleProject = async (e: React.FormEvent) => {
      e.preventDefault();
      if (newProject.name.trim()) {
        setNewProject((prev) => ({
          ...prev,
          name: '',
          description: '',
          curators: [],
          creator: 0,
          supervisorSet: null,
        }));
        
        showNotification('Проект создан!', 'success');
        dispatch(addProject(newProject));
      }
    };

  const handleUpdateProject = async (e: React.FormEvent) => {
    e.preventDefault();

    const projectData = {
      ...newProject,
      creator: user.user_id,
      supervisorSet: user.user_id,
    };

    if (newProject.name.trim()) {
      try {
        await updateProject({ id: projectData.project_id, data: projectData }).unwrap();
        // Обновляем проект в Redux
        dispatch(updateProjects(projectData));
        showNotification('Проект обновлен!', 'success');
      } catch (error) {
        showNotification(`Ошибка при обновлении проекта: ${error.status} ${error.stage}`, 'error');
      }
    } else {
      showNotification('Пожалуйста, заполните все поля!', 'error');
    }
  };

  const handleDirectionChange = (selected: number) => {
    setNewProject((prev) => ({
      ...prev,
      direction: selected,
    }));
  };

  const handleCuratorChange = (selected: number) => {
    setNewProject((prev) => ({
      ...prev,
      curators: selected,
    }));
  };

  const handleTextArea = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const textarea = e.target;

    setNewProject((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleNextStep = () => {
    navigate("/event-setup-save")
  };

  const handleRemoveProject = (id: string) => {
    dispatch(removeProject(id)); 
  };

  return (
    <div className="FormContainer">
      <div className="FormHeader">
          <BackButton />
          <h2>{existingProject ? 'Редактирование проекта' : 'Добавление проекта'}</h2>
        </div>

      <form 
        className="ProjectForm Form"
        onSubmit={existingProject ? handleUpdateProject : handleProject}>

        <DirectionSelector
          onChange={handleDirectionChange}
        />

        <div className="NameContainer">
          <NameInputField
            name="name"
            value={newProject.name}
            onChange={handleInputChange}
            placeholder="Название проекта"
            required
          />
          <DescriptionInputField
            name="description"
            value={newProject.description}
            onChange={handleTextArea}
            placeholder="Описание проекта"
          />
        </div>

        {/*<UserSelector
          selectedUserId={newProject.curators || null}
          onChange={handleCuratorChange}
          label="Добавить куратора"
        />*/}

        <div className="FormButtons">
          <button className="primary-btn" type="submit" disabled={isUpdating}>
            {existingProject ? 'Обновить проект' : 'Создать проект'}
          </button>
          <button
            className="primary-btn"
            type="button"
            onClick={handleNextStep} // Переход к следующему шагу
          >
            Далее
            <ChevronRightIcon width="24" height="24" strokeWidth="1" />
          </button>
        </div>
      </form>

      { 
        stepProjects.projects && stepProjects.projects.length > 0 && (
        <div className="ProjectList">
          <h3>Созданные проекты:</h3>
          <ul className='SelectedList'>
            {stepProjects.projects.map((project) => (
              <li key={project.project_id} className="SelectedListItem">
                {project.name}
                <CloseIcon
                  className="RemoveIcon"
                  width="16"
                  height="16"
                  strokeWidth="1.5"
                  onClick={() => handleRemoveProject(project.project_id)}
                />
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
