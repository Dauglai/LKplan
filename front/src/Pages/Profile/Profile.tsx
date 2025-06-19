import { useEffect, useState } from 'react'; // Базовые хуки React
import { useGetUserQuery, useUpdateUserMutation } from 'Features/ApiSlices/userSlice'; // RTK Query запросы
import { useNotification } from 'Components/Common/Notification/Notification'; // Хук уведомлений
import 'Styles/FormStyle.scss'; // Общие стили форм
import './Profile.scss'; // Стили профиля
import { Input, Button, Form, InputNumber, Skeleton, Typography } from 'antd'; // UI компоненты Ant Design

const { Text } = Typography; // Компонент текста для отображения данных

/**
 * Компонент профиля пользователя с возможностью просмотра и редактирования данных.
 * Отображает информацию о пользователе и позволяет переключаться между режимами просмотра и редактирования.
 * 
 * @component
 * @example
 * // Пример использования:
 * <Profile />
 * 
 * @returns {JSX.Element} Карточка профиля пользователя с кнопками редактирования/отмены/сохранения
 */
export default function Profile(): JSX.Element {
  const { data: user, isLoading } = useGetUserQuery(); // Запрос данных пользователя
  const [updateUser] = useUpdateUserMutation(); // Мутация для обновления данных пользователя
  const [isEditing, setIsEditing] = useState(false); // Состояние режима редактирования
  const [form] = Form.useForm(); // Хук формы Ant Design
  const { showNotification } = useNotification(); // Хук для показа уведомлений

  // Инициализация формы и сохранение начальных значений
  const [initialValues, setInitialValues] = useState(null);

  /**
   * Эффект для инициализации формы данными пользователя
   * Собирает полное имя из отдельных полей и устанавливает значения формы
   */
  useEffect(() => {
    if (user) {
      const values = {
        ...user,
        fullName: `${user.surname} ${user.name} ${user.patronymic || ''}`
      };
      form.setFieldsValue(values);
      setInitialValues(values);
    }
  }, [user, form]);

  /**
   * Обработчик отправки формы редактирования профиля
   * Разбивает полное имя на составляющие и отправляет обновленные данные на сервер
   */
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      // Разделение полного имени на фамилию, имя и отчество
      const [surname, name, ...patronymicParts] = values.fullName.split(' ');
      
      await updateUser({
        user_id: user.user_id,
        data: {
          ...values,
          surname,
          name,
          patronymic: patronymicParts.join(' '),
          course: values.course || null,
        }
      }).unwrap();

      setIsEditing(false);
      setInitialValues(form.getFieldsValue()); // Сохраняем новые значения как начальные
      showNotification('Данные успешно обновлены!', 'success');
    } catch (error) {
      console.error('Ошибка:', error);
      showNotification('Ошибка при обновлении данных', 'error');
    }
  };

  /**
   * Обработчик отмены редактирования
   * Восстанавливает предыдущие значения формы и выходит из режима редактирования
   */
  const handleCancel = () => {
    form.setFieldsValue(initialValues);
    setIsEditing(false);
  };

  // Загрузочный скелет при загрузке данных
  if (isLoading || !user) {
    return <div className="ProfileContainer"><Skeleton active /></div>;
  }

  /**
   * Вспомогательная функция для рендеринга полей формы/профиля
   * @param {string} label - Подпись поля
   * @param {string} name - Имя поля в форме
   * @param {boolean} isEmail - Флаг, указывающий что поле содержит email
   * @returns {JSX.Element} Элемент поля в зависимости от режима (редактирование/просмотр)
   */
  const renderField = (label, name, isEmail = false) => {
    if (isEditing) {
      return (
        <Form.Item name={name} key={name}>
          {name === 'course' ? (
            <InputNumber
              className="ProfileInput"
              min={1}
              max={6}
              placeholder="Не указано"
            />
          ) : (
            <Input
              className="ProfileInput"
              type={isEmail ? 'email' : 'text'}
              placeholder={isEmail ? "example@mail.ru" : "Не указано"}
            />
          )}
        </Form.Item>
      );
    }
    
    const value = form.getFieldValue(name);
    return (
      <div className="ProfileFieldValue" key={name}>
        {value || <Text type="secondary">Не указано</Text>}
      </div>
    );
  };

  return (
    <div className="ProfileContainer">
      <h2 className="ProfileHeading">Личный кабинет</h2>
      
      <div className="ProfileFullName">
          <p>{initialValues?.fullName}</p>
      </div>

      <Form form={form} className="ProfileForm">
        <div className="ProfileColumns">
          <div className="ProfileColumn">
            <h3>Личная информация</h3>
            
            <label>ФИО</label>
            {renderField('ФИО', 'fullName')}

            <label>Курс</label>
            {renderField('Курс', 'course')}

            <label>Университет</label>
            {renderField('Университет', 'university')}

            <label>Работа</label>
            {renderField('Работа', 'job')}
          </div>

          <div className="ProfileColumn">
            <h3>Контакты</h3>

            <label>Email</label>
            {renderField('Email', 'email', true)}

            <label>Telegram</label>
            {renderField('Telegram', 'telegram')}

            <label>ВКонтакте</label>
            {renderField('ВКонтакте', 'vk')}
          </div>
        </div>

        <div className="ProfileActions">
          {!isEditing ? (
            <Button
              type="primary"
              className="ProfileSubmitButton"
              onClick={() => setIsEditing(true)}
            >
              Редактировать
            </Button>
          ) : (
            <>
              <Button
                type="primary"
                className="ProfileSubmitButton"
                onClick={handleSubmit}
              >
                Сохранить
              </Button>
              <Button
                className="ProfileSubmitButton"
                onClick={handleCancel}
              >
                Отменить
              </Button>
            </>
          )}
        </div>
      </Form>
    </div>
  );
}
