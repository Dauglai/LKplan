import { useState } from 'react';
import { Specialization, useGetSpecializationsQuery } from 'Features/ApiSlices/specializationSlice';
import { Select, Spin } from "antd";
import "Styles/FormSelectorStyle.scss";
import CloseIcon from 'assets/icons/close.svg?react';
import PlusIcon from 'assets/icons/plus.svg?react';
import ChevronRightIcon from 'assets/icons/chevron-right.svg?react';


interface SpecializationSelectorProps {
  selectedSpecializations: number[];
  onChange: (selectedIds: number[]) => void;
  label?: string;
  isSingleSelect?: boolean;
}


export default function SpecializationSelector({
  selectedSpecializations = [],
  onChange,
  label = "Добавить специализацию*",
  isSingleSelect = false,
}: SpecializationSelectorProps): JSX.Element {
  const { data: allSpecializations, isLoading } = useGetSpecializationsQuery();

  const handleChange = (value: number | number[]) => {
    if (isSingleSelect) {
      onChange([value as number]);
    } else {
      onChange(value as number[]);
    }
  };

  if (isLoading) {
    return <div className="FormField"><Spin size="small" /></div>;
  }

  return (
        <Select
          mode={isSingleSelect ? undefined : "multiple"}
          value={isSingleSelect ? selectedSpecializations[0] : selectedSpecializations}
          onChange={handleChange}
          placeholder={label}
          className="Selector"
          options={allSpecializations?.map((spec) => ({
            label: spec.name,
            value: spec.id,
          }))}
          style={{ width: "100%" }}
          allowClear={!isSingleSelect}
        />
  );
}


