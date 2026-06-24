import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Alert from '@mui/material/Alert';
import '../styles/Login.css';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const { email, password } = formData;

  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password.trim()) {
      setError('Please enter both email and password');
      return;
    }

    const res = await login(email.trim(), password);
    if (res.success) {
      navigate('/chat');
    } else {
      setError(res.error);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2 className="login-title">ConvoAI</h2>
        <p className="login-subtitle">Log in to start chatting with ConvoAI</p>

        {error && <Alert className="auth-alert" severity="error">{error}</Alert>}

        <form className="login-form" onSubmit={onSubmit}>
          <TextField
            className="auth-input"
            label="Email Address"
            variant="outlined"
            type="email"
            name="email"
            value={email}
            onChange={onChange}
            fullWidth
            required
          />
          <TextField
            className="auth-input"
            label="Password"
            variant="outlined"
            type="password"
            name="password"
            value={password}
            onChange={onChange}
            fullWidth
            required
          />
          <Button
            className="auth-btn"
            type="submit"
            variant="contained"
            fullWidth
          >
            Log In
          </Button>
        </form>

        <div className="login-footer">
          Don't have an account?
          <Link to="/register" className="login-link">Sign Up</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
