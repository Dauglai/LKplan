import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Form, Input, Button, Typography, message } from 'antd';
const { Text } = Typography;

import 'Styles/pages/Auth.scss';
import { useRegisterMutation } from 'Features/Auth/api/authApiSlice';

/**
 * Компонент для регистрации пользователя в системе.
 * Содержит форму с полями для ввода e-mail, пароля и подтверждения пароля.
 * При успешной регистрации отправляется письмо для подтверждения.
 * 
 * @component
 * @example
 * return (
 *   <Auth />
 * )
 */
export default function Auth(): JSX.Element {
  const [Auth, { isLoading }] = useRegisterMutation();
  const [form] = Form.useForm();
  const [emailSent, setEmailSent] = useState<string | null>(null);

  useEffect(() => {
    document.title = 'Регистрация - MeetPoint';
  }, []);

  /**
   * Валидация пароля.
   * Пароль должен содержать:
   * - как минимум 8 символов
   * - хотя бы одну строчную букву
   * - хотя бы одну заглавную букву
   * - хотя бы один специальный символ из набора [!#$%&()*+./:;=>?@[\]^`{|}~']
   * 
   * @param _ - Примерный параметр для типа
   * @param value - Введённый пользователем пароль
   * @returns Promise, который либо разрешается (если пароль валиден), либо отклоняется (если нет)
   */
  const passwordValidator = (_: any, value: string) => {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[!#$%&()*+./:;=>?@[\]^`{|}~']).{8,}$/;
    if (!value) return Promise.reject('Введите пароль');
    if (!regex.test(value)) {
      return Promise.reject(
        "Пароль должен содержать не менее 8 латинских символов, одну строчную, одну заглавную букву и один спец. символ"
      );
    }
    return Promise.resolve();
  };

  /**
   * Обработчик отправки формы регистрации.
   * 
   * @param values - Объект с данными формы (e-mail и пароль)
   * @returns void
   */
  const onFinish = async (values: { email: string; password: string }) => {
    try {
      await Auth({
        username: values.email, // если username = email
        email: values.email,
        password: values.password,
      }).unwrap();

      setEmailSent(values.email);
      message.success('Регистрация прошла успешно');
      form.resetFields();
    } catch (error: any) {
      if (error?.data?.email) {
        form.setFields([{
          name: 'email',
          errors: ['Пользователь с таким email уже существует'],
        }]);
      } else {
        message.error('Произошла ошибка. Попробуйте снова.');
      }
    }
  };

  return (
    <main className="Auth">
      <h1 className="Auth-Heading">Регистрация</h1>
      <Form form={form} layout="vertical" onFinish={onFinish} className="Auth-Form">
        <Form.Item
          label="E-mail"
          name="email"
          className="Auth-Form-Item"
          rules={[
            { required: true, message: 'Введите e-mail' },
            { type: 'email', message: 'Некорректный формат e-mail' },
          ]}
        >
          <Input placeholder="Введите e-mail" autoComplete="off" className="Auth-Form-Input"/>
        </Form.Item>

        <Form.Item
          label="Пароль"
          name="password"
          className="Auth-Form-Item"
          rules={[{ validator: passwordValidator, required: true }]}
          hasFeedback
        >
          <Input.Password placeholder="Введите пароль" autoComplete="new-password" className="Auth-Form-Input"/>
        </Form.Item>

        <Form.Item
          label="Подтверждение пароля"
          name="confirm"
          dependencies={['password']}
          className="Auth-Form-Item"
          hasFeedback
          rules={[
            { required: true, message: 'Подтвердите пароль' },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('password') === value) {
                  return Promise.resolve();
                }
                return Promise.reject('Пароли не совпадают');
              },
            }),
          ]}
        >
          <Input.Password placeholder="Повторите пароль" autoComplete="new-password" className="Auth-Form-Input"/>
        </Form.Item>

        <Form.Item className="Auth-Form-Item">
          <Button type="primary" htmlType="submit" loading={isLoading} block className="Auth-Form-Submit">
            Зарегистрироваться
          </Button>
        </Form.Item>

        {emailSent && (
          <div className="Auth-Form-EmailSent">
            <Text type="success">
              На электронную почту <strong>{emailSent}</strong> отправлено письмо для подтверждения регистрации. 
              Если письма нет во входящих, пожалуйста, проверьте папку "Спам" — иногда оно может попасть туда.
            </Text>
          </div>
        )}
      </Form>
      <Link className="Auth-Link" to="/login">
        У меня уже есть аккаунт
      </Link>
    </main>
  );
}


