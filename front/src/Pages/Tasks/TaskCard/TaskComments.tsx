import React, { useState } from 'react';
import {
  useGetCommentsByTaskQuery,
  useCreateCommentMutation,
  useUpdateCommentMutation,
  useDeleteCommentMutation,
} from 'Features/ApiSlices/commentApiSlice';
import { Button, Input, List, Popconfirm, message, Upload } from 'antd';
import { UploadOutlined, EditOutlined, DeleteOutlined, SaveOutlined, CloseOutlined, PaperClipOutlined } from '@ant-design/icons';
import type { UploadFile } from 'antd/es/upload/interface';

interface Props {
  taskId: number;
  currentUserId: number;
}

const TaskComments: React.FC<Props> = ({ taskId, currentUserId }) => {
  const { data: comments = [], refetch } = useGetCommentsByTaskQuery(taskId, { skip: !taskId });
  const [createComment] = useCreateCommentMutation();
  const [updateComment] = useUpdateCommentMutation();
  const [deleteComment] = useDeleteCommentMutation();

  const [newComment, setNewComment] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const [editedContent, setEditedContent] = useState('');

  const handleAddComment = async () => {
    if (!newComment.trim() && !file) return;

    try {
      const formData = new FormData();
      formData.append('content', newComment);
      if (file) formData.append('file', file);

      await createComment({
        taskId,
        data: formData,
      }).unwrap();

      setNewComment('');
      setFile(null);
      refetch();
    } catch {
      message.error('Ошибка при добавлении комментария');
    }
  };

  const handleSaveEdit = async (id: number) => {
    try {
      await updateComment({ id, data: { content: editedContent } }).unwrap();
      setEditingCommentId(null);
      refetch();
    } catch {
      message.error('Ошибка при редактировании');
    }
  };

  const handleDeleteComment = async (id: number) => {
    try {
      await deleteComment(id).unwrap();
      refetch();
    } catch {
      message.error('Ошибка при удалении');
    }
  };

  return (
    <div style={{ marginTop: 24 }}>
      <h3>Комментарии</h3>

      <List
        dataSource={comments}
        renderItem={(comment) => (
          <List.Item
            style={{
              borderBottom: '1px solid #eee',
              paddingBottom: 8,
              marginBottom: 8,
            }}
            actions={
              comment.author === currentUserId
                ? editingCommentId === comment.id
                  ? [
                    <Button icon={<SaveOutlined />} onClick={() => handleSaveEdit(comment.id)} />,
                    <Button icon={<CloseOutlined />} onClick={() => setEditingCommentId(null)} />,
                  ]
                  : [
                    <Button icon={<EditOutlined />} onClick={() => {
                      setEditingCommentId(comment.id);
                      setEditedContent(comment.content);
                    }} />,
                    <Popconfirm
                      title="Удалить комментарий?"
                      onConfirm={() => handleDeleteComment(comment.id)}
                      okText="Да"
                      cancelText="Нет"
                    >
                      <Button danger icon={<DeleteOutlined />} />
                    </Popconfirm>,
                  ]
                : []
            }
          >
            <List.Item.Meta
              title={
                <div>
                  <strong>{`${comment.author_info?.surname || ''} ${comment.author_info?.name || ''}`}</strong>
                </div>
              }
              description={
                <div>
                  {editingCommentId === comment.id ? (
                    <Input.TextArea
                      autoSize
                      value={editedContent}
                      onChange={(e) => setEditedContent(e.target.value)}
                    />
                  ) : (
                    <>
                      <p style={{ marginBottom: 4 }}>{comment.content}</p>
                      {comment.file && (
                        <a href={comment.file} target="_blank" rel="noopener noreferrer">
                          <PaperClipOutlined /> Файл
                        </a>
                      )}
                    </>
                  )}
                </div>
              }
            />
          </List.Item>
        )}
      />

      <Input.TextArea
        value={newComment}
        onChange={(e) => setNewComment(e.target.value)}
        placeholder="Напишите комментарий..."
        autoSize={{ minRows: 2, maxRows: 5 }}
        style={{ marginBottom: 8 }}
      />

      <Upload
        beforeUpload={(file) => {
          setFile(file);
          return false;
        }}
        showUploadList={file ? [{ uid: '1', name: file.name }] : []}
        onRemove={() => setFile(null)}
      >
        <Button icon={<UploadOutlined />} style={{ marginBottom: 8 }}>
          Прикрепить файл
        </Button>
      </Upload>

      <Button type="primary" onClick={handleAddComment}>
        Добавить
      </Button>
    </div>
  );
};

export default TaskComments;
