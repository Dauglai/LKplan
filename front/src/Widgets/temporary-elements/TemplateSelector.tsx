import './TemplateSelector.scss';

export default function TemplateSelector(): JSX.Element {
  return (
    <select 
      className="TemplateSelector" 
      defaultValue="">
        <option value="">Выбрать шаблон</option>
        <option value="template1">Шаблон 1</option>
        <option value="template2">Шаблон 2</option>
        <option value="template3">Шаблон 3</option>
    </select>
  );
}
