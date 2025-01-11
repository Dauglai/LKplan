import { configureStore } from '@reduxjs/toolkit';
import { apiSlice } from '../api/apiSlice.ts';
import { authReducer, setCredentials } from 'Features/Auth/model/authSlice.ts';

export const store = configureStore({
  reducer: {
    [apiSlice.reducerPath]: apiSlice.reducer,
    auth: authReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(apiSlice.middleware),
  devTools: true,
});


const initializeAuthState = (store: typeof store) => {
  const storedAuth = localStorage.getItem('auth');
  if (storedAuth) {
    try {
      const { access, refresh } = JSON.parse(storedAuth);
      if (access && refresh) {
        store.dispatch(setCredentials({ access, refresh }));
      }
    } catch (error) {
      console.error('Failed to parse auth from localStorage:', error);
    }
  }
};

initializeAuthState(store);

export type AppStore = typeof store;
export type RootState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];

