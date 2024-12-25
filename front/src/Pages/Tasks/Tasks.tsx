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
} from 'antd';
import { LeftOutlined, MoreOutlined, PlusOutlined } from '@ant-design/icons';
import './Tasks.scss';

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

  const [dataSource, setDataSource] = useState(initialDataSource);
  const [filterDirection, setFilterDirection] = useState('asc');
  const [isModalVisible, setIsModalVisible] = useState(false); // Статус модального окна
  const [selectedTaskKey, setSelectedTaskKey] = useState(null);
  const [parentTaskKey, setParentTaskKey] = useState(null); // Родительская задача

  const statuses = ['Новое', 'В работе', 'На проверке', 'Выполнено'];

  const handleMakeSubtask = (taskKey) => {
    setSelectedTaskKey(taskKey);
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setParentTaskKey(null);
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
  const handleDeleteRow = (key) => {
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
        >
          {statuses.map((statusOption) => (
            <Option key={statusOption} value={statusOption}>
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
              <Menu.Item onClick={() => handleMakeSubtask(record.key)}>
                Сделать подзадачей
              </Menu.Item>
              <Menu.Item onClick={() => handleDeleteRow(record.key)}>
                Удалить строку
              </Menu.Item>
            </Menu>
          }
          trigger={['click']}
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
          <Button type="primary" icon={<PlusOutlined />}></Button>{' '}
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
    </div>
  );
};

export default Tasks;

// import React, { useState } from 'react';
// import {
//   Table,
//   Dropdown,
//   Menu,
//   Button,
//   Tag,
//   Select,
//   Space,
//   Modal,
//   message,
//   Checkbox,
// } from 'antd';
// import { LeftOutlined, MoreOutlined, PlusOutlined } from '@ant-design/icons';
// import './Tasks.scss';

// const { Option } = Select;

// const Tasks = () => {
//   const initialDataSource = [
//     {
//       key: '1',
//       name: 'Задача 1',
//       sprint: 'Sprint 1',
//       status: 'Новое',
//       deadline: '2024-12-05',
//       assignee: 'Иван Иванов',
//       tags: ['Frontend', 'Critical'],
//       children: [
//         {
//           key: '1-1',
//           name: 'Подзадача 1',
//           sprint: 'Sprint 1',
//           status: 'В работе',
//           deadline: '2024-12-06',
//           assignee: 'Петр Петров',
//           tags: ['Backend'],
//         },
//       ],
//     },
//     {
//       key: '2',
//       name: 'Задача 2',
//       sprint: 'Sprint 2',
//       status: 'На проверке',
//       deadline: '2024-12-10',
//       assignee: 'Анна Смирнова',
//       tags: ['Bugfix'],
//     },
//     {
//       key: '3',
//       name: 'Задача 3',
//       sprint: 'Sprint 2',
//       status: 'Выполнено',
//       deadline: '2024-12-12',
//       assignee: 'Алексей Павлов',
//       tags: ['Feature'],
//     },
//   ];

//   const [dataSource, setDataSource] = useState(initialDataSource);
//   const [visibleColumns, setVisibleColumns] = useState([
//     'name',
//     'sprint',
//     'status',
//     'deadline',
//     'assignee',
//     'tags',
//   ]);
//   const [isModalVisible, setIsModalVisible] = useState(false);
//   const [selectedTaskKey, setSelectedTaskKey] = useState(null);
//   const [parentTaskKey, setParentTaskKey] = useState(null);

//   const statuses = ['Новое', 'В работе', 'На проверке', 'Выполнено'];

//   // Обновление видимости столбцов
//   const handleColumnVisibilityChange = (column) => {
//     setVisibleColumns((prev) =>
//       prev.includes(column)
//         ? prev.filter((col) => col !== column)
//         : [...prev, column]
//     );
//   };

//   // Рекурсивное обновление статуса
//   const updateStatus = (data, taskKey, newStatus) => {
//     return data.map((item) => {
//       if (item.key === taskKey) {
//         return { ...item, status: newStatus };
//       }
//       if (item.children) {
//         return {
//           ...item,
//           children: updateStatus(item.children, taskKey, newStatus),
//         };
//       }
//       return item;
//     });
//   };

//   // Рекурсивное удаление задачи
//   const removeTask = (data, taskKey) => {
//     return data
//       .filter((item) => item.key !== taskKey)
//       .map((item) => {
//         if (item.children) {
//           return {
//             ...item,
//             children: removeTask(item.children, taskKey),
//           };
//         }
//         return item;
//       });
//   };

//   // Открытие модального окна
//   const handleMakeSubtask = (taskKey) => {
//     setSelectedTaskKey(taskKey);
//     setIsModalVisible(true);
//   };

//   // Подтверждение перемещения задачи
//   const handleConfirmMove = () => {
//     if (!parentTaskKey) {
//       message.error('Выберите родительскую задачу');
//       return;
//     }
//     if (selectedTaskKey === parentTaskKey) {
//       message.error('Задача не может быть подзадачей самой себя');
//       return;
//     }

//     const { updatedChildren, removedTask } = removeTask(
//       dataSource,
//       selectedTaskKey
//     );
//     const updatedData = addTaskToParent(
//       updatedChildren,
//       removedTask,
//       parentTaskKey
//     );

//     setDataSource(updatedData);
//     setIsModalVisible(false);
//     setParentTaskKey(null);
//     message.success('Задача успешно стала подзадачей!');
//   };

//   // Закрытие модального окна
//   const handleCancel = () => {
//     setIsModalVisible(false);
//     setParentTaskKey(null);
//   };

//   // Рекурсивное добавление задачи
//   const addTaskToParent = (data, task, parentKey) => {
//     return data.map((item) => {
//       if (item.key === parentKey) {
//         const updatedChildren = item.children
//           ? [...item.children, task]
//           : [task];
//         return { ...item, children: updatedChildren };
//       }
//       if (item.children) {
//         return {
//           ...item,
//           children: addTaskToParent(item.children, task, parentKey),
//         };
//       }
//       return item;
//     });
//   };

//   const columnsConfig = [
//     {
//       title: 'Название',
//       dataIndex: 'name',
//       key: 'name',
//       render: (text) => <strong>{text}</strong>,
//     },
//     {
//       title: 'Спринт',
//       dataIndex: 'sprint',
//       key: 'sprint',
//     },
//     {
//       title: 'Статус',
//       dataIndex: 'status',
//       key: 'status',
//       render: (status, record) => (
//         <Select
//           value={status}
//           style={{ width: 120 }}
//           onChange={(value) => {
//             const updatedData = updateStatus(dataSource, record.key, value);
//             setDataSource(updatedData);
//           }}
//         >
//           {statuses.map((statusOption) => (
//             <Option key={statusOption} value={statusOption}>
//               {statusOption}
//             </Option>
//           ))}
//         </Select>
//       ),
//     },
//     {
//       title: 'Действия',
//       key: 'actions',
//       render: (_, record) => (
//         <Dropdown
//           overlay={
//             <Menu>
//               <Menu.Item onClick={() => handleMakeSubtask(record.key)}>
//                 Сделать подзадачей
//               </Menu.Item>
//               <Menu.Item
//                 onClick={() =>
//                   setDataSource(removeTask(dataSource, record.key))
//                 }
//               >
//                 Удалить задачу
//               </Menu.Item>
//             </Menu>
//           }
//           trigger={['click']}
//         >
//           <Button icon={<MoreOutlined />} />
//         </Dropdown>
//       ),
//     },
//     {
//       title: (
//         <Dropdown
//           overlay={
//             <Menu>
//               {[
//                 { key: 'name', label: 'Название' },
//                 { key: 'sprint', label: 'Спринт' },
//                 { key: 'status', label: 'Статус' },
//                 { key: 'deadline', label: 'Дедлайн' },
//                 { key: 'assignee', label: 'Исполнитель' },
//                 { key: 'tags', label: 'Тэги' },
//               ].map(({ key, label }) => (
//                 <Menu.Item key={key}>
//                   <Checkbox
//                     checked={visibleColumns.includes(key)}
//                     onChange={() => handleColumnVisibilityChange(key)}
//                   >
//                     {label}
//                   </Checkbox>
//                 </Menu.Item>
//               ))}
//             </Menu>
//           }
//           trigger={['click']}
//         >
//           <Button icon={<MoreOutlined />} />
//         </Dropdown>
//       ),
//       key: 'columnsVisibility',
//     },
//   ];

//   const columns = columnsConfig.filter(
//     (col) => visibleColumns.includes(col.key) || col.key === 'actions'
//   );

//   const handleStatusSort = () => {
//     const statusIndex = (status) => statuses.indexOf(status);

//     const sortData = (data) =>
//       [...data]
//         .sort((a, b) => {
//           const comparison = statusIndex(a.status) - statusIndex(b.status);
//           return filterDirection === 'asc' ? comparison : -comparison;
//         })
//         .map((item) => ({
//           ...item,
//           children: item.children ? sortData(item.children) : undefined,
//         }));

//     const sortedData = sortData(dataSource);
//     setDataSource(sortedData);
//     setFilterDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
//   };

//   return (
//     <div className="Tasks">
//       <div className="Tasks-Header">
//         <div className="Tasks-Header-Heading">
//           <div>
//             <p>Название проекта тестовое</p>
//             <h2>{<LeftOutlined />} Все задачи</h2>
//           </div>
//           <Button type="primary" icon={<PlusOutlined />}></Button>{' '}
//         </div>
//         <div className="Tasks-Header-Status">
//           <Button onClick={handleStatusSort}>Сортировать</Button>
//         </div>
//         <div className="Tasks-Header-Search">{/* <p>Поиск</p> */}</div>
//         <div className="Tasks-Header-Buttons">
//           <Button type="default">Гант</Button>
//           <Button type="default">Канбан</Button>
//           <Button type="primary">Список</Button>
//         </div>
//       </div>
//       <Table
//         columns={columns}
//         dataSource={dataSource}
//         rowKey="key"
//         expandable={{
//           childrenColumnName: 'children',
//           rowExpandable: (record) => !!record.children,
//         }}
//       />
//       <Modal
//         title="Выберите родительскую задачу"
//         visible={isModalVisible}
//         onOk={handleConfirmMove}
//         onCancel={handleCancel}
//         okText="Подтвердить"
//         cancelText="Отмена"
//       >
//         <Select
//           style={{ width: '100%' }}
//           placeholder="Выберите задачу"
//           onChange={(value) => setParentTaskKey(value)}
//         >
//           {dataSource
//             .filter((item) => item.key !== selectedTaskKey) // Исключаем перемещаемую задачу
//             .map((item) => (
//               <Option key={item.key} value={item.key}>
//                 {item.name}
//               </Option>
//             ))}
//         </Select>
//       </Modal>
//     </div>
//   );
// };

// export default Tasks;
