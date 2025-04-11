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
  message, Form, Progress, Card,

} from 'antd';
import moment from 'moment';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { useUpdateTaskMutation } from 'Features/Auth/api/tasksApiSlice.ts';
import "./TaskCard.css";
import {
  useGetCheckListsByTaskQuery,
} from 'Features/Auth/api/CheckListApiSlice.ts';
import TaskChecklist from 'Pages/Tasks/TaskCard/TaskChecklist.tsx';
import TaskComments from 'Pages/Tasks/TaskCard/TaskComments.tsx';
//import { getCurrentUserId } from 'Features/utils/auth.ts';



const { Option } = Select;

const TaskCard = ({ selectedTask, visible, onClose, assignees, stages }) => {
  const [formData, setFormData] = useState(selectedTask);
  const [updateTask] = useUpdateTaskMutation(); // API для обновления задачи
  const id = selectedTask?.key ? selectedTask.key : null;
  const [editingDeadline, setEditingDeadline] = useState(false);
  //const currentUserId = getCurrentUserId();

  // Чек-листы
  const { data: checkLists, refetch: refetchCheckLists } = useGetCheckListsByTaskQuery(id, {
    skip: !id, // Пропуск запроса, если id нет
  });


  useEffect(() => {
    if (selectedTask) {
      setFormData(selectedTask);
      refetchCheckLists();
    }
  }, [selectedTask]);

  const handleInputChange = async (field, value) => {
    let updatedData = {
      ...formData,
      [field]: value,
    };

    // Преобразуем дату, если есть
    if (updatedData.end) {
      const parsedDate = moment(updatedData.end, moment.ISO_8601, true);
      updatedData.end = parsedDate.isValid()
        ? parsedDate.toISOString()
        : moment(updatedData.end, "YYYY-MM-DD").toISOString();
    }

    // Обновляем локально
    setFormData(updatedData );

    let cleanedData = {};
    if (field == "stage")
      cleanedData = { status: value.id }
    if (field == "assignee")
      cleanedData = {responsible_user: value.user_id}
    if (field == "name")
      cleanedData = {name: value}
    if (field == "end")
      cleanedData = {end: value}

    try {
      await updateTask({ id: formData.key, data: cleanedData }).unwrap();
      message.success("Задача обновлена");
    } catch (error) {
      console.error("Ошибка:", error);
      message.error("Ошибка при обновлении задачи");
    }
  };

  return (
    <Modal
      className="task-modal"
      title="Редактирование задачи"
      visible={visible}
      onCancel={onClose}
      footer={[]}
    >
      {formData && (
        <Descriptions column={1} bordered>
          <Descriptions.Item label="Название">
            <Input
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
            />
          </Descriptions.Item>

          <Descriptions.Item label="Проект">{formData.sprint}</Descriptions.Item>

          <Descriptions.Item label="Статус">
            <Select
              value={formData.stage.id}
              style={{ width: "100%" }}
              onChange={(value) =>
                handleInputChange(
                  "stage",
                  stages.find((a) => a.id === value)
                )
              }
              onClick={(e) => e.stopPropagation()}
            >
              {stages.map((statusOption) => (
                <Option key={statusOption.id} value={statusOption.id}>
                  {statusOption.name}
                </Option>
              ))}
            </Select>
          </Descriptions.Item>


          <Descriptions.Item label="Дедлайн">
            {editingDeadline ? (
              <DatePicker
                style={{ width: "100%" }}
                onChange={(date) => {
                  const isoString = date?.format("YYYY-MM-DD");
                  handleInputChange("end", isoString);
                  setEditingDeadline(false); // Скрыть после выбора
                }}
              />
            ) : (
              <>
              {formData.end}
                <Button
                  type="link"
                  onClick={() => setEditingDeadline(true)}
                  style={{ marginLeft: 8, padding: 0 }}
                >
                  Изменить
                </Button>
              </>
            )}
          </Descriptions.Item>

          <Descriptions.Item label="Исполнитель">
            <Select
              value={formData.assignee?.user_id}
              style={{ width: "100%" }}
              onChange={(value) =>
                handleInputChange(
                  "assignee",
                  assignees.find((a) => a.user_id === value)
                )
              }
              placeholder="Выберите исполнителя"
            >
              {assignees.map((user) => (
                <Option key={user.user_id} value={user.user_id}>
                  {user.surname} {user.name}
                </Option>
              ))}
            </Select>
          </Descriptions.Item>

          <Descriptions.Item label="Чек-листы">
            <TaskChecklist taskId={formData?.key} assignees={assignees} />
          </Descriptions.Item>

          <Descriptions.Item label="Комментарии">
            <TaskComments taskId={formData?.key} currentUserId={1} />
          </Descriptions.Item>

        </Descriptions>
      )}
    </Modal>
  );
};

export default TaskCard;