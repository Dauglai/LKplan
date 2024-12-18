import { useForm, SubmitHandler } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';

import './Register.scss';
import { useRegisterMutation } from 'Features/Auth/api/authApiSlice';

type Inputs = {
  email: string;
  password: string;
};
export default function Register(): JSX.Element {
  const [register, { isLoading }] = useRegisterMutation();
  const navigate = useNavigate();
  const {
    register: reg,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<Inputs>();
  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    console.log(data);
    
    const userData = await register({
      username: data.email.split('@')[0].replace('.', ''),
      email: data.email,
      password: data.password,
    }).unwrap();
    try {
      userData.message
      navigate('/profile');
    } catch (error) {
      console.log(error)
    }
    
  };
  return (
    <>
      <main className="Register">
          <h1 className="Register-Heading">Регистрация</h1>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="Register-Form"
          >
            <input
              type="text"
              autoComplete="off"
              placeholder="E-mail"
              className="Register-Form-Input"
              {...reg('email', { required: true })}
            />
            <input
              type="password"
              autoComplete="off"
              placeholder="Password"
              className="Register-Form-Input"
              {...reg('password', { required: true })}
            />
            <button className="Register-Form-Submit" type="submit">
              {' '}
              Зарегистрироваться
            </button>
            <p className="Register-Form-Text">
              Нажимая «Зарегистрироваться», ты принимаешь условия
              Пользовательского соглашения Согласие на обработку персональных
              данных и Политики использования файлов cookie
            </p>
            <Link className="Register-Form-Link" to="/login">
              У меня уже есть аккаунт
            </Link>
          </form>

      </main>
    </>
  );
}
