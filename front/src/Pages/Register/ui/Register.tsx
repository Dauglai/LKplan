import { useForm, SubmitHandler } from 'react-hook-form';
import { Link } from 'react-router-dom';
import './Register.scss';

type Inputs = {
  login: string;
  password: string;
};
export default function Register(): JSX.Element {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<Inputs>();
  const onSubmit: SubmitHandler<Inputs> = (data) => console.log(data);
  return (
    <>
      <main className="Register">
        <section className="Register-Info">
          <h1 className="Register-Info-Heading">
            Личный кабинет стажера Uralintern
          </h1>
          <ul className="Register-Info-List">
            <li className="Register-Info-List-Item">
              Удобный интерфейс для работы и обучения.
            </li>
            <li className="Register-Info-List-Item">
              Инструменты для управления задачами и проектами.
            </li>
            <li className="Register-Info-List-Item">
              Возможности для профессионального роста и обратной связи.
            </li>
          </ul>
        </section>
        <section className="Register-Container">
          <h1 className="Register-Container-Heading">Регистрация</h1>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="Register-Container-Form"
          >
            <input
              type="text"
              autoComplete="off"
              placeholder="E-mail"
              className="Register-Container-Form-Input"
              {...register('login', { required: true })}
            />
            <input
              type="password"
              autoComplete="off"
              placeholder="Password"
              className="Register-Container-Form-Input"
              {...register('password', { required: true })}
            />
            <button className="Register-Container-Form-Submit" type="submit">
              {' '}
              Зарегистрироваться
            </button>
            <p className="Register-Container-Form-Text">
              Нажимая «Зарегистрироваться», ты принимаешь условия
              Пользовательского соглашения Согласие на обработку персональных
              данных и Политики использования файлов cookie
            </p>
            <Link className="Register-Container-Form-Link" to="/login">
              У меня уже есть аккаунт
            </Link>
          </form>
        </section>
      </main>
    </>
  );
}
