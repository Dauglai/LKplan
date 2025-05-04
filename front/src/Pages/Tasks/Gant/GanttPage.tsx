// Pages/GanttPage/GanttPage.tsx
import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { PlusOutlined } from '@ant-design/icons';
import tableOptionIcon from 'assets/icons/table_option.svg';
import TaskFilter from 'Pages/Tasks/TaskFilter/TaskFilter';
import GanttChart from './GanttChart';
import { skipToken } from '@reduxjs/toolkit/query';

import './GanttPage.scss';
import { useGetAllTasksQuery } from 'Features/ApiSlices/tasksApiSlice.ts';
import { useGetProjectByIdQuery } from 'Features/ApiSlices/projectSlice.ts';
import CreateTaskModal from 'Pages/Tasks/CreateTaskModal';
import { ViewModeButtons } from '../../../Components/NavButtons/ViewSwitchButtons.tsx';
import { useGetUsersQuery } from 'Features/ApiSlices/userSlice.ts';

const GanttPage = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const [searchParams] = useSearchParams();
  const teamId = searchParams.get('team') ?? null;
  const { data: userData, isLoading, error } = useGetUsersQuery();

  const navigate = useNavigate();
  const [filter, setFilter] = useState<any>({
    project: projectId,
    team: teamId,
  });

  const [page] = useState(1);
  const [isModalVisible, setIsModalVisible] = useState(false);


  const queryParams = projectId
    ? {
      ...filter,
      page,
      page_size: 100,
    }
    : skipToken;

  const { data: projectData } = useGetProjectByIdQuery(projectId);
  const { data: taskData = { results: [] }, refetch } = useGetAllTasksQuery(queryParams);
  const assignees = userData ? userData : [];
  const stages = projectData?.stages || [];
  const dataSource = taskData.results;

  useEffect(() => {
    document.title = 'Диаграмма Ганта - MeetPoint';
  }, []);

  return (
    <div className="Tasks">
      <div className="Tasks-Header">
        <div className="Tasks-Header-Heading">
          <button onClick={() => setIsModalVisible(true)} className="create-button">
            Создать <PlusOutlined />
          </button>
        </div>

        <div className="task-filter-wrapper">
          <TaskFilter
            filter={filter}
            setFilter={setFilter}
            stages={projectData?.stages ?? []}
            users={projectData?.users ?? []}
            projectData={projectData}
          />
        </div>

        <ViewModeButtons
          activeMode="gantt"
          onChange={(mode) => navigate(`/projects/${projectId}/${mode}?team=${teamId ?? ''}`)}
        />
      </div>

      <GanttChart tasks={dataSource} />

      <CreateTaskModal
        visible={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        onCreate={() => {
          setIsModalVisible(false);
          refetch();
        }}
        statuses={projectData?.stages ?? []}
        assignees={projectData?.users ?? []}
      />
    </div>
  );
};

export default GanttPage;
