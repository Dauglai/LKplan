import React, { useState } from 'react';
import { Modal, Form, Input, Select, Button, Radio, Typography } from 'antd';
import { Robot } from 'Features/ApiSlices/robotApiSlice';

const { Option } = Select;
const { Title } = Typography;

interface RobotModalProps {
  visible: boolean;
  onCancel: () => void;
  onSave: (robot: Omit<Robot, 'id'>) => void;
  initialData?: Robot;
}

const RobotModal: React.FC<RobotModalProps> = ({ 
  visible, 
  onCancel, 
  onSave,
  initialData 
}) => {
  const [form] = Form.useForm();
  const [robotType, setRobotType] = useState<Robot["type_action"]>(
    initialData?.type_action || 'move_status'
  );

  const handleSubmit = () => {
    form.validateFields().then(values => {
      const robot: Omit<Robot, 'id'> = {
        name: values.name,
        description: values.description,
        type_action: robotType,
        status: values.status !== false,
        parameters_template: getParametersByType(robotType, values)
      };
      onSave(robot);
      form.resetFields();
      onCancel();
    });
  };

  const getParametersByType = (type: Robot["type_action"], values: any) => {
    switch (type) {
      case 'move_status':
        return {
          target_status: values.targetStatus
        };
      case 'notification':
        return {
          bot_token: values.botToken,
          chat_id: values.chatId,
          message: values.message || 'Статус изменен: {status}'
        };
      default:
        return {};
    }
  };

  // Сброс формы при изменении типа робота
  const handleTypeChange = (type: Robot["type_action"]) => {
    setRobotType(type);
    form.setFieldsValue({
      targetStatus: undefined,
      botToken: undefined,
      chatId: undefined,
      message: undefined
    });
  };

  return (
    <Modal
      title={
          <Title level={4} className="ModalTitle">
            Настройка робота
          </Title>
      }
      open={visible}
      onCancel={onCancel}
      onOk={handleSubmit}
      width={600}
      className='ModalFormContainer'
      footer={[
        <Button key="cancel" onClick={onCancel}>
          Отмена
        </Button>,
        <Button key="submit" type="primary" onClick={handleSubmit}>
          {initialData ? 'Сохранить' : 'Создать'}
        </Button>,
      ]}
    >
      <Form 
        form={form} 
        layout="vertical"
        initialValues={{
          ...initialData,
          ...initialData?.parameters_template,
          status: initialData?.status !== false
        }}
      >
        <Form.Item className="ModalFormItem" 
          name="name"
          rules={[{ required: true, message: 'Введите название' }]}
        >
          <Input placeholder="Название робота *" className='ModalFormField'/>
        </Form.Item>

        <Form.Item className="ModalFormItem" name="description">
          <Input.TextArea
            placeholder="Описание робота"
            className='ModalFormField' 
            autoSize={{ minRows: 1, maxRows: 5 }}
            showCount 
            maxLength={200}/>
        </Form.Item>

        <Form.Item
          className="ModalFormItem" 
          name="type_action"
          rules={[{ required: true }]}
        >
          <Select onChange={handleTypeChange} className='ModalFormField'>
            <Option value="move_status">Изменение статуса</Option>
            <Option value="notification">Уведомление</Option>
          </Select>
        </Form.Item>

        <Form.Item className="ModalFormItem" name="status" valuePropName="checked">
          <Radio.Group>
            <Radio value={true}>Активен</Radio>
            <Radio value={false}>Неактивен</Radio>
          </Radio.Group>
        </Form.Item>

        {/* Динамическая часть формы */}
        {robotType === 'move_status' && (
          <Form.Item className="ModalFormItem" 
            name="targetStatus"
            rules={[{ required: true }]}
          >
            <Input placeholder="Целевой статус *" className='ModalFormField'/>
          </Form.Item>
        )}

        {robotType === 'notification' && (
            <Form.Item className="ModalFormItem" 
              name="message"
            >
              <Input.TextArea
                placeholder="Шаблон сообщения (по умолчанию: Статус изменен: {status})"
                className='ModalFormField'
                rows={3}
              />
            </Form.Item>
        )}
      </Form>
    </Modal>
  );
};

export default RobotModal;