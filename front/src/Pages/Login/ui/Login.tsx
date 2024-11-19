import { useForm, SubmitHandler } from "react-hook-form";
import { Link } from "react-router-dom";
import "./Login.css"
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
      <main>
        <section>
          <h1>UrealIntern</h1>
          <ul>
            <li>1</li>
            <li>2</li>
            <li>3</li>
          </ul>
        </section>
        <div>
          <h1>Login</h1>
          <form onSubmit={handleSubmit(onSubmit)}>
            <input
              type="text"
              autoComplete="off"
              placeholder="E-mail"
              {...register("login", { required: true })}
            />
            <input
              type="password"
              autoComplete="off"
              placeholder="Password"
              {...register("password", { required: true })}
            />
            <input type="submit" />
            <p>
              Lorem ipsum dolor sit, amet consectetur adipisicing elit. Officia
              totam sapiente dolorum maxime voluptatum adipisci, repudiandae
              repellendus minus sed perferendis dicta consequuntur incidunt quos
              alias!
            </p>
            <Link to="/register">Register</Link>
          </form>
        </div>
      </main>
    </>
  );
}
