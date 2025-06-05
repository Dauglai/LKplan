import React, { useState } from 'react';
import { Modal, Form, Input, Select, Button, Radio, InputNumber, Typography } from 'antd';
import { Trigger } from 'Features/ApiSlices/triggerApiSlice';

const { Option } = Select;
const { Title } = Typography;

interface TriggerModalProps {
  visible: boolean;
  onCancel: () => void;
  onSave: (trigger: Omit<Trigger, 'id'>) => void;
  initialData?: Trigger;
}

const TriggerModal: React.FC<TriggerModalProps> = ({ 
  visible, 
  onCancel, 
  onSave,
  initialData 
}) => {
  const [form] = Form.useForm();
  const [triggerType, setTriggerType] = useState<Trigger["type_condition"]>(
    initialData?.type_condition || 'time_expiration'
  );

  const handleSubmit = () => {
    form.validateFields().then(values => {
      const trigger: Omit<Trigger, 'id'> = {
        name: values.name,
        description: values.description,
        type_condition: triggerType,
        status: values.status !== false,
        parameters_template: getParametersByType(triggerType, values)
      };
      onSave(trigger);
      form.resetFields();
      onCancel();
    });
  };

  const getParametersByType = (type: Trigger["type_condition"], values: any) => {
    switch (type) {
      case 'time_expiration':
        return {
          interval: values.interval,
          value: values.timeValue,
          field: values.timeField || 'updated_at'
        };
      case 'status_check':
        return {
          status: values.targetStatus
        };
      case 'field_comparison':
        return {
          field: values.comparisonField,
          operator: values.operator,
          value: values.comparisonValue
        };
      default:
        return {};
    }
  };

  // Сброс формы при изменении типа триггера
  const handleTypeChange = (type: Trigger["type_condition"]) => {
    setTriggerType(type);
    form.setFieldsValue({
      interval: undefined,
      timeValue: undefined,
      targetStatus: undefined,
      operator: undefined,
      comparisonValue: undefined
    });
  };

  return (
    <Modal
      title={
          <Title level={4} className="ModalTitle">
            Настройка триггера
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
          <Input placeholder="Название триггера *" className='ModalFormField'/>
        </Form.Item>

        <Form.Item className="ModalFormItem" name="description">
          <Input.TextArea
            placeholder="Описание триггера"
            className='ModalFormField' 
            autoSize={{ minRows: 1, maxRows: 5 }}
            showCount 
            maxLength={200}/>
        </Form.Item>

        <Form.Item
          className="ModalFormItem" 
          name="type_condition"
          label="Тип условия"
          rules={[{ required: true }]}
        >
          <Select onChange={handleTypeChange} className='ModalFormField' >
            <Option value="time_expiration">Время истечения</Option>
            <Option value="status_check">Проверка статуса</Option>
            <Option value="field_comparison">Сравнение поля</Option>
          </Select>
        </Form.Item>

        <Form.Item className="ModalFormItem" name="status" label="Статус" valuePropName="checked">
          <Radio.Group>
            <Radio value={true}>Активен</Radio>
            <Radio value={false}>Неактивен</Radio>
          </Radio.Group>
        </Form.Item>

        {/* Динамическая часть формы */}
        {triggerType === 'time_expiration' && (
          <>
            <Form.Item className="ModalFormItem" 
              name="interval"
              rules={[{ required: true }]}
            >
              <Select className='ModalFormField' placeholder="Интервал времени *">
                <Option value="days">Дни</Option>
                <Option value="hours">Часы</Option>
                <Option value="minutes">Минуты</Option>
              </Select>
            </Form.Item>

            <Form.Item className="ModalFormItem" 
              name="timeValue"
              rules={[{ required: true }]}
            >
              <InputNumber min={1} className='ModalFormField' placeholder="Значение"/>
            </Form.Item>

            <Form.Item className="ModalFormItem" 
              name="timeField"
            >
              <Input placeholder="Поле с датой (опционально)" className='ModalFormField' />
            </Form.Item>
          </>
        )}

        {triggerType === 'status_check' && (
          <Form.Item className="ModalFormItem" 
            name="targetStatus"
            rules={[{ required: true }]}
          >
            <Input placeholder="Целевой статус" className='ModalFormField'/>
          </Form.Item>
        )}

        {triggerType === 'field_comparison' && (
          <>
            <Form.Item className="ModalFormItem" 
              name="comparisonField"
              rules={[{ required: true }]}
            >
              <Input placeholder="Поле для сравнения" className='ModalFormField'/>
            </Form.Item>

            <Form.Item className="ModalFormItem" 
              name="operator"
              rules={[{ required: true }]}
            >
              <Select className='ModalFormField' placeholder="Оператор">
                <Option value="==">Равно</Option>
                <Option value="!=">Не равно</Option>
                <Option value=">">Больше</Option>
                <Option value="<">Меньше</Option>
              </Select>
            </Form.Item>

            <Form.Item className="ModalFormItem" 
              name="comparisonValue"
              rules={[{ required: true }]}
            >
              <Input placeholder="Значение для сравнения" className='ModalFormField'/>
            </Form.Item>
          </>
        )}
      </Form>
    </Modal>
  );
};

export default TriggerModal;