import React, { useState } from 'react';
import { Button } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import StatusModal from './StatusModal';
import StatusKanban  from './StatusKanban';
import { removeStatus, updateStatuses } from 'Features/store/eventSetupSlice';
import { StatusApp } from 'Features/ApiSlices/statusAppSlice';


export default function StatusSettings(): JSX.Element {
  const dispatch = useDispatch();
  const { stepStatuses } = useSelector((state: any) => state.event);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const handleAddStatus = (newStatus: StatusApp) => {
    const updatedStatuses = [...stepStatuses.statuses];
    
    if (newStatus.is_positive) {
      const firstNegativeIndex = updatedStatuses.findIndex(s => !s.is_positive);
      if (firstNegativeIndex !== -1) {
        updatedStatuses.splice(firstNegativeIndex, 0, newStatus);
      } else {
        updatedStatuses.push(newStatus);
      }
    } else {
      updatedStatuses.push(newStatus);
    }

    dispatch(updateStatuses(updatedStatuses));
  };

  const handleStatusesUpdate = (statuses: StatusApp[]) => {
    dispatch(updateStatuses(statuses));
  };

  const handleStatusRemove = (id: number) => {
    dispatch(removeStatus(id));
  };

  return (
    <div className="status-settings">
      <Button 
        type="primary" 
        onClick={() => setIsModalVisible(true)}
        style={{ marginBottom: 20 }}
      >
        Добавить новый статус
      </Button>

      <StatusModal
        visible={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        onAddStatus={handleAddStatus}
      />

      <StatusKanban
        statuses={stepStatuses.statuses}
        onStatusesUpdate={handleStatusesUpdate}
        onStatusRemove={handleStatusRemove}
      />
    </div>
  );
};