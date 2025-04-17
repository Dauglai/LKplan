import { StatusApp, useGetStatusesAppQuery } from 'Features/ApiSlices/statusAppSlice';
import "Styles/FormSelectorStyle.scss";
import { Select, Spin } from 'antd';
const { Option } = Select;


interface StatusAppSelectorProps {
  selectedStatusApp: StatusApp;
  onChange: (selected: StatusApp) => void;
}

export default function StatusAppSelector({
  selectedStatusApp,
  onChange,
}: StatusAppSelectorProps): JSX.Element {
  const { data: allStatusesApp, isLoading } = useGetStatusesAppQuery();

  if (isLoading) {
    return <Spin />;
  }

  return (
      <Select
        value={selectedStatusApp.id ?? undefined}
        onChange={(id) => {
          const selected = allStatusesApp?.find((s) => s.id === id);
          if (selected) onChange(selected);
        }}
        placeholder="Выберите статус"
        style={{ width: '100%' }}
        optionFilterProp="children"
        showSearch
      >
        {allStatusesApp?.map(statusApp => (
          <Option key={statusApp.id} value={statusApp.id}>
            {statusApp.name}
          </Option>
        ))}
      </Select>
  );
}
