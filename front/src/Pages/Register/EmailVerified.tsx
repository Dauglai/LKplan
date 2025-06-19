import { Result } from 'antd'; // Компонент результата Ant Design
import { useSearchParams } from 'react-router-dom'; // Хук для работы с параметрами URL

/**
 * Объект с сообщениями для различных статусов подтверждения email.
 * @constant
 * @type {Object}
 * @property {Object} success - Сообщение об успешном подтверждении
 * @property {string} success.status - Статус результата
 * @property {Object} expired - Сообщение об истекшем сроке ссылки
 * @property {Object} invalid - Сообщение о недействительной ссылке
 * @property {string} invalid.title - Заголовок сообщения
 * @property {string} invalid.subTitle - Подробное описание
 */
const statusMessages = {
  success: {
    status: 'success',
    title: 'Почта подтверждена',
    subTitle: 'Почта успешно подтверждена. Теперь вы можете войти в аккаунт.',
  },
  expired: {
    status: 'warning',
    title: 'Ссылка устарела',
    subTitle: 'Срок действия ссылки истёк. Пожалуйста, запросите новую ссылку для подтверждения почты.',
  },
  invalid: {
    status: 'error',
    title: 'Недействительная ссылка',
    subTitle: 'Ссылка недействительна. Возможно, она уже была использована или повреждена.',
  },
};

/**
 * Страница подтверждения email.
 * Отображает результат операции подтверждения email в зависимости от параметра status в URL.
 * Поддерживает три статуса: success (успешно), expired (истек срок), invalid (недействительная ссылка).
 * 
 * @component
 * @example
 * // Пример URL для вызова:
 * // /email-verified?status=success
 * // /email-verified?status=expired
 * // /email-verified?status=invalid
 * 
 * @returns {JSX.Element} Страница с результатом подтверждения email
 */
export default function EmailVerifiedPage() {
  const [searchParams] = useSearchParams(); // Параметры URL
  const statusParam = searchParams.get('status') as keyof typeof statusMessages; // Получение параметра status

  /**
   * Определяет контент для отображения на основе параметра status.
   * Если статус неизвестен, возвращает сообщение по умолчанию.
   * 
   * @type {Object}
   * @property {string} status - Статус результата
   * @property {string} title - Заголовок сообщения
   * @property {string} subTitle - Подробное описание
   */
  const content = statusMessages[statusParam] || {
    status: 'info',
    title: 'Неизвестный статус',
    subTitle: 'Что-то пошло не так. Попробуйте ещё раз.',
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', marginTop: 100 }}>
      <Result 
        status={content.status} 
        title={content.title} 
        subTitle={content.subTitle} 
      />
    </div>
  );
}
