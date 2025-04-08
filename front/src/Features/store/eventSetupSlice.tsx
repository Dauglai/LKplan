import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Event } from "Features/ApiSlices/eventSlice";
import { Direction } from "Features/ApiSlices/directionSlice";
import { Project } from "Features/ApiSlices/projectSlice";

interface EventSetupState {
    stepEvent: Event;  // Данные о мероприятии
    stepDirections: { directions: Direction[] };  // Направления для мероприятия
    stepProjects: { projects: Project[] };  // Проекты, связанные с мероприятием
}

const initialState: EventSetupState = {
    stepEvent: {
        name: '',
        description: '',
        link: '',
        stage: 'Редактирование',  // Начальная стадия мероприятия
        start: '',
        end: '',
        specializations: [],
        statuses: [1],  // Статус мероприятия по умолчанию
        supervisor: 2,  // Ответственный за мероприятие
        creator: 2  // Создатель мероприятия
    },
    stepDirections: { directions: [] },  // Направления (по умолчанию пустой массив)
    stepProjects: { projects: [] },  // Проекты (по умолчанию пустой массив)
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
     * Сбросить все данные о мероприятии к начальному состоянию.
     */
    resetEvent: () => initialState,
  },
});

// Экспорт экшенов и редьюсера слайса
export const { 
  updateEvent, updateEventField, 
  updateDirections, addDirection, removeDirection,
  updateProjects, addProject, removeProject,
  resetEvent 
} = eventSlice.actions;
export const eventSetupReducer = eventSlice.reducer;

