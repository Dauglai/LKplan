import { useState } from 'react';
import { Input, Tooltip, Button } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useParams } from 'react-router-dom';
import {
  useGetResultsQuery,
  useCreateResultMutation
} from 'Features/ApiSlices/resultApiSlice';

import './ResultsTab.scss';

export default function ResultsTab() {
  const { teamId } = useParams();
  const teamIdNumber = Number(teamId);

  const { data: results = [], isLoading } = useGetResultsQuery(teamIdNumber, {
    skip: isNaN(teamIdNumber)
  });
  const [createResult] = useCreateResultMutation();

  const [showForm, setShowForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newLink, setNewLink] = useState('');

  const handleAddResult = async () => {
    if (!newTitle.trim() || !newLink.trim()) return;
    try {
      let data = {
        name: newTitle,
        link: newLink,
        team: teamIdNumber
      };
      await createResult(data).unwrap();

      setNewTitle('');
      setNewLink('');
      setShowForm(false);
    } catch (e) {
      console.error('Ошибка при создании:', e);
    }
  };

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (e) {
      console.error('Ошибка при копировании ссылки:', e);
    }
  };

  if (isLoading) return <div>Загрузка...</div>;

  return (
    <div className="ResultsTab">
      <Button
        type="primary"
        icon={<PlusOutlined />}
        onClick={() => setShowForm(true)}
        className="AddButton"
      >
        Добавить
      </Button>

      <div className="ResultsList">
        {results.map((result) => (
          <div key={result.id} className="ResultRow">
            <div className="ResultTitle">{result.name}</div>
            <Input
              value={result.link}
              readOnly
              className="ResultInput"
            />
            <Tooltip title="Скопировать ссылку">
              <div className="Icon CopyIcon" onClick={() => handleCopy(result.link)}>
                {/* Заменить эту иконку на свою */}
                <span>↗</span>
              </div>
            </Tooltip>
          </div>
        ))}

        {showForm && (
          <div className="ResultRow">
            <Input
              placeholder="Название"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="ResultTitle"
            />
            <Input
              placeholder="Добавьте ссылку на артефакт"
              value={newLink}
              onChange={(e) => setNewLink(e.target.value)}
              className="ResultInput"
            />
            <Tooltip title="Сохранить">
              <div className="Icon SubmitIcon" onClick={handleAddResult}>
                {/* Заменить эту иконку на свою */}
                <span>→</span>
              </div>
            </Tooltip>
          </div>
        )}
      </div>
    </div>
  );
}
