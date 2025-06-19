import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'; // Инструменты для RTK Query
import { baseURL } from '../config/api.ts'; // Базовый URL API
import { RootState } from '../model/store.ts'; // Типы хранилища
import { setCredentials, logOut } from 'Features/Auth/model/authSlice.ts'; // Экшены для авторизации

/**
 * Базовый запрос с настройками авторизации
 * Добавляет токен в заголовки при наличии
 */
const baseQuery = fetchBaseQuery({
  baseUrl: baseURL,
  credentials: 'include',
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).auth.token; // Получаем токен из хранилища
    if (token) {
      headers.set('authorization', `Bearer ${token}`);
    }
    return headers;
  },
});

/**
 * Расширенный запрос с обработкой 401/403 ошибок
 * При обнаружении ошибки авторизации пытается обновить токен
 * и повторить оригинальный запрос
 */
const baseQueryWithReauth = async (args: any, api: any, extraOptions: any) => {
  let result = await baseQuery(args, api, extraOptions); // Первоначальный запрос

  // Обработка ошибок авторизации
  if (result?.error?.status === 401 || result?.error?.status === 403) {
    const state = api.getState() as RootState;
    const refreshToken = state.auth.refresh; // Получаем refresh токен

    if (!refreshToken) {
      api.dispatch(logOut()); // Разлогиниваем если нет refresh токена
      return result;
    }

    // Пробуем обновить access токен
    const refreshResponse = await baseQuery(
      {
        url: '/api/token/refresh/',
        method: 'POST',
        body: { refresh: refreshToken },
      },
      api,
      extraOptions
    );

    if (refreshResponse?.data) {
      // Обновляем credentials в хранилище
      api.dispatch(setCredentials({
        access: (refreshResponse.data as any).access,
        refresh: refreshToken,
      }));
    
      result = await baseQuery(args, api, extraOptions); // Повторяем запрос
    } else {
      api.dispatch(logOut()); // Разлогиниваем при ошибке обновления
    }
  }

  return result;
};

/**
 * Базовый API slice с настройкой авторизации и reauth логикой
 * Содержит определения всех tagTypes, используемых в приложении
 */
export const apiSlice = createApi({
  baseQuery: baseQueryWithReauth,
  tagTypes: [
    'Specialization',
    'Direction',
    'Project',
    'User',
    'StatusApp',
    'Event',
    'Application',
    'AppReview',
    'Team',
    'Meeting',
    'Result',
    'Task',
    'UserRoles',
    'StatusOrder',
    'FunctionOrder',
  ],
  endpoints: (builder) => ({}),
});