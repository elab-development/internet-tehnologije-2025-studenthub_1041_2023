import { useState } from 'react';

function Form({ title, fields, onSubmit, loading, error, columns = 1 }) {
  const [formData, setFormData] = useState(() => {
    const initialData = {};
    fields.forEach(f => { initialData[f.name] = ''; });
    return initialData;
  });

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className={`form-container columns-${columns}`} noValidate>
      <h2 style={{ color: 'var(--white)' }}>{title}</h2>

      <div className="form-fields-wrapper">
        {fields.map(({ label, name, type, placeholder, options }, i) => (
          <div key={i} className="form-group">
            <label htmlFor={name} style={{ color: 'var(--white)' }}>{label}</label>
            {type === 'select' ? (
              <select
                id={name}
                name={name}
                value={formData[name]}
                onChange={handleChange}
                required
              >
                <option value="" disabled>{placeholder || 'Izaberite opciju'}</option>
                {options && options.map((opt, idx) => (
                  <option key={idx} value={opt}>{opt}</option>
                ))}
              </select>
            ) : (
              <input
                id={name}
                name={name}
                type={type}
                placeholder={placeholder}
                value={formData[name]}
                onChange={handleChange}
                required
              />
            )}
          </div>
        ))}
      </div>

      {error && <div className="error-message">{error}</div>}

      <button type="submit" disabled={loading} className="button">
        {loading ? 'Učitavanje...' : title}
      </button>
    </form>
  );
}

export default Form;
