import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Provider } from 'react-redux';

import './index.css';

import App from './App.tsx';
import { store } from '../model/store.ts';

import Layout from 'Shared/ui/layout/layout.tsx';
import RequireAuth from 'Shared/ui/requireAuth.tsx';

import Login from 'Pages/Login/ui/Login.tsx';
import Register from 'Pages/Register/ui/Register.tsx';
import Profile from 'Pages/Profile/ui/Profile.tsx';
import RequestsManagement from 'Pages/Requests/ui/RequestsManagement.tsx';
import CreateEventForm from 'Pages/CreateEvent/ui/CreateEventForm/CreateEventForm.tsx';
import CreateProjectForm from 'Pages/CreateEvent/ui/CreateProjectForm/CreateProjectForm.tsx'
import { StudentReq } from 'Pages/StudentReq/index.ts';
import Tasks from 'Pages/Tasks/Tasks.tsx';
import { ConfigProvider } from 'antd';
import EventListPage from 'Pages/EventList/EventList.tsx';

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
            <Route path="/" element={<Layout />}>
              <Route path="/" element={<App />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/StudReq/:uId" element={<StudentReq />} />
              <Route path="/" element={<RequireAuth />}>
                <Route path="/profile" element={<Profile />} />
              </Route>
              <Route path="/requests-list" element={<RequestsManagement />} />
              <Route path="/tasks" element={<Tasks />} />
              <Route path="/create-new-event" element={<CreateEventForm />} />
              <Route path="/events-list" element={<EventListPage />} />
              <Route path="/create-new-project" element={<CreateProjectForm />} />
          </Route>
          </Routes>
        </BrowserRouter>
      </Provider>
    </ConfigProvider>
  </StrictMode>
);
