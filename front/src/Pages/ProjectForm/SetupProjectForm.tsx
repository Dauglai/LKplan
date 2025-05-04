import DirectionSelector from 'Widgets/Selectors/DirectionSelector';
import { useNotification } from 'Widgets/Notification/Notification';
import { useNavigate } from "react-router-dom";
import UserSelector from 'Widgets/Selectors/UserSelector';
import BackButton from 'Widgets/BackButton/BackButton';
import NameInputField from 'Components/Forms/NameInputField';
import DescriptionInputField from 'Components/Forms/DescriptionInputField.tsx';
import CloseIcon from 'assets/icons/close.svg?react';
import ChevronRightIcon from 'assets/icons/chevron-right.svg?react';
import 'Styles/FormStyle.scss'
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addProject, updateProjects, removeProject } from 'Features/store/eventSetupSlice';
import { Project } from 'Features/ApiSlices/projectSlice';
import { Direction } from 'Features/ApiSlices/directionSlice';

export default function SetupProjectForm(): JSX.Element {
  const { stepProjects } = useSelector((state: any) => state.event);
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const { stepDirections } = useSelector((state: any) => state.event);
  const { showNotification } = useNotification();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const [newProject, setNewProject] = useState({
    direction: 0,
    name: '',
    description: '',
  });

  const selectedDirection = stepDirections.directions.find(d => d.id === newProject.direction);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewProject((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleEditProject = (project: Project) => {
    setNewProject({
      direction: project.direction,
      name: project.name,
      description: project.description,
    });
    setEditingProjectId(project.project_id);
  };

  const handleProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newProject.name.trim()) {
      if (editingProjectId) {
        const updatedProjects = stepProjects.projects.map((project) =>
          project.project_id === editingProjectId ? { ...newProject, project_id: editingProjectId } : project
        );
        // Обновляем существующий проект
        dispatch(updateProjects(updatedProjects));
        showNotification('Проект обновлён!', 'success');
      } else {
        // Создаём новый проект
        dispatch(addProject(newProject));
        showNotification('Проект создан!', 'success');
      }

      // Сбрасываем форму
      setNewProject({ direction: 0, name: '', description: '' });
      setEditingProjectId(null);
    }
  };

  const handleDirectionChange = (selected: Direction) => {
    setNewProject((prev) => ({
      ...prev,
      direction: selected.id,
    }));
  };

  const handleCuratorChange = (selected: number) => {
    setNewProject((prev) => ({
      ...prev,
      curators: selected,
    }));
  };

  const handleTextArea = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNewProject((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleNextStep = () => {
    navigate("/stages-setup")
  };

  const handleRemoveProject = (id: string) => {
    dispatch(removeProject(id)); 
  };

  return (
    <div className="FormContainer">
      <div className="FormHeader">
          <BackButton />
          <h2>Добавление проекта</h2>
        </div>

      <form 
        className="ProjectForm Form"
        onSubmit={handleProject}>

        <DirectionSelector
          onChange={handleDirectionChange}
          selectedDirection={selectedDirection}
          sourceType='local'
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
          {editingProjectId && (
            <button
              type="button"
              className="secondary-btn"
              onClick={() => {
                setEditingProjectId(null);
                setNewProject({ direction: 0, name: '', description: '' });
              }}
            >
              Отменить редактирование
            </button>
          )}
          <button className="primary-btn" type="submit">
          {editingProjectId ? "Редактировать проект" : "Добавить проект"}
          </button>
          <button
            className="primary-btn"
            type="button"
            onClick={handleNextStep}
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
              <li
              key={project.project_id}
              className={`SelectedListItem ${editingProjectId === project.project_id ? 'editing' : ''}`}
              onClick={() => handleEditProject(project)}
            >
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
