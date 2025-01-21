import { useForm, SubmitHandler } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';

import './Register.scss';
import { useRegisterMutation } from 'Features/Auth/api/authApiSlice';

type Inputs = {
  username: string;
  email: string;
  password: string;
};

export default function Register(): JSX.Element {
  const [register, { isLoading }] = useRegisterMutation();
  const navigate = useNavigate();
  const {
    register: reg,
    handleSubmit,
    formState: { errors },
  } = useForm<Inputs>();

  useEffect(() => {
      document.title = 'Регистрация - MeetPoint';
    }, []);
  
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    try {
      const userData = await register({
        username: data.username,
        email: data.email,
        password: data.password,
      }).unwrap();
      if (userData.message) {
        navigate('/profile');
      }
    } catch (error: any) {
      const serverErrors = error.data || {};
      const translatedErrors: Record<string, string> = {};

      if (serverErrors.email) {
        translatedErrors.email = 'Введите корректный адрес электронной почты.';
      }
      if (serverErrors.username) {
        translatedErrors.username = 'Пользователь с таким именем уже существует.';
      }
      setFormErrors(translatedErrors);
    }
  };

  return (
    <main className="Register">
      <h1 className="Register-Heading">Регистрация</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="Register-Form">
        <div className="Register-Form-Group">
          <input
            type="text"
            autoComplete="off"
            placeholder="Имя пользователя"
            className="Register-Form-Input"
            {...reg('username', { required: true, minLength: 3 })}
          />
          {errors.username && <span className="Register-Form-Error">Имя пользователя должно содержать не менее 3 символов</span>}
          {formErrors.username && <span className="Register-Form-Error">{formErrors.username}</span>}
        </div>
        <div className="Register-Form-Group">
          <input
            type="text"
            autoComplete="off"
            placeholder="E-mail"
            className="Register-Form-Input"
            {...reg('email', { required: true })}
          />
          {errors.email && <span className="Register-Form-Error">Поле E-mail обязательно для заполнения</span>}
          {formErrors.email && <span className="Register-Form-Error">{formErrors.email}</span>}
        </div>
        <div className="Register-Form-Group">
          <input
            type="password"
            autoComplete="off"
            placeholder="Password"
            className="Register-Form-Input"
            {...reg('password', { required: true, minLength: 8 })}
          />
          {errors.password && <span className="Register-Form-Error">Пароль должен содержать не менее 8 символов</span>}
          {formErrors.password && <span className="Register-Form-Error">{formErrors.password}</span>}
        </div>
        <button className="Register-Form-Submit" type="submit" disabled={isLoading}>
          Зарегистрироваться
        </button>
        <p className="Register-Form-Text">
          Нажимая «Зарегистрироваться», ты принимаешь условия Пользовательского соглашения, Согласие на обработку персональных данных и Политики использования файлов cookie.
        </p>
        <Link className="Register-Form-Link" to="/login">
          У меня уже есть аккаунт
        </Link>
      </form>
    </main>
  );
}

