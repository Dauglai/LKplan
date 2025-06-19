import React, { useState } from 'react';
import { Button } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import StatusModal from './StatusModal';
import StatusKanban  from './StatusKanban';
import { 
  removeStatus, 
  addStatus, 
  reorderStatuses,
  updateStatus} from 'Features/store/eventSetupSlice';
import { StatusApp } from 'Features/ApiSlices/statusAppSlice';


/**
 * Компонент управления статусами мероприятия.
 * Объединяет функциональность Kanban-доски статусов и модального окна редактирования.
 * Позволяет добавлять, редактировать, удалять и изменять порядок статусов.
 * Редактирование доступно только при создании нового мероприятия.
 * 
 * @component
 * @example
 * // Пример использования:
 * <StatusSettings />
 *
 * @returns {JSX.Element} Компонент управления статусами с кнопкой добавления и Kanban-доской
 */
export default function StatusSettings(): JSX.Element {
  const dispatch = useDispatch(); // Хук для dispatch Redux-действий
  const { stepStatuses, editingEventId } = useSelector((state: any) => state.event); // Данные статусов из Redux store
  const [isStatusModalVisible, setIsStatusModalVisible] = useState(false); // Видимость модалки статуса
  const [editingStatus, setEditingStatus] = useState<StatusApp | null>(null); // Редактируемый статус

  /**
   * Обработчик добавления нового статуса
   * @param {StatusApp} newStatus - Новый статус для добавления
   */
  const handleAddStatus = (newStatus: StatusApp) => {
    dispatch(addStatus(newStatus));
  };

  /**
   * Обработчик обновления существующего статуса
   * @param {StatusApp} updatedStatus - Обновленные данные статуса
   */
  const handleUpdateStatus = (updatedStatus: StatusApp) => {
    dispatch(updateStatus(updatedStatus));
  };

  /**
   * Обработчик изменения порядка статусов
   * @param {StatusApp[]} statuses - Новый порядок статусов
   */
  const handleStatusesUpdate = (statuses: StatusApp[]) => {
    dispatch(reorderStatuses(statuses));
  };

  /**
   * Обработчик удаления статуса
   * @param {number} id - ID удаляемого статуса
   */
  const handleStatusRemove = (id: number) => {
    dispatch(removeStatus(id));
  };

  /**
   * Обработчик редактирования статуса
   * @param {StatusApp} status - Статус для редактирования
   */
  const handleStatusEdit = (status: StatusApp) => {
    setEditingStatus(status);
    setIsStatusModalVisible(true);
  };

  /**
   * Обработчик закрытия модального окна
   */
  const handleModalClose = () => {
    setIsStatusModalVisible(false);
    setEditingStatus(null);
  };

  return (
    <div className="status-settings">
      {editingEventId ? (
        <div className="statusEditNotice">
          Редактирование статусов доступно только при создании мероприятия
        </div>
      ) : (
        <div className="settings-actions">
          <Button 
            type="primary" 
            onClick={() => setIsStatusModalVisible(true)}
            style={{ marginRight: 10 }}
          >
            Добавить статус
          </Button>
          <span 
            style={{ 
              color: stepStatuses.statuses?.length > 0 ? '#888' : '#ff4d4f',
              fontSize: '14px'
            }}
          >
            Для успешного создания мероприятия необходимо добавить хотя бы один статус
          </span>
        </div>
      )}
      
      {/* Модальное окно добавления/редактирования статуса */}
      <StatusModal
        visible={isStatusModalVisible}
        onCancel={handleModalClose}
        onAddStatus={handleAddStatus}
        onUpdateStatus={handleUpdateStatus}
        editingStatus={editingStatus}
      />

      {/* Kanban-доска для управления статусами */}
      <StatusKanban
        editingEventId={editingEventId}
        statuses={stepStatuses.statuses}
        onStatusesUpdate={handleStatusesUpdate}
        onStatusRemove={handleStatusRemove}
        onStatusEdit={handleStatusEdit}
      />
    </div>
  );
}