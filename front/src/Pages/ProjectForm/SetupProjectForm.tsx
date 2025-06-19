import DirectionSelector from 'Components/Selectors/DirectionSelector'; // Селектор выбора направления
import { useNotification } from 'Components/Common/Notification/Notification'; // Хук уведомлений
import { useNavigate } from "react-router-dom"; // Хук навигации
import BackButton from 'Components/Common/BackButton/BackButton'; // Кнопка "Назад"
import NameInputField from 'Components/Forms/NameInputField'; // Поле ввода названия
import DescriptionInputField from 'Components/Forms/DescriptionInputField.tsx'; // Поле ввода описания
import CloseIcon from 'assets/icons/close.svg?react'; // Иконка закрытия
import ChevronRightIcon from 'assets/icons/chevron-right.svg?react'; // Иконка стрелки вправо
import 'Styles/FormStyle.scss'; // Стили формы
import React, { useState } from 'react'; // Базовые хуки React
import { useDispatch, useSelector } from 'react-redux'; // Redux хуки
import { addProject, updateProjects, removeProject } from 'Features/store/eventSetupSlice'; // Экшены проектов
import { Project } from 'Features/ApiSlices/projectSlice'; // Тип проекта
import { Direction } from 'Features/ApiSlices/directionSlice'; // Тип направления
import SideStepNavigator from 'Components/Sections/SideStepNavigator'; // Навигатор шагов

interface FormErrors {
  direction?: string; // Ошибка выбора направления
  name?: string; // Ошибка названия проекта
}

/**
 * Форма настройки проектов мероприятия.
 * Позволяет создавать, редактировать и удалять проекты, группировать их по направлениям.
 * Включает валидацию полей и интеграцию с Redux store.
 * 
 * @component
 * @example
 * // Пример использования:
 * <SetupProjectForm />
 * 
 * @returns {JSX.Element} Форма управления проектами с навигацией
 */
export default function SetupProjectForm(): JSX.Element {
  const { stepProjects, stepDirections } = useSelector((state: any) => state.event); // Данные из Redux store
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null); // ID редактируемого проекта
  const [errors, setErrors] = useState<FormErrors>({}); // Ошибки валидации
  const { showNotification } = useNotification(); // Хук уведомлений
  const dispatch = useDispatch(); // Redux dispatch
  const navigate = useNavigate(); // Навигация
  
  // Состояние нового проекта
  const [newProject, setNewProject] = useState({
    direction: 0, // ID направления
    name: '', // Название проекта
    description: '', // Описание проекта
  });

  // Текущее выбранное направление
  const selectedDirection = stepDirections.directions.find(d => d.id === newProject.direction);

  /**
   * Группирует проекты по направлениям для отображения.
   * 
   * @type {Record<number, Project[]>}
   */
  const projectsByDirection = stepProjects.projects?.reduce((acc: Record<number, Project[]>, project) => {
    if (!acc[project.direction]) {
      acc[project.direction] = [];
    }
    acc[project.direction].push(project);
    return acc;
  }, {});

  /**
   * Валидирует форму перед отправкой.
   * Проверяет наличие выбранного направления и названия проекта.
   * 
   * @returns {boolean} Результат валидации (true - валидно)
   */
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

  /**
   * Обработчик изменения полей ввода.
   * 
   * @param {React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>} e - Событие изменения
   */
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

  /**
   * Переключает форму в режим редактирования проекта.
   * 
   * @param {Project} project - Проект для редактирования
   */
  const handleEditProject = (project: Project) => {
    setNewProject({
      direction: project.direction,
      name: project.name,
      description: project.description,
    });
    setEditingProjectId(project.project_id);
    setErrors({});
  };

  /**
   * Обработчик сохранения проекта (создание/обновление).
   * 
   * @async
   * @param {React.FormEvent} e - Событие формы
   */
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

  /**
   * Обработчик изменения выбранного направления.
   * 
   * @param {Direction} selected - Выбранное направление
   */
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

  /**
   * Обработчик изменения текстового поля описания.
   * 
   * @param {React.ChangeEvent<HTMLTextAreaElement>} e - Событие изменения
   */
  const handleTextArea = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNewProject((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  /**
   * Переход к следующему шагу настройки.
   */
  const handleNextStep = () => {
    navigate("/stages-setup");
  };

  /**
   * Удаление проекта по ID.
   * 
   * @param {string} id - ID проекта для удаления
   */
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