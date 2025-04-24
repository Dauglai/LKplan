// components/KanbanBoard.tsx
import React, { useState } from 'react';
import { Button, Input, message, Modal } from 'antd';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import './KanbanBoard.scss';
import { DeleteOutlined, EllipsisOutlined, PlusOutlined } from '@ant-design/icons';
import { Dropdown, Menu } from 'antd';
import moment from 'moment/moment';
import {
  useCreateStageMutation,
  useDeleteStageMutation,
  useUpdateStageMutation,
} from 'Features/ApiSlices/stageApiSlice.ts';

interface Task {
  id: string;
  title: string;
  executor: string;
  startDate: string;
  endDate: string;
  subtasks?: number;
}

interface Column {
  id: string;
  title: string;
  taskIds: string[];
}

interface KanbanData {
  tasks: Record<string, Task>;
  columns: Record<string, Column>;
  columnOrder: string[];
}


const prepareData = (stages, tasks) => {


  const taskMap = tasks.reduce((acc, task) => {
    acc[task.key] = {
      id: task.key,
      title: task.name,
      executor: `${task.assignee.surname} ${task.assignee.name}`,
      startDate: task.start ? moment(task.start).format('DD.MM.YYYY') : 'Нет срока',
      endDate: task.end? moment(task.end).format('DD.MM.YYYY') : 'Нет срока',
      subtasks: task.children.length,
    };
    return acc;
  }, {});

  const columns = stages.reduce((acc, stage) => {
    acc[`stage-${stage.id}`] = {
      id: `stage-${stage.id}`,
      title: stage.name,
      color: stage.color,
      taskIds: stage.taskIds,
    };
    return acc;
  }, {});

  const columnOrder = stages.map((stage) => `stage-${stage.id}`);

  return { taskMap, columns, columnOrder };
};

