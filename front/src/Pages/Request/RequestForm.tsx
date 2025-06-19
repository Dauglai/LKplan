import { useState, useEffect } from "react"; // Хуки состояния и эффектов
import { Project, useGetProjectsQuery } from "Features/ApiSlices/projectSlice"; // Тип проекта и запрос проектов
import { Event } from "Features/ApiSlices/eventSlice"; // Тип мероприятия
import { Team, useGetTeamsQuery } from "Features/ApiSlices/teamSlice"; // Тип команды и запрос команд
import ProjectSelector from "Components/Selectors/ProjectSelector"; // Селектор проектов
import SpecializationSelector from "Components/Selectors/SpecializationSelector"; // Селектор специализаций
import DirectionSelector from "Components/Selectors/DirectionSelector"; // Селектор направлений
import ChevronRightIcon from 'assets/icons/chevron-right.svg?react'; // Иконка стрелки вправо
import TeamSelector from "Components/Selectors/TeamSelector"; // Селектор команд
import { Direction, useGetDirectionsQuery } from "Features/ApiSlices/directionSlice"; // Тип направления и запрос направлений
import { Input, Spin } from "antd"; // Компоненты Ant Design
import { useGetStatusOrdersByEventQuery } from "Features/ApiSlices/statusOrdersSlice";

interface RequestFormProps {
  event: Event; // Объект мероприятия
  userId: string; // ID пользователя
  onSubmit: (data: any) => void; // Функция обработки отправки формы
}

/**
 * Форма создания заявки на участие в мероприятии.
 * Позволяет выбрать направление, проект, команду и специализацию.
 * Автоматически фильтрует доступные варианты в зависимости от выбранных значений.
 * Поддерживает автоподстановку связанных сущностей.
 * 
 * @component
 * @example
 * // Пример использования:
 * <RequestForm 
 *   event={currentEvent} 
 *   userId={currentUser.id} 
 *   onSubmit={handleRequestSubmit} 
 * />
 *
 * @param {RequestFormProps} props - Свойства компонента
 * @returns {JSX.Element} Форма создания заявки с селекторами и полем сообщения
 */
export default function RequestForm({ event, userId, onSubmit }: RequestFormProps): JSX.Element {
  const { data: directions, isLoading: isDirectionsLoading } = useGetDirectionsQuery(); // Запрос направлений
  const { data: projects, isLoading: isProjectsLoading } = useGetProjectsQuery(); // Запрос проектов
  const { data: teams, isLoading: isTeamsLoading } = useGetTeamsQuery(); // Запрос команд
  const { data: statusOrders, isLoading: isStatusOrdersLoading } = useGetStatusOrdersByEventQuery(event.event_id); //Запрос на список статусов для мероприятия

  // Состояния формы
  const [selectedDirection, setSelectedDirection] = useState<Direction | null>(null); // Выбранное направление
  const [selectedProject, setSelectedProject] = useState<Project | null>(null); // Выбранный проект
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null); // Выбранная команда
  const [selectedSpecialization, setSelectedSpecialization] = useState<number[]>([]); // Выбранные специализации
  const [message, setMessage] = useState<string>(""); // Сообщение к заявке

  const firstStatus = statusOrders?.reduce((prev, current) => 
    (prev.number < current.number) ? prev : current
  );

  // Базовые данные заявки
  const [requestData, setRequestData] = useState({
    event: event.event_id,
    user: userId,
    status: firstStatus?.status,
  });

  useEffect(() => {
    if (statusOrders && statusOrders.length > 0) {
      const initialStatus = statusOrders.reduce((prev, current) => 
        (prev.number < current.number) ? prev : current
      ).status;
      
      setRequestData(prev => ({
        ...prev,
        status: initialStatus,
      }));
    }
  }, [statusOrders]);


  /**
   * Направления, отфильтрованные по текущему мероприятию.
   * @type {Direction[]|undefined}
   */
  const filteredDirections = directions?.filter(
    (direction) => direction.event === event.event_id
  );

  /**
   * Проекты, отфильтрованные по доступным направлениям.
   * @type {Project[]|undefined}
   */
  const filteredProjects = projects?.filter((project) =>
    filteredDirections?.some((dir) => dir.id === project.directionSet.id)
  );

  /**
   * Команды, отфильтрованные по доступным проектам.
   * @type {Team[]|undefined}
   */
  const filteredTeams = teams?.filter((team) => {
    const project = projects?.find((p) => p.project_id === team.project);
    if (!project) return false;
    return filteredDirections?.some((dir) => dir.id === project.directionSet.id);
  });

  /**
   * Эффект автоподстановки направления при выборе проекта.
   */
  useEffect(() => {
    if (selectedProject) {
      const project = projects?.find((project) => project.id === selectedProject.id);
      if (project) setSelectedDirection(project.directionSet);
    }
  }, [selectedProject, projects]);

  /**
   * Эффект автоподстановки проекта и направления при выборе команды.
   */
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

  /**
   * Обработчик отправки формы.
   * Формирует объект с данными заявки и передает его в onSubmit.
   */
  const handleSubmit = () => {
    if (selectedProject) requestData.project = selectedProject.project_id;
    if (selectedDirection) requestData.direction = selectedDirection.id;
    if (selectedSpecialization) requestData.specialization = selectedSpecialization[0];
    if (selectedTeam) requestData.team = selectedTeam.id;
    if (message) requestData.message = message;

    onSubmit(requestData);
  };

  // Состояние загрузки данных
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

