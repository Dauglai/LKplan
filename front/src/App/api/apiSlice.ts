import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { baseURL } from '../config/api.ts';
import { RootState } from '../model/store.ts';

import { setCredentials, logOut } from 'Features/Auth/model/authSlice.ts';
// TODO: save tokens in cookies 
const baseQuery = fetchBaseQuery({
  baseUrl: baseURL,
  credentials: 'include',

  prepareHeaders: (headers, { getState }) => {
    const state = getState() as RootState;
    const token = state.auth.token;
    if (token) {
      headers.set('authorization', `Bearer ${token}`);
    }
    return headers;
  },
});

const baseQueryWithReauth: typeof baseQuery = async (
  args,
  api,
  extraOptions
) => {
  let result = await baseQuery(args, api, extraOptions);
  if (result.error && result.error.status === 403) {
    const refreshToken = (api.getState() as RootState).auth.refresh;
    // try to get a new token
    const refreshResult = await baseQuery(
      {
        url: '/api/token/refresh/',
        body: { refresh: refreshToken },
      },
      api,
      extraOptions
    );
    if (refreshResult?.data) {
      const user = (api.getState() as RootState).auth.user;
      // store the new token
      api.dispatch(setCredentials({ ...refreshResult.data, user }));
      // retry the initial query
      result = await baseQuery(args, api, extraOptions);
    } else {
      api.dispatch(logOut());
    }
  }
  return result;
};

export const apiSlice = createApi({
  baseQuery: baseQueryWithReauth,
  endpoints: (builder) => ({}),
});
