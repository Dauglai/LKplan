import { Project, useGetProjectsQuery } from 'Features/ApiSlices/projectSlice'; // Тип Project и API-запрос проектов
import { Select, Spin } from 'antd'; // Компоненты Ant Design
const { Option } = Select; // Деструктуризация Option из Select
import "Styles/FormSelectorStyle.scss"; // Стили компонента

/**
 * Интерфейс пропсов компонента ProjectSelector.
 * 
 * @property {Project | null} [selectedProject] - Выбранный проект (опционально).
 * @property {(project: Project) => void} onChange - Колбэк при изменении выбора проекта.
 * @property {string} [label='Выбрать проект'] - Текст лейбла (опционально).
 * @property {Project[]} [projects] - Кастомный список проектов (опционально).
 */
interface ProjectSelectorProps {
  selectedProject?: Project | null;
  onChange: (project: Project) => void;
  label?: string;
  projects?: Project[];
}

/**
 * Компонент выбора проекта из списка.
 * Поддерживает как загрузку проектов с сервера, так и использование переданного списка проектов.
 * 
 * @component
 * @example
 * // Пример использования с загрузкой проектов:
 * <ProjectSelector
 *   onChange={(project) => handleProjectSelect(project)}
 * />
 * 
 * // Пример с кастомным списком проектов:
 * <ProjectSelector
 *   projects={customProjects}
 *   selectedProject={currentProject}
 *   label="Выберите проект"
 *   onChange={handleProjectChange}
 * />
 *
 * @param {ProjectSelectorProps} props - Пропсы компонента.
 * @returns {JSX.Element} Выпадающий список проектов или состояние загрузки/ошибки.
 */
export default function ProjectSelector({
  selectedProject,
  onChange,
  label = 'Выбрать проект',
  projects: propProjects,
}: ProjectSelectorProps): JSX.Element {
  const { data: fetchedProjects, isLoading } = useGetProjectsQuery(); // Получаем проекты с сервера
  const projects = propProjects || fetchedProjects; // Используем переданные проекты или загруженные

  if (isLoading) return <Spin />;

  if (!projects || projects.length === 0) {
    return <div>Проекты не найдены</div>;
  }

  return (
    <Select
      value={selectedProject?.project_id ?? undefined}
      onChange={(id) => {
        const selected = projects.find((p) => p.project_id === id);
        if (selected) onChange(selected);
      }}
      placeholder={label}
      optionFilterProp="children"
      showSearch
      className="Selector"
    >
      {projects.map((project) => (
        <Option key={project.project_id} value={project.project_id}>
          {project.name}
        </Option>
      ))}
    </Select>
  );
}

  