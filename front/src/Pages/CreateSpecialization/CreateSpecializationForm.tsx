import { useEffect, useState } from 'react';
import {
  useCreateSpecializationMutation,
  useGetSpecializationsQuery,
  useDeleteSpecializationMutation
} from 'Features/ApiSlices/specializationSlice';

import 'Styles/FormStyle.scss';
import './CreateSpecializationForm.scss';
import ChevronRightIcon from 'assets/icons/chevron-right.svg?react';
import TrashIcon from 'assets/icons/trash-2.svg?react';
import BackButton from "Widgets/BackButton/BackButton";


export default function CreateSpecializationForm () : JSX.Element {
  const [createSpecialization, { isLoading: isCreating }] = useCreateSpecializationMutation();
  const { data: specializations, isLoading, isError } = useGetSpecializationsQuery();
  const [deleteSpecialization] = useDeleteSpecializationMutation();
  
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
      document.title = 'Специализации - MeetPoint';
  }, []);
  
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
    <div className="Container">
        <div className="FormContainer">
          <form onSubmit={handleCreateSpecialization} className='Form CreateSpecializationForm'>
              <div className="ModalFormHeader">
                <BackButton />
                <h2>Создать специализацию</h2>
              </div>
              <div className="NameContainer">
                  <input
                      type="text"
                      name="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      placeholder="Название специализации"
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