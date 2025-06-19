import { configureStore } from '@reduxjs/toolkit'; // Основной инструмент для создания хранилища
import { apiSlice } from '../api/apiSlice.ts'; // Основной API slice приложения
import { authReducer, setCredentials } from 'Features/Auth/model/authSlice.ts'; // Редьюсер и экшены авторизации
import { eventSetupReducer } from 'Features/store/eventSetupSlice.tsx'; // Редьюсер для событий

/**
 * Главное хранилище состояния приложения
 * Содержит:
 * - API slice (RTK Query)
 * - Состояние авторизации
 * - Состояние событий
 */
export const store = configureStore({
  reducer: {
    [apiSlice.reducerPath]: apiSlice.reducer, // Подключаем редьюсер API
    auth: authReducer, // Подключаем редьюсер авторизации
    event: eventSetupReducer, // Подключаем редьюсер событий
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(apiSlice.middleware), // Добавляем middleware API
  devTools: true, // Включаем Redux DevTools
});

/**
 * Инициализирует состояние авторизации из localStorage
 * @param {typeof store} store - Экземпляр Redux store
 */
const initializeAuthState = (store: typeof store) => {
  const storedAuth = localStorage.getItem('auth'); // Получаем данные из localStorage
  if (storedAuth) {
    try {
      const { access, refresh } = JSON.parse(storedAuth); // Парсим данные
      if (access && refresh) {
        store.dispatch(setCredentials({ access, refresh })); // Устанавливаем credentials
      }
    } catch (error) {
      console.error('Failed to parse auth from localStorage:', error); // Логируем ошибку парсинга
    }
  }
};

initializeAuthState(store); // Вызываем инициализацию при создании store

export type AppStore = typeof store; // Тип хранилища
export type RootState = ReturnType<AppStore['getState']>; // Тип корневого состояния
export type AppDispatch = AppStore['dispatch']; // Тип dispatch
