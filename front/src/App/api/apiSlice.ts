import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { baseURL } from '../config/api.ts';
import { RootState } from '../model/store.ts';

import { setCredentials, logOut } from 'Features/Auth/model/authSlice.ts';

const baseQuery = fetchBaseQuery({
  baseUrl: baseURL,
  credentials: 'include',
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).auth.token;
    if (token) {
      headers.set('authorization', `Bearer ${token}`);
    }
    return headers;
  },
});

const baseQueryWithReauth = async (args: any, api: any, extraOptions: any) => {
  let result = await baseQuery(args, api, extraOptions);

  if (result?.error?.status === 401 || result?.error?.status === 403) {
    const state = api.getState() as RootState;
    const refreshToken = state.auth.refresh;

    if (!refreshToken) {
      api.dispatch(logOut());
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
      api.dispatch(setCredentials({
        access: (refreshResponse.data as any).access,
        refresh: refreshToken,
      }));
    
      // Повторный запрос после обновления токена
      result = await baseQuery(args, api, extraOptions);
    } else {
      api.dispatch(logOut());
    }
    
  }

  return result;
};

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
    'Trigger', 
    'Robot'

  ],
  endpoints: (builder) => ({}),
});
