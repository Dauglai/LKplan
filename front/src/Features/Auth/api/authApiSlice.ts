import { apiSlice } from 'App/api/apiSlice.ts';

// function getCSRFToken() {
//   const csrfToken = document.cookie
//     .split('; ')
//     .find((row) => row.startsWith('csrftoken'))
//     ?.split('=')[1];
//   return csrfToken;
// }

// TODO add types for credentials
export const authApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (credentials: { username: string; password: string }) => ({
        url: '/api/token/',
        method: 'POST',
        credentials: 'include',
        body: {
          username: credentials.username,
          password: credentials.password,
        },
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
      }),
    }),
    refreshAccessToken: builder.mutation({
      query: (credentials: { refresh: string | null }) => ({
        url: '/api/token/refresh/',
        method: 'POST',
        body: { ...credentials },
      }),
    }),
    verifyAccessToken: builder.mutation({
      query: (credentials: { access: string | null }) => ({
        url: '/api/token/verify/',
        method: 'POST',
        body: { ...credentials },
      }),
    }),
    passwordResetRequest: builder.mutation<void, { email: string }>({
      query: (data) => ({
        url: '/api/password-reset/',
        method: 'POST',
        body: data,
      }),
    }),
    passwordResetConfirm: builder.mutation<void, { token: string; new_password: string }>({
      query: (data) => ({
        url: '/api/password-reset/confirm/',
        method: 'POST',
        body: data,
      }),
    }),    
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useRefreshAccessTokenMutation,
  useVerifyAccessTokenMutation,
  usePasswordResetRequestMutation,
  usePasswordResetConfirmMutation,
} = authApiSlice;
