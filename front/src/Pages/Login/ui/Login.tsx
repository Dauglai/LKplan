import { useForm, SubmitHandler } from 'react-hook-form';
import { Link, useLocation, useNavigate } from 'react-router-dom';

import './Login.scss';
import { useLoginMutation } from 'Features/Auth/api/authApiSlice';
import { useAppDispatch } from 'App/model/hooks';
import { setCredentials, logOut } from 'Features/Auth/model/authSlice';
import { useEffect } from 'react';

type Inputs = {
  login: string;
  password: string;
};

export default function Login(): JSX.Element {
  const [login, { isLoading }] = useLoginMutation();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<Inputs>();

  useEffect(() => {
    document.title = 'Авторизация - MeetPoint';
  }, []);

  const from = location.state?.from?.pathname || '/';

  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    const userData = await login({
      username: data.login,
      password: data.password,
    }).unwrap();
    dispatch(logOut());
    dispatch(setCredentials(userData));
    localStorage.setItem('user', JSON.stringify(userData));
    navigate(from, { replace: true });
};
  return (
    <>
      <main className="Login">
        <h1 className="Login-Heading">Вход</h1>
        <form onSubmit={handleSubmit(onSubmit)} className="Login-Form">
          <input
            type="text"
            autoComplete="off"
            placeholder="Имя пользователя"
            {...register('login', { required: true })}
            className="Login-Form-Input"
          />
          <input
            type="password"
            autoComplete="off"
            placeholder="Пароль"
            {...register('password', { required: true })}
            className="Login-Form-Input"
          />
          {/*<a className="Login-Form-ForgotPass">Не помню пароль</a>*/}
          <button type="submit" className="Login-Form-Submit">
            Войти
          </button>
          <Link to="/register" className="Login-Form-Link">
            Ещё нет аккаунта? Зарегистрируйся
          </Link>
        </form>
      </main>
    </>
  );
}
