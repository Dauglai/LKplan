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
  Descriptions, Avatar,
} from 'antd';
import { LeftOutlined, MoreOutlined, PlusOutlined } from '@ant-design/icons';
import './Tasks.scss';
import CreateTaskModal from './CreateTaskModal';
import { TaskFormValues } from './CreateTaskModal/CreateTaskModal.typings';


import {
  useCreateTaskMutation, useDeleteTaskMutation,
  useGetAllTasksQuery, useUpdateTaskMutation,
} from 'Features/ApiSlices/tasksApiSlice';
import { useGetUsersQuery } from 'Features/ApiSlices/userSlice.ts';
import { useGetProjectByIdQuery, useGetProjectsQuery } from 'Features/ApiSlices/projectSlice.ts';
import { useParams } from 'react-router-dom';
import TaskCard from 'Pages/Tasks/TaskCard/TaskCard.tsx';
import TaskFilters from 'Pages/Tasks/TaskFilter/TaskFilter.tsx';
import TaskFilter from 'Pages/Tasks/TaskFilter/TaskFilter.tsx';


interface Profile {
  user_id: number;
  surname: string;
  name: string;
  patronymic: string;
}

interface Stage {
  id: number;
  name: string;
}

interface Task {
  key: string;
  name: string;
  sprint: string;
  status: string;
  stage: Stage;
  end: string;
  assignee: Profile;
  children?: Task[]; // Подзадачи
}


interface RemoveTaskResult {
  updatedChildren: Task[];
  removedTask: Task | null;
}

const { Option } = Select;

