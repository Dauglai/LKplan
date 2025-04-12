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
import { useUpdateTaskMutation } from 'Features/ApiSlices/tasksApiSlice';
import "./TaskCard.css";
import {
  useGetCheckListsByTaskQuery,
} from 'Features/ApiSlices/checkListApiSlice';
import TaskChecklist from 'Pages/Tasks/TaskCard/TaskChecklist.tsx';
import TaskComments from 'Pages/Tasks/TaskCard/TaskComments.tsx';
import { CalendarOutlined } from '@ant-design/icons';
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
    if (field == "start")
      cleanedData = {start: value}
    if (field == "description")
      cleanedData = {description: value}

    try {
      await updateTask({ id: formData.key, data: cleanedData }).unwrap();
      if (field != "description" || field == "name")
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
        <div className="task-form-content">

          <div className="task-block">
            <h3>Название</h3>
            <Input
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
            />
          </div>

          <div className="task-block">
            <h3>Описание</h3>
            <Input.TextArea
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              rows={3}
            />
          </div>

          <div className="task-row">
            <div className="task-col">
              <h3>Дата начала</h3>
              <DatePicker
                style={{ width: "100%" }}
                onChange={(date) =>
                  handleInputChange("start", date?.format("YYYY-MM-DD"))
                }
              />
            </div>
            <div className="task-col">
              <h3>Дата окончания</h3>
              <DatePicker
                style={{ width: "100%" }}
                onChange={(date) =>
                  handleInputChange("end", date?.format("YYYY-MM-DD"))
                }
              />
            </div>
          </div>

          {/* <div className="task-row">
        <div className="task-col">
          <h3>Ответственный</h3>
          <Select placeholder="Выберите" style={{ width: "100%" }} />
        </div>
        <div className="task-col">
          <h3>Исполнители</h3>
          <Select mode="multiple" placeholder="Выберите" style={{ width: "100%" }} />
        </div>
      </div> */}

          <div className="task-block">
            <h3>Статус</h3>
            <Select
              value={formData.stage.id}
              style={{ width: "100%" }}
              onChange={(value) =>
                handleInputChange(
                  "stage",
                  stages.find((a) => a.id === value)
                )
              }
            >
              {stages.map((s) => (
                <Option key={s.id} value={s.id}>{s.name}</Option>
              ))}
            </Select>
          </div>

          <div className="task-block">
            <h3>Чек-листы</h3>
            <TaskChecklist taskId={formData?.key} assignees={assignees} />
          </div>

          <div className="task-block">
            <h3>Комментарии</h3>
            <TaskComments taskId={formData?.key} currentUserId={1} />
          </div>

        </div>
      )}
    </Modal>
  );
};

export default TaskCard;