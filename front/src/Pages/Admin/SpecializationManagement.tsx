import { useState } from 'react';
import {
  useCreateSpecializationMutation,
  useGetSpecializationsQuery,
  useDeleteSpecializationMutation
} from 'Features/ApiSlices/specializationSlice'; // Путь может быть другим, проверь его

export default function SpecializationManagement () : JSX.Element {
  const [createSpecialization, { isLoading: isCreating }] = useCreateSpecializationMutation();
  const { data: specializations, isLoading, isError } = useGetSpecializationsQuery();
  const [deleteSpecialization] = useDeleteSpecializationMutation();
  
  // State для формы создания новой специализации
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

  return (
    <div>
      {/* Форма для создания специализации */}
      <form onSubmit={handleCreateSpecialization}>
        <h3>Создать новую специализацию</h3>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Название специализации"
          required
        />
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Описание специализации"
          required
        />
        <button type="submit" disabled={isCreating}>Создать</button>
      </form>
      
      {/* Список существующих специализаций */}
      <h3>Существующие специализации</h3>
      {isLoading ? (
        <p>Загрузка...</p>
      ) : isError ? (
        <p>Ошибка при загрузке специализаций.</p>
      ) : (
        <ul>
          {specializations?.map((specialization) => (
            <li key={specialization.id}>
              <strong>{specialization.name}</strong>
              <p>{specialization.description}</p>
              <button onClick={() => handleDeleteSpecialization(specialization.id)}>
                Удалить
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
