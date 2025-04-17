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
  Checkbox,
  Descriptions, Avatar,
} from 'antd';
import { LeftOutlined, MoreOutlined, PlusOutlined } from '@ant-design/icons';
import './Tasks.scss';
import CreateTaskModal from './CreateTaskModal';
import { TaskFormValues } from './CreateTaskModal/CreateTaskModal.typings';
import tableOptionIcon from '/src/assets/icons/table_optionb.svg';


import {
  useCreateTaskMutation, useDeleteTaskMutation,
  useGetAllTasksQuery, useUpdateTaskMutation,
} from 'Features/Auth/api/tasksApiSlice';
import { useGetUsersQuery } from 'Features/ApiSlices/userSlice.ts';
import { useGetProjectByIdQuery, useGetProjectsQuery } from 'Features/ApiSlices/projectSlice.ts';
import { useParams } from 'react-router-dom';
import TaskCard from 'Pages/Tasks/TaskCard/TaskCard.tsx';
import TaskFilters from 'Pages/Tasks/TaskFilter/TaskFilter.tsx';
import TaskFilter from 'Pages/Tasks/TaskFilter/TaskFilter.tsx';
import PlanButton from '../../Components/PlanButton/PlanButton.tsx';
import moment from 'moment';


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
  const [dataSource, setDataSource] = useState<Task[]>([]);
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
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<'ascend' | 'descend' | null>(null);
  const [visibleColumns, setVisibleColumns] = useState<string[]>([
    'name',
    'sprint',
    'status',
    'end',
    'assignee',
    'team',
    'actions'
  ]);

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
      description: task.description || ``,
      sprint: task.project ? `${task.project_info.name}` : "Без проекта",
      direction: task.project ? `${task.project_info.directionSet.name}` : "Без направления",
      status: task.status,
      stage: task.stage,
      team: task.team ? `${task.team.name}` : "Без команды",
      start: task.start, // ISO-строка
      end: task.end,
      assignee: task.resp_user
      ? task.resp_user
      : null,
      author: task.author
        ? task.author
        : null,
      children: task.subtasks ? transformTasksData(task.subtasks) : [],
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
      status: stages[0].id,
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

  const handleTableChange = (pagination: any, filters: any, sorter: any) => {
    setSortColumn(sorter.field);
    setSortOrder(sorter.order);
  };

  const columnOptions = [
    { label: 'Название', value: 'name' },
    { label: 'Статус', value: 'status' },
    { label: 'Направление', value: 'direction' },
    { label: 'Проект', value: 'sprint' },
    { label: 'Команда', value: 'team' },
    { label: 'Постановщик', value: 'author' },
    { label: 'Ответсвенный', value: 'assignee' },
    { label: 'Дата начала', value: 'start' },
    { label: 'Дата окончания', value: 'end' },
    { lable: 'Действия', value: 'actions'}
  ];

  useEffect(() => {
    const savedColumns = localStorage.getItem('visibleColumns');
    if (savedColumns) {
      setVisibleColumns(JSON.parse(savedColumns));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('visibleColumns', JSON.stringify(visibleColumns));
  }, [visibleColumns]);



  const handleColumnChange = (checkedValues: string[]) => {
    setVisibleColumns(checkedValues);
  };

  const columns = [
    {
      title: 'Название',
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
      sortOrder: sortColumn === 'name' ? sortOrder : null,

      render: (text: string) => <strong>{text}</strong>,
    },
    {
      title: 'Статус',
      dataIndex: 'status',
      key: 'status',
      sorter: (a, b) => a.status - b.status,
      sortOrder: sortColumn === 'status' ? sortOrder : null,
      render: (status: string, record: Task) => (
        <Select
          value={status}
          style={{ width: 120 }}
          onChange={(value) => handleChangeStatus(record.key, value)}
          onClick={(e) => e.stopPropagation()}
        >
          {stages.map((statusOption) => (
            <Option key={statusOption.id} value={statusOption.id}>
              {statusOption.name}
            </Option>
          ))}
        </Select>
      ),
    },

    {
      title: 'Направление',
      dataIndex: 'direction',
      key: 'direction',
      sorter: (a, b) => a.direction?.localeCompare(b.direction || ''),
      sortOrder: sortColumn === 'direction' ? sortOrder : null,
    },

    {
      title: 'Проект',
      dataIndex: 'sprint',
      key: 'sprint',
      sorter: (a, b) => a.sprint?.localeCompare(b.sprint || ''),
      sortOrder: sortColumn === 'sprint' ? sortOrder : null,
    },

    {
      title: 'Команда',
      dataIndex: 'team',
      key: 'team',
      sorter: (a, b) => a.team?.localeCompare(b.team || ''),
      sortOrder: sortColumn === 'team' ? sortOrder : null,
    },

    {
      title: 'Постановщик',
      dataIndex: 'author',
      key: 'author',
      sorter: (a, b) => {
        const nameA = a.author?.surname + a.author?.name || '';
        const nameB = b.author?.surname + b.author?.name || '';
        return nameA.localeCompare(nameB);
      },
      sortOrder: sortColumn === 'author' ? sortOrder : null,
      render: (author) =>
        author ? (
          <div style={{ display: 'flex', alignItems: 'center' }}>
            {author.surname} {author.name}
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center' }}>Не назначен</div>
        ),
    },

    {
      title: 'Ответственный',
      dataIndex: 'assignee',
      key: 'assignee',
      sorter: (a, b) => {
        const nameA = a.assignee?.surname + a.assignee?.name || '';
        const nameB = b.assignee?.surname + b.assignee?.name || '';
        return nameA.localeCompare(nameB);
      },
      sortOrder: sortColumn === 'assignee' ? sortOrder : null,
      render: (assignee) =>
        assignee ? (
          <div style={{ display: 'flex', alignItems: 'center' }}>
            {assignee.surname} {assignee.name}
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center' }}>Не назначен</div>
        ),
    },
    {
      title: 'Дата начала',
      dataIndex: 'start',
      key: 'start',
      sorter: (a, b) => new Date(a.start).getTime() - new Date(b.start).getTime(),
      sortOrder: sortColumn === 'start' ? sortOrder : null,
      render: (value) => value ? moment(value).format('DD.MM.YYYY') : 'Нет срока',
    },

    {
      title: 'Дата окончания',
      dataIndex: 'end',
      key: 'end',
      sorter: (a, b) => new Date(a.end).getTime() - new Date(b.end).getTime(),
      sortOrder: sortColumn === 'end' ? sortOrder : null,
      render: (value) => value ? moment(value).format('DD.MM.YYYY') : 'Нет срока',
    },
    {
      title: 'Действия',
      key: 'actions',
      render: (_: any, record: Task) => (
        <Dropdown
          overlay={
            <Menu>
              <Menu.Item onClick={(info) => handleMakeSubtask(record.key, info)}>
                Сделать подзадачей
              </Menu.Item>
              <Menu.Item onClick={(info) => handleDeleteRow(record.key, info)}>
                Удалить строку
              </Menu.Item>
            </Menu>
          }
          trigger={['click']}
          onClick={(e: React.MouseEvent<HTMLDivElement>) => e.stopPropagation()}
        >
          <Button icon={<MoreOutlined />} />
        </Dropdown>
      ),
    },
  ];

  const filteredColumns = columns
    .filter(col => !col.key || visibleColumns.includes(col.key))
    .map(col => ({
      ...col,
      onHeaderCell: () => ({ title: '' })  // убираем подсказку
    }));

  return (
    <div className="Tasks">
      <div className="Tasks-Header">
        <div className="Tasks-Header-Heading">
          <Button
            onClick={() => setIsModalCreateTaskVisible(true)}
          >
            <a>Создать</a>
            <PlusOutlined />
          </Button>
        </div>

        <div className="task-filter-wrapper">
          <TaskFilter
            filter={filter}
            setFilter={setFilter}
            stages={stages}
            users={assignees}
            projectData={projectList}
          />
        </div>
        <div >
          <Dropdown
            overlay={
              <div className="column-settings-dropdown">
                <Checkbox.Group
                  options={columnOptions}
                  value={visibleColumns}
                  onChange={handleColumnChange}
                />
              </div>
            }
            trigger={['click']}
            placement="bottomLeft"
          >
            <img src={tableOptionIcon} alt="Настройка таблицы" className="table-settings-icon" />
          </Dropdown>
        </div>
        <div className="Tasks-Header-Buttons">
          <PlanButton type="default">Гант</PlanButton>
          <PlanButton type="default">Канбан</PlanButton>
          <PlanButton type="primary">Список</PlanButton>
        </div>
      </div>
      <Table
        columns={filteredColumns}
        dataSource={dataSource}
        rowKey="id"
        showSorterTooltip={false}
        onRow={(record) => ({
          onClick: () => handleRowClick(record),
        })}
        onChange={handleTableChange}
        expandable={{
          childrenColumnName: 'children',
          rowExpandable: (record) => !!record.children,
        }}
        pagination={false}
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
