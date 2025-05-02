// src/pages/KanbanPage.tsx
import React, { useState, useEffect } from 'react';
import { Button } from 'antd';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import TaskFilter from 'Pages/Tasks/TaskFilter/TaskFilter';
import KanbanBoard from 'Pages/Tasks/KanbanBoard';  // путь под себя
import { useGetAllTasksQuery } from 'Features/ApiSlices/tasksApiSlice';
import { useGetProjectByIdQuery } from 'Features/ApiSlices/projectSlice';
import { useGetUsersQuery } from 'Features/ApiSlices/userSlice';
import { skipToken } from '@reduxjs/toolkit/query';

import './KanbanPage.scss';
import { ViewModeButtons } from '../../Components/NavButtons/ViewSwitchButtons.tsx';

interface Profile {
  user_id: number;
  surname: string;
  name: string;
  patronymic: string;
}

interface Stage {
  id: number;
  name: string;
}

interface Task {
  key: string;
  name: string;
  sprint: string;
  status: string;
  stage: Stage;
  end: string;
  assignee: Profile;
  author: Profile;
  performers: Profile[];
  children?: Task[]; // Подзадачи
  parent_task: number;
}



export default function KanbanPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const teamId = Number(searchParams.get('team') || '');
  const { projectId } = useParams();
  const { data: userData } = useGetUsersQuery();
  const { data: projectData } = useGetProjectByIdQuery(projectId);
  const assignees = userData || [];
  const stages = projectData?.stages || [];
  const [viewMode, setViewMode] = useState<'tasks' | 'kanban' | 'gantt'>('kanban');

  // фильтры
  const [filter, setFilter] = useState({ query: '', status: undefined, /*…*/ });
  const [dataSource, setDataSource] = useState<Task[]>([]);

  const queryParams = {
    name: filter.query,
    status: filter.status,
    creator: filter.creator,
    responsible_user: filter.responsible_user,
    deadline: filter.deadline,
    created_after: filter.created_after,
    created_before: filter.created_before,
    task_id: filter.task_id,
    project: projectId,
    team: teamId,
    page_size: 1000,
    sort: filter.sort,
  };

  const { data: data = { results: [], count: 0 }, refetch } = useGetAllTasksQuery(queryParams);

  useEffect(() => {
    if (!data?.results || data.results.length === 0) return;
    const transformed = transformTasksData(data.results);
    setDataSource(transformed);
  }, [data?.results]);

  const transformTasksData = (data: Task[]): Task[] => {
    if (!data) return [];

    return data.map((task) => ({
      key: String(task.id),
      name: task.name || `Задача ${task.id}`,
      description: task.description || ``,
      sprint: task.project ? `${task.project_info.name}` : "Без проекта",
      direction: task.project ? `${task.project_info.directionSet.name}` : "Без направления",
      status: task.status,
      stage: task.stage,
      team: task.team ? `${task.team.name}` : "Без команды",
      start: task.start, // ISO-строка
      end: task.end,
      assignee: task.resp_user
        ? task.resp_user
        : null,
      author: task.author
        ? task.author
        : null,
      performers: task.performers,
      children: task.subtasks ? transformTasksData(task.subtasks) : [],
      parent_task: task.parent_task
    }));
  };

  return (
    <div className="KanbanPage">
      <div className="Tasks-Header">
        <div className="task-filter-wrapper">
          <TaskFilter
            filter={filter}
            setFilter={setFilter}
            stages={stages}
            users={assignees}
            projectData={projectData ? [projectData] : []}
          />
        </div>
        <ViewModeButtons
          activeMode={viewMode}
          onChange={(mode) => navigate(`/projects/${projectId}/${mode}?team=${teamId ?? ''}`)}
        />

      </div>

      <div className="KanbanPage-Board">
        <KanbanBoard
          stages={stages}
          tasks={dataSource}
          refetchTasks={refetch}
          projectId={projectId}
          assignees={assignees}
        />
      </div>
    </div>
  );
}
