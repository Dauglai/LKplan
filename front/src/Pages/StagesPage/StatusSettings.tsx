import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button, Input, Row, Col, Card, Modal, Form, Radio, Typography } from 'antd';
const { Title } = Typography;
import { StatusApp } from 'Features/ApiSlices/statusAppSlice';
import { updateStatuses, addStatus } from 'Features/store/eventSetupSlice';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import CloseIcon from 'assets/icons/close.svg?react';


export default function StatusSettings(): JSX.Element {
  const dispatch = useDispatch();
  const { stepStatuses } = useSelector((state: any) => state.event);

  // Стейт для нового статуса
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [newStatusName, setNewStatusName] = useState('');
  const [newStatusDescription, setNewStatusDescription] = useState('');
  const [newStatusType, setNewStatusType] = useState('positive');

  // Функция для открытия модального окна
  const showModal = () => {
    setIsModalVisible(true);
  };

  // Функция для закрытия модального окна
  const handleCancel = () => {
    setIsModalVisible(false);
    setNewStatusName('');
    setNewStatusDescription('');
    setNewStatusType('positive');
  };

  // Функция для добавления нового статуса
  const addStatusModal = () => {
    if (newStatusName.trim()) {
      const newStatus: StatusApp = {
        id: Date.now(),
        name: newStatusName,
        description: newStatusDescription,
        is_positive: newStatusType === 'positive',
      };
      // Вместо updateStatuses используем addStatus
      dispatch(addStatus(newStatus)); // Добавляем новый статус в хранилище
      handleCancel(); // Закрыть модальное окно после добавления
    }
  };
  

  // Обработчик перемещения столбцов
  const onDragEnd = (result: any) => {
    const { destination, source } = result;

    if (!destination) return;

    const reorderedStatuses = Array.from(stepStatuses.statuses);
    const [movedStatus] = reorderedStatuses.splice(source.index, 1);
    reorderedStatuses.splice(destination.index, 0, movedStatus);

    dispatch(updateStatuses(reorderedStatuses)); // Обновить порядок статусов
  };

  

  return (
    <div>

      {/* Кнопка для открытия модального окна */}
      <Button type="primary" onClick={showModal} style={{ marginBottom: 20 }}>
        Добавить новый статус
      </Button>

      {/* Модальное окно для добавления статуса */}
      <Modal
        title={
          <Title level={4} className="ModalTitle">
            Создание статуса
          </Title>
        }
        open={isModalVisible}
        onCancel={handleCancel}
        onOk={addStatusModal}
        className='ModalFormContainer'
        closeIcon={<CloseIcon width={24} height={24} strokeWidth={1} />}
        footer={[
          <Button key="cancel" onClick={handleCancel}>
            Отмена
          </Button>,
          <Button key="ok" type="primary" onClick={addStatusModal}>
            Создать
          </Button>,
        ]}
      >
        <Form layout="vertical">
          <Form.Item className="ModalFormItem">
            <Input
              value={newStatusName}
              onChange={(e) => setNewStatusName(e.target.value)}
              placeholder="Название"
              className='ModalFormField'
            />
          </Form.Item>
          <Form.Item className="ModalFormItem">
            <Input
              value={newStatusDescription}
              onChange={(e) => setNewStatusDescription(e.target.value)}
              placeholder="Описание"
              className='ModalFormField'
            />
          </Form.Item>
          <Form.Item className="ModalFormItem">
            <Radio.Group block
              value={newStatusType}
              defaultValue={"positive"}
              onChange={(e) => setNewStatusType(e.target.value)}
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

      {/* Канбан с заголовками столбцов (статусы) */}
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="statuses" direction="horizontal" type="column">
          {(provided) => (
            <div
              className="kanban-board"
              ref={provided.innerRef}
              {...provided.droppableProps}
            >
              {stepStatuses.statuses?.map((status: StatusApp, index: number) => (
                <Draggable key={status.id} draggableId={String(status.id)} index={index}>
                  {(provided) => (
                    <div
                      className={`kanban-column ${status.is_positive ? 'positive' : 'negative'}`}
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                    >
                      <div className="kanban-column-header">
                        {status.name}
                      </div>
                      <div className="kanban-column-body">
                        {/* Здесь потом можно будет рендерить заявки */}
                      </div>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
};
