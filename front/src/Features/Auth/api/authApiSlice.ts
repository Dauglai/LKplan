import { apiSlice } from 'App/api/apiSlice.ts';


// TODO add types for credentials
export const authApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (credentials: { username: string; password: string }) => ({
        url: '/api/token/',
        method: 'POST',
        body: {
          username: credentials.username,
          password: credentials.password,
        },
      }),
    }),
    register: builder.mutation({
      query: (credentials) => ({
        url: '/api-auth/register/',
        method: 'POST',
        body: { ...credentials },
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
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useRefreshAccessTokenMutation,
  useVerifyAccessTokenMutation,
} = authApiSlice;
