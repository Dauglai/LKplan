import React, { FC } from 'react';
import moment from 'moment';
import { Modal, Form, Input, Select, DatePicker, Button, Space, Row, Col } from 'antd';

import {
  CreateTaskModalProps,
  TaskFormValues,
} from './CreateTaskModal.typings';

import './CreateTaskModal.scss';
import TaskEditor from 'Pages/Tasks/TaskCard/TaskEditor.tsx';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

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
          start: moment(values.start).format('YYYY-MM-DD'),
          deadline: moment(values.deadline).format('YYYY-MM-DD'),
        };
        form.resetFields();
        onCreate(formattedValues);
      })
      .catch((info) => {
        console.error('Ошибка при валидации формы:', info);
      });
  };

  return (
    <Modal
      title="Создать задачу"
      open={visible}
      onCancel={onCancel}
      footer={null}
      className="create-task-modal"
    >
      <Form
        form={form}
        layout="vertical"
        name="createTaskForm"
        initialValues={{ status: 'Новое' }}
        className="create-task-form"
      >
        <Form.Item
          name="name"
          label="Название задачи"
          rules={[{ required: true, message: 'Введите название задачи' }]}
        >
          <Input placeholder="Введите название" />
        </Form.Item>

        <Form.Item
          name="description"
          label="Описание задачи"
          rules={[{ required: true, message: 'Добавьте описание' }]}
        >
          <Form.Item name="description" noStyle>
            <ReactQuill
              theme="snow"
              style={{ height: '200px', marginBottom: '40px' }}
              modules={{
                toolbar: [
                  [{ font: [] }, { size: [] }],
                  ['bold', 'italic', 'underline', 'strike'],
                  [{ color: [] }, { background: [] }],
                  [{ script: 'sub' }, { script: 'super' }],
                  [{ align: [] }],
                  [{ list: 'ordered' }, { list: 'bullet' }],
                  ['link', 'image'],
                  ['clean'],
                ],
              }}
              onChange={(value) => form.setFieldsValue({ description: value })}
            />
          </Form.Item>
        </Form.Item>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="start"
              label="Дата начала"
              rules={[{ required: true, message: 'Выберите дату начала' }]}
            >
              <DatePicker
                placeholder="день.месяц.год"
                style={{ width: '100%' }}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="deadline"
              label="Дата окончания"
              rules={[{ required: true, message: 'Выберите дату окончания' }]}
            >
              <DatePicker
                placeholder="день.месяц.год"
                style={{ width: '100%' }}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="assignee"
              label="Ответственный"
              rules={[{ required: true, message: 'Выберите ответственного' }]}
            >
              <Select placeholder="Выберите ответственного">
                {assignees?.map((a) => (
                  <Option key={a.user_id} value={a.user_id}>
                    {a.surname} {a.name} {a.patronymic}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="executors" label="Исполнители">
              <Select mode="multiple" placeholder="Добавьте исполнителей">
                {assignees?.map((a) => (
                  <Option key={a.user_id} value={a.user_id}>
                    {a.surname} {a.name} {a.patronymic}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Form.Item>
          <div className="create-task-footer">
            <Button onClick={onCancel}>Отмена</Button>
            <Button type="primary" onClick={handleCreate}>
              Создать
            </Button>
          </div>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default CreateTaskModal;
