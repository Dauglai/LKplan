import styled from "styled-components";
import { useForm, SubmitHandler } from "react-hook-form";
import { Link } from "react-router-dom";

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
      <main>
        <div>
          <h1>Register</h1>
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
            <p>
              Lorem ipsum dolor sit, amet consectetur adipisicing elit. Officia
              totam sapiente dolorum maxime voluptatum adipisci, repudiandae
              repellendus minus sed perferendis dicta consequuntur incidunt quos
              alias!
            </p>
            <input type="submit" />
            <Link to="/login">Login</Link>
          </form>
        </div>
      </main>
    </>
  );
}
