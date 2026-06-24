import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import api, { BASE_URL } from '../api/axios';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import SendIcon from '@mui/icons-material/Send';
import MessageBubble from './MessageBubble';
import ConfirmModal from './ConfirmModal';
import '../styles/ChatWindow.css';

const ChatWindow = ({ onMessageSent }) => {
  const { id } = useParams();
  const [chat, setChat] = useState(null);
  const [messageText, setMessageText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [errorModalOpen, setErrorModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    const fetchChat = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/chats/${id}`);
        setChat(res.data);
      } catch (err) {
        console.error('Error fetching chat history', err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchChat();
    }
  }, [id]);

  useEffect(() => {
    scrollToBottom();
  }, [chat?.messages, sending]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!messageText.trim() || sending) return;

    const typedMessage = messageText;
    setMessageText('');
    setSending(true);

    const optimisticUserMsg = {
      _id: `temp-user-${Date.now()}`,
      role: 'user',
      content: typedMessage,
      createdAt: new Date(),
    };
    const optimisticAiMsg = {
      _id: `temp-ai-${Date.now()}`,
      role: 'model',
      content: '',
      createdAt: new Date(),
    };

    setChat((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        messages: [...prev.messages, optimisticUserMsg, optimisticAiMsg],
      };
    });

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${BASE_URL}/chats/${id}/message/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify({ message: typedMessage, timezone: Intl.DateTimeFormat().resolvedOptions().timeZone }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Server returned status ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let buffer = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        
        const parts = buffer.split('\n\n');
        
        buffer = parts.pop() || '';

        for (const part of parts) {
          const trimmed = part.trim();
          if (!trimmed) continue;

          if (trimmed.startsWith('data:')) {
            const dataStr = trimmed.substring(5).trim();
            if (dataStr) {
              let parsed;
              try {
                parsed = JSON.parse(dataStr);
              } catch (parseErr) {
                console.error('Failed to parse stream chunk:', dataStr, parseErr);
                continue;
              }

              if (parsed.error) {
                throw new Error(parsed.error);
              }

              if (parsed.text) {
                const textChunk = parsed.text;
                setChat((prev) => {
                  if (!prev) return prev;
                  const updatedMessages = prev.messages.map((msg) => {
                    if (msg._id === optimisticAiMsg._id) {
                      return { ...msg, content: msg.content + textChunk };
                    }
                    return msg;
                  });
                  return { ...prev, messages: updatedMessages };
                });
              }
            }
          }
        }
      }
    } catch (err) {
      console.error('Error sending message stream:', err);
      setChat((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          messages: prev.messages.filter(
            (msg) => msg._id !== optimisticUserMsg._id && msg._id !== optimisticAiMsg._id
          ),
        };
      });
      setErrorMessage(err.message || 'Error communicating with AI service');
      setErrorModalOpen(true);
    } finally {
      setSending(false);
      if (onMessageSent) {
        onMessageSent();
      }
    }
  };

  if (loading) {
    return (
      <div className="chat-loading-screen">
        <div className="app-loader-text">Loading history...</div>
      </div>
    );
  }

  return (
    <div className="chat-window">
      <header className="chat-header">
        <h3 className="chat-title">{chat?.title || 'Chat'}</h3>
      </header>

      <div className="chat-messages-container">
        {chat?.messages && chat.messages.length === 0 && (
          <div className="chat-loading-screen">
            <span>Send a message to start the conversation with ConvoAI.</span>
          </div>
        )}
        
        {chat?.messages && chat.messages.map((msg) => (
          <MessageBubble key={msg._id} message={msg} />
        ))}

        {sending && (
          <div className="chat-loader">
            <span>ConvoAI is typing...</span>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      <div className="chat-input-container">
        <form onSubmit={handleSubmit} className="chat-input-form">
          <TextField
              className="chat-textfield"
              placeholder="Type your message..."
              variant="outlined"
              multiline
              maxRows={4}
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
          />
          <IconButton
              className="chat-send-btn"
              type="submit"
              disabled={!messageText.trim() || sending}
          >
            <SendIcon />
          </IconButton>
        </form>
      </div>
      <ConfirmModal
        open={errorModalOpen}
        title="Error"
        message={errorMessage}
        confirmText="OK"
        showCancel={false}
        onConfirm={() => setErrorModalOpen(false)}
      />
    </div>
  );
};

export default ChatWindow;