import React, { useState } from 'react';
import ReactQuill from 'react-quill';

const DescriptionPage = () => {
  const [editing, setEditing] = useState(false);

  const [description, setDescription] = useState('<p>Начальное описание</p>');

  const handleSave = () => {
    setEditing(false);
    // тут можно отправить PATCH-запрос
    console.log('Сохраняем описание:', description);
  };

  return (
    <div style={{ padding: 24 }}>
      <h2>Описание задачи</h2>

      {editing ? (
        <div style={{ marginBottom: 16 }}>
          <ReactQuill
            value={description}
            onChange={setDescription}
            style={{ background: 'white' }}
          />
          <button onClick={handleSave} style={{ marginTop: 12 }}>
            Сохранить
          </button>
        </div>
      ) : (
        <div
          onClick={() => setEditing(true)}
          style={{
            minHeight: 100,
            border: '1px solid #d9d9d9',
            borderRadius: 4,
            padding: 12,
            backgroundColor: '#fafafa',
            cursor: 'pointer',
            marginBottom: 16,
          }}
          dangerouslySetInnerHTML={{
            __html: description || '<i>Без описания</i>',
          }}
        />
      )}
    </div>
  );
};

export default DescriptionPage;
