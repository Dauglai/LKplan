import { useEffect, useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { useGetUserQuery, useUpdateUserMutation } from 'Features/ApiSlices/userSlice';
import { useNotification } from 'Components/Common/Notification/Notification';
import { getInitials } from 'Features/utils/getInitials';
import 'Styles/FormStyle.scss'
import './Profile.scss';
import { Input, Button, Form, InputNumber, Skeleton, Typography} from 'antd';

const { Text } = Typography;

export default function Profile(): JSX.Element {
  const { data: user, isLoading } = useGetUserQuery();
  const [updateUser] = useUpdateUserMutation();
  const [isEditing, setIsEditing] = useState(false);
  const [form] = Form.useForm();
  const { showNotification } = useNotification();

  // Инициализация формы и сохранение начальных значений
  const [initialValues, setInitialValues] = useState(null);

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

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
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

  const handleCancel = () => {
    form.setFieldsValue(initialValues);
    setIsEditing(false);
  };

  if (isLoading || !user) {
    return <div className="ProfileContainer"><Skeleton active /></div>;
  }

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
