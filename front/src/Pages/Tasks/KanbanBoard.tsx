import React, { useState, useEffect } from 'react';
import { Button, Input, message, Modal, Dropdown, Menu } from 'antd';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { DeleteOutlined, EllipsisOutlined, PlusOutlined, MenuOutlined } from '@ant-design/icons';
import moment from 'moment';
import TaskCard from './TaskCard/TaskCard';

import {
  useCreateStageMutation,
  useUpdateStageMutation,
  useDeleteStageMutation,
  Stage,
} from 'Features/ApiSlices/stageApiSlice';
import { useUpdateTaskMutation } from 'Features/ApiSlices/tasksApiSlice';

import './KanbanBoard.scss';

interface FullTask {
  key: string;
  name: string;
  sprint: string;
  status: string;
  stage: Stage;
  end: string;
  assignee: { user_id: number; surname: string; name: string; patronymic: string };
  author: any;
  performers: any[];
  children?: FullTask[];
  parent_task: number;
}

interface DisplayTask {
  id: string;
  title: string;
  executor: string;
  startDate: string;
  endDate: string;
  subtasks: number;
}

interface ColumnData {
  id: string;
  title: string;
  color: string;
  taskIds: string[];
}

interface DataState {
  displayTasks: Record<string, DisplayTask>;
  fullTasks: Record<string, FullTask>;
  columns: Record<string, ColumnData>;
  columnOrder: string[];
}

