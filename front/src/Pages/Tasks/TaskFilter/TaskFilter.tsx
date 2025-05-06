import React from 'react';
import { Select, Input, DatePicker, Dropdown, Button } from 'antd';
import './TaskFilters.css';
import PlanButton from '../../../Components/PlanButton/PlanButton.tsx';
import { Tag, Tooltip } from 'antd';
import { CloseOutlined, FilterOutlined } from '@ant-design/icons';
import { useGetTeamsQuery } from 'Features/ApiSlices/teamSlice.ts';
import { useGetDirectionsQuery } from 'Features/ApiSlices/directionSlice.ts';
const { Option } = Select;
const { RangePicker } = DatePicker;
import filterSettingsIcon from '/src/assets/icons/filter_settings.svg'
import { useGetProjectsQuery } from 'Features/ApiSlices/projectSlice.ts';

const TaskFilter = ({
                      filter,
                      setFilter,
                      stages,
                      users,
                      projectData,
                    }) => {

  const {data: directions = []} = useGetDirectionsQuery();
  const {data: teams = []} = useGetTeamsQuery();
  const {data: projects = []} = useGetProjectsQuery();
    //useGetProjectTeamsQuery,
  const filterDropdown = (
    <div className="filter-dropdown">
      <Select
        placeholder="Направление"
        value={filter.direction || null}
        onChange={(value) => setFilter({ ...filter, direction: value })}
      >
        {directions.map((s) => (
          <Option key={s.id} value={s.id}>
            {s.name}
          </Option>
        ))}
      </Select>

      <Select
        placeholder="Проект"
        value={filter.project || null}
        onChange={(value) => setFilter({ ...filter, project: value })}
      >
        {projects.map((project) => (
          <Option key={project.id} value={project.id}>
            {project.name}
          </Option>
        ))}
      </Select>

      <Select
        placeholder="Исполнитель"
        value={filter.responsible_user || null}
        onChange={(value) => setFilter({ ...filter, responsible_user: value })}
      >
        {users.map((u) => (
          <Option key={u.user_id} value={u.user_id}>
            {u.surname} {u.name}
          </Option>
        ))}
      </Select>

      <Select
        placeholder="Постановщик"
        value={filter.author || null}
        onChange={(value) => setFilter({ ...filter, author: value })}
      >
        {users.map((u) => (
          <Option key={u.user_id} value={u.user_id}>
            {u.surname} {u.name}
          </Option>
        ))}
      </Select>

      <Select
        placeholder="Статус"
        value={filter.status || null}
        onChange={(value) => setFilter({ ...filter, status: value })}
      >
        {stages.map((stage) => (
          <Option key={stage.id} value={stage.id}>
            {stage.name}
          </Option>
        ))}
      </Select>

      <Select
        placeholder="Команда"
        value={filter.team || null}
        onChange={(value) => setFilter({ ...filter, team: value })}
      >
        {teams.map((t) => (
          <Option key={t.id} value={t.id}>
            {t.name}
          </Option>
        ))}
      </Select>



      <RangePicker
        onChange={(dates) => {
          setFilter({
            ...filter,
            created_after: dates ? dates[0].format('YYYY-MM-DD') : undefined,
            created_before: dates ? dates[1].format('YYYY-MM-DD') : undefined,
          });
        }}
      />
    </div>
  );

  return (
    <div className="task-filter-input-wrapper">
      <div className="task-filter-input">
        <div className="task-filter-tags-inside">
          {Object.entries(filter).map(([key, value]) => {
            if (!value || key === 'query') return null;

            const labelMap = {
              direction: 'Направление',
              project: 'Проект',
              author: 'Постановщик',
              responsible_user: 'Ответственный',
              status: 'Статус',
              team: 'Команда',
              created_after: 'Создан после',
              created_before: 'Создан до',
            };

            const label = labelMap[key] || key;

            return (
              <Tag
                closable
                key={key}
                onClose={() => {
                  const newFilter = { ...filter };
                  delete newFilter[key];
                  setFilter(newFilter);
                }}
              >
                {label}
              </Tag>
            );
          })}

          <input
            className="task-filter-input-field"
            placeholder="Поиск по названию"
            value={filter.query}
            onChange={(e) => setFilter({ ...filter, query: e.target.value })}
          />
        </div>

        <Dropdown overlay={filterDropdown} trigger={['click']} placement="bottomRight">
          <img
            src={filterSettingsIcon}
            alt="Настройка таблицы"
            className="task-filter-icon"
          />
        </Dropdown>
      </div>
    </div>
  );
};

export default TaskFilter;
