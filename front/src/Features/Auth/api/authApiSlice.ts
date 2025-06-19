import { apiSlice } from 'App/api/apiSlice.ts';
/**
 * API срез для аутентификации и авторизации.
 * Содержит endpoints для входа, регистрации, обновления токенов и сброса пароля.
 * 
 * @module authApiSlice
 * @example
 * // Пример использования хука login:
 * const [login] = useLoginMutation();
 * login({ username: 'user', password: 'pass' });
 * 
 * @example
 * // Пример использования хука passwordResetRequest:
 * const [resetRequest] = usePasswordResetRequestMutation();
 * resetRequest({ email: 'user@example.com' });
 */
export const authApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    /**
     * Endpoint для входа пользователя.
     * @method POST
     * @param {Object} credentials - Данные для входа.
     * @param {string} credentials.username - Имя пользователя.
     * @param {string} credentials.password - Пароль.
     * @returns {Promise} Промис с данными аутентификации.
     */
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

    /**
     * Endpoint для регистрации нового пользователя.
     * @method POST
     * @param {Object} credentials - Данные для регистрации.
     * @param {string} credentials.username - Имя пользователя.
     * @param {string} credentials.email - Email пользователя.
     * @param {string} credentials.password - Пароль.
     * @returns {Promise} Промис с результатом регистрации.
     */
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

    /**
     * Endpoint для обновления access токена.
     * @method POST
     * @param {Object} credentials - Данные для обновления токена.
     * @param {string} credentials.refresh - Refresh токен.
     * @returns {Promise} Промис с новым access токеном.
     */
    refreshAccessToken: builder.mutation({
      query: (credentials: { refresh: string | null }) => ({
        url: '/api/token/refresh/',
        method: 'POST',
        body: { ...credentials },
      }),
    }),

    /**
     * Endpoint для верификации access токена.
     * @method POST
     * @param {Object} credentials - Данные для верификации.
     * @param {string} credentials.access - Access токен.
     * @returns {Promise} Промис с результатом верификации.
     */
    verifyAccessToken: builder.mutation({
      query: (credentials: { access: string | null }) => ({
        url: '/api/token/verify/',
        method: 'POST',
        body: { ...credentials },
      }),
    }),

    /**
     * Endpoint для запроса сброса пароля.
     * @method POST
     * @param {Object} data - Данные для запроса.
     * @param {string} data.email - Email пользователя.
     * @returns {Promise<void>} Пустой промис.
     */
    passwordResetRequest: builder.mutation<void, { email: string }>({
      query: (data) => ({
        url: '/api/password-reset/',
        method: 'POST',
        body: data,
      }),
    }),

    /**
     * Endpoint для подтверждения сброса пароля.
     * @method POST
     * @param {Object} data - Данные для подтверждения.
     * @param {string} data.token - Токен сброса пароля.
     * @param {string} data.new_password - Новый пароль.
     * @returns {Promise<void>} Пустой промис.
     */
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
