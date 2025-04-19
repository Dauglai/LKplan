import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import "Styles/FormSelectorStyle.scss"

import { Select, Spin } from 'antd';
import { useGetDirectionsQuery } from 'Features/ApiSlices/directionSlice';

const { Option } = Select;

interface Direction {
  id: number;
  name: string;
}

interface DirectionSelectorProps {
  onChange: (direction: Direction) => void;
  value?: number;
  sourceType: 'local' | 'remote';
  placeholder?: string;
}

export default function DirectionSelector({
  onChange,
  value,
  sourceType,
  placeholder = 'Выбрать направление *',
}: DirectionSelectorProps): JSX.Element {
  const [options, setOptions] = useState<Direction[]>([]);
  const { data: remoteDirections, isLoading } = useGetDirectionsQuery(undefined, {
    skip: sourceType !== 'remote',
  });
  const localDirections = useSelector((state: any) => state.event?.stepDirections?.directions || []);

  useEffect(() => {
    if (sourceType === 'remote' && remoteDirections) {
      setOptions(remoteDirections);
    }
    if (sourceType === 'local') {
      setOptions(localDirections);
    }
  }, [sourceType, remoteDirections, localDirections]);

  const handleChange = (id: number) => {
    const selected = options.find((dir) => dir.id === id);
    if (selected) {
      onChange(selected);
    }
  };

  if (isLoading) return <Spin />;

  return (
    <Select
      showSearch
      value={value}
      onChange={handleChange}
      placeholder={placeholder}
      style={{ width: '100%' }}
      optionFilterProp="children"
      filterOption={(input, option) =>
        (option?.children as string).toLowerCase().includes(input.toLowerCase())
      }
    >
      {options.map((direction) => (
        <Option key={direction.id} value={direction.id}>
          {direction.name}
        </Option>
      ))}
    </Select>
  );
}

  