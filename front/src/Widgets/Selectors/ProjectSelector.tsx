import { useState } from 'react';
import { useGetProjectsQuery } from 'Features/ApiSlices/projectSlice';
import ChevronRightIcon from 'assets/icons/chevron-right.svg?react';

interface ProjectSelectorProps {
  selectedProjectId: number | null;
  onChange: (projectId: number) => void;
  label? : string;
  projects?: [];
}

export default function ProjectSelector({
    selectedProjectId,
    onChange,
    label = "Выбрать проект",
    projects: propProjects,
  }: ProjectSelectorProps): JSX.Element {
    const { data: fetchedProjects, isLoading, error } = useGetProjectsQuery();
    const [isOpen, setIsOpen] = useState(false);
  

    const projects = propProjects || fetchedProjects;
  
    const handleSelectProject = (projectId: number) => {
      onChange(projectId);
    };
  
    if (isLoading) {
      return <div className="ProjectSelector FormField">Загрузка проектов...</div>;
    }
  
    if (error || !projects || projects.length === 0) {
      return <div className="ProjectSelector FormField">Проекты не найдены</div>;
    }
  
    const selectedProjectName =
      projects.find((project) => project.project_id === selectedProjectId)?.name || label;
  
    return (
      <div className="ProjectSelector">
        <div
          className="ListField FormField"
          onClick={() => setIsOpen((prev) => !prev)}
        >
          <p>{selectedProjectName}</p>
          <ChevronRightIcon
            width="20"
            height="20"
            strokeWidth="1"
            className={`ChevronDown ${isOpen ? "open" : ""}`}
          />
  
          {isOpen && (
            <div className="DropdownList">
              {projects.map((project) => (
                <div
                  key={project.project_id}
                  className={`DropdownItem ${
                    selectedProjectId === project.project_id ? "selected" : ""
                  }`}
                  onClick={() => handleSelectProject(project.project_id)}
                >
                  {project.name}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }
  