const KanbanBoard = ({stages, tasks}) => {
  const [createStatus] = useCreateStageMutation();
  const [editStatus] = useUpdateStageMutation();
  const [deleteStatus] = useDeleteStageMutation();
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);

  const [selectedStatus, setSelectedStatus] = useState(null);
  const [statusName, setStatusName] = useState('');
  const [color, setColor] = useState('');

  const [data, setData] = useState(() => prepareData(stages, tasks));
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const colorMap: Record<string, string> = {
    'Зелёный': '#2ECC71',
    'Жёлтый': '#F1C40F',
    'Красный': '#E74C3C',
    'Серый': '#95A5A6',
  };

  const openEditModal = (column) => {
    setSelectedStatus(column);
    setStatusName(column.title);
    setColor(column.color);
    setIsEditModalVisible(true);
  };

  const handleCreateStatus = async () => {
    try {
      const response = await createStatus({
        data: { name: statusName, color, project: currentUserId },
      }).unwrap();

      const id = `column-${response.id}`;
      setData(prev => ({
        ...prev,
        columns: {
          ...prev.columns,
          [id]: { id, title: response.name, taskIds: [] },
        },
        columnOrder: [...prev.columnOrder, id],
      }));

      setStatusName('');
      setColor('');
      setIsCreateModalVisible(false);
    } catch {
      message.error('Ошибка при создании статуса');
    }
  };


  const handleEditStatus = async () => {
    try {
      await editStatus({
        id: selectedStatus.id,
        data: { name: statusName, color },
      }).unwrap();

      setData(prev => {
        const updated = { ...prev };
        const col = Object.values(updated.columns).find(c => c.id === selectedStatus.id);
        if (col) col.title = statusName;
        return updated;
      });

      setIsEditModalVisible(false);
    } catch {
      message.error('Ошибка при редактировании статуса');
    }
  };

  const confirmDelete = async () => {
    try {
      await deleteStatus(selectedStatus.id).unwrap();

      setData(prev => {
        const { [selectedStatus.id]: _, ...restColumns } = prev.columns;
        return {
          ...prev,
          columns: restColumns,
          columnOrder: prev.columnOrder.filter(id => id !== selectedStatus.id),
        };
      });

      setIsDeleteModalVisible(false);
    } catch {
      message.error('Ошибка при удалении статуса');
    }
  };

  const renderColumnHeader = (column, colorName) => {
    const menu = (
      <Menu
        items={[
          { key: 'edit', label: 'Редактировать', onClick: () => editStatus(column.id) },
          { key: 'delete', label: 'Удалить', onClick: () => deleteStatus(column.id) },
        ]}
      />
    );

    return (
      <div className="kanban-column-header">
        <div className="header-content">
          <span className="column-title">{column.title}</span>
          <Dropdown overlay={menu} trigger={['click']}>
            <EllipsisOutlined className="column-menu-icon" />
          </Dropdown>
        </div>
        <div
          className="column-color-line"
          style={{ backgroundColor: colorMap[colorName] || '#ccc' }}
        />
      </div>
    );
  };

  const onDragEnd = (result: any) => {
    const { destination, source, draggableId } = result;
    if (!destination || (destination.droppableId === source.droppableId && destination.index === source.index)) return;

    const startCol = data.columns[source.droppableId];
    const finishCol = data.columns[destination.droppableId];

    if (startCol === finishCol) {
      const newTaskIds = Array.from(startCol.taskIds);
      newTaskIds.splice(source.index, 1);
      newTaskIds.splice(destination.index, 0, draggableId);

      const newColumn = { ...startCol, taskIds: newTaskIds };
      setData({ ...data, columns: { ...data.columns, [newColumn.id]: newColumn } });
    } else {
      const startTaskIds = Array.from(startCol.taskIds);
      startTaskIds.splice(source.index, 1);
      const newStart = { ...startCol, taskIds: startTaskIds };

      const finishTaskIds = Array.from(finishCol.taskIds);
      finishTaskIds.splice(destination.index, 0, draggableId);
      const newFinish = { ...finishCol, taskIds: finishTaskIds };

      setData({
        ...data,
        columns: {
          ...data.columns,
          [newStart.id]: newStart,
          [newFinish.id]: newFinish,
        },
      });
    }
  };

  const showModal = () => setIsModalVisible(true);
  const handleOk = () => {
    const id = `column-${Date.now()}`;
    const newColumn: Column = { id, title: newStatus, taskIds: [] };
    setData({
      ...data,
      columns: { ...data.columns, [id]: newColumn },
      columnOrder: [...data.columnOrder, id],
    });
    setNewStatus('');
    setIsModalVisible(false);
  };

  return (
    <>
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="kanban-board">
          {data.columnOrder.map((columnId) => {
            const column = data.columns[columnId];
            const tasks = column.taskIds.map((taskId) => data.taskMap[taskId]);

            return (
              <Droppable droppableId={column.id} key={column.id}>
                {(provided) => (
                  <div
                    className="kanban-column"
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                  >
                    <div className="kanban-column-header">
                      <h4>{column.title}</h4>
                      {renderColumnHeader(column, column.color)}
                    </div>
                    <div className="kanban-tasks">
                      {tasks.map((task, index) => (
                        <Draggable
                          draggableId={task.id}
                          index={index}
                          key={task.id}
                        >
                          {(provided) => (
                            <div
                              className="kanban-task"
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                            >
                              <div className="task-title">{task.title}</div>
                              {task.subtasks && (
                                <div className="task-subtasks">
                                  ⇳ {task.subtasks}
                                </div>
                              )}
                              <div className="task-date">
                                {task.startDate} – {task.endDate}
                              </div>
                              <div className="task-executor">
                                {task.executor}
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  </div>
                )}
              </Droppable>
            );
          })}
          <div
            className="kanban-column-header"
            onClick={showModal}
          >
            <div className="add-status-column">
              <PlusOutlined />
              <span>Добавить статус</span>
            </div>
          </div>
        </div>
      </DragDropContext>

      <Modal
        title="Новый статус"
        open={isCreateModalVisible}
        onOk={handleCreateStatus}
        onCancel={() => setIsCreateModalVisible(false)}
        okText="Создать статус"
        cancelText="Отменить"
      >
        <div>
          <Input
            placeholder="Название статуса"
            value={statusName}
            onChange={(e) => setStatusName(e.target.value)}
          />
          <div className="color-picker">
            {Object.entries(colorMap).map(([name, hex]) => (
              <div
                key={name}
                className={`color-circle ${color === name ? 'selected' : ''}`}
                style={{ backgroundColor: hex }}
                onClick={() => setColor(name)}
              />
            ))}
          </div>
        </div>
      </Modal>
      <Modal
        open={isDeleteModalVisible}
        onOk={confirmDelete}
        onCancel={() => setIsDeleteModalVisible(false)}
        okText="Удалить"
        cancelText="Отменить"
      >
        <div className="modal-centered">
          <DeleteOutlined style={{ fontSize: 40 }} />
          <h3>Удалить статус?</h3>
          <p>Вы уверены, что хотите удалить статус? Все задачи в колонке будут удалены из доски.</p>
        </div>
      </Modal>

      <Modal
        open={isEditModalVisible}
        onOk={handleEditStatus}
        onCancel={() => setIsEditModalVisible(false)}
        okText="Изменить"
        cancelText="Отменить"
      >
        <div>
          <Input
            placeholder="Название статуса"
            value={statusName}
            onChange={(e) => setStatusName(e.target.value)}
          />
          <div className="color-picker">
            {Object.entries(colorMap).map(([name, hex]) => (
              <div
                key={name}
                className={`color-circle ${color === name ? 'selected' : ''}`}
                style={{ backgroundColor: hex }}
                onClick={() => setColor(name)}
              />
            ))}
          </div>
        </div>
      </Modal>
    </>
  );
};

export default KanbanBoard;
