import { useEffect, useState } from 'react';
import {
  useCreateStatusAppMutation,
  useGetStatusesAppQuery,
  useDeleteStatusAppMutation,
} from 'Features/ApiSlices/statusAppSlice';

import 'Styles/FormStyle.scss';
import '../CreateSpecialization/CreateSpecializationForm.scss';
import ChevronRightIcon from 'assets/icons/chevron-right.svg?react';
import TrashIcon from 'assets/icons/trash-2.svg?react';
import BackButton from "Widgets/BackButton/BackButton";



export default function CreateStatusAppForm (): JSX.Element {
  const [createStatus, { isLoading: isCreating }] = useCreateStatusAppMutation();
  const { data: statusesApp, isLoading, isError } = useGetStatusesAppQuery();
  const [deleteStatus] = useDeleteStatusAppMutation();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
      document.title = 'Статусы - MeetPoint';
  }, []);

  const handleCreateStatus = async (e: React.FormEvent) => {
    e.preventDefault();

    if (name.trim() && description.trim()) {
      await createStatus({ name, description });
      setName('');
      setDescription('');
    }
  };

  const handleDeleteStatus = (id: number) => {
    deleteStatus(id);
  };

  const handleTextAtea = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const textarea = e.target;
      textarea.style.height = 'auto';
      textarea.style.height = `${textarea.scrollHeight}px`;
  
      setDescription(e.target.value);
    };

  return (
    <div className="Container">
        <div className="FormContainer">
        <form  className="Form CreateStatusAppForm"  onSubmit={handleCreateStatus}>
          <div className="ModalFormHeader">
            <BackButton />
            <h2>Создать статус</h2>
          </div>
          <div className="NameContainer">
                <input
                    type="text"
                    name="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    placeholder="Название статуса"
                    className="Name TextField FormField"
                />
                <textarea
                    placeholder="Описание (опционально)"
                    className="Description TextField FormField"
                    name="description"
                    value={description}
                    onInput={handleTextAtea}
                />
            </div>
            <div className="FormButtons">
              <button className="primary-btn" type="submit">
                Создать
                <ChevronRightIcon width="24" height="24" strokeWidth="1"/>
              </button>
            </div>
            </form>
        </div>

        <div className="ListResults">
            <h3>Существующие статусы</h3>
            {isLoading ? (
                <p>Загрузка...</p>
            ) : isError ? (
                <p>Ошибка при загрузке статусов.</p>
            ) : (
                <ul>
                {statusesApp?.map((status) => (
                    <li key={status.id}>
                        <div>
                            <h4>{status.name}</h4>
                            <p>{status.description}</p>
                        </div>
                        <button 
                            className="DeleteButton lfp-btn"
                            onClick={() => handleDeleteStatus(status.id)}>
                            <TrashIcon width="20" height="20" strokeWidth="2"/>
                        </button>
                    </li>
                ))}
            </ul>
        )}
        </div>
    </div>
  );
};