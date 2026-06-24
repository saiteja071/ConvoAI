import React, { useContext } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Avatar from '@mui/material/Avatar';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/DeleteOutlined';
import LogoutIcon from '@mui/icons-material/ExitToApp';
import ChatIcon from '@mui/icons-material/ChatBubbleOutlined';
import '../styles/Sidebar.css';

const Sidebar = ({ chats, onDeleteChat, onCreateChat }) => {
  const { user, logout } = useContext(AuthContext);
  const { id: activeChatId } = useParams();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-logo-container">
          <Link to="/chat" className="sidebar-logo">ConvoAI</Link>
        </div>
        <Button
          className="new-chat-btn"
          variant="contained"
          startIcon={<AddIcon />}
          fullWidth
          onClick={onCreateChat}
        >
          New Chat
        </Button>
      </div>

      <div className="sidebar-list">
        {chats.length === 0 ? (
          <div className="sidebar-empty">
            No chats yet.
          </div>
        ) : (
          chats.map((chat) => (
            <div
              key={chat._id}
              className={`sidebar-item-container ${activeChatId === chat._id ? 'active' : ''}`}
            >
              <ChatIcon className="sidebar-item-icon" />
              <Link
                to={`/chat/${chat._id}`}
                className="sidebar-item-link"
                title={chat.title}
              >
                {chat.title}
              </Link>
              <IconButton
                className="delete-chat-btn"
                size="small"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onDeleteChat(chat._id);
                }}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </div>
          ))
        )}
      </div>

      <div className="sidebar-footer">
        <div className="user-info">
          <Avatar className="user-avatar">
            {getInitials(user?.name)}
          </Avatar>
          <div className="user-details">
            <span className="user-name">{user?.name || 'User'}</span>
            <span className="user-email">{user?.email || 'user@example.com'}</span>
          </div>
        </div>
        <Button
          className="logout-btn"
          variant="outlined"
          startIcon={<LogoutIcon />}
          fullWidth
          onClick={handleLogout}
        >
          Logout
        </Button>
      </div>
    </aside>
  );
};

export default Sidebar;
