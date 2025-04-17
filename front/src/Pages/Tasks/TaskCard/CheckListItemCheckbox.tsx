import { Checkbox } from 'antd';

export const CheckListItemCheckbox = ({ checked, onChange }: { checked: boolean, onChange: () => void }) => {
  return (
    <Checkbox
      checked={checked}
      onChange={onChange}
      className="checklist-checkbox"
    />
  );
};
