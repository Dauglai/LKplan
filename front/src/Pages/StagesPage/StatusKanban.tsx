import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { StatusApp } from 'Features/ApiSlices/statusAppSlice';
import CloseIconWhite from 'assets/icons/close-white.svg?react';
import EditIconWhite from 'assets/icons/edit-white.svg?react';
import { useState } from 'react';

interface StatusKanbanProps {
  editingEventId: number;
  statuses: StatusApp[];
  onStatusesUpdate: (statuses: StatusApp[]) => void;
  onStatusRemove: (id: number) => void;
  onStatusEdit: (status: StatusApp) => void;
}

/**
 * Kanban-компонент для управления статусами заявок мероприятия.
 * Поддерживает перетаскивание статусов для изменения порядка, редактирование и удаление статусов.
 * 
 * @component
 * @example
 * // Пример использования:
 * <StatusKanban
 *   editingEventId={selectedEventId}
 *   statuses={eventStatuses}
 *   onStatusesUpdate={handleStatusOrderUpdate} 
 *   onStatusRemove={handleStatusRemove}
 *   onStatusEdit={handleStatusEdit}
 * />
 *
 * @param {Object} props - Пропсы компонента.
 * @param {number} props.editingEventId - ID редактируемого мероприятия (блокирует перетаскивание)
 * @param {StatusApp[]} props.statuses - Массив статусов для отображения
 * @param {function} props.onStatusesUpdate - Коллбэк при изменении порядка статусов
 * @param {function} props.onStatusRemove - Коллбэк удаления статуса
 * @param {function} props.onStatusEdit - Коллбэк редактирования статуса
 *
 * @returns {JSX.Element} Интерактивная Kanban-доска статусов
 */
export default function StatusKanban({
  editingEventId,
  statuses,
  onStatusesUpdate,
  onStatusRemove,
  onStatusEdit
}: StatusKanbanProps): JSX.Element {
  //const [isTriggerModalVisible, setIsTriggerModalVisible] = useState(false);
  //const [currentStatusId, setCurrentStatusId] = useState<number | null>(null);
  //const [editingTrigger, setEditingTrigger] = useState<any>(null); // Состояние редактируемого триггера

  /**
   * Обработчик завершения перетаскивания элементов
   * @param {DropResult} result - Результат перетаскивания из react-beautiful-dnd
   */
  const onDragEnd = (result: DropResult) => {
    const { destination, source, draggableId, type } = result;

    // Блокируем перетаскивание во время редактирования мероприятия
    if (editingEventId) return;

    if (!destination) return;

    // Логика перетаскивания колонок (статусов)
    if (type === 'column') {
      if (destination.index === source.index) return;
      
      const newStatuses = Array.from(statuses);
      const [removed] = newStatuses.splice(source.index, 1);
      newStatuses.splice(destination.index, 0, removed);
      
      onStatusesUpdate(newStatuses);
      return;
    }
  };

  /* 
   * Форматирование времени для отображения
   * @param {string} exp - Строка времени в формате "1d", "2h" и т.д.
   * @returns {string} Отформатированное время ("1 дн", "2 ч" и т.д.)
   */
  /*const formatExpiration = (exp: string) => {
    const value = parseInt(exp);
    const unit = exp.replace(value.toString(), '');
    
    const units = {
      'd': 'дн',
      'h': 'ч', 
      'm': 'мин'
    };
    
    return `${value} ${units[unit] || unit}`;
  };*/

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
                
                return (
                  <Draggable 
                    key={status.id} 
                    draggableId={`status-${status.id}`}
                    index={index}
                    isDragDisabled={editingEventId ? true : false} // Запрещаем перетаскивание при редактировании
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
                          {!editingEventId && ( // Показываем кнопки только при создании
                            <div className="statusActions">
                              <button 
                                className="statusRemoveBtn"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onStatusEdit(status);
                                }}
                                title="Редактировать статус"
                              >
                                <EditIconWhite width={16} height={16} />
                              </button>
                              <button 
                                className="statusRemoveBtn"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onStatusRemove(status.id);
                                }}
                                title="Удалить статус"
                              >
                                <CloseIconWhite width={16} height={16} />
                              </button>
                            </div>
                          )}
                        </div>
                        
                        {status.description && (
                          <div className="kanbanColumnDescriptionWrapper">
                            <div className="statusDescription">
                              {status.description}
                            </div>
                          </div>
                        )}
                        
                        {/**<div className="kanbanColumnBody">
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
                                        <span>{`До просрочки: ${formatExpiration(trigger.config.expiration)}`}</span>
                                        
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleOpenTriggerModal(status.id, trigger);
                                          }}
                                          className="triggerEditBtn"
                                        >
                                          <EditIconBlack width={12} height={12} />
                                        </button>
                                        
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
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
                                {provided.placeholder}
                              </div>
                            )}
                          </Droppable>
                        </div>
                        
                        <div className="addButtonsContainer">
                          <Button 
                            type="text" 
                            icon={<PlusIcon width={16} height={16}/>}
                            onClick={() => handleOpenTriggerModal(status.id)} // Добавляем обработчик
                            block
                            className="addButton"
                          >
                            Добавить триггер
                          </Button>
                          <Button 
                            type="text" 
                            icon={<PlusIcon width={16} height={16}/>}
                            //onClick={() => handleOpenRobotModal(status.id)}
                            block
                            className="addButton"
                          >
                            Добавить робота
                          </Button>
                        </div>**/}
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

      {/*<TriggerModal
        visible={isTriggerModalVisible}
        onCancel={handleTriggerModalCancel}
        onSave={handleTriggerSave}
        initialData={editingTrigger}
        statusId={currentStatusId}
      />*/}
    </>
  );
}