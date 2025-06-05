import React, { useState } from 'react';
import { Modal, Button, Form, Input, Radio, Typography } from 'antd';
import { StatusApp } from 'Features/ApiSlices/statusAppSlice';
import CloseIcon from 'assets/icons/close.svg?react';

const { Title } = Typography;

interface StatusModalProps {
  visible: boolean;
  onCancel: () => void;
  onAddStatus: (status: StatusApp) => void;
}

export default function StatusModal({visible, 
  onCancel, 
  onAddStatus
} : StatusModalProps): JSX.Element {
  const [form] = Form.useForm();
  const [statusType, setStatusType] = useState<'positive' | 'negative'>('positive');

  const handleSubmit = () => {
    form.validateFields().then(values => {
      const newStatus: StatusApp = {
        id: Date.now(),
        name: values.name,
        description: values.description,
        is_positive: statusType === 'positive',
      };
      onAddStatus(newStatus);
      form.resetFields();
      onCancel();
    });
  };

  return (
    <Modal
      title={
          <Title level={4} className="ModalTitle">
            Создание статуса
          </Title>
      }
      open={visible}
      onCancel={onCancel}
      onOk={handleSubmit}
      className='ModalFormContainer'
      closeIcon={<CloseIcon width={24} height={24} strokeWidth={1} />}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          Отмена
        </Button>,
        <Button key="submit" type="primary" onClick={handleSubmit}>
          Создать
        </Button>,
      ]}
    >
      <Form form={form} layout="vertical">
        <Form.Item 
        className="ModalFormItem" 
        name="name"
        rules={[{ required: true, message: 'Введите название статуса' }]}>
            <Input
              placeholder="Название статуса *"
              className='ModalFormField'
            />
          </Form.Item>
        <Form.Item 
        className="ModalFormItem" 
        name="description">
            <Input.TextArea 
            placeholder="Описание статуса"
            className='ModalFormField' 
            autoSize={{ minRows: 1, maxRows: 5 }}
            showCount 
            maxLength={200}/>
        </Form.Item>
        <Form.Item className="ModalFormItem">
            <Radio.Group block
              value={statusType}
              defaultValue={"positive"}
              onChange={(e) => setStatusType(e.target.value)}
            >
              <div className="radio-group">
                <Radio value="positive" className="radio-option radio-positive">
                  Положительный
                </Radio>
                <Radio value="negative" className="radio-option radio-negative">
                  Отрицательный
                </Radio>
              </div>
            </Radio.Group>
        </Form.Item>
      </Form>
    </Modal>
  );
};