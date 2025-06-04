import { useState } from 'react';
import { Specialization, useGetSpecializationsQuery } from 'Features/ApiSlices/specializationSlice';
import { Select, Spin } from "antd";
import "Styles/FormSelectorStyle.scss";



interface SpecializationSelectorProps {
  selectedSpecializations: number[];
  onChange: (selectedIds: number[]) => void;
  label?: string;
  isSingleSelect?: boolean;
  availableSpecializations?: number[];
}


export default function SpecializationSelector({
  selectedSpecializations = [],
  onChange,
  label = "Добавить специализацию*",
  isSingleSelect = false,
  availableSpecializations,
}: SpecializationSelectorProps): JSX.Element {
  const { data: allSpecializations, isLoading } = useGetSpecializationsQuery();

  const filteredSpecializations = availableSpecializations
    ? allSpecializations?.filter(spec => 
        availableSpecializations.includes(spec.id)
      )
    : allSpecializations;

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
          options={filteredSpecializations?.map((spec) => ({
            label: spec.name,
            value: spec.id,
          }))}
          style={{ width: "100%" }}
          allowClear={!isSingleSelect}
        />
  );
}


