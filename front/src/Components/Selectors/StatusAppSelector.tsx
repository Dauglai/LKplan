import { StatusApp, useGetStatusesAppQuery } from 'Features/ApiSlices/statusAppSlice'; // Типы и API для статусов приложения
import "Styles/FormSelectorStyle.scss"; // Стили компонента
import { Select } from 'antd'; // Компонент Select из Ant Design
const { Option } = Select; // Деструктуризация Option из Select

/**
 * Интерфейс пропсов компонента StatusAppSelector.
 * 
 * @property {StatusApp} [selectedStatusApp] - Выбранный статус приложения (опционально).
 * @property {(selected: StatusApp) => void} onChange - Колбэк при изменении статуса.
 */
interface StatusAppSelectorProps {
  selectedStatusApp?: StatusApp;
  onChange: (selected: StatusApp) => void;
}

/**
 * Компонент выбора статуса приложения.
 * Загружает доступные статусы с сервера и предоставляет интерфейс для выбора.
 * 
 * @component
 * @example
 * // Пример использования:
 * <StatusAppSelector
 *   selectedStatusApp={currentStatus}
 *   onChange={(status) => handleStatusChange(status)}
 * />
 *
 * @param {StatusAppSelectorProps} props - Пропсы компонента.
 * @returns {JSX.Element} Выпадающий список статусов или сообщение о загрузке.
 */
export default function StatusAppSelector({
  selectedStatusApp,
  onChange,
}: StatusAppSelectorProps): JSX.Element {
  const { data: allStatusesApp, isLoading } = useGetStatusesAppQuery(); // Запрос статусов приложения

  if (isLoading) {
    return <span>Загрузка...</span>;
  }

  return (
      <Select
        value={selectedStatusApp?.id ?? undefined}
        onChange={(id) => {
          const selected = allStatusesApp?.find((s) => s.id === id);
          if (selected) onChange(selected);
        }}
        placeholder="Выберите статус"
        style={{ width: '100%' }}
        optionFilterProp="children"
        showSearch
      >
        {allStatusesApp?.map(statusApp => (
          <Option key={statusApp.id} value={statusApp.id}>
            {statusApp.name}
          </Option>
        ))}
      </Select>
  );
}
