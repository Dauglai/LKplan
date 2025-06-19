import { useEffect, useState } from 'react'; // Базовые хуки React
import { Form, Input, Button, message, Typography } from 'antd'; // UI компоненты Ant Design
import { usePasswordResetRequestMutation } from 'Features/Auth/api/authApiSlice'; // RTK Query мутация
import 'Styles/pages/Auth.scss'; // Стили страницы

const { Text } = Typography; // Компонент текста из Ant Design

/**
 * Компонент для запроса сброса пароля по email.
 * Отправляет пользователю письмо со ссылкой для сброса пароля.
 * После успешной отправки показывает сообщение о успехе.
 * 
 * @component
 * @example
 * // Пример использования:
 * <PasswordResetRequest />
 * 
 * @returns {JSX.Element} Форма запроса сброса пароля с email полем и кнопкой отправки.
 */
export default function PasswordResetRequest(): JSX.Element {
  const [form] = Form.useForm(); // Хук формы Ant Design
  const [requestReset, { isLoading }] = usePasswordResetRequestMutation(); // Мутация запроса сброса
  const [emailSent, setEmailSent] = useState<string | null>(null); // Состояние для хранения email после отправки

  // Установка заголовка страницы
  useEffect(() => {
    document.title = 'Восстановление пароля - MeetPoint';
  }, []);

  /**
   * Обработчик отправки формы запроса сброса пароля.
   * @param {Object} values - Значения формы
   * @param {string} values.email - Email пользователя для отправки ссылки сброса
   */
  const onFinish = async (values: { email: string }) => {
    try {
      await requestReset({ email: values.email }).unwrap(); // Отправка запроса на сервер
      setEmailSent(values.email); // Сохраняем email для показа сообщения
      form.resetFields(); // Сбрасываем поля формы
      // если нужно — редиректим или ждём действия пользователя
    } catch (error) {
      message.error('Не удалось отправить ссылку. Проверьте почту или попробуйте позже');
      console.error(error);
    }
  };

  return (
    <main className="Auth">
      <h1 className="Auth-Heading">Восстановление пароля</h1>
      <Text className="Auth-Text">Введите email, с которым вы регистрировались. Мы отправим вам ссылку для сброса пароля.</Text>

      <Form
        form={form}
        name="passwordResetRequestForm"
        onFinish={onFinish}
        layout="vertical"
        className="Auth-Form"
      >
        <Form.Item
          name="email"
          label="Email"
          className="Auth-Form-Item"
          rules={[
            { required: true, message: 'Пожалуйста, введите email' },
            { type: 'email', message: 'Введите корректный email' },
          ]}
        >
          <Input placeholder="example@mail.com" className="Auth-Form-Input"/>
        </Form.Item>

        <Form.Item className="Auth-Form-Item">
          <Button
            type="primary"
            htmlType="submit"
            loading={isLoading}
            className="Auth-Form-Submit"
            block
          >
            Отправить ссылку для восстановления
          </Button>
        </Form.Item>

        {emailSent && (
          <div className="Auth-Form-EmailSent">
            <Text type="success">
              На электронную почту <strong>{emailSent}</strong> отправлено письмо для восстановления пароля.
            </Text>
          </div>
        )}
      </Form>
    </main>
  );
}
