import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { StatusApp } from 'Features/ApiSlices/statusAppSlice';
import CloseIconWhite from 'assets/icons/close-white.svg?react';
import CloseIconBlack from 'assets/icons/close.svg?react';
import { Trigger } from 'Features/ApiSlices/triggerApiSlice';
import { useState } from 'react';
import TriggerModal from './TriggerModal';
import PlusIcon from 'assets/icons/plus.svg?react';
import TimerIcon from 'assets/icons/timer.svg?react';
import RobotIcon from 'assets/icons/laptop.svg?react';
import { Button } from 'antd';
import { Robot } from 'Features/ApiSlices/robotApiSlice';
import RobotModal from './RobotModal';

interface StatusKanbanProps {
  statuses: StatusApp[];
  robots: Robot[];
  onStatusesUpdate: (statuses: StatusApp[]) => void;
  onStatusRemove: (id: number) => void;
  onAddTrigger: (statusId: number, trigger: Omit<Trigger, 'id'>) => void;
  onRemoveTrigger: (statusId: number, triggerId: number) => void;
  onMoveTrigger: (source: { statusId: number; triggerId: number }, destination: { statusId: number }) => void;
  onAttachRobot: (statusId: number, triggerId: number, robotId: number) => void;
  onDetachRobot: (statusId: number, robotId: number) => void;
  onMoveRobot: (
    source: { statusId: number; robotId: number },
    destination: { statusId: number },
    robotId: number
  ) => void;
  onAddRobot: (robot: Omit<Robot, 'id'>) => void; // Изменено - убрал statusId
}

