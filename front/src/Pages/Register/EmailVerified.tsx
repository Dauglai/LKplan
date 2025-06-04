import { Result } from 'antd';
import { useSearchParams } from 'react-router-dom';

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

export default function EmailVerifiedPage() {
  const [searchParams] = useSearchParams();
  const statusParam = searchParams.get('status') as keyof typeof statusMessages;

  const content = statusMessages[statusParam] || {
    status: 'info',
    title: 'Неизвестный статус',
    subTitle: 'Что-то пошло не так. Попробуйте ещё раз.',
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', marginTop: 100 }}>
      <Result status={content.status} title={content.title} subTitle={content.subTitle} />
    </div>
  );
}
