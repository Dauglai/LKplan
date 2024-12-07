const people = [
    'Иванов Иван Иванович',
    'Петров Петр Петрович',
    'Сидорова Анна Сергеевна',
    'Кузнецова Мария Владимировна',
    'Смирнов Алексей Александрович',
];


export default function PersonSelector({
  label,
  role,
  selectedPerson,
  onSelect,
} : {
    label: string;
    role: string;
    selectedPerson: string;
    onSelect: (person: string) => void;
}): JSX.Element {
  return (
    <div className="ListField EventFormField">
      <label>
        {label} ({role})
        <select
          value={selectedPerson}
          onChange={(e) => onSelect(e.target.value)}
          className="TextField"
        >
          <option value="" disabled>
            Выбрать
          </option>
          {people.map((person, index) => (
            <option key={index} value={person}>
              {person}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
};