export default function StatusKanban({
  statuses,
  robots,
  onStatusesUpdate,
  onStatusRemove,
  onAddTrigger,
  onRemoveTrigger,
  onMoveTrigger,
  onAttachRobot,
  onDetachRobot,
  onMoveRobot,
  onAddRobot
}: StatusKanbanProps): JSX.Element {
  const [triggerModal, setTriggerModal] = useState<{
    visible: boolean;
    statusId: number | null;
  }>({ visible: false, statusId: null });

  const [robotModal, setRobotModal] = useState<{
    visible: boolean;
    statusId: number | null;
  }>({ visible: false, statusId: null });

  // Группируем роботов по статусам
  const getRobotsForStatus = (statusId: number) => {
    return robots.filter(robot => 
      robot.status_order?.status === statusId
    ).sort((a, b) => 
      (a.status_order?.position || 0) - (b.status_order?.position || 0)
    );
  };

  const onDragEnd = (result: DropResult) => {
    const { destination, source, draggableId, type } = result;

    if (!destination) return;

    // Перетаскивание статусов (колонок)
    if (type === 'column') {
      if (destination.index === source.index) return;
      
      const newStatuses = Array.from(statuses);
      const [removed] = newStatuses.splice(source.index, 1);
      newStatuses.splice(destination.index, 0, removed);
      
      onStatusesUpdate(newStatuses);
      return;
    }

    // Перетаскивание триггеров
    if (type === 'trigger' && source.droppableId !== destination.droppableId) {
      const sourceStatusId = parseInt(source.droppableId.replace('trigger-', ''));
      const destStatusId = parseInt(destination.droppableId.replace('trigger-', ''));
      const triggerId = parseInt(draggableId.replace('trigger-', ''));
      
      onMoveTrigger(
        { statusId: sourceStatusId, triggerId },
        { statusId: destStatusId }
      );
    }

    // Перетаскивание роботов
    if (type === 'robot' && source.droppableId !== destination.droppableId) {
      const sourceStatusId = parseInt(source.droppableId.replace('robot-', ''));
      const destStatusId = parseInt(destination.droppableId.replace('robot-', ''));
      const robotId = parseInt(draggableId.replace('robot-', ''));
      
      onMoveRobot(
        { statusId: sourceStatusId, robotId },
        { statusId: destStatusId }
      );
    }
  };

  const handleOpenTriggerModal = (statusId: number) => {
    setTriggerModal({ visible: true, statusId });
  };

  const handleCloseTriggerModal = () => {
    setTriggerModal({ visible: false, statusId: null });
  };

  const handleSaveTrigger = (trigger: Omit<Trigger, 'id'>) => {
    if (triggerModal.statusId) {
      onAddTrigger(triggerModal.statusId, trigger);
    }
    handleCloseTriggerModal();
  };

  const handleOpenRobotModal = (statusId: number) => {
    setRobotModal({ visible: true, statusId });
  };

  const handleCloseRobotModal = () => {
    setRobotModal({ visible: false, statusId: null });
  };

  const handleSaveRobot = (robot: Omit<Robot, 'id'>) => {
    if (robotModal.statusId) {
      onAddRobot(robotModal.statusId, robot);
    }
    handleCloseRobotModal();
  };

  return (
    <>
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable 
          droppableId="statuses" 
          direction="horizontal" 
          type="column"
        >
          {(provided) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className="kanbanBoard"
            >
              {statuses.map((status, index) => {
                const statusRobots = getRobotsForStatus(status.id);
                
                return (
                  <Draggable 
                    key={status.id} 
                    draggableId={`status-${status.id}`}
                    index={index}
                  >
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className={`kanbanColumn ${
                          status.is_positive ? 'positive' : 'negative'
                        } ${
                          status.description ? 'hasDescription' : ''
                        } ${
                          snapshot.isDragging ? 'isDragging' : ''
                        }`}
                      >
                        <div className="kanbanColumnHeader">
                          <span className="statusTitle">{status.name}</span>
                          <button 
                            className="statusRemoveBtn"
                            onClick={(e) => {
                              e.stopPropagation();
                              onStatusRemove(status.id);
                            }}
                          >
                            <CloseIconWhite width={16} height={16} />
                          </button>
                        </div>
                        
                        {status.description && (
                          <div className="kanbanColumnDescriptionWrapper">
                            <div className="statusDescription">
                              {status.description}
                            </div>
                          </div>
                        )}
                        
                        <div className="kanbanColumnBody">
                          {/* Секция триггеров */}
                          <Droppable 
                            droppableId={`trigger-${status.id}`} 
                            type="trigger"
                          >
                            {(provided) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.droppableProps}
                                className="triggerContainer"
                              >
                                {status.triggers?.map((trigger, index) => (
                                  <Draggable
                                    key={`trigger-${trigger.id}`}
                                    draggableId={`trigger-${trigger.id}`}
                                    index={index}
                                  >
                                    {(provided, snapshot) => (
                                      <div
                                        ref={provided.innerRef}
                                        {...provided.draggableProps}
                                        {...provided.dragHandleProps}
                                        className={`triggerItem ${
                                          snapshot.isDragging ? 'isDragging' : ''
                                        }`}
                                      >
                                        <TimerIcon width={24} height={24}/>
                                        <span>{trigger.name}</span>
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            onRemoveTrigger(status.id, trigger.id);
                                          }}
                                          className="triggerRemoveBtn"
                                        >
                                          <CloseIconBlack width={12} height={12} />
                                        </button>
                                      </div>
                                    )}
                                  </Draggable>
                                ))}
                                {provided.placeholder}
                              </div>
                            )}
                          </Droppable>
                          
                          {/* Секция роботов */}
                          <Droppable 
                            droppableId={`robot-${status.id}`} 
                            type="robot"
                          >
                            {(provided) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.droppableProps}
                                className="robotContainer"
                              >
                                {statusRobots.map((robot, index) => (
                                  <Draggable 
                                    key={`robot-${robot.id}`} 
                                    draggableId={`robot-${robot.id}`}
                                    index={index}
                                  >
                                    {(provided, snapshot) => (
                                      <div
                                        ref={provided.innerRef}
                                        {...provided.draggableProps}
                                        {...provided.dragHandleProps}
                                        className={`robotItem ${
                                          snapshot.isDragging ? 'isDragging' : ''
                                        }`}
                                      >
                                        <RobotIcon width={24} height={24}/>
                                        <span>{robot.name}</span>
                                        <button 
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            onDetachRobot(status.id, robot.id);
                                          }}
                                          className="robotRemoveBtn"
                                        >
                                          <CloseIconBlack width={12} height={12} />
                                        </button>
                                      </div>
                                    )}
                                  </Draggable>
                                ))}
                                {provided.placeholder}
                              </div>
                            )}
                          </Droppable>
                        </div>
                        
                        <div className="addButtonsContainer">
                          <Button 
                            type="text" 
                            icon={<PlusIcon width={16} height={16}/>}
                            onClick={() => handleOpenTriggerModal(status.id)}
                            block
                            className="addButton"
                          >
                            Добавить триггер
                          </Button>
                          <Button 
                            type="text" 
                            icon={<PlusIcon width={16} height={16}/>}
                            onClick={() => handleOpenRobotModal(status.id)}
                            block
                            className="addButton"
                          >
                            Добавить робота
                          </Button>
                        </div>
                      </div>
                    )}
                  </Draggable>
                );
              })}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      <TriggerModal
        visible={triggerModal.visible}
        onCancel={handleCloseTriggerModal}
        onSave={handleSaveTrigger}
      />

      <RobotModal
        visible={robotModal.visible}
        onCancel={handleCloseRobotModal}
        onSave={handleSaveRobot}
      />
    </>
  );
}