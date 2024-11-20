import { useForm, SubmitHandler } from 'react-hook-form';
import { Link } from 'react-router-dom';

import './Login.scss';

type Inputs = {
  login: string;
  password: string;
};

export default function Login(): JSX.Element {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<Inputs>();
  const onSubmit: SubmitHandler<Inputs> = (data) => console.log(data);
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
          <a className="Login-Form-FogotPass">Не помню пароль</a>
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
