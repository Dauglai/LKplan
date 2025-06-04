import { useState, useEffect } from "react";
import { Project, useGetProjectsQuery } from "Features/ApiSlices/projectSlice";
import { Event } from "Features/ApiSlices/eventSlice";
import { Team, useGetTeamsQuery } from "Features/ApiSlices/teamSlice";
import ProjectSelector from "Components/Selectors/ProjectSelector";
import SpecializationSelector from "Components/Selectors/SpecializationSelector";
import DirectionSelector from "Components/Selectors/DirectionSelector";
import ChevronRightIcon from 'assets/icons/chevron-right.svg?react';
import TeamSelector from "Components/Selectors/TeamSelector";
import { Direction, useGetDirectionsQuery } from "Features/ApiSlices/directionSlice";
import { Input, Spin } from "antd";

interface RequestFormProps {
  event: Event;
  userId: string;
  onSubmit: (data: any) => void;
}

export default function RequestForm({ event, userId, onSubmit }: RequestFormProps): JSX.Element {
  const { data: directions, isLoading: isDirectionsLoading } = useGetDirectionsQuery();
  const { data: projects, isLoading: isProjectsLoading } = useGetProjectsQuery();
  const { data: teams, isLoading: isTeamsLoading } = useGetTeamsQuery();

  const [selectedDirection, setSelectedDirection] = useState<Direction | null>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [selectedSpecialization, setSelectedSpecialization] = useState<number[]>([]);
  const [message, setMessage] = useState<string>("");

  const [requestData, setRequestData] = useState({
    event: event.event_id,
    user: userId,
    status: 1,
  });

  const filteredDirections = directions?.filter(
    (direction) => direction.event === event.event_id
  );

  const filteredProjects = projects?.filter((project) =>
    // Проект привязан через directionSet к направлению, а направление к мероприятию
    filteredDirections?.some((dir) => dir.id === project.directionSet.id)
  );

  const filteredTeams = teams?.filter((team) => {
    const project = projects?.find((p) => p.project_id === team.project);
    if (!project) return false;
    return filteredDirections?.some((dir) => dir.id === project.directionSet.id);
  });

  // Логика автоподстановки родителя при выборе дочернего элемента
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

  const handleSubmit = () => {
    if (selectedProject) requestData.project = selectedProject.project_id;
    if (selectedDirection) requestData.direction = selectedDirection.id;
    if (selectedSpecialization) requestData.specialization = selectedSpecialization[0];
    if (selectedTeam) requestData.team = selectedTeam.id;
    if (message) requestData.message = message;

    onSubmit(requestData);
  };

  if (isDirectionsLoading || isProjectsLoading || isTeamsLoading) {
    return <Spin tip="Загрузка данных..." />;
  }

  return (
    <div className="FormContainer RequestFormContainer">
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
          selectedProject={selectedProject}
          onChange={setSelectedProject}
          projects={selectedDirection
            ? filteredProjects?.filter((project) => project.directionSet.id === selectedDirection.id)
            : filteredProjects || []}
          label="Выбрать проект"
        />

        <TeamSelector
          selectedTeam={selectedTeam}
          teams={selectedProject
            ? filteredTeams?.filter((team) => {
                const project = projects?.find((p) => p.project_id === team.project);
                return project?.id === selectedProject.id;
              })
            : filteredTeams || []}
          onChange={setSelectedTeam}
        />

        <SpecializationSelector 
          selectedSpecializations={selectedSpecialization}
          onChange={setSelectedSpecialization}
          isSingleSelect={true}
          label="Выбрать специализацию"
          availableSpecializations={event.specializations}
        />

        <Input.TextArea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          maxLength={1000}
          name="message"
          placeholder="Сообщение"
          autoSize={{ minRows: 3, maxRows: 6 }}
          className="Message"
        />

        <button className="primary-btn" type="submit">
          Отправить
          <ChevronRightIcon width="24" height="24" strokeWidth="1" />
        </button>
      </form>
    </div>
  );
}

