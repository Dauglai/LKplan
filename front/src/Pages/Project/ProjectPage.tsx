import { useParams, Link, useNavigate } from 'react-router-dom'; // Навигация и параметры URL
import { useGetProjectByIdQuery } from 'Features/ApiSlices/projectSlice'; // Запрос данных проекта
import { useGetDirectionByIdQuery } from 'Features/ApiSlices/directionSlice'; // Запрос данных направления
import { useGetEventByIdQuery } from 'Features/ApiSlices/eventSlice'; // Запрос данных мероприятия
import { useGetTeamsQuery } from 'Features/ApiSlices/teamSlice'; // Запрос списка команд
import BackButton from "Components/Common/BackButton/BackButton"; // Кнопка "Назад"
import { Button } from 'antd'; // UI компоненты Ant Design
import 'Styles/pages/common/InfoPageStyle.scss'; // Общие стили страницы
import { useEffect, useState } from 'react'; // Базовые хуки React
import EditProjectModal from 'Pages/ProjectForm/EditProjectModal'; // Модальное окно редактирования
import { useDeleteProjectMutation } from 'Features/ApiSlices/projectSlice'; // Мутация удаления проекта
import { useNotification } from 'Components/Common/Notification/Notification'; // Уведомления
import { useUserRoles } from 'Features/context/UserRolesContext'; // Контекст ролей пользователя

/**
 * Страница просмотра детальной информации о проекте.
 * Отображает данные проекта, связанное направление и мероприятие, список команд проекта.
 * Предоставляет функционал редактирования и удаления (для авторизованных пользователей).
 * 
 * @component
 * @example
 * // Пример использования (переход по ссылке):
 * <Link to={`/projects/${projectId}`} />
 * 
 * @returns {JSX.Element} Страница с детальной информацией о проекте
 */
export default function ProjectPage(): JSX.Element {
  const { id } = useParams<{ id: string }>(); // Получаем ID проекта из URL
  const navigate = useNavigate(); // Хук для навигации
  const { showNotification } = useNotification(); // Хук для показа уведомлений
  // Запрос данных проекта
  const { 
    data: project, 
    isLoading: isProjectLoading, 
    refetch: refetchProject 
  } = useGetProjectByIdQuery(Number(id));
  // Запрос данных направления (выполняется только если есть проект)
  const { 
    data: direction, 
    isLoading: isDirectionLoading 
  } = useGetDirectionByIdQuery(project?.directionSet.id || 0, {
    skip: !project,
  });
  // Запрос данных мероприятия (выполняется только если есть направление)
  const { 
    data: event, 
    isLoading: isEventLoading 
  } = useGetEventByIdQuery(direction?.event || 0, {
    skip: !direction,
  });
  // Запрос списка всех команд
  const { 
    data: teams, 
    isLoading: isTeamsLoading 
  } = useGetTeamsQuery();
  // Мутация для удаления проекта
  const [deleteProject] = useDeleteProjectMutation();
  // Хук для проверки ролей и прав пользователя
  const { hasRole, hasPermission, getRoleForObject } = useUserRoles();

  // Состояние модального окна редактирования
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  /**
   * Обработчик удаления проекта
   * @param {number} id - ID проекта для удаления
   */
  const handleDelete = async (id: number) => {
    await deleteProject(id);
    showNotification('Проект удалён', 'success');
    navigate('/projects');
  };

  // Установка заголовка страницы в зависимости от данных проекта
  useEffect(() => {
    if (project) {
        document.title = `${project.name} - MeetPoint`;
    } else {
        document.title = `Страница проекта - MeetPoint`;
    }
  }, [project]);

  // Показываем загрузку если данные еще не получены
  if (isProjectLoading || isDirectionLoading || isEventLoading || isTeamsLoading) {
    return <div>Загрузка...</div>;
  }

  // Если проект не найден
  if (!project) {
    return <div>Проект не найден</div>;
  }

  // Фильтруем команды относящиеся к текущему проекту
  const projectTeams = teams?.filter((team) => team.project === project.project_id) || [];

  /**
   * Проверяет права пользователя на редактирование проекта
   * @returns {boolean} true если пользователь имеет права на редактирование
   */
  const canEditProject = () => {
    console.log('Checking permissions for project:', project);
    // Организатор может редактировать все проекты
    if (hasPermission('edit_project') && hasRole('organizer')) {
      return true;
    }

    // Руководитель направления может редактировать проект, если у него есть доступ к направлению
    if (hasPermission('edit_project') && getRoleForObject('direction_leader', project?.directionSet.id, 'crm.direction')) {
      return true;
    }

    // В остальных случаях - не может редактировать проект
    return false;
  };

  return (
    <div className="ProjectInfoPage InfoPage">
        <div className="ProjectInfoHeader ListsHeaderPanel HeaderPanel">
          <div className="LeftHeaderPanel">
            <BackButton />
            <h2>{project.name}</h2>
          </div>
          
            {canEditProject() && (
              <div className="RightHeaderPanel">
                <Button onClick={() => setIsEditModalOpen(true)}>Редактировать</Button>
                <Button danger onClick={() => handleDelete(project.project_id)}>Удалить</Button>
              </div>)}
        </div>


        <div className="ProjectInfo MainInfo">
          <ul className="ProjecInfoList ListInfo">
            <li><strong>Мероприятие: </strong><Link to={`/event/${event.event_id}`}>{event.name}</Link></li>
            <li><strong>Направление: </strong>{direction.name}</li>
            {/*<li><strong>Куратор: </strong>{project.curatorsSet.length > 0 ? 
              <Link to={`/profile/${ project.curatorsSet[0].user_id}`}>
                {project.curatorsSet[0].surname} {getInitials(project.curatorsSet[0].name, project.curatorsSet[0].patronymic)}
              </Link> : "-"}</li>*/}
          </ul>
            <div className="ProjectDescription InfoDescription">{project.description}</div>
            <div className="ProjectContent InfoContent">
              <strong>Команды</strong>
              {projectTeams.length ? (
              <ul>
                  {projectTeams.map((team) => (
                  <li key={team.id}>
                      <Link to={`/team/${team.id}`}>{team.name}</Link>
                  </li>
                  ))}
              </ul>
              ) : (
              <p>Команд нет</p>
              )}
          </div>
        </div>

        {isEditModalOpen && (
          <EditProjectModal
            isOpen={isEditModalOpen}
            onClose={() => setIsEditModalOpen(false)}
            project={project}
            onSuccess={refetchProject}
          />
        )}
    </div>
  );
};
