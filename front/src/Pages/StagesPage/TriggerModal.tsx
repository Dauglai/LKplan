import React, { useEffect, useState } from 'react';
import { Modal, Form, Input, Select, Button, InputNumber, Typography } from 'antd';
import { FunctionOrder } from 'Features/ApiSlices/functionOrdersApiSlice';

const { Title } = Typography;

interface TriggerModalProps {
  visible: boolean;
  onCancel: () => void;
  onSave: (order: Omit<FunctionOrder, 'id'>) => void;
  initialData?: {
    id?: number;
    config: { expiration: string };
    status_order_id: number;
    trigger?: number;
  };
  statusId: number; // ID статуса, к которому привязываем триггер
}

const TriggerModal: React.FC<TriggerModalProps> = ({ 
  visible, 
  onCancel, 
  onSave,
  initialData,
  statusId
}) => {
  const [form] = Form.useForm();
  const [timeUnit, setTimeUnit] = useState<'d' | 'h' | 'm'>('d');
  const [timeValue, setTimeValue] = useState<number>(14);

  useEffect(() => {
    if (initialData) {
      // Парсим существующее значение expiration (например "14d")
      const exp = initialData.config.expiration;
      const value = parseInt(exp);
      const unit = exp.replace(value.toString(), '') as 'd' | 'h' | 'm';
      
      setTimeValue(value);
      setTimeUnit(unit);
    }
  }, [initialData]);

  const handleSubmit = () => {
    form.validateFields().then(() => {
      const expiration = `${timeValue}${timeUnit}`;
      
      onSave({
        position: 1, // Пока ставим 1, можно добавить поле в форму при необходимости
        type_function: 'trigger',
        config: { expiration },
        status_order_id: statusId,
        trigger: initialData?.trigger || 1, // ID триггера "expiration"
      });
      
      form.resetFields();
      onCancel();
    });
  };

  return (
    <Modal
      title={
        <Title level={4} className="ModalTitle">
          {initialData ? 'Редактирование триггера' : 'Добавление триггера'}
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
          name: 'Проверка на актуальность заявки',
          description: 'Определяет, когда заявка становится просроченной',
        }}
      >
        <Form.Item 
          className="ModalFormItem" 
          name="name"
          label="Название триггера"
        >
          <Input disabled className='ModalFormField'/>
        </Form.Item>

        <Form.Item 
          className="ModalFormItem" 
          name="description"
          label="Описание"
        >
          <Input.TextArea
            disabled
            className='ModalFormField' 
            autoSize={{ minRows: 1, maxRows: 5 }}
          />
        </Form.Item>

        <Form.Item
          className="ModalFormItem"
          label="Время до просрочки"
          required
        >
          <div style={{ display: 'flex', gap: '8px' }}>
            <InputNumber
              min={1}
              value={timeValue}
              onChange={(value) => setTimeValue(value || 1)}
              style={{ flex: 1 }}
            />
            <Select
              value={timeUnit}
              onChange={(value) => setTimeUnit(value)}
              style={{ width: '100px' }}
            >
              <Option value="d">Дней</Option>
              <Option value="h">Часов</Option>
              <Option value="m">Минут</Option>
            </Select>
          </div>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default TriggerModal;
