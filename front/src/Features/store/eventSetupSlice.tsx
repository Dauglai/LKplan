import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Event } from "Features/ApiSlices/eventSlice";
import { Direction } from "Features/ApiSlices/directionSlice";
import { Project } from "Features/ApiSlices/projectSlice";
import { StatusApp } from "Features/ApiSlices/statusAppSlice";
import { Trigger } from "Features/ApiSlices/triggerApiSlice";
import { Robot } from "Features/ApiSlices/robotApiSlice";

interface EventSetupState {
  stepEvent: Event;
  stepDirections: { directions: Direction[] };
  stepProjects: { projects: Project[] };
  stepStatuses: {
    statuses: StatusApp[];
    statusOrders: {
      id?: number;
      status: number;
      number: number;
    }[];
  };
  stepRobots: {
    robots: Robot[];
    functionOrders: {
      id?: number;
      status_order: number;
      position: number;
      robot: number;
      config: Record<string, any>;
    }[];
  };
  editingEventId: number | null;
}

const initialState: EventSetupState = {
  stepEvent: {
    name: '',
    description: '',
    stage: 'Редактирование',
    start: '',
    end: '',
    end_app: '',
    specializations: [],
  },
  stepDirections: { directions: [] },
  stepProjects: { projects: [] },
  stepStatuses: { 
    statuses: [],
    statusOrders: [] 
  },
  stepRobots: {
    robots: [],
    functionOrders: []
  },
  editingEventId: null,
};

/**
 * Слайс для управления состоянием мероприятия, направлений и проектов.
 */

