import { useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import './StudentReq.scss';
import Chevron from 'assets/icons/chevron-right.svg?react';
interface Inputs {
  fullName: string;
  bearings: string;
  tg: string;
  about: string;
}

export default function StudentReq() {
  const { uId } = useParams();
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<Inputs>();
  const onSubmit = (data: Inputs) => console.log({ ...data, id: uId });
  return (
    <>
      <main className="StudReq">
        <form onSubmit={handleSubmit(onSubmit)} className="StudReq-Form">
          <h1 className="StudReq-Heading">Заполни анкету</h1>
          <label>
            ФИО
            <input
              type="text"
              autoComplete="off"
              placeholder="Иванов Иван Иванович"
              {...register('fullName', { required: true })}
              className="StudReq-Form-Input"
            />
          </label>

          <label>
            Аккаунт в телеграм
            <input
              type="text"
              autoComplete="off"
              placeholder="@example"
              {...register('tg', { required: true })}
              className="StudReq-Form-Input"
            />
          </label>
          <span className="select-wrapper">
            <select
              defaultValue={''}
              {...register('bearings', { required: true })}
              className="StudReq-Form-Input"
            >
              <option value="" disabled selected hidden>
                Направление/Проект
              </option>
              <option value="Информационные технологии">
                Информационные технологии
              </option>
              <option value="Информатика и вычислительная техника">
                Информатика и вычислительная техника
              </option>
              <option value="Информатика и вычислительная техника">
                Информатика и вычислительная техника
              </option>
            </select>
          </span>
          <label>
            О вас{' '}
            <textarea
              rows={6}
              autoComplete="off"
              placeholder=""
              {...register('about', { required: true })}
              className="StudReq-Form-TextArea"
            />
          </label>

          <button type="submit" className="StudReq-Form-Submit">
            Отправить <Chevron />
          </button>
        </form>
        <section className="StudReq-Info">
          <div>
            <h2>Lorem, ipsum dolor.</h2>
            <p>
              Lorem ipsum dolor sit, amet consectetur adipisicing elit. Eum,
              animi?
            </p>
          </div>
          <div>
            <h2>Lorem, ipsum dolor.</h2>
            <p>
              Lorem ipsum dolor sit, amet consectetur adipisicing elit. Eum,
              animi?
            </p>
          </div>
        </section>
      </main>
    </>
  );
}
