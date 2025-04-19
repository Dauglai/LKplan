
import { Project, useGetProjectsQuery } from 'Features/ApiSlices/projectSlice';
import { Select, Spin } from 'antd';
const { Option } = Select;
import "Styles/FormSelectorStyle.scss";

interface ProjectSelectorProps {
  selectedProject?: Project | null;
  onChange: (project: Project) => void;
  label?: string;
  projects?: Project[];
}

export default function ProjectSelector({
  selectedProject,
  onChange,
  label = 'Выбрать проект',
  projects: propProjects,
}: ProjectSelectorProps): JSX.Element {
  const { data: fetchedProjects, isLoading } = useGetProjectsQuery();
  const projects = propProjects || fetchedProjects;

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

  