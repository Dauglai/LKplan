import { createSlice } from '@reduxjs/toolkit'; // Импорт createSlice из Redux Toolkit
import { RootState } from 'App/model/store.ts'; // Тип RootState для типизации селекторов

/**
 * Интерфейс состояния аутентификации.
 * 
 * @property {string | null} token - Access токен.
 * @property {string | null} refresh - Refresh токен.
 * @property {boolean} [isAuthenticated] - Флаг аутентификации (опционально).
 */
export interface AuthState {
  token: string | null;
  refresh: string | null;
  isAuthenticated?: boolean;
}

/**
 * Начальное состояние для слайса аутентификации.
 */
const initialState: AuthState = {
  user: null,
  token: null,
  refresh: null,
  isAuthenticated: false,
};

/**
 * Слайс для управления состоянием аутентификации.
 * Содержит редьюсеры и действия для работы с токенами.
 * 
 * @slice
 * @example
 * // Пример использования:
 * dispatch(setCredentials({ access: 'token', refresh: 'refresh' }));
 * dispatch(logOut());
 */
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    /**
     * Устанавливает учетные данные пользователя.
     * Сохраняет токены в состоянии и localStorage.
     * 
     * @param {AuthState} state - Текущее состояние.
     * @param {Object} action - Объект действия.
     * @param {string} action.payload.access - Access токен.
     * @param {string} action.payload.refresh - Refresh токен.
     */
    setCredentials: (state, action) => {
      const { access, refresh } = action.payload;
      state.token = access;
      state.refresh = refresh;
      state.isAuthenticated = true;
      localStorage.setItem('auth', JSON.stringify({ access, refresh }));
    },

    /**
     * Выход пользователя из системы.
     * Очищает токены в состоянии и localStorage.
     * 
     * @param {AuthState} state - Текущее состояние.
     */
    logOut: (state) => {
      state.token = null;
      state.refresh = null;
      state.isAuthenticated = false;
      localStorage.removeItem('auth');
      localStorage.removeItem('user');
    },
  },
});

// Экспорт действий
export const { setCredentials, logOut } = authSlice.actions;

// Экспорт редьюсера
export const authReducer = authSlice.reducer;

/**
 * Селектор для проверки аутентификации пользователя.
 * 
 * @param {RootState} state - Корневое состояние Redux.
 * @returns {boolean} Флаг аутентификации.
 */
export const selectIsAuthenticated = (state: RootState) => state.auth.isAuthenticated;

/**
 * Селектор для получения текущего access токена.
 * 
 * @param {RootState} state - Корневое состояние Redux.
 * @returns {string | null} Текущий access токен или null.
 */
export const selectCurrentToken = (state: RootState) => state.auth.token;
