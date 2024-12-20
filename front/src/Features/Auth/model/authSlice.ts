import { createSlice } from '@reduxjs/toolkit';

import { RootState } from 'App/model/store.ts';

export interface AuthState {
  user: Object | null;
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
  initialState: initialState,
  reducers: {
    setCredentials: (state, action) => {
      const { user, access, refresh } = action.payload;
      state.user = user;
      state.token = access;
      state.refresh = refresh;
    },

    logOut: (state) => {
      state.user = null;
      state.token = null;
      state.refresh = null;
    },
  },
});

export const { setCredentials, logOut } = authSlice.actions;

export const authReducer = authSlice.reducer;

export const selectCurrentUser = (state: RootState) => state.auth.user;
export const selectCurrentToken = (state: RootState) => state.auth.token;
