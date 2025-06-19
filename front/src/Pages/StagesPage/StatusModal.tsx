import React, { useEffect, useState } from 'react';
import { Modal, Button, Form, Input, Radio, Typography } from 'antd';
import { StatusApp } from 'Features/ApiSlices/statusAppSlice';
import CloseIcon from 'assets/icons/close.svg?react';

const { Title } = Typography;


interface StatusModalProps {
  visible: boolean;
  onCancel: () => void;
  onAddStatus: (status: StatusApp) => void;
  onUpdateStatus?: (status: StatusApp) => void;
  editingStatus?: StatusApp | null;
}

/**
 * Модальное окно для добавления и редактирования статусов заявок.
 * Позволяет задавать название, описание и тип статуса (положительный/отрицательный).
 * Поддерживает режимы создания нового статуса и редактирования существующего.
 * 
 * @component
 * @example
 * // Пример использования для добавления статуса:
 * <StatusModal
 *   visible={isModalVisible}
 *   onCancel={() => setIsModalVisible(false)}
 *   onAddStatus={handleAddStatus}
 * />
 * 
 * // Пример использования для редактирования статуса:
 * <StatusModal
 *   visible={isModalVisible}
 *   onCancel={() => setIsModalVisible(false)}
 *   onUpdateStatus={handleUpdateStatus}
 *   editingStatus={selectedStatus}
 * />
 *
 * @param {Object} props - Пропсы компонента.
 * @param {boolean} props.visible - Флаг видимости модального окна
 * @param {function} props.onCancel - Коллбэк закрытия модального окна
 * @param {function} props.onAddStatus - Коллбэк добавления нового статуса
 * @param {function} [props.onUpdateStatus] - Коллбэк обновления существующего статуса
 * @param {StatusApp | null} [props.editingStatus] - Редактируемый статус (null при создании)
 *
 * @returns {JSX.Element} Модальное окно с формой редактирования статуса
 */
export default function StatusModal({
  visible, 
  onCancel, 
  onAddStatus,
  onUpdateStatus,
  editingStatus
}: StatusModalProps): JSX.Element {
  const [form] = Form.useForm(); // Хук формы Ant Design
  const [statusType, setStatusType] = useState<'positive' | 'negative'>('positive'); // Тип статуса

  // Сброс формы при закрытии модального окна
  useEffect(() => {
    if (!visible) {
      form.resetFields();
    }
  }, [visible, form]);

  // Заполнение формы данными редактируемого статуса
  useEffect(() => {
    if (editingStatus && visible) {
      form.setFieldsValue({
        name: editingStatus.name,
        description: editingStatus.description
      });
      setStatusType(editingStatus.is_positive ? 'positive' : 'negative');
    }
  }, [editingStatus, visible, form]);

  /**
   * Обработчик отправки формы
   * Валидирует данные и вызывает соответствующий коллбэк (добавление/обновление)
   */
  const handleSubmit = () => {
    form.validateFields().then(values => {
      const statusData: StatusApp = {
        id: editingStatus?.id || Date.now(), // Используем существующий ID или генерируем временный
        name: values.name,
        description: values.description,
        is_positive: statusType === 'positive',
      };

      if (editingStatus && onUpdateStatus) {
        onUpdateStatus(statusData);
      } else {
        onAddStatus(statusData);
      }

      form.resetFields();
      onCancel();
    });
  };

  return (
    <Modal
      title={
        <Title level={4} className="ModalTitle">
          {editingStatus ? 'Редактирование статуса' : 'Создание статуса'}
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
          {editingStatus ? 'Сохранить' : 'Создать'}
        </Button>,
      ]}
    >
      <Form form={form} layout="vertical">
        <Form.Item 
          className="ModalFormItem" 
          name="name"
          rules={[{ required: true, message: 'Введите название статуса' }]}
        >
          <Input
            placeholder="Название статуса *"
            className='ModalFormField'
          />
        </Form.Item>
        <Form.Item 
          className="ModalFormItem" 
          name="description"
        >
          <Input.TextArea 
            placeholder="Описание статуса"
            className='ModalFormField' 
            autoSize={{ minRows: 1, maxRows: 5 }}
            showCount 
            maxLength={200}
          />
        </Form.Item>
        <Form.Item className="ModalFormItem">
          <Radio.Group 
            block
            value={statusType}
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