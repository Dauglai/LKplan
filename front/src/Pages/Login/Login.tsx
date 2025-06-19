import { useEffect, useState } from 'react'; // Хуки React
import { Form, Input, Button } from 'antd'; // Компоненты Ant Design
import { Link, useLocation, useNavigate } from 'react-router-dom'; // Навигация и ссылки
import { useLoginMutation } from 'Features/Auth/api/authApiSlice'; // API авторизации
import { useAppDispatch } from 'App/model/hooks'; // Redux dispatch
import { setCredentials, logOut } from 'Features/Auth/model/authSlice'; // Redux actions
import 'Styles/pages/Auth.scss'; // Стили страницы авторизации

/**
 * Компонент страницы авторизации.
 * Предоставляет форму для входа в систему с обработкой ошибок.
 * 
 * @component
 * @example
 * // Пример использования:
 * <Route path="/login" element={<Auth />} />
 *
 * @returns {JSX.Element} Форма авторизации с полями для ввода и кнопкой входа.
 */
export default function Auth(): JSX.Element {
  const [form] = Form.useForm(); // Хук формы Ant Design
  const [Auth, { isLoading }] = useLoginMutation(); // Мутация для авторизации
  const dispatch = useAppDispatch(); // Redux dispatch
  const navigate = useNavigate(); // Хук навигации
  const location = useLocation(); // Хук location
  const [errorMessage, setErrorMessage] = useState<string>(''); // Состояние для ошибки

  // Установка заголовка страницы
  useEffect(() => {
    document.title = 'Авторизация - MeetPoint';
  }, []);

  // Получение предыдущего пути для редиректа после авторизации
  const from = location.state?.from?.pathname || '/';

  /**
   * Обработчик отправки формы авторизации.
   * @param {Object} values - Значения формы { Auth: string, password: string }
   */
  const onFinish = async (values: { Auth: string; password: string }) => {
    try {
      // Пытаемся авторизоваться
      const userData = await Auth({
        username: values.Auth,
        password: values.password,
      }).unwrap();
      
      dispatch(logOut()); // Сначала выходим (на всякий случай)
      dispatch(setCredentials(userData)); // Сохраняем данные пользователя
      localStorage.setItem('user', JSON.stringify(userData)); // Сохраняем в localStorage
      navigate(from, { replace: true }); // Редиректим пользователя
    } catch (error: any) {
      console.error('Ошибка авторизации', error);
      
      // Обработка различных ошибок авторизации
      if (error.status === 401) {
        setErrorMessage('Неверный логин или пароль. Пожалуйста, проверьте введенные данные.');
      } else {
        setErrorMessage('Произошла ошибка при авторизации. Попробуйте еще раз.');
      }
    }
  };

  return (
    <>
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
      {/*<GoogleLoginButton />*/}
    </>
  );
}