const eventSlice = createSlice({
  name: "event",  // Название слайса
  initialState,
  reducers: {
    /**
     * Обновить все данные о мероприятии.
     * @param state Текущее состояние
     * @param action Новые данные мероприятия
     */
    updateEvent(state, action: PayloadAction<Event>) {
        state.stepEvent = { ...state.stepEvent, ...action.payload };
    },

    /**
     * Обновить одно поле в мероприятии.
     * @param state Текущее состояние
     * @param action Обновляемое поле и новое значение
     */
    updateEventField<K extends keyof Event>(state, action: PayloadAction<{ field: K; value: Event[K] }>) {
        state.stepEvent[action.payload.field] = action.payload.value;
    },

    setEditingEventId(state, action: PayloadAction<number | null>) {
      state.editingEventId = action.payload;
    },

    /**
     * Обновить направления мероприятия.
     * @param state Текущее состояние
     * @param action Новые направления
     */
    updateDirections(state, action: PayloadAction<Direction[]>) {
        state.stepDirections.directions = action.payload;
    },

    /**
     * Добавить одно направление.
     * @param state Текущее состояние
     * @param action Направление для добавления
     */
    addDirection(state, action: PayloadAction<Direction>) {
        state.stepDirections.directions.push({ ...action.payload, id: Date.now().toString() });
    },

    /**
     * Удалить направление по id.
     * @param state Текущее состояние
     * @param action ID направления для удаления
     */
    removeDirection(state, action: PayloadAction<number>) {
        state.stepDirections.directions = state.stepDirections.directions.filter(
            (direction) => direction.id !== action.payload
        );
    },

    /**
     * Обновить проекты мероприятия.
     * @param state Текущее состояние
     * @param action Новые проекты
     */
    updateProjects(state, action: PayloadAction<Project[]>) {
        state.stepProjects.projects = action.payload;
    },

    /**
     * Добавить один проект.
     * @param state Текущее состояние
     * @param action Проект для добавления
     */
    addProject(state, action: PayloadAction<Project>) {
        state.stepProjects.projects.push({ ...action.payload, project_id: Date.now().toString() });
    },

    /**
     * Удалить проект по id.
     * @param state Текущее состояние
     * @param action ID проекта для удаления
     */
    removeProject(state, action: PayloadAction<number>) {
        state.stepProjects.projects = state.stepProjects.projects.filter(
            (project) => project.project_id !== action.payload
        );
    },

    /**
     * Обновить статусы мероприятия.
     * @param state Текущее состояние
     * @param action Новые статусы
     */
    updateStatuses(state, action: PayloadAction<StatusApp[]>) {
      state.stepStatuses.statuses = action.payload;
    },
    
    /**
     * Добавить один статус.
     * @param state Текущее состояние
     * @param action Статус для добавления
     */
    addStatus(state, action: PayloadAction<StatusApp>) {
      state.stepStatuses.statuses.push(action.payload);
    },

    /**
     * Удалить статус по id.
     * @param state Текущее состояние
     * @param action ID статуса для удаления
     */
    removeStatus(state, action: PayloadAction<number>) {
      state.stepStatuses.statuses = state.stepStatuses.statuses.filter(
        (status) => status.id !== action.payload
      );
    },
    
    // Обновить статус
    updateStatus(state, action: PayloadAction<StatusApp>) {
      const index = state.stepStatuses.statuses.findIndex((status) => status.id === action.payload.id);
      if (index !== -1) {
        state.stepStatuses.statuses[index] = action.payload;
      }
    },

    reorderStatuses(state, action: PayloadAction<StatusApp[]>) {
      state.stepStatuses.statuses = action.payload;
      // Обновляем порядок в statusOrders
      state.stepStatuses.statusOrders = action.payload.map((status, index) => ({
        id: status.id,
        status: status.id,
        number: index + 1
      }));
    },

    // Добавление триггера к статусу
    addTriggerToStatus(state, action: PayloadAction<{
      statusId: number;
      trigger: Omit<Trigger, 'id'>;
    }>) {
      const status = state.stepStatuses.statuses.find(s => 
        s.id === action.payload.statusId || s.name === action.payload.statusId
      );
      if (status) {
        if (!status.triggers) status.triggers = [];
        status.triggers.push({
          ...action.payload.trigger,
          id: Date.now() // Временный ID для фронта
          });
        }
      },

      // Обновление триггера
      updateTrigger(state, action: PayloadAction<{
        statusId: number;
        triggerId: number;
        changes: Partial<Trigger>;
      }>) {
        const status = state.stepStatuses.statuses.find(s => 
          s.id === action.payload.statusId || s.name === action.payload.statusId
        );
        if (status?.triggers) {
          const triggerIndex = status.triggers.findIndex(t => 
            t.id === action.payload.triggerId
          );
          if (triggerIndex !== -1) {
            status.triggers[triggerIndex] = {
              ...status.triggers[triggerIndex],
              ...action.payload.changes
            };
          }
        }
      },

      // Удаление триггера
      removeTriggerFromStatus(state, action: PayloadAction<{
        statusId: number;
        triggerId: number;
      }>) {
        const status = state.stepStatuses.statuses.find(s => 
          s.id === action.payload.statusId || s.name === action.payload.statusId
        );
        if (status?.triggers) {
          status.triggers = status.triggers.filter(
            t => t.id !== action.payload.triggerId
          );
        }
      },

      // Обновление порядка триггеров
      reorderTriggers(state, action: PayloadAction<{
        statusId: number;
        triggers: Trigger[];
      }>) {
        const status = state.stepStatuses.statuses.find(s => 
          s.id === action.payload.statusId || s.name === action.payload.statusId
        );
        if (status) {
          status.triggers = action.payload.triggers;
        }
      },

      moveTriggerBetweenStatuses: (state, action: PayloadAction<{
      source: { statusId: number; triggerId: number };
      destination: { statusId: number };
    }>) => {
      const { source, destination } = action.payload;
      const statuses = state.stepStatuses.statuses;
      
      const sourceStatus = statuses.find(s => s.id === source.statusId);
      const destStatus = statuses.find(s => s.id === destination.statusId);
      
      if (sourceStatus && destStatus) {
        const triggerIndex = sourceStatus.triggers?.findIndex(t => t.id === source.triggerId) ?? -1;
        
        if (triggerIndex !== -1) {
          const [trigger] = sourceStatus.triggers.splice(triggerIndex, 1);
          destStatus.triggers = [...(destStatus.triggers || []), trigger];
        }
      }
    },

    // Добавляем робота в общий список
    addRobot(state, action: PayloadAction<Robot>) {
      state.stepRobots.robots.push({
        ...action.payload,
        id: action.payload.id || Date.now()
      });
    },

    // Привязываем робота к триггеру
    attachRobotToTrigger(state, action: PayloadAction<{
      statusId: number;
      triggerId: number;
      robotId: number;
    }>) {
      const status = state.stepStatuses.statuses.find(s => s.id === action.payload.statusId);
      const trigger = status?.triggers?.find(t => t.id === action.payload.triggerId);
      
      if (trigger) {
        trigger.robotId = action.payload.robotId;
      }
    },

    // Отвязываем робота от триггера
    detachRobotFromTrigger(state, action: PayloadAction<{
      statusId: number;
      triggerId: number;
    }>) {
      const status = state.stepStatuses.statuses.find(s => s.id === action.payload.statusId);
      const trigger = status?.triggers?.find(t => t.id === action.payload.triggerId);
      
      if (trigger) {
        delete trigger.robotId;
      }
    },

    // Перемещение робота между триггерами
    moveRobotBetweenTriggers(state, action: PayloadAction<{
      source: { statusId: number; triggerId: number };
      destination: { statusId: number; triggerId: number };
      robotId: number;
    }>) {
      // Удаляем из исходного триггера
      const sourceStatus = state.stepStatuses.statuses.find(
        s => s.id === action.payload.source.statusId
      );
      const sourceTrigger = sourceStatus?.triggers?.find(
        t => t.id === action.payload.source.triggerId
      );
      
      if (sourceTrigger?.robotId === action.payload.robotId) {
        delete sourceTrigger.robotId;
      }

      // Добавляем в новый триггер
      const destStatus = state.stepStatuses.statuses.find(
        s => s.id === action.payload.destination.statusId
      );
      const destTrigger = destStatus?.triggers?.find(
        t => t.id === action.payload.destination.triggerId
      );
      
      if (destTrigger) {
        destTrigger.robotId = action.payload.robotId;
      }
    },

    addFunctionOrder(state, action: PayloadAction<{
      statusId: number;
      position: number;
      robotId?: number;
      triggerId?: number;
      config: Record<string, any>;
    }>) {
      const { statusId, position, robotId, triggerId, config } = action.payload;
      
      if (!robotId && !triggerId) return;

      state.stepRobots.functionOrders.push({
        id: Date.now(),
        status_order: statusId,
        position,
        robot: robotId,
        trigger: triggerId,
        config
      });
    },

    // Обновление FunctionOrder
    updateFunctionOrder(state, action: PayloadAction<{
      id: number;
      changes: {
        position?: number;
        config?: Record<string, any>;
      };
    }>) {
      const order = state.stepRobots.functionOrders.find(o => o.id === action.payload.id);
      if (order) {
        Object.assign(order, action.payload.changes);
      }
    },

    /**
     * Сбросить все данные о мероприятии к начальному состоянию.
     */
    resetEvent: () => initialState,
  },
});

// Экспорт экшенов и редьюсера слайса
export const { 
  updateEvent, updateEventField, setEditingEventId,
  updateDirections, addDirection, removeDirection,
  updateProjects, addProject, removeProject,
  updateStatuses, addStatus, removeStatus, updateStatus, reorderStatuses,
  addTriggerToStatus, updateTrigger, removeTriggerFromStatus, reorderTriggers, moveTriggerBetweenStatuses,
  addRobot, attachRobotToTrigger, detachRobotFromTrigger, moveRobotBetweenTriggers,
  addFunctionOrder, updateFunctionOrder,
  resetEvent, 
} = eventSlice.actions;
export const eventSetupReducer = eventSlice.reducer;

