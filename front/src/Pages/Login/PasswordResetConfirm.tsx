import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Form, Input, Button, message } from 'antd';
import { usePasswordResetConfirmMutation } from 'Features/Auth/api/authApiSlice';
import 'Styles/pages/Auth.scss';

export default function PasswordResetConfirm(): JSX.Element {
  const [form] = Form.useForm();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const token = searchParams.get('token');
  const [resetPassword, { isLoading }] = usePasswordResetConfirmMutation();

  useEffect(() => {
    document.title = 'Сброс пароля - MeetPoint';
  }, []);

  const passwordValidator = (_: any, value: string) => {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*?№()]).{8,}$/;
    if (!value) return Promise.reject('Введите пароль');
    if (!regex.test(value)) {
      return Promise.reject(
        'Пароль должен содержать не менее 8 символов, одну строчную, одну заглавную букву и один спец. символ [!@#$%^&*?№()]'
      );
    }
    return Promise.resolve();
  };

  const onFinish = async (values: { password: string }) => {
    if (!token) {
      message.error('Токен сброса не найден');
      return;
    }

    try {
      await resetPassword({
        token,
        new_password: values.password,
      }).unwrap();
      message.success('Пароль успешно обновлён');
      navigate('/login');
    } catch (error) {
      message.error('Не удалось сбросить пароль. Попробуйте ещё раз или запросите новый');
      console.error(error);
    }
  };

  return (
    <main  className="Auth">
      <h1 className="Auth-Heading">Сброс пароля</h1>

      <Form
        form={form}
        name="resetPassword"
        layout="vertical"
        onFinish={onFinish}
        className="Auth-Form"
      >
        <Form.Item
          name="password"
          label="Новый пароль"
          className="Auth-Form-Item"
          rules={[{ validator: passwordValidator }]}
          hasFeedback
        >
          <Input.Password placeholder="Введите новый пароль" className="Auth-Form-Input"/>
        </Form.Item>

        <Form.Item
          name="confirm"
          label="Подтвердите пароль"
          dependencies={['password']}
          className="Auth-Form-Item"
          hasFeedback
          rules={[
            { required: true, message: 'Пожалуйста, подтвердите пароль' },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('password') === value) {
                  return Promise.resolve();
                }
                return Promise.reject('Пароли не совпадают');
              },
            }),
          ]}
        >
          <Input.Password placeholder="Повторите новый пароль" className="Auth-Form-Input"/>
        </Form.Item>

        <Form.Item className="Auth-Form-Item">
          <Button type="primary" htmlType="submit" loading={isLoading} block className="Auth-Form-Submit">
            Обновить пароль
          </Button>
        </Form.Item>
      </Form>
    </main>
  );
}
