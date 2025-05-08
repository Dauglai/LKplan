import { Modal } from 'antd';
import { useState, useEffect, useMemo } from 'react';
import { Project, useUpdateProjectMutation } from 'Features/ApiSlices/projectSlice';
import { useNotification } from 'Components/Common/Notification/Notification'; 

import DirectionSelector from 'Components/Selectors/DirectionSelector';
import NameInputField from 'Components/Forms/NameInputField';
import DescriptionInputField from 'Components/Forms/DescriptioninputField';
import UserSelector from 'Components/Selectors/UserSelector';
import { useUserRoles } from 'Features/context/UserRolesContext';
import { useGetDirectionsQuery } from 'Features/ApiSlices/directionSlice';

type EditProjectModalProps = {
  isOpen: boolean;
  onClose: () => void;
  project?: Project;
  onSuccess?: () => void;
};

export default function EditProjectModal({ isOpen, onClose, project, onSuccess }: EditProjectModalProps): JSX.Element {
  const { showNotification } = useNotification();
  const [updateProject, { isLoading }] = useUpdateProjectMutation();
  const { hasRole, getRoleForObject } = useUserRoles();
  const { data: allDirections } = useGetDirectionsQuery();

  const [editedProject, setEditedProject] = useState({
    project_id: 0,
    direction: null,
    name: '',
    description: '',
    //curators: 0,
  });


  useEffect(() => {
    if (project) {
      setEditedProject({
        project_id: project.project_id,
        direction: project.directionSet || project.direction,
        name: project.name,
        description: project.description || '',
        curators: project.curators || 0,
      });
    }
  }, [project]);

  const filteredDirections = useMemo(() => {
    if (hasRole('organizer')) {
      // Если пользователь организатор, все направления доступны
      return allDirections;
    }

    if (hasRole('direction_leader')) {
      // Если пользователь руководитель направления, фильтруем доступные направления
      return allDirections.filter((direction) => {
        // Для каждого направления проверяем, есть ли роль руководителя для этого направления
        const role = getRoleForObject(
          'direction_leader', // тип роли — руководитель направления
          direction.id, // ID направления
          'crm.direction', // тип объекта — направление
        );

        return role; // если роль есть, это направление доступно
      });
    }

    return []; // Если роль не определена, возвращаем пустой список
  }, [allDirections, hasRole, getRoleForObject]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditedProject((prev) => ({ ...prev, [name]: value }));
  };

  const handleDirectionChange = (selected) => {
    setEditedProject((prev) => ({
      ...prev,
      direction: selected,
    }));
  };

  const handleCuratorChange = (selected: number) => {
    setEditedProject((prev) => ({
      ...prev,
      curators: selected,
    }));
  };

  const handleTextArea = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setEditedProject((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  console.log(editedProject)

  const handleSubmit = async () => {
    if (!editedProject.name.trim() || !editedProject.direction) return;

    const payload = {
        ...editedProject,
        id: editedProject.project_id,
        direction: editedProject.direction.id,
    };

    await updateProject(payload);
    showNotification('Проект обновлён!', 'success');
    onSuccess?.();
    onClose();
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
