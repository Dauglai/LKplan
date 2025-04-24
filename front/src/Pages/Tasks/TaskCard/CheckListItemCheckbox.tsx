import { Checkbox } from 'antd';
import './Checkbox.scss'

export const CheckListItemCheckbox = ({ checked, onChange }: { checked: boolean, onChange: () => void }) => {
  return (
    <Checkbox
      checked={checked}
      onChange={onChange}
      className="checklist-checkbox"
    />
  );
};
