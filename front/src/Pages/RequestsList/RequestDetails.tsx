import { Application } from 'Features/ApiSlices/applicationSlice';
import PenIcon from 'assets/icons/pen.svg?react';

import { Modal, List, Typography, Space, Button, Divider, Input } from 'antd';
import { CloseOutlined } from '@ant-design/icons';
import { useState } from 'react';

const { Text, Title } = Typography;
const { TextArea } = Input;

interface RequestDetailsProps {
  request: Application;
  open: boolean;
  onClose: () => void;
}

export default function RequestDetailsModal({ request, open, onClose }: RequestDetailsProps): JSX.Element {
  const [reply, setReply] = useState(request.comment || '');

  const infoItems = [
    { label: 'Статус', value: request.status.name },
    { label: 'Мероприятие', value: request.event.name },
    { label: 'Направление', value: request.direction?.name || 'Не указано'},
    { label: 'Проект', value: request.project?.name || 'Не указан'},
    { label: 'Команда', value: request.team?.name || 'Не указана' },
    { label: 'Специальность', value: request.specialization?.name || 'Не указана' },
    { label: 'Место работы', value: request.user.work_place || 'Не указано' },
    { label: 'Учебное заведение', value: request.user.education_place || 'Не указано' },
    { label: 'Курс', value: request.user.course || 'Не указано' },
    { label: 'Ссылка в TG', value: request.user.telegram || 'Не указана' },
    { label: 'Ссылка в VK', value: request.user.vk || 'Не указана' },
  ];

  return (
    <Modal
      open={open}
      onCancel={onClose}
      closable={false}
      footer={null}
      title={<Title level={4}>{request.user.surname} {request.user.name} {request.user.patronymic} {request.user.course ? `${request.user.course} Курс` : ""}</Title>}
      width={452}
      className="RequestDetailsModal"
    >
      <div style={{}}>
        {/* Блок 1 — Список информации */}
        <div>
          <List 
            itemLayout="horizontal"
            dataSource={infoItems}
            renderItem={({ label, value }) => (
              <List.Item
                actions={[
                  <Button type="text" icon={<PenIcon width="12" height="12" strokeWidth={1}/>} key="edit" />
                ]}
              >
                <List.Item.Meta
                  title={<Text strong>{label}</Text>}
                  description={value}
                />
              </List.Item>
            )}
          />
        </div>


        {/* Блок 2 — Общение со студентом */}
        <div style={{ position: 'relative' }}>
          <Title level={5}>Общение со студентом</Title>
          <Button
            icon={<CloseOutlined />}
            onClick={onClose}
            style={{ position: 'absolute', top: 0, right: 0 }}
            type="text"
          />
          <Space direction="vertical" size="small" style={{ width: '100%', marginTop: 12 }}>
            <Text><strong>Сообщение студента:</strong></Text>
            <Text type="secondary">{request.message || '—'}</Text>

            <Text><strong>Ответ:</strong></Text>
            <TextArea
              rows={4}
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              placeholder="Введите ответ студенту..."
            />
          </Space>
        </div>
      </div>
    </Modal>
  );
}