const Tasks = () => {
  /*const assignees = [
    { id: 1, name: 'Иван Иванов' },
    { id: 2, name: 'Анна Смирнова' },
    { id: 3, name: 'Алексей Павлов' },
  ];
*/
  const statuses = ['Новое', 'В работе', 'На проверке', 'Выполнено'];

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
  const [updateTask] = useUpdateTaskMutation();
  const [deleteTask] = useDeleteTaskMutation();
  const { data: projects, isLoading: isLoadingProjects } = useGetProjectsQuery();
  const projectList = projects || [];
  const { projectId } = useParams();
  // @ts-ignore
  const { data: userData, isLoading, error } = useGetUsersQuery();
  const { data: projectData} = useGetProjectByIdQuery(projectId);
  const assignees = userData ? userData : [];
  const stages = projectData?.stages || [];
//  const { data } = useGetAllTasksQuery();
  const [limit, setLimit] = useState(10);
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState({ sort: '', query: ''});
  const { data: data = [] } = useGetAllTasksQuery({
    name: filter.query,
    status: filter.status,
    creator: filter.creator,
    responsible_user: filter.responsible_user,
    project: filter.project,
    deadline: filter.deadline,
    created_after: filter.created_after,
    created_before: filter.created_before,
    task_id: filter.task_id,
    team: filter.team,
    page,
    page_size: limit,
    sort: filter.sort,
  });

  useEffect(() => {
    if (data) {
      const structuredTasks = organizeTasks(data);
      setDataSource(transformTasksData(structuredTasks));
    }
  }, [data]);

  const organizeTasks = (tasks: Task[]): Task[] => {
    const taskMap: Record<string, Task> = {};
    const rootTasks: Task[] = [];

    // Создаем глубокую копию
    const tasksCopy = tasks.map(task => ({
      ...task,
      children: task.children || [], // Убедимся, что `children` массив, а не `undefined`
    }));

    tasksCopy.forEach((task) => {
      taskMap[task.id] = task;
    });

    tasksCopy.forEach((task) => {
      if (task.parent_task && taskMap[task.parent_task]) {
        taskMap[task.parent_task].children.push(task);
      } else {
        rootTasks.push(task);
      }
    });

    return rootTasks;
  };


  useEffect(() => {
		document.title = 'Список задач - MeetPoint';
	}, []);

  const transformTasksData = (data: Task[]): Task[] => {
    if (!data) return [];

    return data.map((task) => ({
      key: String(task.id),
      name: task.name || `Задача ${task.id}`,
      sprint: task.project ? `Проект ${task.project}` : "Без проекта",
      status: task.status,
      stage: task.stage,
      end: task.end ? new Date(task.end).toLocaleDateString() : "Нет срока",
      assignee: task.resp_user
      ? task.resp_user
      : null,
      children: task.subtasks ? transformTasksData(task.subtasks) : [],
      checklist: task.checklist?.map((item) => item.description) || [],
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
      project: projectId,
      name: newTask.name,
      description: newTask.description,
      end: newTask.deadline,
      responsible_user: newTask.assignee,
      status: newTask.status,
    });
    setDataSource([...dataSource, taskWithKey]);
    console.log(dataSource);
    message.success('Задача успешно создана!');
    setIsModalCreateTaskVisible(false);
  };

  // Рекурсивная функция для изменения статуса
  const updateStatus = (data: Task[], key: string, newStatus: string): Task[] => {
    return data.map((item) => {
      if (item.key === key) {
        return { ...item, status: newStatus };
      }
      if (item.children) {
        return { ...item, children: updateStatus(item.children, key, newStatus) };
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
  const handleChangeStatus = async (key: string, newStatus: string) => {
    try {
      // Обновляем задачу на сервере
      await updateTask({ id: Number(key), data: { status: newStatus } }).unwrap();

      // После успешного обновления меняем состояние локально
      setDataSource((prevData) => updateStatus(prevData, key, newStatus));
    } catch (error) {
      console.error('Ошибка обновления статуса:', error);
    }
  };

  // Обработчик удаления строки
  const handleDeleteRow = async (key: string, info: any) => {
    info.domEvent.stopPropagation();
    try {
      await deleteTask(Number(key)).unwrap(); // Теперь передаём только id
      const updatedData = deleteRow(dataSource, key);
      setDataSource(updatedData);
    } catch (error) {
      console.error('Ошибка удаления:', error);
    }
  };

  const handleConfirmMove = async () => {
    if (!parentTaskKey) {
      message.error('Выберите родительскую задачу');
      return;
    }
    if (selectedTaskKey === parentTaskKey) {
      message.error('Задача не может быть подзадачей самой себя');
      return;
    }

    try {
      await updateTask({
        id: Number(selectedTaskKey),
        data: { parent_task: Number(parentTaskKey) },
      }).unwrap();

      const updatedData = moveTaskToParent(
        dataSource,
        selectedTaskKey,
        parentTaskKey
      );
      setDataSource(updatedData);
      setIsModalVisible(false);
      setParentTaskKey(null);
      message.success('Задача успешно стала подзадачей!');
    } catch (error) {
      message.error('Ошибка при обновлении задачи');
      console.error('Ошибка:', error);
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

  const [filters, setFilters] = useState({});
  const [sortOrder, setSortOrder] = useState({ columnKey: null, order: null });

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
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
    const id = Number(record.key)
    if (!id) {
      console.error('Ошибка: У задачи нет ID', record);
      return;
    }
    setSelectedTask(record);
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
      title: 'Проект',
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
          {stages.map((statusOption) => (
            <Option
              key={statusOption.id}
              value={statusOption.id}
            >
              {statusOption.name}
            </Option>
          ))}
        </Select>
      ),
    },
    {
      title: 'Дедлайн',
      dataIndex: 'end',
      key: 'end',
    },
    {
      title: 'Исполнитель',
      dataIndex: 'assignee',
      key: 'assignee',
      render: (assignee) =>
        assignee ? (
          <div style={{ display: 'flex', alignItems: 'center' }}>
            {assignee.surname} {assignee.name} {assignee.patronymic}
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center' }}>Не назначен</div>
        ),
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
            <p>Название проекта {projectData?.name || 'Загрузка...'}</p>
            <h2>{<LeftOutlined />} Все задачи</h2>
          </div>
          <Button
            onClick={() => setIsModalCreateTaskVisible(true)}
            type="primary"
            icon={<PlusOutlined />}
          ></Button>{' '}
        </div>

        <div className="Tasks-Header-Search">
          <TaskFilter filter={filter} setFilter={setFilter} stages={stages} users={assignees} projectData={projectList} />
        </div>
        <div className="Tasks-Header-Buttons">
          <Button type="default">Гант</Button>
          <Button type="default">Канбан</Button>
          <Button type="primary">Список</Button>
        </div>
      </div>
      <Table
        columns={columns}
        dataSource={dataSource}
        rowKey="id"
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

      <CreateTaskModal
        visible={isModalCreateTaskVisible}
        onCreate={handleCreateTask}
        onCancel={() => setIsModalCreateTaskVisible(false)}
        statuses={projectData?.stages || []}
        assignees={assignees}
      />
      <TaskCard
        visible={isModalTaskVisible}
        selectedTask={selectedTask}
        onClose={handleCloseModal}
        stages={projectData?.stages || []}
        assignees={assignees}
      />
    </div>
  );
};

export default Tasks;
