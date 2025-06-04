import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { StatusApp } from 'Features/ApiSlices/statusAppSlice';
import CloseIcon from 'assets/icons/close-white.svg?react';

interface StatusKanbanProps {
  statuses: StatusApp[];
  onStatusesUpdate: (statuses: StatusApp[]) => void;
  onStatusRemove: (id: number) => void;
}

export default function StatusKanban({
  statuses, 
  onStatusesUpdate,
  onStatusRemove
}: StatusKanbanProps): JSX.Element {
  const onDragEnd = (result: DropResult) => { // Используем правильный тип
    const { destination, source, draggableId } = result;
    
    // Если элемент не перемещен или перемещен на то же место
    if (!destination || 
        (destination.droppableId === source.droppableId &&
         destination.index === source.index)) {
      return;
    }

    const newStatuses = Array.from(statuses);
    const [removed] = newStatuses.splice(source.index, 1);
    newStatuses.splice(destination.index, 0, removed);

    onStatusesUpdate(newStatuses);
  };

  return (
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
            {statuses.map((status, index) => (
              <Draggable 
                key={status.id} 
                draggableId={`status-${status.id}`} // Добавляем префикс
                index={index}
              >
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps} // Перенес сюда
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
                        <CloseIcon width={16} height={16} />
                      </button>
                    </div>
                    {status.description && (
                      <div className="kanbanColumnDescriptionWrapper">
                        <div className="statusDescription">
                          {status.description}
                        </div>
                      </div>
                    )}
                    <div className="kanbanColumnBody"></div>
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
}