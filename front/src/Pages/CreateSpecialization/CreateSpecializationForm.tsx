import { useState } from 'react';
import {
  useCreateSpecializationMutation,
  useGetSpecializationsQuery,
  useDeleteSpecializationMutation
} from 'Features/ApiSlices/specializationSlice';

import CreateEventHeader from 'Widgets/CreateFormHeader/CreateFormHeader';
import 'Styles/CreateFormStyle.scss';
import './CreateSpecializationForm.scss';
import SubmitButtons from 'Widgets/buttons/SubmitButtons';
import TrashIcon from 'assets/icons/trash-2.svg?react';


export default function CreateSpecializationForm () : JSX.Element {
  const [createSpecialization, { isLoading: isCreating }] = useCreateSpecializationMutation();
  const { data: specializations, isLoading, isError } = useGetSpecializationsQuery();
  const [deleteSpecialization] = useDeleteSpecializationMutation();

  console.log(specializations)
  
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  
  const handleCreateSpecialization = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (name.trim() && description.trim()) {
      await createSpecialization({ name, description });
      setName('');
      setDescription('');
    }
  };

  const handleDeleteSpecialization = (id: number) => {
    deleteSpecialization(id);
  };

  const handleTextAtea = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const textarea = e.target;
      textarea.style.height = 'auto';
      textarea.style.height = `${textarea.scrollHeight}px`;
  
      setDescription(e.target.value)
    };

  return (
    <div className="CreateContainer">
        <div className="CreateFormContainer">
        <form onSubmit={handleCreateSpecialization} className='CreateForm CreateSpecializationForm'>
            <CreateEventHeader label="Добавление специализации" />
            <div className="CreateNameContainer">
                <input
                    type="text"
                    name="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    placeholder="Название специализации"
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
            <SubmitButtons label="Создать" />
        </form>
        </div>
        <div className="ListResults">
            <h3>Существующие специализации</h3>
            {isLoading ? (
                <p>Загрузка...</p>
            ) : isError ? (
                <p>Ошибка при загрузке специализаций.</p>
            ) : (
                <ul>
                {specializations?.map((specialization) => (
                    <li key={specialization.id}>
                        <div>
                            <h4>{specialization.name}</h4>
                            <p>{specialization.description}</p>
                        </div>
                        <button 
                            className="DeleteButton lfp-btn"
                            onClick={() => handleDeleteSpecialization(specialization.id)}>
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