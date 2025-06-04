import { useEffect, useState } from 'react';
import { Form, Input, Button, message, Typography } from 'antd';
import { usePasswordResetRequestMutation } from 'Features/Auth/api/authApiSlice';
import 'Styles/pages/Auth.scss';

const { Text } = Typography;

export default function PasswordResetRequest(): JSX.Element {
  const [form] = Form.useForm();
  const [requestReset, { isLoading }] = usePasswordResetRequestMutation();
  const [emailSent, setEmailSent] = useState<string | null>(null);

  useEffect(() => {
    document.title = 'Восстановление пароля - MeetPoint';
  }, []);

  const onFinish = async (values: { email: string }) => {
    try {
      await requestReset({ email: values.email }).unwrap();
      setEmailSent(values.email);
      form.resetFields();
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
