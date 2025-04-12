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
import {
  EditOutlined,
  CalendarOutlined,
  UserOutlined,
  CheckOutlined,
  CloseOutlined, DeleteOutlined,
} from '@ant-design/icons';
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

  const handleUpdateCheckListItemField = async (itemId: number, field: 'datetime' | 'responsible' | 'description', value: any) => {
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

  const [editingItemId, setEditingItemId] = useState<number | null>(null);
  const [editingField, setEditingField] = useState<'description' | 'datetime' | 'responsible' | null>(null);
  const [editedValue, setEditedValue] = useState<any>('');

  const startEditing = (itemId: number, field: 'description' | 'datetime' | 'responsible', value: any) => {
    setEditingItemId(itemId);
    setEditingField(field);
    setEditedValue(value);
  };

  const resetEditing = () => {
    setEditingItemId(null);
    setEditingField(null);
    setEditedValue('');
  };

  const [editingCheckListId, setEditingCheckListId] = useState<number | null>(null);
  const [editedTitle, setEditedTitle] = useState('');

  const handleUpdateCheckListTitle = async (id: number, title: string) => {
    try {
      await updateCheckList({ checkListId: id, data: { description: title } }).unwrap();
      refetchCheckLists();
    } catch {
      message.error('Ошибка обновления названия чек-листа');
    }
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
              title={
                editingCheckListId === checkList.id ? (
                  <Input
                    value={editedTitle}
                    onChange={(e) => setEditedTitle(e.target.value)}
                    onBlur={() => {
                      handleUpdateCheckListTitle(checkList.id, editedTitle);
                      setEditingCheckListId(null);
                    }}
                    autoFocus
                  />
                ) : (
                  <div
                    onClick={() => {
                      setEditedTitle(checkList.description);
                      setEditingCheckListId(checkList.id);
                    }}
                  >
                    {checkList.description}
                  </div>
                )
              }
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
                <Droppable droppableId={`${checkList.id}`}>
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
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                padding: 8,
                                marginBottom: 8,
                                border: '1px solid #eee',
                                borderRadius: 4,
                                background: '#fafafa',
                                ...provided.draggableProps.style,
                              }}
                            >
                              <Checkbox
                                checked={item.is_completed}
                                onChange={() => handleToggleCheckListItem(item)}
                                style={{ marginRight: 8 }}
                              />

                              {/* Центр — описание */}
                              <div style={{ flex: 1 }}>
                                {editingItemId === item.id && editingField === 'description' ? (
                                  <Input
                                    size="small"
                                    value={editedValue}
                                    onChange={(e) => setEditedValue(e.target.value)}
                                    onBlur={() => {
                                      handleUpdateCheckListItemField(item.id, 'description', editedValue);
                                      resetEditing();
                                    }}
                                    autoFocus
                                    style={{ maxWidth: 200 }}
                                  />
                                ) : (
                                  <div onClick={() => startEditing(item.id, 'description', item.description)}>
                                    {item.description || 'Без названия'}
                                  </div>
                                )}
                              </div>

                              {/* Правая часть */}
                              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                                {/* Ответственный */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                  {editingItemId === item.id && editingField === 'responsible' ? (
                                    <Select
                                      size="small"
                                      style={{ width: 140 }}
                                      value={item.responsible || undefined}
                                      onChange={(value) => {
                                        handleUpdateCheckListItemField(item.id, 'responsible', value);
                                        resetEditing();
                                      }}
                                      onBlur={resetEditing}
                                      autoFocus
                                    >
                                      {assignees.map((user) => (
                                        <Select.Option key={user.user_id} value={user.user_id}>
                                          {user.surname} {user.name}
                                        </Select.Option>
                                      ))}
                                    </Select>
                                  ) : (
                                    <div onClick={() => startEditing(item.id, 'responsible', item.responsible)}>
                                      {assignees.find(user => user.user_id === item.responsible)?.surname || 'Не назначен'}
                                    </div>
                                  )}
                                  <UserOutlined
                                    onClick={() => startEditing(item.id, 'responsible', item.responsible)}
                                    style={{ color: '#5C8DB9', cursor: 'pointer' }}
                                  />
                                </div>

                                {/* Дата */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                  {editingItemId === item.id && editingField === 'datetime' ? (
                                    <DatePicker
                                      size="small"
                                      onChange={(date) => {
                                        handleUpdateCheckListItemField(item.id, 'datetime', date ? date.format('YYYY-MM-DD') : null);
                                        resetEditing();
                                      }}
                                      autoFocus
                                    />
                                  ) : (
                                    <div onClick={() => startEditing(item.id, 'datetime', item.datetime)}>
                                      {item.datetime ? moment(item.datetime).format('DD.MM.YYYY') : 'Без срока'}
                                    </div>
                                  )}
                                  <CalendarOutlined
                                    onClick={() => startEditing(item.id, 'datetime', item.datetime)}
                                    style={{ color: '#5C8DB9', cursor: 'pointer' }}
                                  />
                                </div>

                                {/* Удалить */}
                                <Button
                                  type="text"
                                  icon={<DeleteOutlined />}
                                  onClick={() => handleDeleteCheckListItem(item.id)}
                                  style={{ color: '#ff4d4f' }}
                                />
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

              {/* Добавление нового пункта */}
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
                    style={{ backgroundColor: '#5C8DB9', color: 'white' }}
                  >
                    Добавить пункт
                  </Button>
                </div>
              ) : (
                <Button
                  type="primary"
                  onClick={() => setAddingItemForChecklistId(checkList.id)}
                  block
                  style={{ marginTop: 10, backgroundColor: '#5C8DB9', color: 'white' }}
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
