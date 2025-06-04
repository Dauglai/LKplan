import DirectionSelector from 'Components/Selectors/DirectionSelector';
import { useNotification } from 'Components/Common/Notification/Notification';
import { useNavigate } from "react-router-dom";
import UserSelector from 'Components/Selectors/UserSelector';
import BackButton from 'Components/Common/BackButton/BackButton';
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
import SideStepNavigator from 'Components/Sections/SideStepNavigator';

interface FormErrors {
  direction?: string;
  name?: string;
}

export default function SetupProjectForm(): JSX.Element {
  const { stepProjects, stepDirections } = useSelector((state: any) => state.event);
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [errors, setErrors] = useState<FormErrors>({});
  const { showNotification } = useNotification();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const [newProject, setNewProject] = useState({
    direction: 0,
    name: '',
    description: '',
  });

  const selectedDirection = stepDirections.directions.find(d => d.id === newProject.direction);

  // Группировка проектов по направлениям
  const projectsByDirection = stepProjects.projects?.reduce((acc: Record<number, Project[]>, project) => {
    if (!acc[project.direction]) {
      acc[project.direction] = [];
    }
    acc[project.direction].push(project);
    return acc;
  }, {});

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    
    if (!newProject.direction) {
      newErrors.direction = "Выберите направление";
    }
    
    if (!newProject.name.trim()) {
      newErrors.name = "Введите название проекта";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewProject((prev) => ({
      ...prev,
      [name]: value,
    }));
    
    // Очищаем ошибку при изменении поля
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleEditProject = (project: Project) => {
    setNewProject({
      direction: project.direction,
      name: project.name,
      description: project.description,
    });
    setEditingProjectId(project.project_id);
    setErrors({});
  };

  const handleProject = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      showNotification("Пожалуйста, заполните все обязательные поля", "error");
      return;
    }

    try {
      if (editingProjectId) {
        const updatedProjects = stepProjects.projects.map((project) =>
          project.project_id === editingProjectId ? { ...newProject, project_id: editingProjectId } : project
        );
        dispatch(updateProjects(updatedProjects));
        showNotification('Проект обновлён!', 'success');
      } else {
        dispatch(addProject(newProject));
        showNotification('Проект создан!', 'success');
      }

      setNewProject({ direction: 0, name: '', description: '' });
      setEditingProjectId(null);
    } catch (error) {
      showNotification('Ошибка при сохранении проекта', 'error');
    }
  };

  const handleDirectionChange = (selected: Direction) => {
    setNewProject((prev) => ({
      ...prev,
      direction: selected.id,
    }));
    
    // Очищаем ошибку направления при изменении
    if (errors.direction) {
      setErrors(prev => ({ ...prev, direction: undefined }));
    }
  };

  const handleTextArea = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNewProject((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleNextStep = () => {
    if (stepProjects.projects.length === 0) {
      showNotification("Добавьте хотя бы один проект", "error");
      return;
    }
    navigate("/stages-setup");
  };

  const handleRemoveProject = (id: string) => {
    dispatch(removeProject(id)); 
  };

  return (
    <div className="SetupContainer">
      <SideStepNavigator />
      <div className="FormContainer">
        <div className="FormHeader">
          <BackButton />
          <h2>Добавление проекта</h2>
        </div>

        <form className="ProjectForm Form" onSubmit={handleProject}>
          <DirectionSelector
            onChange={handleDirectionChange}
            selectedDirection={selectedDirection}
            sourceType='local'
            error={errors.direction}
          />

          <div className="NameContainer">
            <NameInputField
              name="name"
              value={newProject.name}
              onChange={handleInputChange}
              placeholder="Название проекта"
              required
              error={errors.name}
            />
            <DescriptionInputField
              name="description"
              value={newProject.description}
              onChange={handleTextArea}
              placeholder="Описание проекта"
            />
          </div>

          <div className="FormButtons">
            {editingProjectId && (
              <button
                type="button"
                className="secondary-btn"
                onClick={() => {
                  setEditingProjectId(null);
                  setNewProject({ direction: 0, name: '', description: '' });
                  setErrors({});
                }}
              >
                Отменить редактирование
              </button>
            )}
            <button className="primary-btn" type="submit">
              Сохранить проект
            </button>
          </div>
        </form>

        

        {projectsByDirection && Object.keys(projectsByDirection).length > 0 && (
          <div className="ProjectsByDirection">
            {Object.entries(projectsByDirection).map(([directionId, projects]) => {
              const direction = stepDirections.directions.find(d => d.id === directionId);
              return (
                <div key={directionId} className="ProjectList">
                  <h3>{direction ? direction.name : 'Без направления'}</h3>
                  <ul className='SelectedList'>
                    {projects.map((project) => (
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
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveProject(project.project_id);
                          }}
                        />
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        )}

        <div className="FormButtons navigate">
          <button
            className="primary-btn"
            type="button"
            onClick={handleNextStep}
          >
            Далее
            <ChevronRightIcon width="24" height="24" strokeWidth="1" />
          </button>
        </div>
      </div>
    </div>
  );
}