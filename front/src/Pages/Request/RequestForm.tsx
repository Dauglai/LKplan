import { useState, useEffect } from "react";
import { Project, useGetProjectsQuery } from "Features/ApiSlices/projectSlice";
import { Team, useGetTeamsQuery } from "Features/ApiSlices/teamSlice";
import ProjectSelector from "Widgets/Selectors/ProjectSelector";
import SpecializationSelector from "Widgets/Selectors/SpecializationSelector";
import DirectionSelector from "Widgets/Selectors/DirectionSelector";
import ChevronRightIcon from 'assets/icons/chevron-right.svg?react';
import TeamSelector from "Widgets/Selectors/TeamSelector";
import { Direction, useGetDirectionsQuery } from "Features/ApiSlices/directionSlice";

interface RequestFormProps {
  eventId: number;
  userId: string;
  onSubmit: (data: any) => void;
}

export default function RequestForm({ eventId, userId, onSubmit }: RequestFormProps): JSX.Element {
  const { data: directions } = useGetDirectionsQuery();
  const { data: projects } = useGetProjectsQuery();
  const { data: teams } = useGetTeamsQuery();

  const [selectedDirection, setSelectedDirection] = useState<Direction | null>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [selectedSpecialization, setSelectedSpecialization] = useState<number[]>([]);
  const [message, setMessage] = useState<string>("");

  const [requestData, setRequestData] = useState({
      event: eventId,
      user: userId,
      status: 1,
  });

  console.log(directions)

  const filteredDirections = directions?.filter(
    (direction) => direction.event === eventId
  );

  const filteredProjects = selectedDirection
    ? projects?.filter((project) => project.directionSet.id === selectedDirection.id)
    : projects;

  const filteredTeams = selectedProject
    ? teams?.filter((team) => team.project === selectedProject.project_id)
    : teams;

  useEffect(() => {
    if (selectedProject) {
      const project = projects?.find((project) => project.id === selectedProject.id);
      if (project) setSelectedDirection(project.directionSet);
    }
  }, [selectedProject, projects]);

  useEffect(() => {
    if (selectedTeam) {
      const team = teams?.find((team) => team.id === selectedTeam.id);
      if (team) {
        const project = projects?.find((p) => p.project_id === team.project);
        if (project) {
          setSelectedProject(project);
          setSelectedDirection(project.directionSet);
        }
      }
    }
    
  }, [selectedTeam, teams, projects]);

  const handleTextArea = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const textarea = e.target;
      textarea.style.height = 'auto';
      textarea.style.height = `${textarea.scrollHeight}px`;

      setMessage(textarea.value)
    };

  const handleSubmit = () => {
    if (selectedProject) requestData.project = selectedProject.project_id;
    if (selectedDirection) requestData.direction = selectedDirection.id;
    if (selectedSpecialization) requestData.specialization = selectedSpecialization[0];
    if (selectedTeam) requestData.team = selectedTeam.id;
    if (message) requestData.message = message;

    onSubmit(requestData);
  };

  return (
    <div className="FormContainer">
      <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="RequestForm Form">
        <div className="ModalFormHeader">
          <h3>Подать заявку</h3>
        </div>

        <DirectionSelector
          selectedDirectionId={selectedDirection}
          onChange={setSelectedDirection}
          label="Выбрать направление"
          sourceType="remote"
          directions={filteredDirections}
        />

        <ProjectSelector
          selectedProjectId={selectedProject}
          onChange={setSelectedProject}
          projects={filteredProjects || []}
          label="Выбрать проект"
        />

        <TeamSelector
          selectedTeamId={selectedTeam}
          teams={filteredTeams || []}
          onChange={setSelectedTeam}
        />

        <SpecializationSelector 
          selectedSpecializations={selectedSpecialization}
          onChange={setSelectedSpecialization}
          isSingleSelect={true}
          label="Выбрать специализацию"
        />

        <textarea
            value={message}
            onChange={handleTextArea}
            maxLength={1000}
            name="message"
            className="FormField Message"
            placeholder="Сообщение"
        />
          <button className="primary-btn" type="submit">
            Отправить
            <ChevronRightIcon width="24" height="24" strokeWidth="1" />
          </button>
      </form>
    </div>
  );
}

