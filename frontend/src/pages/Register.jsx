import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Alert from '@mui/material/Alert';
import '../styles/Register.css';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  const { name, email, password } = formData;

  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!name.trim() || !email.trim() || !password.trim()) {
      setError('Please fill in all fields');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    const res = await register(name.trim(), email.trim(), password);
    if (res.success) {
      setSuccess('Registration successful! Redirecting to login...');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } else {
      setError(res.error);
    }
  };

  return (
    <div className="register-container">
      <div className="register-card">
        <h2 className="register-title">ConvoAI</h2>
        <p className="register-subtitle">Create your account to start chatting</p>

        {error && <Alert className="auth-alert" severity="error">{error}</Alert>}
        {success && <Alert className="auth-alert" severity="success">{success}</Alert>}

        <form className="register-form" onSubmit={onSubmit}>
          <TextField
            className="auth-input"
            label="Name"
            variant="outlined"
            name="name"
            value={name}
            onChange={onChange}
            fullWidth
            required
          />
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
            Sign Up
          </Button>
        </form>

        <div className="register-footer">
          Already have an account?
          <Link to="/login" className="register-link">Log In</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
