import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import Sidebar from '../components/Sidebar';
import ChatWindow from '../components/ChatWindow';
import ConfirmModal from '../components/ConfirmModal';
import '../styles/Chat.css';

const Chat = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [chats, setChats] = useState([]);
  const [deleteChatId, setDeleteChatId] = useState(null);

  useEffect(() => {
    fetchChats();
  }, []);

  const fetchChats = async () => {
    try {
      const res = await api.get('/chats');
      setChats(res.data);
    } catch (err) {
      console.error('Failed to load chats list', err);
    }
  };

  const handleCreateChat = async () => {
    try {
      const res = await api.post('/chats');
      await fetchChats();
      navigate(`/chat/${res.data._id}`);
    } catch (err) {
      console.error('Failed to create new chat session', err);
    }
  };

  const handleDeleteChat = async (chatId) => {
    try {
      await api.delete(`/chats/${chatId}`);
      await fetchChats();
      if (id === chatId) {
        navigate('/chat');
      }
    } catch (err) {
      console.error('Failed to delete chat session', err);
    }
  };

  return (
    <div className="chat-page-layout">
      <Sidebar
        chats={chats}
        onDeleteChat={setDeleteChatId}
        onCreateChat={handleCreateChat}
      />
      {id ? (
        <ChatWindow onMessageSent={fetchChats} />
      ) : (
        <div className="chat-placeholder-container">
          <h2 className="chat-placeholder-title">ConvoAI</h2>
          <p className="chat-placeholder-subtitle">
            Select a chat from the sidebar or start a new one to begin conversation.
          </p>
        </div>
      )}
      <ConfirmModal
        open={!!deleteChatId}
        title="Delete Chat"
        message="Are you sure you want to permanently delete this chat session? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        isDestructive={true}
        onConfirm={async () => {
          const idToDelete = deleteChatId;
          setDeleteChatId(null);
          await handleDeleteChat(idToDelete);
        }}
        onCancel={() => setDeleteChatId(null)}
      />
    </div>
  );
};

export default Chat;
