import { useState } from 'react';
import {
  useCreateStatusAppMutation,
  useGetStatusesAppQuery,
  useDeleteStatusAppMutation,
} from 'Features/ApiSlices/statusAppSlice';

import CreateEventHeader from 'Widgets/CreateFormHeader/CreateFormHeader';
import 'Styles/CreateFormStyle.scss';
import './CreateStatusAppForm.scss';
import ChevronRightIcon from 'assets/icons/chevron-right.svg?react';
import TrashIcon from 'assets/icons/trash-2.svg?react';

export default function CreateStatusAppForm (): JSX.Element {
  const [createStatus, { isLoading: isCreating }] = useCreateStatusAppMutation();
  const { data: statusesApp, isLoading, isError } = useGetStatusesAppQuery();
  const [deleteStatus] = useDeleteStatusAppMutation();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

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
    <div className="CreateContainer">
        <div className="CreateFormContainer">
        <form  className="CreateForm CreateStatusAppForm"  onSubmit={handleCreateStatus}>
            <CreateEventHeader label="Добавление статуса" />
            <div className="CreateNameContainer">
                <input
                    type="text"
                    name="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    placeholder="Название статуса"
                    className="CreateName TextField FormField"
                />
                <textarea
                    placeholder="Описание (опционально)"
                    className="CreateDescription TextField FormField"
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