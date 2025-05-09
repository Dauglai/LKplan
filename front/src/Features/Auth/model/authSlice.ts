import { createSlice } from '@reduxjs/toolkit';

import { RootState } from 'App/model/store.ts';

export interface AuthState {
  // user: Object | null;
  token: string | null;
  refresh: string | null;
}

const initialState: AuthState = {
  user: null,
  token: null,
  refresh: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      const { access, refresh } = action.payload;
      state.token = access;
      state.refresh = refresh;
      state.isAuthenticated = true;
      localStorage.setItem('auth', JSON.stringify({ access, refresh }));
    },

    logOut: (state) => {
      state.token = null;
      state.refresh = null;
      state.isAuthenticated = false;
      localStorage.removeItem('auth');
      localStorage.removeItem('user');
    },
  },
});

export const { setCredentials, logOut } = authSlice.actions;

export const authReducer = authSlice.reducer;

export const selectIsAuthenticated = (state: RootState) => state.auth.isAuthenticated;
export const selectCurrentToken = (state: RootState) => state.auth.token;
