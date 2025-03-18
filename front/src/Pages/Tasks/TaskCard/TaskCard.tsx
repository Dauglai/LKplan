import React, { useEffect, useState } from 'react';
import {
  Modal,
  Descriptions,
  Input,
  Select,
  DatePicker,
  Button,
  Checkbox,
  List,
  message, Form,

} from 'antd';
import moment from 'moment';
import { useUpdateTaskMutation } from 'Features/Auth/api/tasksApiSlice.ts';
import {
  useGetCheckListsByTaskQuery,
  useCreateCheckListMutation,
  useUpdateCheckListMutation,
  useDeleteCheckListMutation,
  useGetCheckListItemsQuery,
  useCreateCheckListItemMutation,
  useUpdateCheckListItemMutation,
  useDeleteCheckListItemMutation,
} from 'Features/Auth/api/CheckListApiSlice.ts';

const { Option } = Select;

const TaskCard = ({ selectedTask, visible, onClose, assignees, stages }) => {
  const [formData, setFormData] = useState(selectedTask || {});
  const [updateTask] = useUpdateTaskMutation(); // API для обновления задачи
  const id = selectedTask?.key ? selectedTask.key : null;

  // Чек-листы
  const { data: checkLists, refetch: refetchCheckLists } = useGetCheckListsByTaskQuery(id, {
    skip: !id, // Пропуск запроса, если id нет
  });
  const [createCheckList] = useCreateCheckListMutation();
  const [updateCheckList] = useUpdateCheckListMutation();
  const [deleteCheckList] = useDeleteCheckListMutation();

  // Пункты чек-листов
  const { data: checkListItems, refetch: refetchCheckListItems } = useGetCheckListItemsQuery(id, {
    skip: !id, // Пропуск запроса, если id нет
  });

  const safeCheckLists = Array.isArray(checkLists) ? checkLists : [];
  const safeCheckListItems = Array.isArray(checkListItems) ? checkListItems : [];


  const [createCheckListItem] = useCreateCheckListItemMutation();
  const [updateCheckListItem] = useUpdateCheckListItemMutation();
  const [deleteCheckListItem] = useDeleteCheckListItemMutation();

  useEffect(() => {
    if (selectedTask) {
      setFormData(selectedTask);
      //refetchCheckLists();
    }
  }, [selectedTask]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    try {
      await updateTask({ id: formData.id, data: formData }).unwrap();
      message.success('Задача обновлена');
      onClose();
    } catch (error) {
      message.error('Ошибка обновления задачи');
    }
  };

  const handleAddCheckList = async () => {
    try {
      await createCheckList({ taskId: id, data: { description: 'Новый чек-лист' } }).unwrap();
      message.success('Чек-лист добавлен');
      refetchCheckLists();
    } catch (error) {
      message.error('Ошибка добавления чек-листа');
    }
  };

  const handleUpdateCheckList = async (checkListId, data) => {
    try {
      await updateCheckList({ checkListId, data }).unwrap();
      refetchCheckLists();
    } catch (error) {
      message.error('Ошибка обновления чек-листа');
    }
  };

  const handleDeleteCheckList = async (checkListId) => {
    try {
      await deleteCheckList(checkListId).unwrap();
      message.success('Чек-лист удален');
      refetchCheckLists();
    } catch (error) {
      message.error('Ошибка удаления чек-листа');
    }
  };

  const handleToggleCheckListItem = async (item) => {
    try {
      await updateCheckListItem({ itemId: item.id, data: { is_checked: !item.is_checked } }).unwrap();
      refetchCheckListItems();
    } catch (error) {
      message.error('Ошибка обновления пункта чек-листа');
    }
  };

  const handleAddCheckListItem = async (checkListId) => {
    try {
      await createCheckListItem({ checkListId, data: { description: 'Новый пункт', is_checked: false } }).unwrap();
      refetchCheckListItems();
    } catch (error) {
      message.error('Ошибка добавления пункта');
    }
  };

  const handleDeleteCheckListItem = async (itemId) => {
    try {
      await deleteCheckListItem(itemId).unwrap();
      message.success('Пункт удален');
      refetchCheckListItems();
    } catch (error) {
      message.error('Ошибка удаления пункта');
    }
  };

  return (
    <Modal
      title="Редактирование задачи"
      visible={visible}
      onCancel={onClose}
      footer={[
        <Button key="cancel" onClick={onClose}>
          Отмена
        </Button>,
        <Button key="save" type="primary" onClick={handleSave}>
          Сохранить
        </Button>,
      ]}
    >
      {formData && (
        <Descriptions column={1} bordered>
          <Descriptions.Item label="Название">
            <Input value={formData.name} onChange={(e) => handleInputChange('name', e.target.value)} />
          </Descriptions.Item>

          <Descriptions.Item label="Проект">{formData.sprint}</Descriptions.Item>

          <Descriptions.Item label="Статус">
            <Select
              value={formData.stage}
              style={{ width: '100%' }}
              onChange={(value) => handleInputChange('stage', value)}
            >
              {stages.map((statusOption) => (
                <Option key={statusOption.id} value={statusOption.id}>
                  {statusOption.name}
                </Option>
              ))}
            </Select>
          </Descriptions.Item>

          <Descriptions.Item
            name="deadline"
            label="Дедлайн"
            rules={[{ required: true, message: 'Выберите дату дедлайна' }]}
          >
            <DatePicker style={{ width: '100%' }} />
          </Descriptions.Item>

          <Descriptions.Item label="Исполнитель">
            <Select
              value={formData.assignee?.id}
              style={{ width: '100%' }}
              onChange={(value) => handleInputChange('assignee', assignees.find((a) => a.id === value))}
            >
              {assignees.map((user) => (
                <Option key={user.id} value={user.id}>
                  {user.surname} {user.name}
                </Option>
              ))}
            </Select>
          </Descriptions.Item>

          <Descriptions.Item label="Чек-листы">
            <List
              dataSource={safeCheckLists}
              renderItem={(checkList) => (
                <List.Item>
                  <Checkbox checked={checkList.is_completed} onChange={() => handleUpdateCheckList(checkList.id, { is_completed: !checkList.is_completed })}>
                    {checkList.description}
                  </Checkbox>
                  <Button type="link" onClick={() => handleDeleteCheckList(checkList.id)}>
                    Удалить
                  </Button>
                  <List
                    dataSource={safeCheckListItems}
                    renderItem={(item) => (
                      <List.Item>
                        <Checkbox checked={item.is_checked} onChange={() => handleToggleCheckListItem(item)}>
                          {item.description}
                        </Checkbox>
                        <Button type="link" onClick={() => handleDeleteCheckListItem(item.id)}>
                          Удалить
                        </Button>
                      </List.Item>
                    )}
                  />
                  <Button type="dashed" onClick={() => handleAddCheckListItem(checkList.id)}>
                    Добавить пункт
                  </Button>
                </List.Item>
              )}
            />
            <Button type="dashed" style={{ width: '100%', marginTop: '10px' }} onClick={handleAddCheckList}>
              Добавить чек-лист
            </Button>
          </Descriptions.Item>
        </Descriptions>
      )}
    </Modal>
  );
};

export default TaskCard;