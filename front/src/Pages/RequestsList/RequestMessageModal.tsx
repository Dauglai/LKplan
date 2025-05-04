import { Typography, Card, Button, Space, Input } from 'antd';
import { Application, usePartialUpdateApplicationMutation } from 'Features/ApiSlices/applicationSlice';
import { useState } from 'react';
import { useNotification } from 'Components/Common/Notification/Notification';

const { Text, Title } = Typography;
const { TextArea } = Input;

interface RequestMessageProps {
  request: Application;
  onClose: () => void;
}

export default function RequestMessageModal({ request, onClose }: RequestMessageProps): JSX.Element {
  const [reply, setReply] = useState('');
  const [localComment, setLocalComment] = useState(request.comment); // локальный комментарий
  const [sendReply, { isLoading }] = usePartialUpdateApplicationMutation();
  const { showNotification } = useNotification();

  const handleSendReply = async () => {
    const trimmedReply = reply.trim();
    if (!trimmedReply) return;

    try {
      await sendReply({ id: request.id, data: { comment: trimmedReply } }).unwrap();
      setLocalComment(trimmedReply); // обновляем локальное состояние
      setReply(''); // очищаем textarea
      showNotification('Ответ отправлен!', 'success');
    } catch (error) {
      showNotification(`Ошибка при отправке ответа: ${error}`, 'error');
      console.error('Ошибка при отправке ответа:', error);
    }
  };

  const hasReply = Boolean(localComment);

  return (
    <Space direction="vertical" style={{ width: '100%' }} size="middle">
      <Card size="small" title="Сообщение студента:">
        <Text>{request.message}</Text>
      </Card>

      {hasReply ? (
        <Card size="small" title="Ваш ответ:">
          <Text>{localComment}</Text>
        </Card>
      ) : (
        <Card size="small" title="Ваш ответ:">
          <TextArea
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            placeholder="Введите ответ студенту..."
            autoSize={{ minRows: 4, maxRows: 6 }}
            disabled={isLoading}
            maxLength={100}
            />
            <Space style={{ justifyContent: 'space-between', width: '100%' }}>
              <Text type="secondary">Символы: {reply.length} / 100</Text>
            </Space>
          <div style={{ marginTop: 8, textAlign: 'right' }}>
            <Button
              type="primary"
              onClick={handleSendReply}
              loading={isLoading}
              disabled={!reply.trim()}
            >
              Ответить
            </Button>
          </div>
        </Card>
      )}
    </Space>
  );
}
