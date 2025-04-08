import React, { useEffect, useState } from 'react';
import UsersSelector from 'Widgets/Selectors/UsersSelector';
import ProjectSelector from 'Widgets/Selectors/ProjectSelector';
import CloseIcon from 'assets/icons/close.svg?react';
import ChevronRightIcon from 'assets/icons/chevron-right.svg?react';
import { Team, useCreateTeamMutation, useUpdateTeamMutation } from 'Features/ApiSlices/teamSlice';
import { useNotification } from 'Widgets/Notification/Notification';

interface TeamFormProps {
  closeModal: () => void;
  existingTeam?: Team;
}

export default function TeamForm({
                                   closeModal,
                                   existingTeam,
                                 }: TeamFormProps): JSX.Element {
  const [createTeam, { isLoading: isCreating }] = useCreateTeamMutation();
  const [updateTeam, { isLoading: isUpdating }] = useUpdateTeamMutation();
  const { showNotification } = useNotification();

  const [teamData, setNewTeam] = useState({
    name: '',
    project: 0,
    students: [] as number[],
    curator: null as number | null, // Выбор одного куратора
    // curators: [] as number[], // Закомментировано: множественный выбор кураторов
  });

  useEffect(() => {
    if (existingTeam) {
      setNewTeam(existingTeam);
    }
  }, [existingTeam]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewTeam((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleProjectChange = (selectedProjectId: number) => {
    setNewTeam((prev) => ({
      ...prev,
      project: selectedProjectId,
    }));
  };

  const handleStudentsChange = (selectedStudents: number[]) => {
    setNewTeam((prev) => ({
      ...prev,
      students: selectedStudents,
    }));
  };

  const handleCuratorChange = (selectedCurator: number) => {
    setNewTeam((prev) => ({
      ...prev,
      curator: selectedCurator,
    }));
  };

  // const handleCuratorsChange = (selectedCurators: number[]) => {
  //   setNewTeam((prev) => ({
  //     ...prev,
  //     curators: selectedCurators,
  //   }));
  // };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (teamData.name.trim()) {
      if (existingTeam) {
        try {
          await updateTeam(teamData).unwrap();
          showNotification('Команда обновлена!', 'success');
          closeModal();
        } catch (error) {
          console.error('Ошибка при обновлении команды:', error);
          showNotification(`Ошибка при обновлении команды: ${error.status} ${error.data.stage}`, 'error');
        }
      } else {
        try {
          await createTeam(teamData).unwrap();
          setNewTeam({
            name: '',
            project: 0,
            students: [],
            curator: null,
          });
          showNotification('Команда создана!', 'success');
          closeModal();
        } catch (error) {
          console.error('Ошибка при создании команды:', error);
          showNotification(`Ошибка при создании команды: ${error.status} ${error.data.stage}`, 'error');
        }
      }
    }
  };

  return (
    <div className="FormContainer">
      <form className="Form TeamForm" onSubmit={handleSubmit}>
        <div className="ModalFormHeader">
          <h2>{existingTeam ? 'Редактирование команды' : 'Добавление команды'}</h2>
          <CloseIcon width="24" height="24" strokeWidth="1" onClick={closeModal} className="ModalCloseButton" />
        </div>

        <div className="NameContainer">
          <input
            type="text"
            name="name"
            value={teamData.name}
            onChange={handleInputChange}
            required
            placeholder="Название команды*"
            className="TextField FormField"
          />
        </div>

        <ProjectSelector selectedProjectId={teamData.project} onChange={handleProjectChange} />

        <UsersSelector selectedUsersId={teamData.students} onChange={handleStudentsChange} label="Добавить студентов*" />

        <UsersSelector selectedUsersId={teamData.curator ? [teamData.curator] : []} onChange={(ids) => handleCuratorChange(ids[0])} label="Выбрать куратора*" />

        {/* <UsersSelector selectedUsersId={teamData.curators} onChange={handleCuratorsChange} label="Выбрать кураторов*" multiple /> */}
        {/* Закомментировано: множественный выбор кураторов */}

        <div className="FormButtons">
          <button className="primary-btn" type="submit" disabled={isCreating || isUpdating}>
            {existingTeam ? 'Обновить' : 'Создать'}
            <ChevronRightIcon width="24" height="24" strokeWidth="1" />
          </button>
        </div>
      </form>
    </div>
  );
}