export default function KanbanBoard({
                                      stages,
                                      tasks,
                                      refetchTasks,
                                      projectId,
                                      assignees,
                                    }: {
  stages: (Stage & { taskIds: string[] })[];
  tasks: FullTask[];
  projectId: number;
  assignees: any[];
}) {
  // RTK Query mutations:
  const [createStage] = useCreateStageMutation();
  const [updateStage] = useUpdateStageMutation();
  const [deleteStage] = useDeleteStageMutation();
  const [updateTask] = useUpdateTaskMutation();

  // State for modals & selection:
  const [dataState, setDataState] = useState<DataState>({ displayTasks: {}, fullTasks: {}, columns: {}, columnOrder: [] });
  const [isCreateModal, setIsCreateModal] = useState(false);
  const [isEditModal, setIsEditModal] = useState(false);
  const [isDeleteModal, setIsDeleteModal] = useState(false);
  const [selectedStage, setSelectedStage] = useState<ColumnData | null>(null);
  const [newStageName, setNewStageName] = useState('');
  const [newStageColor, setNewStageColor] = useState('');
  const [selectedTaskKey, setSelectedTaskKey] = useState<string | null>(null);
  const [isTaskModal, setIsTaskModal] = useState(false);

  // Цвета для выбора:
  const colorMap: Record<string,string> = {
    'Зелёный':'#2ECC71','Жёлтый':'#F1C40F','Красный':'#E74C3C','Серый':'#95A5A6'
  };

  // 1) Подготовка данных при изменении props.stages / props.tasks
  useEffect(() => {
    setDataState(prev => {
      // Если количество задач или стадий реально поменялось — пересоздаём
      const prevTaskKeys = Object.keys(prev.fullTasks);
      const newTaskKeys = tasks.map(t => t.key);

      const tasksChanged = prevTaskKeys.length !== newTaskKeys.length ||
        !prevTaskKeys.every(key => newTaskKeys.includes(key));

      const stagesChanged = prev.columnOrder.length !== stages.length ||
        !prev.columnOrder.every(id => stages.some(s => s.id === id));

      if (!tasksChanged && !stagesChanged) {
        return prev; // 👈 ничего не меняем!
      }

      // Иначе реально пересобираем состояние:
      const fullTasks: Record<string, FullTask> = {};
      tasks.forEach(t => { if (t.key) fullTasks[t.key] = t; });

      const displayTasks: Record<string, DisplayTask> = {};
      tasks.forEach(t => {
        if (!t.key) return;
        displayTasks[t.key] = {
          id: t.key,
          title: t.name,
          executor: t.assignee
            ? `${t.assignee.surname} ${t.assignee.name}`
            : 'Без исполнителя',
          startDate: t.end
            ? moment(t.end).format('DD.MM.YYYY')
            : 'Нет срока',
          endDate: t.end
            ? moment(t.end).format('DD.MM.YYYY')
            : 'Нет срока',
          subtasks: t.children?.length || 0,
        };
      });

      const columns: Record<string, ColumnData> = {};
      stages.forEach(s => {
        columns[s.id] = {
          id: s.id,
          title: s.name,
          color: s.color,
          taskIds: s.taskIds,
        };
      });

      const columnOrder = stages.map(s => s.id);

      return { fullTasks, displayTasks, columns, columnOrder };
    });
  }, [stages, tasks]);

  // 2) Обработчики открытия модалей стадий
  const openEditStage = (col: ColumnData) => {
    setSelectedStage(col);
    setNewStageName(col.title);
    setNewStageColor(col.color);
    setIsEditModal(true);
  };
  const openDeleteStage = (col: ColumnData) => {
    setSelectedStage(col);
    setIsDeleteModal(true);
  };

  // 3) CRUD для стадий
  const handleCreateStage = async () => {
    try {
      const res = await createStage({ project: projectId, name: newStageName, color: newStageColor }).unwrap();
      setDataState(d => ({
        ...d,
        columns: {
          ...d.columns,
          [res.id]: { id: res.id, title: res.name, color: res.color, taskIds: [] }
        },
        columnOrder: [...d.columnOrder, res.id]
      }));
      setIsCreateModal(false);
      setNewStageName('');
      setNewStageColor('');
    } catch {
      message.error('Не удалось создать статус');
    }
  };
  const handleEditStage = async () => {
    if (!selectedStage) return;
    try {
      await updateStage({ id: selectedStage.id, data: { project: projectId, name: newStageName, color: newStageColor } }).unwrap();
      setDataState(d => {
        const col = { ...d.columns[selectedStage.id], title: newStageName, color: newStageColor };
        return { ...d, columns: { ...d.columns, [selectedStage.id]: col } };
      });
      setIsEditModal(false);
    } catch {
      message.error('Не удалось изменить статус');
    }
  };
  const handleDeleteStage = async () => {
    if (!selectedStage) return;
    try {
      await deleteStage(selectedStage.id).unwrap();
      setDataState(d => {
        const { [selectedStage.id]:_, ...rest } = d.columns;
        return {
          ...d,
          columns: rest,
          columnOrder: d.columnOrder.filter(id=> id!==selectedStage.id)
        };
      });
      setIsDeleteModal(false);
    } catch {
      message.error('Не удалось удалить статус');
    }
  };

  // 4) Открытие TaskCard
  const handleTaskClick = (taskKey: string) => {
    setSelectedTaskKey(taskKey);
    setIsTaskModal(true);
  };

  // 5) DnD: перетаскивание карточек
  const onDragEnd = async (result:any) => {
    const { source, destination, draggableId } = result;
    if (!destination) return;
    // 5.1) Если в ту же колонку — просто reordering
    if (destination.droppableId === source.droppableId) {
      const col = dataState.columns[source.droppableId];
      const newIds = Array.from(col.taskIds);
      newIds.splice(source.index,1);
      newIds.splice(destination.index,0,draggableId);
      setDataState(d => ({
        ...d,
        columns: { ...d.columns, [col.id]: { ...col, taskIds: newIds } }
      }));
      return;
    }
    // 5.2) Миграция между колонками
    const startCol = dataState.columns[source.droppableId];
    const finishCol= dataState.columns[destination.droppableId];
    const newStartIds = Array.from(startCol.taskIds);
    newStartIds.splice(source.index,1);
    const newFinishIds = Array.from(finishCol.taskIds);
    newFinishIds.splice(destination.index,0, draggableId);

    setDataState(d=>({
      ...d,
      columns: {
        ...d.columns,
        [startCol.id]: {...startCol, taskIds: newStartIds},
        [finishCol.id]: {...finishCol, taskIds: newFinishIds},
      }
    }));

    // 5.3) Обновление на сервере

    try {
      await updateTask({ id: +draggableId, data: { status: finishCol.id } }).unwrap();
      await refetchTasks();
    } catch {
      message.error('Не удалось сохранить новый статус задачи');
    }
  };

  // 6) Рендер колонки с кнопкой «⋮»
  const renderHeader = (col: ColumnData) => {
    const menu = (
      <Menu>
        <Menu.Item key="1" onClick={()=>openEditStage(col)}>Редактировать</Menu.Item>
        <Menu.Item key="2" onClick={()=>openDeleteStage(col)}>Удалить</Menu.Item>
      </Menu>
    );
    return (
      <div className="kanban-column-header">
        <div className="header-content">
          <span className="column-title">{col.title}</span>
          <Dropdown overlay={menu} trigger={['click']}>
            <EllipsisOutlined className="column-menu-icon" />
          </Dropdown>
        </div>
        <div
          className="column-color-line"
          style={{ backgroundColor: colorMap[col.color] || '#ccc' }}
        />
      </div>
    );
  };

  return (
    <>
      <div className="kanban-header">
        <Button icon={<PlusOutlined />} onClick={()=>setIsCreateModal(true)}>
          Добавить статус
        </Button>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="kanban-board">
          {dataState.columnOrder.map(colId => {
            const col = dataState.columns[colId];
            return (
              <Droppable droppableId={col.id} key={col.id}>
                {(provided) => (
                  <div
                    className="kanban-column"
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                  >
                    {renderHeader(col)}
                    <div className="kanban-tasks">
                      {col.taskIds.map((taskKey, idx) => {
                        const t = dataState.displayTasks[taskKey];
                        if (!t) return null;
                        return (
                          <Draggable draggableId={t.id} index={idx} key={t.id}>
                            {(prov, snap) => (
                              <div
                                className={`kanban-task ${snap.isDragging?'dragging':''}`}
                                ref={prov.innerRef}
                                {...prov.draggableProps}
                              >
                                {/* ячейка drag-handle */}
                                <div {...prov.dragHandleProps} className="task-drag-handle">
                                  <MenuOutlined />
                                </div>
                                <div className="task-content" onClick={()=>handleTaskClick(t.id)}>
                                  <div className="task-title">{t.title}</div>
                                  <div className="task-subtasks">⇳ {t.subtasks}</div>
                                  <div className="task-date">{t.startDate} – {t.endDate}</div>
                                  <div className="task-executor">{t.executor}</div>
                                </div>
                              </div>
                            )}
                          </Draggable>
                        )
                      })}
                      {provided.placeholder}
                    </div>
                  </div>
                )}
              </Droppable>
            )
          })}
        </div>
      </DragDropContext>

      {/* Модали для стадий */}
      <Modal
        title="Новый статус"
        open={isCreateModal}
        onOk={handleCreateStage}
        onCancel={()=>setIsCreateModal(false)}
        okText="Создать"
        cancelText="Отмена"
      >
        <Input
          placeholder="Название"
          value={newStageName}
          onChange={e=>setNewStageName(e.target.value)}
        />
        <div className="color-picker">
          {Object.entries(colorMap).map(([name,hex])=>(
            <div
              key={name}
              className={`color-circle ${newStageColor===name?'selected':''}`}
              style={{background:hex}}
              onClick={()=>setNewStageColor(name)}
            />
          ))}
        </div>
      </Modal>

      <Modal
        title="Редактировать статус"
        open={isEditModal}
        onOk={handleEditStage}
        onCancel={()=>setIsEditModal(false)}
        okText="Сохранить"
        cancelText="Отмена"
      >
        <Input
          placeholder="Название"
          value={newStageName}
          onChange={e=>setNewStageName(e.target.value)}
        />
        <div className="color-picker">
          {Object.entries(colorMap).map(([name,hex])=>(
            <div
              key={name}
              className={`color-circle ${newStageColor===name?'selected':''}`}
              style={{background:hex}}
              onClick={()=>setNewStageColor(name)}
            />
          ))}
        </div>
      </Modal>

      <Modal
        title={<DeleteOutlined style={{ color:'#e74c3c', fontSize:24 }}/>}
        open={isDeleteModal}
        onOk={handleDeleteStage}
        onCancel={()=>setIsDeleteModal(false)}
        okText="Удалить"
        cancelText="Отмена"
      >
        <p>Вы уверены, что хотите удалить этот статус?</p>
      </Modal>

      {/* Модалка задачи */}
      {selectedTaskKey && (
        <TaskCard
          visible={isTaskModal}
          selectedTask={dataState.fullTasks[selectedTaskKey]!}
          onClose={()=>{ setIsTaskModal(false); setSelectedTaskKey(null); }}
          stages={stages}
          assignees={assignees}
          onUpdate={(upd) => {
            //  после сохранения в карточке сразу обновляем отображение
            setDataState(d => ({
              ...d,
              displayTasks: {
                ...d.displayTasks,
                [upd.key]: {
                  ...d.displayTasks[upd.key],
                  title: upd.name,
                  executor: `${upd.assignee.surname} ${upd.assignee.name}`,
                  startDate: upd.end ? moment(upd.end).format('DD.MM.YYYY') : 'Нет срока',
                  endDate: upd.end ? moment(upd.end).format('DD.MM.YYYY') : 'Нет срока',
                }
              },
              fullTasks: {
                ...d.fullTasks,
                [upd.key]: upd
              }
            }));
          }}
        />
      )}
    </>
  );
};

