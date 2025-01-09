import './CheckboxField.scss';

export default function CheckboxField({ label }: { label: string }): JSX.Element {
  return (
    <div className="CheckboxField">
      <input type="checkbox" id={label} className="CheckboxInput" />
      <label htmlFor={label} className="CheckboxLabel">
        <span className="CheckboxIcon" />
        {label}
      </label>
    </div>
  );
}

