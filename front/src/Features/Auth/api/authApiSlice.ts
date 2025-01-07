import { apiSlice } from 'App/api/apiSlice.ts';

function getCSRFToken() {
  const csrfToken = document.cookie
    .split('; ')
    .find((row) => row.startsWith('csrftoken'))
    ?.split('=')[1];
  return csrfToken;
}

// TODO add types for credentials
export const authApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (credentials: { username: string; password: string }) => ({
        url: '/api-auth/login/',
        method: 'POST',
        body: new URLSearchParams({
          username: credentials.username,
          password: credentials.password,
        }),
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'X-CSRFToken': getCSRFToken(), // Передача CSRF-токена
        },
        credentials: 'include',
      }),
    }),
    register: builder.mutation({
      query: (credentials) => ({
        url: '/api/register/',
        method: 'POST',
        body: {
          username: credentials.username,
          email: credentials.email,
          password: credentials.password,
        },
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'X-CSRFToken': getCSRFToken(), // Передача CSRF-токена
        },
        credentials: 'include',
      }),
    }),
    // refreshAccessToken: builder.mutation({
    //   query: (credentials: { refresh: string | null }) => ({
    //     url: '/api/token/refresh/',
    //     method: 'POST',
    //     body: { ...credentials },
    //   }),
    // }),
    // verifyAccessToken: builder.mutation({
    //   query: (credentials: { access: string | null }) => ({
    //     url: '/api/token/verify/',
    //     method: 'POST',
    //     body: { ...credentials },
    //   }),
    // }),
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  // useRefreshAccessTokenMutation,
  // useVerifyAccessTokenMutation,
} = authApiSlice;
