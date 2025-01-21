import React, { useEffect, useState } from 'react';
import {
  Table,
  Dropdown,
  Menu,
  Button,
  Tag,
  Select,
  message,
  Modal,
  Descriptions,
} from 'antd';
import { LeftOutlined, MoreOutlined, PlusOutlined } from '@ant-design/icons';

import './Tasks.scss';

import CreateTaskModal from './CreateTaskModal';
import { TaskFormValues } from './CreateTaskModal/CreateTaskModal.typings';

import {
  useCreateTaskMutation,
  useGetAllTasksQuery,
} from 'Features/Auth/api/tasksApiSlice';

interface Task {
  key: string;
  name: string;
  sprint: string;
  status: string;
  deadline: string;
  assignee: string;
  tags: string[];
  children?: Task[]; // Подзадачи
}

interface RemoveTaskResult {
  updatedChildren: Task[];
  removedTask: Task | null;
}

const { Option } = Select;

const Tasks = () => {
  const assignees = [
    { id: 1, name: 'Иван Иванов' },
    { id: 2, name: 'Анна Смирнова' },
    { id: 3, name: 'Алексей Павлов' },
  ];

  const statuses = ['Новое', 'В работе', 'На проверке', 'Выполнено'];
  const tags = ['Frontend', 'Backend', 'Bugfix', 'Feature'];

  const [dataSource, setDataSource] = useState<Task[]>([]);
  const [filterDirection, setFilterDirection] = useState('asc');
  const [isModalVisible, setIsModalVisible] = useState(false); // Статус модального окна
  const [isModalTaskVisible, setIsModalTaskVisible] = useState(false); // Статус модального окна задачи
  const [isModalCreateTaskVisible, setIsModalCreateTaskVisible] =
    useState(false); // Статус модального окна создания задачи
  const [selectedTask, setSelectedTask] = useState<Task | null>(null); // Данные выбранной задачи
  const [selectedTaskKey, setSelectedTaskKey] = useState<string | null>(null);
  const [parentTaskKey, setParentTaskKey] = useState<string | null>(null); // Родительская задача
  const [createTask] = useCreateTaskMutation();

  // @ts-ignore
  const { data } = useGetAllTasksQuery();

  useEffect(() => {
    if (data) {
      setDataSource(transformTasksData(data));
    }
  }, [data]);

  useEffect(() => {
		document.title = 'Список задач - MeetPoint';
	}, []);

  const transformTasksData = (data: any): Task[] => {
    if (!data?.results) return [];

    return data.results.map((task: any) => ({
      key: String(task.id),
      name: task.name || `Задача ${task.id}`,
      sprint: `Спринт ${task.project}`,
      status: statuses[task.status],
      deadline: task.dateCloseTask
        ? new Date(task.dateCloseTask).toLocaleDateString()
        : 'Нет срока',
      assignee:
        `${task.responsible_user?.name || ''} ${task.responsible_user?.surname || ''}`.trim(),
      tags: ['git'],
    }));
  };

  const handleMakeSubtask = (taskKey: string, info: any) => {
    info.domEvent.stopPropagation();
    setSelectedTaskKey(taskKey);
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setParentTaskKey(null);
  };

  const handleCreateTask = async (newTask: TaskFormValues) => {
    const taskWithKey = { ...newTask, key: Date.now().toString() };
    await createTask({
      project: 1,
      name: newTask.name,
      desription: 'wqdwdq',
      dateCloseTask: newTask.deadline,
      responsible_user: {
        name: 'Иван Иванов',
        surname: 'Иванов',
        telegram: 'wd',
        email: 'wqdq',
        partonymic: 'qwqwd',
        course: 1,
        university: 'ITMO',
        vk: 'dqwq',
        job: 'dwqd',
        specializations: [1, 2, 3],
      },
      status: 1,
    });
    setDataSource([...dataSource, taskWithKey]);
    console.log(dataSource);
    message.success('Задача успешно создана!');
    setIsModalCreateTaskVisible(false);
  };

  // Рекурсивная функция для изменения статуса
  const updateStatus = (
    data: Task[],
    key: string,
    newStatus: string
  ): Task[] => {
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
  const deleteRow = (data: Task[], key: string): Task[] => {
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
  const handleChangeStatus = (key: string, newStatus: string) => {
    const updatedData = updateStatus(dataSource, key, newStatus);
    setDataSource(updatedData);
  };

  // Обработчик удаления строки
  const handleDeleteRow = (key: string, info: any) => {
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

    if (selectedTaskKey) {
      const updatedData = moveTaskToParent(
        dataSource,
        selectedTaskKey,
        parentTaskKey
      );
      setDataSource(updatedData);
      setIsModalVisible(false);
      setParentTaskKey(null);
      message.success('Задача успешно стала подзадачей!');
    }
  };

  const moveTaskToParent = (
    data: Task[],
    taskKey: string,
    parentKey: string
  ) => {
    const { updatedChildren, removedTask } = removeTask(data, taskKey);

    if (!removedTask) {
      message.error('Ошибка: задача не найдена');
      return data;
    }

    return addTaskToParent(updatedChildren, removedTask, parentKey);
  };

  const removeTask = (data: Task[], taskKey: string): RemoveTaskResult => {
    let removedTask: Task | null = null;

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

  const addTaskToParent = (
    data: Task[],
    task: Task,
    parentKey: string
  ): Task[] => {
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
    const statusIndex = (status: string) => statuses.indexOf(status);

    const sortData = (data: Task[]): Task[] =>
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
  const handleRowClick = (record: Task) => {
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
      render: (text: string) => <strong>{text}</strong>,
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
      render: (status: string, record: Task) => (
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
      render: (tags: string[]) =>
        tags.map((tag) => (
          <Tag color="blue" key={tag}>
            {tag}
          </Tag>
        )),
    },
    {
      title: 'Действия',
      key: 'actions',
      render: (_: any, record: Task) => (
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
          // @ts-ignore
          onClick={(e: React.MouseEvent<HTMLDivElement>) => e.stopPropagation()} // Останавливаем всплытие события клика
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
