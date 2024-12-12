import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Provider } from 'react-redux';

import { ConfigProvider } from 'antd';

import './index.css';

import App from './App.tsx';
import { store } from '../model/store.ts';

import RequireAuth from 'Shared/ui/requireAuth.tsx';

import Login from 'Pages/Login/ui/Login.tsx';
import Register from 'Pages/Register/ui/Register.tsx';
import Profile from 'Pages/Profile/ui/Profile.tsx';
import Tasks from 'Pages/Tasks/Tasks.tsx';
import AuthLayout from 'Shared/ui/layout/layout.tsx';
import AuthedLayout from 'Shared/ui/AuthedLayout/authedLayout.tsx';

const theme = {
  token: {
    colorPrimary: '#FED201',
    colorTextBase: '#424242',
    colorTextLightSolid: '#424242',
    controlHeightLG: '51px',
    fontSizeLG: '24px',
  },
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ConfigProvider theme={theme}>
      <Provider store={store}>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<AuthLayout />}>
              <Route path="/" element={<App />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/" element={<RequireAuth />}>
                <Route path="/profile" element={<Profile />} />
              </Route>
            </Route>
            <Route path="/" element={<AuthedLayout />}>
              <Route path="/tasks" element={<Tasks />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </Provider>
    </ConfigProvider>
  </StrictMode>
);
