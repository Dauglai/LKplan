import { FC } from 'react';

import moment from 'moment';

import {
  CreateTaskModalProps,
  TaskFormValues,
} from './CreateTaskModal.typings';

import './CreateTaskModal.scss';

import { Modal, Form, Input, Select, DatePicker, Button, Space } from 'antd';

const { Option } = Select;

const CreateTaskModal: FC<CreateTaskModalProps> = ({
  visible,
  onCreate,
  onCancel,
  statuses,
  assignees,
}) => {
  const [form] = Form.useForm<TaskFormValues>();

  const handleCreate = () => {
    form
      .validateFields()
      .then((values) => {
        const formattedValues = {
          ...values,
          deadline: moment(values.deadline).format('YYYY-MM-DD'),
        };
        form.resetFields();
        onCreate(formattedValues);
        console.log(values);
      })
      .catch((info) => {
        console.error('Ошибка при валидации формы:', info);
      });
  };

  return (
    <Modal
      title="Создать задачу"
      open={visible} // Заменили `visible` на `open`
      onCancel={onCancel}
      footer={null}
    >
      <Form
        form={form}
        layout="vertical"
        name="createTaskForm"
        initialValues={{ status: 'Новое' }}
      >
        {/* Название */}
        <Form.Item
          name="name"
          label="Название задачи"
          rules={[{ required: true, message: 'Введите название задачи' }]}
        >
          <Input placeholder="Введите название" />
        </Form.Item>

        {/* Название */}
        <Form.Item
          name="description"
          label="Описание"
          rules={[{ required: true, message: 'Опишите задачу' }]}
        >
          <Input placeholder="Введите название" />
        </Form.Item>

        {/* Спринт */}
        <Form.Item
          name="sprint"
          label="Спринт"
          rules={[{ required: true, message: 'Укажите спринт' }]}
        >
          <Input placeholder="Введите название спринта" />
        </Form.Item>

        {/* Статус */}
        <Form.Item
          name="status"
          label="Статус"
          rules={[{ required: true, message: 'Выберите статус задачи' }]}
        >
          <Select placeholder="Выберите статус">
            {statuses.map((status) => (
              <Option key={status.id} value={status.id}>
                {status.name}
              </Option>
            ))}
          </Select>
        </Form.Item>

        {/* Дедлайн */}
        <Form.Item
          name="deadline"
          label="Дедлайн"
          rules={[{ required: true, message: 'Выберите дату дедлайна' }]}
        >
          <DatePicker
            style={{ width: '100%' }}
          />
        </Form.Item>

        {/* Исполнитель */}
        <Form.Item
          name="assignee"
          label="Исполнитель"
          rules={[{ required: true, message: 'Выберите исполнителя' }]}
        >
          <Select placeholder="Выберите исполнителя">
            {assignees && assignees.length > 0 ? (
              assignees.map((assignee) => (
                <Option key={assignee.user_id} value={assignee.user_id}>
                  {assignee.surname} {assignee.name} {assignee.patronymic}
                </Option>
              ))
            ) : (
              <Option disabled>Нет доступных исполнителей</Option>
            )}
          </Select>
        </Form.Item>

        {/* Кнопки управления */}
        <Form.Item>
          <Space style={{ display: 'flex', justifyContent: 'end' }}>
            <Button onClick={onCancel}>Отмена</Button>
            <Button type="primary" onClick={handleCreate}>
              Создать
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default CreateTaskModal;
