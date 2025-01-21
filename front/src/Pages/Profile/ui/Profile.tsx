import { useEffect, useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { useGetUserQuery, useUpdateUserMutation } from 'Features/ApiSlices/userSlice';
import { useNotification } from 'Widgets/Notification/Notification';
import SpecializationSelector from 'Widgets/Selectors/SpecializationSelector';


import 'Styles/FormStyle.scss'
import './Profile.scss';


export default function Profile(): JSX.Element {
  const { data: user, isLoading } = useGetUserQuery();
  const [updateUser] = useUpdateUserMutation();
  const [isButtonDisabled, setIsButtonDisabled] = useState(true);
  const { showNotification } = useNotification();
  const [fullName, setFullName] = useState<string>('');
  const [selectedSpecializations, setSelectedSpecializations] = useState<number[]>([]);
  
  const { register, handleSubmit, watch, reset } = useForm({
    defaultValues: user,
  });

  const watchedFields = watch();

  useEffect(() => {
    if (user) {
      reset(user);
      setFullName(`${user.surname} ${user.name} ${user.patronymic || ''}`);
      setSelectedSpecializations(user.specializations || []);
    }
  }, [user, reset]);

  useEffect(() => {
    const isUserDataChanged = JSON.stringify(user) !== JSON.stringify(watchedFields);
    const isSpecializationsChanged = JSON.stringify(user?.specializations) !== JSON.stringify(selectedSpecializations);
    
    setIsButtonDisabled(!(isUserDataChanged || isSpecializationsChanged));
  }, [user, watchedFields, selectedSpecializations]);

  const onSubmit: SubmitHandler<typeof watchedFields> = async (data) => {
    try {

      const [surname, name, ...patronymicParts] = fullName.split(' ');
      const patronymic = patronymicParts.join(' ');

      await updateUser({
        data: { ...data, surname, name, patronymic, specializations: selectedSpecializations },
      }).unwrap();

      setIsButtonDisabled(true);
      showNotification('Данные успешно обновлены!', 'success');
    } catch (error) {
      console.error('Ошибка обновления данных:', error);
      showNotification(`Ошибка обновления данных: ${error}`, 'error');
    }
  };

  if (isLoading || !user) {
    return <div>Загрузка...</div>;
  }

  return (
    <div className="ProfileContainer">
      <h2 className="ProfileHeading">Личный кабинет</h2>
      <div className="ProfileFullName">
          <span>{user.surname} {user.name} {user.patronymic}</span>
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="ProfileForm">
        <div className="Profile-Columns">
          <div className="ProfileColumn">
            <h3>Личная информация</h3>
            <label>ФИО</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Введите ФИО"
              className="ProfileInput FormField"
            />

            <label>Курс</label>
            <input
              type="text"
              {...register('course')}
              placeholder="Курс"
              className="ProfileInput FormField"
            />
            <label>Университет</label>
            <input
              type="text"
              {...register('university')}
              placeholder="Университет"
              className="ProfileInput FormField"
            />
            <label>Специализации</label>
            <SpecializationSelector
              selectedSpecializations={selectedSpecializations}
              onChange={setSelectedSpecializations}
              label="Добавить специализацию"
            />
            <label>Работа</label>
            <input
              type="text"
              {...register('job')}
              placeholder="Работа"
              className="ProfileInput FormField"
            />
          </div>
          <div className="ProfileColumn">
            <h3>Контакты</h3>
            <label>Email</label>
            <input
              type="email"
              {...register('email')}
              placeholder="Email"
              className="ProfileInput FormField"
            />
            <label>Telegram</label>
            <input
              type="text"
              {...register('telegram')}
              placeholder="Telegram"
              className="ProfileInput FormField"
            />
            <label>ВКонтакте</label>
            <input
              type="text"
              {...register('vk')}
              placeholder="ВКонтакте"
              className="ProfileInput FormField"
            />
          </div>
        </div>
        <button
          type="submit"
          className="ProfileSubmitButton"
          disabled={isButtonDisabled}
        >
          Обновить
        </button>
      </form>
    </div>
  );
}
