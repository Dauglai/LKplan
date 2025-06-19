import { Modal } from 'antd'; // Модальное окно Ant Design
import { useState, useEffect, useMemo } from 'react'; // Хуки React
import { Project, useUpdateProjectMutation } from 'Features/ApiSlices/projectSlice'; // Типы и мутации проектов
import { useNotification } from 'Components/Common/Notification/Notification'; // Хук уведомлений
import DirectionSelector from 'Components/Selectors/DirectionSelector'; // Селектор направления
import NameInputField from 'Components/Forms/NameInputField'; // Поле ввода названия
import DescriptionInputField from 'Components/Forms/DescriptioninputField'; // Поле ввода описания
import { useUserRoles } from 'Features/context/UserRolesContext'; // Контекст ролей пользователя
import { useGetDirectionsQuery } from 'Features/ApiSlices/directionSlice'; // Запрос направлений

type EditProjectModalProps = {
  isOpen: boolean; // Флаг видимости модального окна
  onClose: () => void; // Функция закрытия модального окна
  project?: Project; // Данные редактируемого проекта
  onSuccess?: () => void; // Колбек после успешного обновления
};

/**
 * Модальное окно редактирования существующего проекта.
 * Позволяет изменить название, описание и направление проекта.
 * Автоматически фильтрует доступные направления в зависимости от ролей пользователя.
 * 
 * @component
 * @example
 * // Пример использования:
 * <EditProjectModal
 *   isOpen={isEditModalOpen}
 *   onClose={() => setIsEditModalOpen(false)}
 *   project={selectedProject}
 *   onSuccess={refetchProjects}
 * />
 *
 * @param {EditProjectModalProps} props - Свойства компонента
 * @returns {JSX.Element} Модальное окно редактирования проекта
 */
export default function EditProjectModal({ 
  isOpen, 
  onClose, 
  project, 
  onSuccess 
}: EditProjectModalProps): JSX.Element {
  const { showNotification } = useNotification(); // Хук уведомлений
  const [updateProject, { isLoading }] = useUpdateProjectMutation(); // Мутация обновления
  const { hasRole, getRoleForObject } = useUserRoles(); // Проверка ролей
  const { data: allDirections } = useGetDirectionsQuery(); // Запрос направлений

  // Состояние формы редактирования
  const [editedProject, setEditedProject] = useState({
    project_id: 0,
    direction: null, // Выбранное направление
    name: '', // Название проекта
    description: '', // Описание проекта
  });

  /**
   * Эффект инициализации формы данными проекта
   * Заполняет форму данными при открытии или изменении проекта
   */
  useEffect(() => {
    if (project) {
      setEditedProject({
        project_id: project.project_id,
        direction: project.directionSet || project.direction,
        name: project.name,
        description: project.description || '',
      });
    }
  }, [project]);

  /**
   * Фильтрует доступные направления для выбора:
   * - Организаторы видят все направления
   * - Руководители направлений видят только свои направления
   * - Остальные пользователи не видят направлений
   */
  const filteredDirections = useMemo(() => {
    if (!allDirections) return [];

    if (hasRole('organizer')) {
      return allDirections; // Полный доступ для организаторов
    }

    if (hasRole('direction_leader')) {
      return allDirections.filter((direction) => {
        const role = getRoleForObject(
          'direction_leader', 
          direction.id,
          'crm.direction'
        );
        return role; // Только направления с правами руководителя
      });
    }

    return []; // Нет доступных направлений
  }, [allDirections, hasRole, getRoleForObject]);

  /**
   * Обработчик изменения текстовых полей
   * @param {React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>} e - Событие изменения
   */
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditedProject((prev) => ({ ...prev, [name]: value }));
  };

  /**
   * Обработчик изменения направления
   * @param {Object} selected - Выбранное направление
   */
  const handleDirectionChange = (selected) => {
    setEditedProject((prev) => ({
      ...prev,
      direction: selected,
    }));
  };

  /**
   * Обработчик изменения текстового поля (textarea)
   * @param {React.ChangeEvent<HTMLTextAreaElement>} e - Событие изменения
   */
  const handleTextArea = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setEditedProject((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  /**
   * Обработчик отправки формы
   * Валидирует данные и отправляет запрос на обновление проекта
   */
  const handleSubmit = async () => {
    if (!editedProject.name.trim() || !editedProject.direction) return;

    try {
      const payload = {
        ...editedProject,
        id: editedProject.project_id,
        direction: editedProject.direction.id,
      };

      await updateProject(payload).unwrap();
      showNotification('Проект обновлён!', 'success');
      onSuccess?.(); // Вызываем колбек при успехе
      onClose(); // Закрываем модальное окно
    } catch (error) {
      showNotification('Ошибка при обновлении проекта', 'error');
      console.error(error);
    }
  };

  return (
    <Modal
      open={isOpen}
      title="Редактировать проект"
      onCancel={onClose}
      onOk={handleSubmit}
      confirmLoading={isLoading}
      okText="Сохранить"
      cancelText="Отмена"
      className="EditFormModal"
      destroyOnClose
    >
      <div className="Form ProjectForm">
        <DirectionSelector
          onChange={handleDirectionChange}
          sourceType="remote"
          selectedDirection={editedProject.direction}
          directions={filteredDirections}
        />

        <div className="NameContainer">
          <NameInputField
            name="name"
            value={editedProject.name}
            onChange={handleInputChange}
            placeholder="Название проекта"
            required
          />
          <DescriptionInputField
            name="description"
            value={editedProject.description}
            onChange={handleTextArea}
            placeholder="Описание проекта"
          />
        </div>

        {/*<UserSelector
          selectedUserId={editedProject.curators || null}
          onChange={handleCuratorChange}
          label="Добавить куратора"
        />*/}
      </div>
    </Modal>
  );
}
