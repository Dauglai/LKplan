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
import DescriptionBlock from './Description.tsx'
import { CalendarOutlined } from '@ant-design/icons';
//import { getCurrentUserId } from 'Features/utils/auth.ts';
import dayjs from 'dayjs';
import 'dayjs/locale/ru';
import locale from 'antd/es/date-picker/locale/ru_RU';
import ReactQuill from 'react-quill';
import TaskDescriptionEditor from 'Pages/Tasks/TaskCard/TaskEditor.tsx';



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
    let formattedValue = value;

    if ((field === "start" || field === "end") && moment.isMoment(value)) {
      formattedValue = value.toISOString(); // ISO-формат
    }

    const updatedData = {
      ...formData,
      [field]: formattedValue,
    };

    setFormData(updatedData);

    let cleanedData = { [field]: formattedValue };

    if (field === "stage")
      cleanedData = { status: value.id };
    if (field === "assignee")
      cleanedData = { responsible_user: value.user_id };
    if (field === "name")
      cleanedData = { name: value };
    if (field === "description")
      cleanedData = { description: value };
    if (field === "performers")
      cleanedData = { performers: value };

    try {
      await updateTask({ id: formData.key, data: cleanedData }).unwrap();
      if (field !== "description" && field !== "name")
        message.success("Задача обновлена");
    } catch (error) {
      console.error("Ошибка:", error);
      message.error("Ошибка при обновлении задачи");
    }
  };
  const [editingField, setEditingField] = useState<'name' | 'description' | null>(null);
  const [editedValue, setEditedValue] = useState('');
  const [editingDateField, setEditingDateField] = useState<'start' | 'end' | null>(null);

  //Универсальный старт редактирования
  const startEditingTextField = (field: 'name' | 'description', value: string) => {
    setEditingField(field);
    setEditedValue(value);
  };


  //Универсальное сохранение
  const saveEditedText = async () => {
    if (!editingField) return;

    const updatedValue = editedValue.trim();
    if (updatedValue !== formData[editingField]) {
      await handleInputChange(editingField, updatedValue);
    }

    setEditingField(null);
    setEditedValue('');
  };


// Универсальный обработчик начала редактирования даты
  const startEditingDate = (field: 'start' | 'end') => {
    setEditingDateField(field);
  };

// Универсальный рендер даты
  const renderDateField = (label: string, field: 'start' | 'end') => (
    <div className="task-col">
      <label>{label}</label>
      {editingDateField === field ? (
        <DatePicker
          style={{ width: '100%' }}
          locale={locale}
          showTime
          onChange={(date) => {
            handleInputChange(field, date ? date.format('YYYY-MM-DD') : null);
            setEditingDateField(null);
          }}
          autoFocus
          suffixIcon={<CalendarOutlined />}
        />
      ) : (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}
             className="task-border"
        >
          <span
            onClick={() => startEditingDate(field)}
            style={{ cursor: 'pointer', flex: 14 }}
          >
            {formData[field]
              ? moment(formData[field]).format('DD.MM.YYYY HH:mm')
              : 'Без срока'}
          </span>
          <CalendarOutlined
            onClick={() => startEditingDate(field)}
            style={{ color: 'black', cursor: 'pointer', flex: 1 }}
          />
        </div>
      )}
    </div>
  );


  return (
    <Modal
      className="task-modal"
      title={
        <div className="task-block">
          {editingField === 'name' ? (
            <Input
              value={editedValue}
              onChange={(e) => setEditedValue(e.target.value)}
              onBlur={saveEditedText}
              onPressEnter={saveEditedText}
              autoFocus
            />
          ) : (
            <div onClick={() => startEditingTextField('name', formData.name)}>
              {formData?.name || 'Без названия'}
            </div>
          )}
        </div>
      }
      visible={visible}
      onCancel={onClose}
      footer={[]}
    >
      {formData && (
        <div className="task-form-content">

          <TaskDescriptionEditor
            description={formData.description}
            onSave={(newDesc) => handleInputChange('description', newDesc)}
          />

          <div className="task-row">
            {renderDateField('Дата начала', 'start')}
            {renderDateField('Дата окончания', 'end')}
          </div>

          <div className="task-row">
            <div className="task-col">
              <label>Ответственный</label>
              <Select
                value={formData.assignee?.user_id}
                style={{ width: '100%' }}
                onChange={(value) =>
                  handleInputChange(
                    'assignee',
                    assignees.find((a) => a.user_id === value),
                  )
                }
                placeholder="Выберите ответственного"
              >
                {assignees?.length > 0 ? (
                  assignees.map((assignee) => (
                    <Option key={assignee.user_id} value={assignee.user_id}>
                      {assignee.surname} {assignee.name} {assignee.patronymic}
                    </Option>
                  ))
                ) : (
                  <Option disabled>Нет ответственного</Option>
                )}
              </Select>
            </div>

            <div className="task-col">
              <label>Исполнители</label>
              <Select
                mode="multiple"
                style={{ width: '100%' }}
                value={formData.performers}
                onChange={(selectedIds) =>
                  handleInputChange('performers', selectedIds)
                }
                placeholder="Добавьте исполнителей"
              >
                {assignees?.length > 0 ? (
                  assignees.map((assignee) => (
                    <Option key={assignee.user_id} value={assignee.user_id}>
                      {assignee.surname} {assignee.name} {assignee.patronymic}
                    </Option>
                  ))
                ) : (
                  <Option disabled>Нет исполнителей</Option>
                )}
              </Select>
            </div>
        </div>

        <div className="task-block">
        <label>Статус</label>
        <Select
        value={formData.stage.id}
      style={{ width: '100%' }}
      onChange={(value) =>
        handleInputChange(
          'stage',
          stages.find((a) => a.id === value),
        )
      }
    >
      {stages.map((s) => (
        <Option key={s.id} value={s.id}>
          {s.name}
        </Option>
      ))}
    </Select>
</div>

  <div className="task-block">
    <h3>Чек-листы</h3>
    <TaskChecklist taskId={formData?.key} assignees={assignees} />
  </div>;

  <div className="task-block">
    <h3>Комментарии</h3>
    <TaskComments taskId={formData?.key} currentUserId={1} />
  </div>
</div>
)
}
</Modal>
)
;
}
;

export default TaskCard;