import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Form from '../reusable/Form';
import axios from 'axios';

function LoginPage({ onLoginSuccess }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fields = [
    { label: 'Email', name: 'email', type: 'email', placeholder: 'Unesite email' },
    { label: 'Lozinka', name: 'password', type: 'password', placeholder: 'Unesite lozinku' },
  ];

  const handleSubmit = async (data) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post('http://127.0.0.1:8000/api/login', data);
      const { access_token, user } = response.data;
      sessionStorage.setItem('access_token', access_token);
      sessionStorage.setItem('user', JSON.stringify(user));

      onLoginSuccess({ access_token, user });

      if (user.role === 'student') {
        navigate('/home');
      } else if (user.role === 'sluzbenik') {
        navigate('/sluzbenik/home');
      } else if (user.role === 'profesor') {
        navigate('/profesor/home');
      } else {
        navigate('/home');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Greška pri prijavi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-wrapper">
      <Form
        title="Prijava"
        fields={fields}
        onSubmit={handleSubmit}
        loading={loading}
        error={error}
        columns={1}
      />
      <div style={{ marginTop: '1rem', color: 'var(--white)', textAlign: 'center' }}>
        Nemate nalog?{' '}
        <Link to="/register" style={{ color: 'var(--accent-1)', fontWeight: '600', textDecoration: 'underline' }}>
          Registrujte se ovde
        </Link>
      </div>
    </div>
  );
}

export default LoginPage;
