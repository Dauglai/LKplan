import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import "Styles/FormSelectorStyle.scss"

import { Select, Spin } from 'antd';
import { Direction, useGetDirectionsQuery } from 'Features/ApiSlices/directionSlice';

const { Option } = Select;

interface DirectionSelectorProps {
  selectedDirection?: Direction | null;
  onChange: (direction: Direction) => void;
  sourceType: 'local' | 'remote';
  label?: string;
  directions?: Direction[];
}

export default function DirectionSelector({
  selectedDirection,
  onChange,
  sourceType,
  label = 'Выбрать направление',
  directions,
}: DirectionSelectorProps): JSX.Element {
  const [options, setOptions] = useState<Direction[]>([]);
  const { data: remoteDirections, isLoading } = useGetDirectionsQuery(undefined, {
    skip: sourceType !== 'remote',
  });
  const localDirections = useSelector((state: any) => state.event?.stepDirections?.directions || []);

  useEffect(() => {
    if (directions) {
      setOptions(directions);
    } else if (sourceType === 'remote' && remoteDirections) {
      setOptions(remoteDirections);
    } else if (sourceType === 'local') {
      setOptions(localDirections);
    }
  }, [sourceType, remoteDirections, localDirections, directions]);

  const handleChange = (id: number) => {
    const selected = options.find((dir) => dir.id === id);
    if (selected) onChange(selected);
  };

  if (isLoading) return <Spin />;

  if (!options || options.length === 0) {
    return <div>Направления не найдены</div>;
  }

  return (
    <Select
      value={selectedDirection?.id ?? undefined}
      onChange={handleChange}
      placeholder={label}
      optionFilterProp="children"
      showSearch
      className="Selector"
    >
      {options.map((direction) => (
        <Option key={direction.id} value={direction.id}>
          {direction.name}
        </Option>
      ))}
    </Select>
  );
}

  