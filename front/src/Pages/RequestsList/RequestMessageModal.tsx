import { Modal, Typography, Card, Button, Space, Input } from 'antd';
import { Application, usePartialUpdateApplicationMutation } from 'Features/ApiSlices/applicationSlice';
import CloseIcon from 'assets/icons/close.svg?react';
import { useState } from 'react';
import { useNotification } from 'Widgets/Notification/Notification';

const { Text, Title } = Typography;
const { TextArea } = Input;

interface RequestMessageProps {
  request: Application;
  onClose: () => void;
}

export default function RequestMessageModal({ request, onClose }: RequestMessageProps): JSX.Element {
  const [reply, setReply] = useState('');
  const [sendReply, { isLoading }] = usePartialUpdateApplicationMutation();
  const { showNotification } = useNotification();

  const handleSendReply = async () => {
    if (!reply.trim()) return;

    try {
      await sendReply({ id: request.id, data: { comment: reply.trim() } }).unwrap();
      showNotification("Ответ отправлен!", 'success')
      onClose();
    } catch (error) {
      showNotification(`Ошибка при отправке ответа: ${error}`, 'error')
      console.error('Ошибка при отправке ответа:', error);
    }
  };

  const hasReply = Boolean(request.comment);

  return (
      <Space direction="vertical" style={{ width: '100%' }} size="middle">
        <Card size="small" title="Сообщение студента:">
          <Text>{request.message}</Text>
        </Card>

        {hasReply ? (
          <Card size="small" title="Ваш ответ:">
            <Text>{request.comment}</Text>
          </Card>
        ) : (
          <Card size="small" title="Ваш ответ:">
            <TextArea
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              placeholder="Введите ответ студенту..."
              autoSize={{ minRows: 4, maxRows: 6 }}
              disabled={isLoading}
            />
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
