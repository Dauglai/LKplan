import { useForm, SubmitHandler } from 'react-hook-form';
import { Link } from 'react-router-dom';

import './Login.scss';
import { Button, Checkbox, Flex, Form, Input } from 'antd';

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

  const onFinish = (values: any) => {
    console.log(values);
  };
  return (
    <>
      <main className="Login">
        <h1 className="Login-Heading">Вход</h1>
        <Form
          name="login"
          onFinish={onFinish}
          className="Login-Form"
          layout="vertical"
          requiredMark={false}
        >
          <Form.Item
            name="email"
            label="Почта"
            rules={[
              { required: true, message: 'Пожалуйста, заполните поле почты' },
            ]}
          >
            <Input placeholder="Почта" />
          </Form.Item>
          <Form.Item
            name="password"
            label="Пароль"
            rules={[
              { required: true, message: 'Пожалуйста, заполните поле пароля' },
            ]}
          >
            <Input type="password" placeholder="Пароль" />
          </Form.Item>
          <Form.Item>
            <Flex justify="space-between" align="center">
              <a>Не помню пароль</a>
            </Flex>
          </Form.Item>
          <Form.Item>
            <Button block type="primary" size="large" htmlType="submit">
              Войти
            </Button>
          </Form.Item>
          <Form.Item>
            <Flex align="center" justify="center">
              <Link to="/register">Ещё нет аккаунта? Зарегистрируйся</Link>
            </Flex>
          </Form.Item>
        </Form>
      </main>
    </>
  );
}
