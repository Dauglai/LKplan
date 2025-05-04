import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Provider } from 'react-redux';

import './index.css';

import App from './App.tsx';
import { store } from '../model/store.ts';

import Layout from 'Shared/ui/layout/layout.tsx';
import RequireAuth from 'Shared/ui/requireAuth.tsx';
import { RequireRole } from 'Shared/ui/RequireRole.tsx';
import { NotificationProvider } from 'Widgets/Notification/Notification.tsx';

import Login from 'Pages/Login/Login.tsx';
import Register from 'Pages/Register/Register.tsx';
import Profile from 'Pages/Profile/ui/Profile.tsx';
import RequestsManagement from 'Pages/RequestsList/RequestsManagement.tsx';
import Tasks from 'Pages/Tasks/Tasks.tsx';
import { ConfigProvider } from 'antd';
import EventsManagement from 'Pages/EventsList/EventsManagement.tsx';
import ProjectsManagement from 'Pages/ProjectsList/ProjectsManagement.tsx';
import DirectionsManagement from 'Pages/DirectionsList/DirectionsManagement.tsx';
import SetupDirectionForm from 'Pages/DirectionForm/SetupDirectionForm.tsx';
import TeamsManagement from 'Pages/TeamsList/TeamsManagement.tsx';
import CreateSpecializationForm from 'Pages/CreateSpecialization/CreateSpecializationForm.tsx'
import EventPage from 'Pages/Event/EventPage.tsx';
import EventForm from 'Pages/EventsList/EventForm/EventForm.tsx';
import EventSetupSummary from 'Pages/Event/EventSetupSummary.tsx';
import StagesPage from 'Pages/StagesPage/StagesPage.tsx';
import ProjectPage from 'Pages/Project/ProjectPage.tsx';
import ProjectForm from 'Pages/ProjectForm/SetupProjectForm.tsx';
import TeamPage from 'Pages/Team/TeamPage.tsx';
import UsersProfilePage from 'Pages/UsersProfile/UsersProfilePage.tsx';
import EmailVerifiedPage from 'Pages/Register/EmailVerified.tsx';
import PasswordResetRequest from 'Pages/Login/PasswordResetRequest.tsx';
import PasswordResetConfirm from 'Pages/Login/PasswordResetConfirm.tsx';
import KanbanPage from 'Pages/KanbanPage/KanbanPage.tsx';

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
                <Route path="/email-verified" element={<EmailVerifiedPage />} />
                <Route path="/password-reset-request" element={<PasswordResetRequest />} />
                <Route path="/password-reset/confirm" element={<PasswordResetConfirm />} />
                <Route path="/" element={<RequireAuth />}>

                {/* Доступ только админу */}
                  <Route element={<RequireRole allowedRoles={['Организатор']} />}>
                    <Route path="/requests" element={<RequestsManagement />} />
                    <Route path="/create-new-specialization" element={<CreateSpecializationForm />} />

                    <Route path="/event-setup" element={<EventForm />} />
                    <Route path="/event/:id/edit" element={<EventForm />} />
                    <Route path="/directions-setup" element={<SetupDirectionForm/>} />
                    <Route path="/projects-setup" element={<ProjectForm />} />
                    <Route path="/stages-setup" element={<StagesPage />} />
                    <Route path="/event-setup-save" element={<EventSetupSummary />} />
                  </Route>

                  {/* Доступ только практикантам */}
                  <Route element={<RequireRole allowedRoles={['Практикант']} />}>
                  </Route>

                  {/* Общие маршруты */}
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/profile/:id" element={<UsersProfilePage />} />
                  <Route path="/events" element={<EventsManagement />} />
                  <Route path="/directions" element={<DirectionsManagement />} />
                  <Route path="/projects" element={<ProjectsManagement />} />
                  <Route path="/event/:id" element={<EventPage />} />
                  <Route path="/project/:id" element={<ProjectPage />} />
                  <Route path="/teams" element={<TeamsManagement />} />
                  <Route path="/teams/:teamId" element={<TeamPage />} />
                  <Route path="/projects/:projectId/tasks" element={<Tasks />} />
                  <Route path="/projects/:projectId/kanban" element={<KanbanPage />} />
                </Route>
            </Route>
            </Routes>
          </BrowserRouter>
        </NotificationProvider>
      </Provider>
    </ConfigProvider>
  </StrictMode>
);
