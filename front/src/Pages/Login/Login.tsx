import { useEffect } from 'react';
import { Form, Input, Button } from 'antd';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useLoginMutation } from 'Features/Auth/api/authApiSlice';
import { useAppDispatch } from 'App/model/hooks';
import { setCredentials, logOut } from 'Features/Auth/model/authSlice';
import 'Styles/pages/Auth.scss';

export default function Auth(): JSX.Element {
  const [form] = Form.useForm();
  const [Auth, { isLoading }] = useLoginMutation();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    document.title = 'Авторизация - MeetPoint';
  }, []);

  const from = location.state?.from?.pathname || '/';

  const onFinish = async (values: { Auth: string; password: string }) => {
    try {
      const userData = await Auth({
        username: values.Auth,
        password: values.password,
      }).unwrap();
      dispatch(logOut());
      dispatch(setCredentials(userData));
      localStorage.setItem('user', JSON.stringify(userData));
      navigate(from, { replace: true });
    } catch (error) {
      console.error('Ошибка авторизации', error);
    }
  };

  return (
    <main className="Auth">
      <h1 className="Auth-Heading">Вход</h1>

      <Form
        form={form}
        name="LoginForm"
        onFinish={onFinish}
        layout="vertical"
        className="Auth-Form"
      >
        <Form.Item
          name="Auth"
          label="Email"
          className="Auth-Form-Item"
          rules={[{ required: true, message: 'Пожалуйста, введите адрес электронной почты' }]}
        >
          <Input placeholder="Имя пользователя" className="Auth-Form-Input"/>
        </Form.Item>

        <Form.Item
          name="password"
          label="Пароль"
          className="Auth-Form-Item"
          rules={[{ required: true, message: 'Пожалуйста, введите пароль' }]}
        >
          <Input.Password placeholder="Пароль" className="Auth-Form-Input"/>
        </Form.Item>

        <Link to="/password-reset-request" className="Auth-Form-Link">Не помню пароль</Link>

        <Form.Item className="Auth-Form-Item">
          <Button
            type="primary"
            htmlType="submit"
            className="Auth-Form-Submit"
            loading={isLoading}
            block
          >
            Войти
          </Button>
        </Form.Item>
      </Form>
      <Link className="Auth-Link" to="/register">
          Ещё нет аккаунта? Зарегистрируйся
      </Link>
    </main>
  );
}
