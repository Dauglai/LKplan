import { useEffect, useState } from "react";
import { useGetProjectsQuery } from "Features/ApiSlices/projectSlice";
import ProjectsHeaderPanel from "./ProjectsHeaderPanel";
import ProjectsListTable from "./ProjectsListTable";
import 'Styles/components/Sections/ListTableStyles.scss';

export default function ProjectsManagement(): JSX.Element {
  const { data: Projects = [], isLoading } = useGetProjectsQuery();
  const [search, setSearch] = useState("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  useEffect(() => {
      document.title = 'Проекты - MeetPoint';
  }, []);

  const handleSearch = (searchValue: string) => {
    setSearch(searchValue.toLowerCase());
  };

  const handleSort = (order: "asc" | "desc") => {
    setSortOrder(order);
  };

  const filteredProjects = Projects
    .filter((project) => project.name.toLowerCase().includes(search))
    .sort((a, b) =>
      sortOrder === "asc"
        ? a.name.localeCompare(b.name)
        : b.name.localeCompare(a.name)
    );

  if (isLoading) return <div>Загрузка...</div>;

  console.log(filteredProjects);

  return (
    <div className="ProjectsContainer ListTableContainer">
      <ProjectsHeaderPanel onSearch={handleSearch} onSort={handleSort} />
      <ProjectsListTable projects={filteredProjects} />
    </div>
  );
};