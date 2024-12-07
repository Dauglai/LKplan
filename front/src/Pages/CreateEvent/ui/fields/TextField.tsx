import './TextField.scss';

export default function TextField({ 
  label, 
  type = 'text',
}: {
  label: string;
  type?: string;
}): JSX.Element {
  return (
    <div className="TextField field">
      <label>{label}</label>
      <input type={type} />
    </div>
  );
}
