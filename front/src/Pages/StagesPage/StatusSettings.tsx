import React, { useState } from 'react';
import { Button } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import StatusModal from './StatusModal';
import StatusKanban  from './StatusKanban';
import { 
  addFunctionOrder, 
  addRobot, 
  addTriggerToStatus, 
  attachRobotToTrigger, 
  detachRobotFromTrigger, 
  moveRobotBetweenTriggers, 
  moveTriggerBetweenStatuses, 
  removeStatus, 
  addStatus,
  removeTriggerFromStatus, 
  updateFunctionOrder, 
  updateStatuses, 
  reorderStatuses} from 'Features/store/eventSetupSlice';
import { StatusApp } from 'Features/ApiSlices/statusAppSlice';
import { Trigger } from 'Features/ApiSlices/triggerApiSlice';
import { Robot } from 'Features/ApiSlices/robotApiSlice';


export default function StatusSettings(): JSX.Element {
  const dispatch = useDispatch();
  const { stepStatuses, stepRobots } = useSelector((state: any) => state.event);
  const [isStatusModalVisible, setIsStatusModalVisible] = useState(false);

  // Добавление нового статуса
  const handleAddStatus = (newStatus: StatusApp) => {
    dispatch(addStatus(newStatus));
  };

  // Обновление порядка статусов
  const handleStatusesUpdate = (statuses: StatusApp[]) => {
    dispatch(reorderStatuses(statuses));
  };

  // Удаление статуса
  const handleStatusRemove = (id: number) => {
    dispatch(removeStatus(id));
  };

  // Добавление триггера к статусу
  const handleAddTrigger = (statusId: number, trigger: Omit<Trigger, 'id'>) => {
    dispatch(addTriggerToStatus({ statusId, trigger }));
  };

  // Удаление триггера из статуса
  const handleRemoveTrigger = (statusId: number, triggerId: number) => {
    dispatch(removeTriggerFromStatus({ statusId, triggerId }));
  };

  // Перемещение триггера между статусами
  const handleMoveTrigger = (
    source: { statusId: number; triggerId: number },
    destination: { statusId: number }
  ) => {
    dispatch(moveTriggerBetweenStatuses({ source, destination }));
  };

  // Добавление нового робота
  const handleAddRobot = (robot: Omit<Robot, 'id'>) => {
    dispatch(addRobot({ ...robot, id: Date.now() }));
  };

  // Привязка робота к триггеру
  const handleAttachRobot = (statusId: number, triggerId: number, robotId: number) => {
    dispatch(attachRobotToTrigger({ statusId, triggerId, robotId }));
    
    // Создаем functionOrder
    dispatch(addFunctionOrder({
      status_order: statusId,
      position: stepRobots.functionOrders.length + 1,
      robot: robotId,
      trigger: triggerId,
      config: {}
    }));
  };

  // Отвязка робота от триггера
  const handleDetachRobot = (statusId: number, triggerId: number) => {
    dispatch(detachRobotFromTrigger({ statusId, triggerId }));
    
    // Находим и обновляем functionOrder (удаляем trigger)
    const order = stepRobots.functionOrders.find(
      o => o.status_order === statusId && o.trigger === triggerId
    );
    if (order?.id) {
      dispatch(updateFunctionOrder({
        id: order.id,
        changes: { trigger: null }
      }));
    }
  };

  // Перемещение робота между триггерами
  const handleMoveRobot = (
    source: { statusId: number; triggerId: number },
    destination: { statusId: number; triggerId: number },
    robotId: number
  ) => {
    dispatch(moveRobotBetweenTriggers({ source, destination, robotId }));
    
    // Обновляем functionOrder
    const order = stepRobots.functionOrders.find(
      o => o.robot === robotId && o.status_order === source.statusId
    );
    if (order?.id) {
      dispatch(updateFunctionOrder({
        id: order.id,
        changes: {
          status_order: destination.statusId,
          trigger: destination.triggerId
        }
      }));
    }
  };

  return (
    <div className="status-settings">
      <div className="settings-actions">
        <Button 
          type="primary" 
          onClick={() => setIsStatusModalVisible(true)}
          style={{ marginRight: 10 }}
        >
          Добавить статус
        </Button>
      </div>

      <StatusModal
        visible={isStatusModalVisible}
        onCancel={() => setIsStatusModalVisible(false)}
        onAddStatus={handleAddStatus}
      />

      <StatusKanban
        statuses={stepStatuses.statuses}
        robots={stepRobots.robots}
        functionOrders={stepRobots.functionOrders}
        onStatusesUpdate={handleStatusesUpdate}
        onStatusRemove={handleStatusRemove}
        onAddTrigger={handleAddTrigger}
        onRemoveTrigger={handleRemoveTrigger}
        onMoveTrigger={handleMoveTrigger}
        onAttachRobot={handleAttachRobot}
        onDetachRobot={handleDetachRobot}
        onMoveRobot={handleMoveRobot}
        onAddRobot={handleAddRobot}
      />
    </div>
  );
}