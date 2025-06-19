import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Form, Input, Button, message } from 'antd';
import { usePasswordResetConfirmMutation } from 'Features/Auth/api/authApiSlice';
import 'Styles/pages/Auth.scss';

/**
 * Компонент для подтверждения сброса пароля пользователя.
 * Позволяет пользователю установить новый пароль после перехода по ссылке сброса.
 * Включает валидацию пароля и обработку токена сброса.
 * 
 * @component
 * @example
 * // Пример использования (обычно вызывается по ссылке из email):
 * // Пользователь переходит по ссылке вида /password-reset-confirm?token=abc123
 * <PasswordResetConfirm />
 * 
 * @returns {JSX.Element} Форма для ввода нового пароля с валидацией.
 */
export default function PasswordResetConfirm(): JSX.Element {
  const [form] = Form.useForm();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Токен сброса пароля из query-параметров URL
  const token = searchParams.get('token');
  // Мутация для подтверждения сброса пароля
  const [resetPassword, { isLoading }] = usePasswordResetConfirmMutation();

  // Установка заголовка страницы
  useEffect(() => {
    document.title = 'Сброс пароля - MeetPoint';
  }, []);

  /**
   * Валидатор пароля, проверяющий сложность.
   * @param {any} _ - Неиспользуемый параметр (требуется antd Form)
   * @param {string} value - Значение пароля для валидации
   * @returns {Promise} Promise, который разрешается при успехе или отклоняется с сообщением об ошибке
   */
  const passwordValidator = (_: any, value: string) => {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[!#$%&()*+./:;=>?@[\]^`{|}~']).{8,}$/;
    if (!value) return Promise.reject('Введите пароль');
    if (!regex.test(value)) {
      return Promise.reject(
        "Пароль должен содержать не менее 8 латинских символов, одну строчную, одну заглавную букву и один спец. символ [!#$%&()*+./:;=>?@\\[\\]^`{|}~']"
      );
    }
    return Promise.resolve();
  };

  /**
   * Обработчик отправки формы сброса пароля.
   * @param {Object} values - Значения формы
   * @param {string} values.password - Новый пароль пользователя
   */
  const onFinish = async (values: { password: string }) => {
    if (!token) {
      message.error('Токен сброса не найден');
      return;
    }

    try {
      await resetPassword({
        token,
        new_password: values.password,
      }).unwrap();
      message.success('Пароль успешно обновлён');
      navigate('/login');
    } catch (error) {
      message.error('Не удалось сбросить пароль. Попробуйте ещё раз или запросите новый');
      console.error(error);
    }
  };

  return (
    <main  className="Auth">
      <h1 className="Auth-Heading">Сброс пароля</h1>

      <Form
        form={form}
        name="resetPassword"
        layout="vertical"
        onFinish={onFinish}
        className="Auth-Form"
      >
        <Form.Item
          name="password"
          label="Новый пароль"
          className="Auth-Form-Item"
          rules={[{ validator: passwordValidator }]}
          hasFeedback
        >
          <Input.Password placeholder="Введите новый пароль" className="Auth-Form-Input"/>
        </Form.Item>

        <Form.Item
          name="confirm"
          label="Подтвердите пароль"
          dependencies={['password']}
          className="Auth-Form-Item"
          hasFeedback
          rules={[
            { required: true, message: 'Пожалуйста, подтвердите пароль' },
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
          <Input.Password placeholder="Повторите новый пароль" className="Auth-Form-Input"/>
        </Form.Item>

        <Form.Item className="Auth-Form-Item">
          <Button type="primary" htmlType="submit" loading={isLoading} block className="Auth-Form-Submit">
            Обновить пароль
          </Button>
        </Form.Item>
      </Form>
    </main>
  );
}
