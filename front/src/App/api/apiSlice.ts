import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { baseURL } from '../config/api.ts';
import { RootState } from '../model/store.ts';

import { setCredentials, logOut } from 'Features/Auth/model/authSlice.ts';

export function getCSRFToken() {
  const csrfToken = document.cookie
    .split('; ')
    .find((row) => row.startsWith('csrftoken'))
    ?.split('=')[1];
  return csrfToken;
}

const baseQuery = fetchBaseQuery({
  baseUrl: baseURL,
  credentials: 'include',

  prepareHeaders: (headers, { getState }) => {
    const state = getState() as RootState;
    if (getCSRFToken()) {
      headers.set('X-CSRFToken', getCSRFToken() || "");
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
    if (!refreshToken) {
      api.dispatch(logOut());
      return result;
    }

    const refreshResult = await baseQuery(
      {
        url: '/api/token/refresh/',
        method: 'POST',
        body: { refresh: refreshToken },
      },
      api,
      extraOptions
    );

    if (refreshResult?.data) {
      const user = (api.getState() as RootState).auth.user;
      api.dispatch(setCredentials({ ...refreshResult.data, user }));
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
  ],
  endpoints: (builder) => ({}),
});
