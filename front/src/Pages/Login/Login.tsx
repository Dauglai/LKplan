import { useEffect, useState } from 'react';
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
  const [errorMessage, setErrorMessage] = useState<string>(''); 

  useEffect(() => {
    document.title = 'Авторизация - MeetPoint';
  }, []);

  const from = location.state?.from?.pathname || '/';

  const onFinish = async (values: { Auth: string; password: string }) => {
    try {
      // Пытаемся авторизоваться
      const userData = await Auth({
        username: values.Auth,
        password: values.password,
      }).unwrap();
      
      dispatch(logOut()); // если логинимся, сначала логаутим (на всякий случай)
      dispatch(setCredentials(userData)); // сохраняем данные пользователя
      localStorage.setItem('user', JSON.stringify(userData)); // сохраняем в localStorage
      navigate(from, { replace: true }); // редиректим пользователя на предыдущую страницу или на главную
    } catch (error: any) {
      console.error('Ошибка авторизации', error);
      
      // Если ошибка с кодом 401, выводим ошибку "Неверные данные"
      if (error.status === 401) {
        setErrorMessage('Неверный логин или пароль. Пожалуйста, проверьте введенные данные.');
      } else {
        setErrorMessage('Произошла ошибка при авторизации. Попробуйте еще раз.');
      }
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
          <Input placeholder="Email" className="Auth-Form-Input"/>
        </Form.Item>

        <Form.Item
          name="password"
          label="Пароль"
          className="Auth-Form-Item"
          rules={[{ required: true, message: 'Пожалуйста, введите пароль' }]}
        >
          <Input.Password placeholder="Пароль" className="Auth-Form-Input"/>
        </Form.Item>

        <Link to="/password-reset-request" className="Auth-Form-Link">Восстановить пароль</Link>

        {errorMessage && <div className="Auth-ErrorMessage">{errorMessage}</div>}

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
          Ещё нет аккаунта? Зарегистрируйтесь
      </Link>
    </main>
  );
}
