import { useState } from 'react';
import { useGetProjectsQuery } from 'Features/ApiSlices/projectSlice';
import ChevronRightIcon from 'assets/icons/chevron-right.svg?react';

interface ProjectSelectorProps {
  selectedProjectId: number | null;
  onChange: (projectId: number) => void;
}

export default function ProjectSelector({
    selectedProjectId,
    onChange,
}: ProjectSelectorProps): JSX.Element {
    const { data: projects, isLoading, error } = useGetProjectsQuery();
    const [isOpen, setIsOpen] = useState(false);

    const handleSelectProject = (projectId: number) => {
        onChange(projectId);
    };

    if (isLoading) {
        return <div className="ProjectSelector">Загрузка направлений...</div>;
    }

    if (error || !projects || projects.length === 0) {
        return <div className="ProjectSelector">Направления не найдены</div>;
    }

    const selectedProjectName = projects.find(project => project.id === selectedProjectId)?.name || 'Выбрать мероприятие';

    return (
        <div className="ProjectSelector">
            <div
                className="ListField FormField"
                onClick={() => setIsOpen(prev => !prev)}
            >
                <p>{selectedProjectName}</p>
                <ChevronRightIcon
                width="20"
                height="20"
                strokeWidth="1"
                className={`ChevronDown ${isOpen ? 'open' : ''}`}
                />

                {isOpen && (
                <div className="DropdownList">
                    {projects.map(project => (
                    <div
                        key={project.id}
                        className={`DropdownItem ${selectedProjectId === project.id ? 'selected' : ''}`}
                        onClick={() => handleSelectProject(project.id)}
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