import React from 'react';
import ReactMarkdown from 'react-markdown';
import '../styles/MessageBubble.css';

const MessageBubble = ({ message }) => {
  const isUser = message.role === 'user';

  return (
    <div className={`message-row ${isUser ? 'user' : 'model'}`}>
      <div className={`message-bubble ${isUser ? 'user' : 'model'}`}>
        {isUser ? (
          <div className="user-message-content">{message.content}</div>
        ) : (
          <ReactMarkdown>{message.content}</ReactMarkdown>
        )}
      </div>
    </div>
  );
};

export default MessageBubble;
