import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Form from '../reusable/Form';
import axios from 'axios';

function RegisterPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const smerOptions = [
    'Informacione Tehnologije i Sistemi',
    'Menadžment',
    'Operacioni Menadžment',
  ];

  const fields = [
    { label: 'Ime', name: 'ime', type: 'text', placeholder: 'Unesite ime' },
    { label: 'Prezime', name: 'prezime', type: 'text', placeholder: 'Unesite prezime' },
    { label: 'Email', name: 'email', type: 'email', placeholder: 'Unesite email' },
    { label: 'Lozinka', name: 'password', type: 'password', placeholder: 'Unesite lozinku' },
    { label: 'Broj indeksa', name: 'broj_indeksa', type: 'text', placeholder: 'Unesite broj indeksa' },
    { label: 'Godina studija', name: 'godina_studija', type: 'number', placeholder: 'Unesite godinu studija' },
    {
      label: 'Smer',
      name: 'smer',
      type: 'select',
      options: smerOptions,
      placeholder: 'Izaberite smer',
    },
  ];

  const handleSubmit = async (data) => {
    setLoading(true);
    setError(null);
    try {
      await axios.post('http://127.0.0.1:8000/api/register', data);
      alert('Uspešno ste se registrovali! Molimo vas da se prijavite.');
      navigate('/'); // redirect na login
    } catch (err) {
      setError(err.response?.data?.message || 'Greška pri registraciji.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-wrapper">
      <Form
        title="Registracija"
        fields={fields}
        onSubmit={handleSubmit}
        loading={loading}
        error={error}
        columns={2}
      />
      <div style={{ marginTop: '1rem', color: 'var(--white)', textAlign: 'center' }}>
        Imate već nalog?{' '}
        <Link to="/" style={{ color: 'var(--accent-1)', fontWeight: '600', textDecoration: 'underline' }}>
          Idite na login
        </Link>
      </div>
    </div>
  );
}

export default RegisterPage;
