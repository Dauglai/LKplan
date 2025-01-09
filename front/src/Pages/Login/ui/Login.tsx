import { useForm, SubmitHandler } from 'react-hook-form';
import { Link, redirect, useNavigate } from 'react-router-dom';

import './Login.scss';
import { useLoginMutation } from 'Features/Auth/api/authApiSlice';
import { useAppDispatch } from 'App/model/hooks';
import { setCredentials } from 'Features/Auth/model/authSlice';

type Inputs = {
  login: string;
  password: string;
};

export default function Login(): JSX.Element {
  const [login, { isLoading }] = useLoginMutation();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<Inputs>();
  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    const userData = await login({
      username: data.login,
      password: data.password,
    }).unwrap();
    console.log(userData);
    localStorage.setItem('user', JSON.stringify(userData.results[0]));
    navigate('/profile');
  };
  return (
    <>
      <main className="Login">
        <h1 className="Login-Heading">Вход</h1>
        <form onSubmit={handleSubmit(onSubmit)} className="Login-Form">
          <input
            type="text"
            autoComplete="off"
            placeholder="E-mail"
            {...register('login', { required: true })}
            className="Login-Form-Input"
          />
          <input
            type="password"
            autoComplete="off"
            placeholder="Password"
            {...register('password', { required: true })}
            className="Login-Form-Input"
          />
          <a className="Login-Form-ForgotPass">Не помню пароль</a>
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
