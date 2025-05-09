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
  message, Form, Progress, Card, Tooltip,

} from 'antd';
import moment from 'moment';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { useDeleteTaskMutation, useUpdateTaskMutation } from 'Features/ApiSlices/tasksApiSlice';
import "./TaskCard.css";
import {
  useGetCheckListsByTaskQuery,
} from 'Features/ApiSlices/checkListApiSlice';
import TaskChecklist from 'Pages/Tasks/TaskCard/TaskChecklist.tsx';
import TaskComments from 'Pages/Tasks/TaskCard/TaskComments.tsx';
import DescriptionBlock from './Description.tsx'
import { CalendarOutlined, UserOutlined } from '@ant-design/icons';
//import { getCurrentUserId } from 'Features/utils/auth.ts';
import dayjs from 'dayjs';
import 'dayjs/locale/ru';
import locale from 'antd/es/date-picker/locale/ru_RU';
import ReactQuill from 'react-quill';
import TaskDescriptionEditor from 'Pages/Tasks/TaskCard/TaskEditor.tsx';
import PlanButton from '../../../Components/PlanButton/PlanButton.tsx';
import { useGetProjectByIdQuery } from 'Features/ApiSlices/projectSlice.ts';
import { useGetTeamByIdQuery } from 'Features/ApiSlices/teamSlice.ts';



const { Option } = Select;

