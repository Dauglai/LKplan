import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Provider } from 'react-redux';

import './index.css';

import App from './App.tsx';
import { store } from '../model/store.ts';

import Layout from 'Shared/ui/layout/layout.tsx';
import RequireAuth from 'Shared/ui/requireAuth.tsx';
import { NotificationProvider } from 'Widgets/Notification/Notification.tsx';

import Login from 'Pages/Login/ui/Login.tsx';
import Register from 'Pages/Register/ui/Register.tsx';
import Profile from 'Pages/Profile/ui/Profile.tsx';
import RequestsManagement from 'Pages/RequestsList/RequestsManagement.tsx';
import Tasks from 'Pages/Tasks/Tasks.tsx';
import { ConfigProvider } from 'antd';
import EventsManagement from 'Pages/EventsList/EventsManagement.tsx';
import ProjectsManagement from 'Pages/ProjectsList/ProjectsManagement.tsx';
import DirectionsManagement from 'Pages/DirectionsList/DirectionsManagement.tsx';
import TeamsManagement from 'Pages/TeamsList/TeamsManagement.tsx';
import CreateSpecializationForm from 'Pages/CreateSpecialization/CreateSpecializationForm.tsx'
import CreateStatusAppForm from 'Pages/CreateStatusApp/CreateStatusAppForm.tsx';
import EventPage from 'Pages/Event/EventPage.tsx';
import ProjectPage from 'Pages/Project/ProjectPage.tsx';
import TeamPage from 'Pages/Team/TeamPage.tsx';
import RequestPage from 'Pages/Request/RequestPage.tsx';
import UsersProfilePage from 'Pages/UsersProfile/UsersProfilePage.tsx';

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
        <NotificationProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Layout />}>
                <Route path="/" element={<App />}/>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/" element={<RequireAuth />}>
                  <Route path="/profile" element={<Profile />}/>
                  <Route path="/requests" element={<RequestsManagement />} />
                  <Route path="/tasks" element={<Tasks />} />
                  <Route path="/events" element={<EventsManagement />} />
                  <Route path="/projects" element={<ProjectsManagement />} />
                  <Route path="/directions" element={<DirectionsManagement />} />
                  <Route path="/teams" element={<TeamsManagement />} />
                  <Route path="/create-new-specialization" element={<CreateSpecializationForm />} />
                  <Route path="/create-new-status-app" element={<CreateStatusAppForm />} />
                  <Route path="/event/:id" element={<EventPage />} />
                  <Route path="/project/:id" element={<ProjectPage />} />
                  <Route path="/team/:id" element={<TeamPage />} />
                  <Route path="/events/submit/:id" element={<RequestPage />} />
                  <Route path="/profile/:id" element={<UsersProfilePage />} />
                </Route>
            </Route>
            </Routes>
          </BrowserRouter>
        </NotificationProvider>
      </Provider>
    </ConfigProvider>
  </StrictMode>
);
