import React, { useEffect, useState } from 'react';
import {
  List,
  Button,
  Card,
  Input,
  Progress,
  Checkbox,
  DatePicker,
  Select,
  message, Popover,
} from 'antd';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import {
  useGetCheckListsByTaskQuery,
  useCreateCheckListMutation,
  useUpdateCheckListMutation,
  useDeleteCheckListMutation,
  useGetCheckListItemsQuery,
  useCreateCheckListItemMutation,
  useUpdateCheckListItemMutation,
  useDeleteCheckListItemMutation,
} from 'Features/ApiSlices/checkListApiSlice';
import moment from 'moment';

const { Option } = Select;
import { Dropdown, Menu, Divider } from 'antd';
import { EllipsisOutlined } from '@ant-design/icons';

const TaskChecklist = ({ taskId, assignees }) => {
  const { data: checkLists, refetch: refetchCheckLists } = useGetCheckListsByTaskQuery(taskId, { skip: !taskId });
  const { data: checkListItems, refetch: refetchCheckListItems } = useGetCheckListItemsQuery(taskId, { skip: !taskId });

  const [createCheckList] = useCreateCheckListMutation();
  const [updateCheckList] = useUpdateCheckListMutation();
  const [deleteCheckList] = useDeleteCheckListMutation();
  const [createCheckListItem] = useCreateCheckListItemMutation();
  const [updateCheckListItem] = useUpdateCheckListItemMutation();
  const [deleteCheckListItem] = useDeleteCheckListItemMutation();

  const [newCheckListTitle, setNewCheckListTitle] = useState('');
  const [newItemValues, setNewItemValues] = useState({ description: '', deadline: null, assignee: null });
  const [addingItemForChecklistId, setAddingItemForChecklistId] = useState<number | null>(null);

  const refetchAll = async () => {
    await Promise.all([refetchCheckListItems(), refetchCheckLists()]);
  };

  const handleAddCheckList = async () => {
    try {
      await createCheckList({ taskId, data: { description: newCheckListTitle } }).unwrap();
      message.success('Чек-лист добавлен');
      setNewCheckListTitle('');
      refetchCheckLists();
    } catch {
      message.error('Ошибка добавления чек-листа');
    }
  };

  const handleDeleteCheckList = async (checkListId) => {
    try {
      await deleteCheckList(checkListId).unwrap();
      message.success('Чек-лист удален');
      refetchCheckLists();
    } catch {
      message.error('Ошибка удаления чек-листа');
    }
  };

  const handleUpdateCheckListItemField = async (itemId: number, field: 'datetime' | 'responsible', value: any) => {
    try {
      await updateCheckListItem({
        itemId: itemId,
        data: { [field]: value },
      }).unwrap();
      await Promise.all([refetchCheckListItems(), refetchCheckLists()]); // 👈 обновляем только пункты
    } catch {
      message.error('Ошибка обновления пункта чек-листа');
    }
  };

  const handleToggleCheckListItem = async (item) => {
    try {
      await updateCheckListItem({
        itemId: item.id,
        data: { is_completed: !item.is_completed },
      }).unwrap();
      await Promise.all([refetchCheckListItems(), refetchCheckLists()]);
    } catch {
      message.error('Ошибка обновления пункта чек-листа');
    }
  };


  const handleAddCheckListItem = async (checkListId: number) => {
    try {
      await createCheckListItem({
        checkListId,
        data: {
          checklist: checkListId,
          description: newItemValues.description,
          datetime: newItemValues.datetime,
          assignee: newItemValues.assignee,
          is_completed: false,
        },
      }).unwrap();
      setNewItemValues({ description: '', deadline: null, assignee: null });
      setAddingItemForChecklistId(null);
      await Promise.all([refetchCheckListItems(), refetchCheckLists()]);
    } catch {
      message.error('Ошибка при добавлении элемента');
    }
  };

  const handleDeleteCheckListItem = async (itemId) => {
    try {
      await deleteCheckListItem(itemId).unwrap();
      message.success('Пункт удален');
      await Promise.all([refetchCheckListItems(), refetchCheckLists()]);
    } catch {
      message.error('Ошибка удаления пункта');
    }
  };

  const handleDragEnd = (result, checkList) => {
    if (!result.destination) return;
    const items = Array.from(checkList.checklistItems);
    const [movedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, movedItem);
    // тут можно вызвать API, если порядок сохраняется на бэке
  };

  return (
    <>
      <List
        grid={{ gutter: 16, column: 1 }}
        dataSource={checkLists}
        renderItem={(checkList) => {
          const total = checkList.checklistItems.length;
          const completed = checkList.checklistItems.filter(i => i.is_completed).length;
          const percent = total ? Math.round((completed / total) * 100) : 0;

          return (
            <Card
              title={checkList.description}
              extra={
                <Button danger size="small" onClick={() => handleDeleteCheckList(checkList.id)}>
                  Удалить
                </Button>
              }
              style={{ marginBottom: 16 }}
              bodyStyle={{ padding: 16 }}
            >
              <Progress percent={percent} size="small" style={{ marginBottom: 10 }} />

              <DragDropContext onDragEnd={(result) => handleDragEnd(result, checkList)}>
                <Droppable droppableId={`checklist-${checkList.id}`}>
                  {(provided) => (
                    <div {...provided.droppableProps} ref={provided.innerRef}>
                      {checkList.checklistItems.map((item, index) => (
                        <Draggable key={item.id} draggableId={`${item.id}`} index={index}>
                          {(provided) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                marginBottom: 8,
                                padding: 8,
                                border: '1px solid #eee',
                                borderRadius: 4,
                                background: '#fafafa',
                                ...provided.draggableProps.style,
                              }}
                            >
                              <div style={{ flex: 1 }}>
                                <Checkbox
                                  checked={item.is_completed}
                                  onChange={() => handleToggleCheckListItem(item)}
                                >
                                  {item.description}
                                </Checkbox>

                                {/* Показываем дату и исполнителя, если есть */}
                                <div style={{ fontSize: 12, color: '#888', marginTop: 4 }}>
                                  {item.datetime && (
                                    <div>📅 {moment(item.datetime).format('DD.MM.YYYY')}</div>
                                  )}
                                  {item.responsible && (
                                    <div>
                                      👤 {
                                      assignees.find(user => user.user_id === item.responsible)?.surname
                                    } {
                                      assignees.find(user => user.user_id === item.responsible)?.name
                                    }
                                    </div>
                                  )}
                                </div>
                              </div>

                              <Popover
                                placement="bottomRight" // 👈 Отображается снизу
                                trigger="click"
                                overlayInnerStyle={{
                                  padding: 10,
                                  width: 220,
                                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
                                }}
                                content={
                                  <div onClick={(e) => e.stopPropagation()}>
                                    <Button
                                      danger
                                      size="small"
                                      onClick={() => handleDeleteCheckListItem(item.id)}
                                      style={{ width: '100%', marginBottom: 8 }}
                                    >
                                      🗑️ Удалить
                                    </Button>

                                    <DatePicker
                                      placeholder="Крайний срок"
                                      size="small"
                                      style={{ width: '100%', marginBottom: 8 }}
                                      onChange={(date) =>
                                        handleUpdateCheckListItemField(item.id, 'datetime', date ? date.format('YYYY-MM-DD') : null)
                                      }
                                    />

                                    <Select
                                      placeholder="Ответственный"
                                      size="small"
                                      value={item.responsible || undefined}
                                      style={{ width: '100%' }}
                                      onChange={(value) =>
                                        handleUpdateCheckListItemField(item.id, 'responsible', value)
                                      }
                                    >
                                      {assignees.map((user) => (
                                        <Select.Option key={user.user_id} value={user.user_id}>
                                          {user.surname} {user.name}
                                        </Select.Option>
                                      ))}
                                    </Select>
                                  </div>
                                }
                              >
                                <Button type="text" icon={<EllipsisOutlined />} />
                              </Popover>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>

              {checkList.checklistItems.length === 0 || addingItemForChecklistId === checkList.id ? (
                <div style={{ marginTop: 10 }}>
                  <Input
                    placeholder="Название пункта"
                    value={newItemValues.description}
                    onChange={(e) =>
                      setNewItemValues((prev) => ({ ...prev, description: e.target.value }))
                    }
                    style={{ marginBottom: 8 }}
                  />
                  <Button
                    type="primary"
                    block
                    onClick={() => handleAddCheckListItem(checkList.id)}
                  >
                    Добавить пункт
                  </Button>
                </div>
              ) : (
                <Button
                  type="dashed"
                  onClick={() => setAddingItemForChecklistId(checkList.id)}
                  block
                  style={{ marginTop: 10 }}
                >
                  Добавить пункт
                </Button>
              )}
            </Card>
          );
        }}
      />
      <div style={{ marginTop: '10px' }}>
        <Input
          placeholder="Название чек-листа"
          value={newCheckListTitle}
          onChange={(e) => setNewCheckListTitle(e.target.value)}
          style={{ marginBottom: 8 }}
        />
        <Button type="primary" onClick={handleAddCheckList} block>
          Создать чек-лист
        </Button>
      </div>
    </>
  );
};

export default TaskChecklist;