const TaskCard = ({selectedTask, visible, onClose, assignees, stages, projectName="", teamId=0,}) => {
    const [formData, setFormData] = useState(selectedTask);
    const [updateTask] = useUpdateTaskMutation(); // API для обновления задачи
    const [deleteTask] = useDeleteTaskMutation();
    const { data: teamData} = useGetTeamByIdQuery(teamId);

    const id = selectedTask?.key ? selectedTask.key : null;
    const [editingDeadline, setEditingDeadline] = useState(false);
    //const currentUserId = getCurrentUserId();
    const [isEditingAssignee, setIsEditingAssignee] = useState(false);
    const [isEditingPerformers, setIsEditingPerformers] = useState(false);

    // Чек-листы
    const { data: checkLists, refetch: refetchCheckLists } = useGetCheckListsByTaskQuery(id, {
      skip: !id, // Пропуск запроса, если id нет
    });

    const handleAddToStack = async () => {
      try {
        const firstStageId = stages[0].id;
        await updateTask({ id: formData.key, data: { status: firstStageId } }).unwrap();
        setFormData((prev) => ({
          ...prev,
          stage: stages.find((s) => s.id === firstStageId),
        }));
        message.success('Задача добавлена в стек');
      } catch (err) {
        console.error('Ошибка при добавлении задачи в стек:', err);
        message.error('Ошибка при добавлении задачи в стек');
      }
    };

    const handleDeleteTask = async () => {
      try {
        await deleteTask(Number(formData.key)).unwrap();
        message.success('Задача удалена');
        setFormData(null);
        onClose(); // закрываем модалку
      } catch (error) {
        console.error('Ошибка удаления задачи:', error);
        message.error('Не удалось удалить задачу');
      }
    };

    const areAllChecklistsCompleted = checkLists?.every((checklist) =>
      checklist.checklistItems?.every((item) => item.is_completed)
    );


    const handleCompleteTask = async () => {
      try {
        await updateTask({ id: Number(formData.key), data: { is_completed: true } }).unwrap();
        message.success('Задача завершена');
        setFormData((prev) => ({ ...prev, is_completed: true }));
        onClose(); // закрываем модалку
      } catch (error) {
        console.error('Ошибка завершения задачи:', error);
        message.error('Не удалось завершить задачу');
      }
    };


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
        await updateTask({ id: Number(formData.key), data: cleanedData }).unwrap();
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
            onChange={(date) => {
              handleInputChange(field, date ? date.format('YYYY-MM-DD') : null);
              setEditingDateField(null);
            }}
            autoFocus
            suffixIcon={<CalendarOutlined />}
          />
        ) : (
          <div
            style={{ display: 'flex', alignItems: 'center', gap: 8 }}
            className="task-border"
          >
          <span
            onClick={() => startEditingDate(field)}
            style={{ cursor: 'pointer', flex: 14 }}
          >
            {formData[field]
              ? moment(formData[field]).format('DD.MM.YYYY')
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
          <div>
            <div className="task-row-title">
              {editingField === 'name' ? (
                <Input
                  value={editedValue}
                  onChange={(e) => setEditedValue(e.target.value)}
                  onBlur={saveEditedText}
                  onPressEnter={saveEditedText}
                  autoFocus
                />
              ) : (
                <div
                  onClick={() => startEditingTextField('name', formData.name)}
                >
                  {formData?.name || 'Без названия'}
                </div>
              )}
              {projectName !== '' && (
                <div className="task-meta">
                  <div className="team">Команда {teamData?.name}</div>
                  <div className="project">Проект {projectName}</div>
                </div>
              )}
            </div>

            <div className="task-block">
              {formData && formData.stage === null ? (
                <Button type="dashed" onClick={handleAddToStack}>
                  Добавить в стек
                </Button>
              ) : (
                <div className="stage-select-row">
                  {stages.map((stage, index) => {
                    const currentStageId = formData?.stage?.id;
                    const activeIndex = stages.findIndex(
                      (s) => s.id === currentStageId
                    );
                    const isActive = currentStageId === stage.id;
                    const isBeforeActive = index < activeIndex;

                    return (
                      <div
                        className="stage-item"
                        key={stage.id}
                        onClick={() => handleInputChange('stage', stage)}
                      >
                        <div className="stage-name">{stage.name}</div>
                        <div
                          className={`stage-line ${
                            isActive
                              ? 'active'
                              : isBeforeActive
                                ? 'before'
                                : 'inactive'
                          }`}
                          style={{
                            backgroundColor: isActive ? stage.color : '#DDDFE4',
                          }}
                        />
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        }
        visible={visible}
        closable={false}
        onCancel={onClose}
        footer={
          <div className="task-modal-footer">
            {formData?.is_completed ? (
              <>
                <div className="completed-label">
                  <span className="completed-text">Задача уже завершена</span>
                </div>
                <PlanButton
                  onClick={async () => {
                    try {
                      await updateTask({
                        id: Number(formData.key),
                        data: { is_completed: false },
                      }).unwrap();
                      message.success('Задача возвращена на доработку');
                      setFormData((prev) => ({ ...prev, is_completed: false }));
                    } catch {
                      message.error('Ошибка возврата задачи');
                    }
                  }}
                >
                  Доработать
                </PlanButton>
              </>
            ) : (
              <Tooltip
                title={
                  areAllChecklistsCompleted === false
                    ? 'Завершение невозможно: не все пункты чек-листов выполнены'
                    : ''
                }
              >
                <PlanButton
                  onClick={handleCompleteTask}
                  disabled={!areAllChecklistsCompleted}
                >
                  Завершить
                </PlanButton>
              </Tooltip>
            )}

            <PlanButton variant="white" onClick={handleDeleteTask}>
              Удалить
            </PlanButton>
          </div>
        }
      >
        {formData && (
          <div className="task-form-content">
            <TaskDescriptionEditor
              description={formData.description}
              onSave={(newDesc) => handleInputChange('description', newDesc)}
            />
            <div className="task-row">
              <div className="task-col">
                <label>Дата создания</label>
                <div
                  style={{ display: 'flex', alignItems: 'center', gap: 8 }}
                  className="task-border"
                >
                  <span style={{ cursor: 'pointer', flex: 14 }}>
                    {formData.created_at
                      ? moment(formData.created_at).format('DD.MM.YYYY')
                      : 'Без срока'}
                  </span>
                  <CalendarOutlined
                    style={{ color: 'black', cursor: 'pointer', flex: 1 }}
                  />
                </div>
              </div>
              {renderDateField('Дата начала', 'start')}
              {renderDateField('Дата окончания', 'end')}
            </div>

            <div className="task-row">
              <div className="task-col">
                <label>Постановщик</label>
                <div
                  style={{ display: 'flex', alignItems: 'center', gap: 8 }}
                  className="task-border"
                >
                  <span style={{ flex: 14 }}>
                    {formData.author.surname} {formData.author.name}{' '}
                    {formData.author.patronymic}
                  </span>
                </div>
              </div>

              <div className="task-col">
                <label>Ответственный</label>
                <div
                  className="task-border"
                  style={{ display: 'flex', alignItems: 'center', gap: 8 }}
                >
                  {isEditingAssignee ? (
                    <Select
                      value={formData.assignee?.user_id}
                      style={{ width: '100%' }}
                      showSearch
                      filterOption={(input, option) => {
                        const assignee = assignees.find(
                          (a) => a.user_id === option?.value
                        );
                        if (!assignee) return false;
                        const fullName =
                          `${assignee.surname} ${assignee.name} ${assignee.patronymic}`.toLowerCase();
                        return fullName.includes(input.toLowerCase());
                      }}
                      onChange={(value) => {
                        handleInputChange(
                          'assignee',
                          assignees.find((a) => a.user_id === value)
                        );
                        setIsEditingAssignee(false);
                      }}
                      onBlur={() => setIsEditingAssignee(false)}
                      autoFocus
                    >
                      {assignees?.length > 0 ? (
                        assignees.map((assignee) => (
                          <Option
                            key={assignee.user_id}
                            value={assignee.user_id}
                          >
                            {assignee.surname} {assignee.name}{' '}
                            {assignee.patronymic}
                          </Option>
                        ))
                      ) : (
                        <Option disabled>Нет ответственного</Option>
                      )}
                    </Select>
                  ) : (
                    <span
                      style={{ flex: 1 }}
                      onClick={() => setIsEditingAssignee(true)}
                    >
                      {formData.assignee
                        ? `${formData.assignee.surname} ${formData.assignee.name} ${formData.assignee.patronymic}`
                        : 'Не выбрано'}
                    </span>
                  )}
                </div>
              </div>

              <div className="task-col">
                <label>Исполнители</label>
                <div
                  className="task-border"
                  style={{ display: 'flex', alignItems: 'center', gap: 8 }}
                >
                  {isEditingPerformers ? (
                    <Select
                      mode="multiple"
                      style={{ width: '100%' }}
                      showSearch
                      optionFilterProp="children"
                      filterOption={(input, option) => {
                        const assignee = assignees.find(
                          (a) => a.user_id === option?.value
                        );
                        if (!assignee) return false;
                        const fullName =
                          `${assignee.surname} ${assignee.name} ${assignee.patronymic}`.toLowerCase();
                        return fullName.includes(input.toLowerCase());
                      }}
                      value={formData.performers ?? []}
                      onChange={(selectedIds) => {
                        handleInputChange('performers', selectedIds);
                        setIsEditingPerformers(false);
                      }}
                      onBlur={() => setIsEditingPerformers(false)}
                      autoFocus
                    >
                      {assignees?.length > 0 ? (
                        assignees.map((assignee) => (
                          <Option
                            key={assignee.user_id}
                            value={assignee.user_id}
                          >
                            {assignee.surname} {assignee.name[0]}.{' '}
                            {assignee.patronymic[0]}.
                          </Option>
                        ))
                      ) : (
                        <Option disabled>Нет исполнителей</Option>
                      )}
                    </Select>
                  ) : (
                    <span
                      style={{ flex: 1 }}
                      onClick={() => setIsEditingPerformers(true)}
                    >
                      {formData.performers?.length > 0
                        ? assignees
                            .filter((a) =>
                              formData.performers.includes(a.user_id)
                            )
                            .map(
                              (a) =>
                                `${a.surname} ${a.name[0]}. ${a.patronymic[0]}.`
                            )
                            .join(', ')
                        : 'Не выбраны'}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="task-block">
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
            }
            ;

            export default TaskCard;