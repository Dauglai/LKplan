import React, { useState } from 'react';
import {
  Table,
  Dropdown,
  Menu,
  Button,
  Tag,
  Checkbox,
  Select,
  Space,
  message,
  Modal,
  Descriptions,
} from 'antd';
import { LeftOutlined, MoreOutlined, PlusOutlined } from '@ant-design/icons';
import './Tasks.scss';
import CreateTaskModal from './CreateTaskModal';
import { TaskFormValues } from './CreateTaskModal/CreateTaskModal.typings';
import type { MenuInfo } from 'rc-menu/lib/interface';

const { Option } = Select;

const Tasks = () => {
  const initialDataSource = [
    {
      key: '1',
      name: 'Задача 1',
      sprint: 'Sprint 1',
      status: 'Новое',
      deadline: '2024-12-05',
      assignee: 'Иван Иванов',
      tags: ['Frontend', 'Critical'],
      children: [
        {
          key: '1-1',
          name: 'Подзадача 1',
          sprint: 'Sprint 1',
          status: 'В работе',
          deadline: '2024-12-06',
          assignee: 'Петр Петров',
          tags: ['Backend'],
        },
      ],
    },
    {
      key: '2',
      name: 'Задача 2',
      sprint: 'Sprint 2',
      status: 'На проверке',
      deadline: '2024-12-10',
      assignee: 'Анна Смирнова',
      tags: ['Bugfix'],
    },
    {
      key: '3',
      name: 'Задача 3',
      sprint: 'Sprint 2',
      status: 'Выполнено',
      deadline: '2024-12-12',
      assignee: 'Алексей Павлов',
      tags: ['Feature'],
    },
  ];

  const assignees = [
    { id: 1, name: 'Иван Иванов' },
    { id: 2, name: 'Анна Смирнова' },
    { id: 3, name: 'Алексей Павлов' },
  ];

  const statuses = ['Новое', 'В работе', 'На проверке', 'Выполнено'];
  const tags = ['Frontend', 'Backend', 'Bugfix', 'Feature'];

  const [dataSource, setDataSource] = useState(initialDataSource);
  const [filterDirection, setFilterDirection] = useState('asc');
  const [isModalVisible, setIsModalVisible] = useState(false); // Статус модального окна
  const [isModalTaskVisible, setIsModalTaskVisible] = useState(false); // Статус модального окна задачи
  const [isModalCreateTaskVisible, setIsModalCreateTaskVisible] =
    useState(false); // Статус модального окна создания задачи
  const [selectedTask, setSelectedTask] = useState(null); // Данные выбранной задачи
  const [selectedTaskKey, setSelectedTaskKey] = useState(null);
  const [parentTaskKey, setParentTaskKey] = useState(null); // Родительская задача

  const handleMakeSubtask = (taskKey, info) => {
    info.domEvent.stopPropagation();
    setSelectedTaskKey(taskKey);
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setParentTaskKey(null);
  };

  const handleCreateTask = (newTask: TaskFormValues) => {
    const taskWithKey = { ...newTask, key: Date.now().toString() };
    setDataSource([...dataSource, taskWithKey]);
    console.log(dataSource);
    message.success('Задача успешно создана!');
    setIsModalCreateTaskVisible(false);
  };

  // Рекурсивная функция для изменения статуса
  const updateStatus = (data, key, newStatus) => {
    return data.map((item) => {
      if (item.key === key) {
        return { ...item, status: newStatus };
      }
      if (item.children) {
        return {
          ...item,
          children: updateStatus(item.children, key, newStatus),
        };
      }
      return item;
    });
  };

  // Рекурсивная функция для удаления строки
  const deleteRow = (data, key) => {
    return data
      .filter((item) => item.key !== key)
      .map((item) => {
        if (item.children) {
          return { ...item, children: deleteRow(item.children, key) };
        }
        return item;
      });
  };

  // Обработчик изменения статуса
  const handleChangeStatus = (key, newStatus) => {
    const updatedData = updateStatus(dataSource, key, newStatus);
    setDataSource(updatedData);
  };

  // Обработчик удаления строки
  const handleDeleteRow = (key, info) => {
    info.domEvent.stopPropagation();
    const updatedData = deleteRow(dataSource, key);
    setDataSource(updatedData);
  };

  const handleConfirmMove = () => {
    if (!parentTaskKey) {
      message.error('Выберите родительскую задачу');
      return;
    }
    if (selectedTaskKey === parentTaskKey) {
      message.error('Задача не может быть подзадачей самой себя');
      return;
    }

    const updatedData = moveTaskToParent(
      dataSource,
      selectedTaskKey,
      parentTaskKey
    );
    setDataSource(updatedData);
    setIsModalVisible(false);
    setParentTaskKey(null);
    message.success('Задача успешно стала подзадачей!');
  };

  const moveTaskToParent = (data, taskKey, parentKey) => {
    const { updatedChildren, removedTask } = removeTask(data, taskKey);

    if (!removedTask) {
      message.error('Ошибка: задача не найдена');
      return data;
    }

    return addTaskToParent(updatedChildren, removedTask, parentKey);
  };

  const removeTask = (data, taskKey) => {
    let removedTask = null;

    const updatedData = data
      .filter((item) => {
        if (item.key === taskKey) {
          removedTask = item; // Сохраняем найденную задачу
          return false; // Удаляем её из текущего списка
        }
        return true;
      })
      .map((item) => {
        if (item.children) {
          return {
            ...item,
            children: removeTask(item.children, taskKey).updatedChildren,
          };
        }
        return item;
      });

    return { updatedChildren: updatedData, removedTask };
  };

  const addTaskToParent = (data, task, parentKey) => {
    return data.map((item) => {
      if (item.key === parentKey) {
        const updatedChildren = item.children
          ? [...item.children, task]
          : [task];
        return { ...item, children: updatedChildren };
      }
      if (item.children) {
        return {
          ...item,
          children: addTaskToParent(item.children, task, parentKey),
        };
      }
      return item;
    });
  };

  // Сортировка по статусу
  const handleStatusSort = () => {
    const statusIndex = (status) => statuses.indexOf(status);

    const sortData = (data) =>
      [...data]
        .sort((a, b) => {
          const comparison = statusIndex(a.status) - statusIndex(b.status);
          return filterDirection === 'asc' ? comparison : -comparison;
        })
        .map((item) => ({
          ...item,
          children: item.children ? sortData(item.children) : undefined,
        }));

    const sortedData = sortData(dataSource);
    setDataSource(sortedData);
    setFilterDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
  };

  // Открытие модального окна с информацией о задаче
  const handleRowClick = (record) => {
    setSelectedTask(record); // Устанавливаем выбранную задачу
    setIsModalTaskVisible(true);
  };

  // Закрытие модального окна
  const handleCloseModal = () => {
    setIsModalTaskVisible(false);
    setSelectedTask(null);
  };

  const columns = [
    {
      title: 'Название',
      dataIndex: 'name',
      key: 'name',
      render: (text) => <strong>{text}</strong>,
    },
    {
      title: 'Спринт',
      dataIndex: 'sprint',
      key: 'sprint',
    },
    {
      title: 'Статус',
      dataIndex: 'status',
      key: 'status',
      render: (status, record) => (
        <Select
          value={status}
          style={{ width: 120 }}
          onChange={(value) => handleChangeStatus(record.key, value)}
          onClick={(e) => e.stopPropagation()}
        >
          {statuses.map((statusOption) => (
            <Option
              key={statusOption}
              value={statusOption}
              // onClick={(e) => e.stopPropagation()}
            >
              {statusOption}
            </Option>
          ))}
        </Select>
      ),
    },
    {
      title: 'Дедлайн',
      dataIndex: 'deadline',
      key: 'deadline',
    },
    {
      title: 'Исполнитель',
      dataIndex: 'assignee',
      key: 'assignee',
    },
    {
      title: 'Тэги',
      dataIndex: 'tags',
      key: 'tags',
      render: (tags) =>
        tags.map((tag) => (
          <Tag color="blue" key={tag}>
            {tag}
          </Tag>
        )),
    },
    {
      title: 'Действия',
      key: 'actions',
      render: (_, record) => (
        <Dropdown
          overlay={
            <Menu>
              <Menu.Item
                onClick={(info) => handleMakeSubtask(record.key, info)}
              >
                Сделать подзадачей
              </Menu.Item>
              <Menu.Item onClick={(info) => handleDeleteRow(record.key, info)}>
                Удалить строку
              </Menu.Item>
            </Menu>
          }
          trigger={['click']}
          onClick={(e) => e.stopPropagation()} // Останавливаем всплытие события клика
        >
          <Button icon={<MoreOutlined />} />
        </Dropdown>
      ),
    },
  ];

  return (
    <div className="Tasks">
      <div className="Tasks-Header">
        <div className="Tasks-Header-Heading">
          <div>
            <p>Название проекта тестовое</p>
            <h2>{<LeftOutlined />} Все задачи</h2>
          </div>
          <Button
            onClick={() => setIsModalCreateTaskVisible(true)}
            type="primary"
            icon={<PlusOutlined />}
          ></Button>{' '}
        </div>
        <div className="Tasks-Header-Status">
          <Button onClick={handleStatusSort}>Сортировать</Button>
        </div>
        <div className="Tasks-Header-Search">{/* <p>Поиск</p> */}</div>
        <div className="Tasks-Header-Buttons">
          <Button type="default">Гант</Button>
          <Button type="default">Канбан</Button>
          <Button type="primary">Список</Button>
        </div>
      </div>
      <Table
        columns={columns}
        dataSource={dataSource}
        rowKey="key"
        onRow={(record) => ({
          onClick: () => handleRowClick(record),
        })}
        expandable={{
          childrenColumnName: 'children',
          rowExpandable: (record) => !!record.children,
        }}
        pagination={{ position: ['none', 'none'] }}
      />
      <Modal
        title="Выберите родительскую задачу"
        visible={isModalVisible}
        onOk={handleConfirmMove}
        onCancel={handleCancel}
        okText="Подтвердить"
        cancelText="Отмена"
      >
        <Select
          style={{ width: '100%' }}
          placeholder="Выберите задачу"
          onChange={(value) => setParentTaskKey(value)}
        >
          {dataSource
            .filter((item) => item.key !== selectedTaskKey) // Исключаем перемещаемую задачу
            .map((item) => (
              <Option key={item.key} value={item.key}>
                {item.name}
              </Option>
            ))}
        </Select>
      </Modal>
      <Modal
        title="Информация о задаче"
        visible={isModalTaskVisible}
        onCancel={handleCloseModal}
        footer={null}
      >
        {selectedTask && (
          <Descriptions column={1}>
            <Descriptions.Item label="Название">
              {selectedTask.name}
            </Descriptions.Item>
            <Descriptions.Item label="Спринт">
              {selectedTask.sprint}
            </Descriptions.Item>
            <Descriptions.Item label="Статус">
              {selectedTask.status}
            </Descriptions.Item>
            <Descriptions.Item label="Дедлайн">
              {selectedTask.deadline}
            </Descriptions.Item>
            <Descriptions.Item label="Исполнитель">
              {selectedTask.assignee}
            </Descriptions.Item>
            <Descriptions.Item label="Тэги">
              {selectedTask.tags.map((tag) => (
                <Tag color="blue" key={tag}>
                  {tag}
                </Tag>
              ))}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
      <CreateTaskModal
        visible={isModalCreateTaskVisible}
        onCreate={handleCreateTask}
        onCancel={() => setIsModalCreateTaskVisible(false)}
        statuses={statuses}
        assignees={assignees}
        tags={tags}
      />
    </div>
  );
};

export default Tasks;
