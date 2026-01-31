import { useEffect, useState } from 'react';
import axios from 'axios';
import DataTable from '../reusable/DataTable';
import Pagination from '../reusable/Pagination';
import Modal from '../reusable/Modal';
import TableToolbar from '../reusable/TableToolbar';
import Breadcrumbs from '../reusable/Breadcrumbs';

const columns = [
  { key: 'rok', label: 'Rok' },
  { key: 'broj_prijave', label: 'Broj prijave' },
  { key: 'status', label: 'Status' },
  { key: 'ocena', label: 'Ocena' },
  { key: 'predmet', label: 'Predmet' },
];

const Prijave = () => {
  const [prijave, setPrijave] = useState([]);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // search + filters
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({});

  const filtersConfig = [
    { key: 'status', type: 'select', label: 'Status', options: ['prijavljen','polozen','nepolozen'].map(s => ({ value: s, label: s })) },
    { key: 'rok', type: 'text', label: 'Rok' }
  ];

  // modal
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ predmet_id: '', rok: '' });

  const tokenHeader = () => ({
    headers: {
      Authorization: `Bearer ${sessionStorage.getItem('access_token')}`,
      Accept: 'application/json'
    }
  });

  const loadPrijave = async () => {
    setLoading(true);
    setError(null);
    try {
      const r = await axios.get(`http://127.0.0.1:8000/api/student/prijave`, tokenHeader());
      const rows = r.data.data.map(d => ({
        ...d,
        predmet: d.predmet.naziv
      }));
      setPrijave(rows);
      setPage(1);
      setLastPage(1); // jer vraća sve (nema paginacije)
    } catch (e) {
      setError('Greška pri učitavanju');
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPrijave();
  }, []);

  const openNew = () => {
    setEditing(null);
    setForm({ predmet_id: '', rok: '' });
    setOpen(true);
  };

  const openEdit = (row) => {
    if (row.status !== 'prijavljen') {
      alert('Može se menjati samo prijava u statusu "prijavljen"');
      return;
    }
    setEditing(row.id);
    setForm({ predmet_id: row.predmet_id || '', rok: row.rok });
    setOpen(true);
  };

  const close = () => { setOpen(false); setEditing(null); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await axios.put(
          `http://127.0.0.1:8000/api/student/prijave/${editing}`,
          { rok: Number(form.rok) },
          { ...tokenHeader(), 'Content-Type': 'application/json' }
        );
      } else {
        await axios.post(
          `http://127.0.0.1:8000/api/student/prijave`,
          { predmet_id: Number(form.predmet_id), rok: Number(form.rok) },
          { ...tokenHeader(), 'Content-Type': 'application/json' }
        );
      }
      close();
      alert('Prijava uspešno izmenjena');
      loadPrijave();
    } catch (err) {
      console.error(err);
      alert('Validaciona greška – proveri unos');
    }
  };

  const handleDelete = async (id, status) => {
    if (status !== 'prijavljen') {
      alert('Može se poništiti samo prijava u statusu "prijavljen"');
      return;
    }
    if (!window.confirm('Da li si siguran da želiš da poništiš prijavu?')) return;
    try {
      await axios.delete(`http://127.0.0.1:8000/api/student/prijave/${id}`, tokenHeader());
      loadPrijave();
    } catch (err) {
      console.error(err);
      alert('Greška pri brisanju');
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  // lokalna pretraga i filtriranje
  const viewRows = prijave.filter(r => {
    const bySearch = r.predmet.toLowerCase().includes(search.trim().toLowerCase());
    const byFilters = Object.keys(filters).every(key => {
      if (!filters[key]) return true;
      return r[key]?.toString().toLowerCase().includes(filters[key].toString().toLowerCase());
    });
    return bySearch && byFilters;
  });

  return (
    <div className="page">
      <h1>Moje prijave ispita</h1>

      <Breadcrumbs
        items={[
          { label: 'Početna', link: '/student/home' },
          { label: 'Moje prijave' }
        ]}
      />

      {loading && <p>Učitavanje…</p>}
      {error && !loading && <p style={{ color: 'red' }}>{error}</p>}

      {!loading && !error && (
        <>
          <TableToolbar
            search={search}
            onSearchChange={setSearch}
            filtersConfig={filtersConfig}
            filtersValues={filters}
            onFilterChange={handleFilterChange}
          />

          <button onClick={openNew}>+ Nova prijava</button>

          <DataTable
            columns={columns}
            data={viewRows}
            renderActions={(row) => (
              <>
                <button onClick={() => openEdit(row)}>Izmeni</button>
                <button onClick={() => handleDelete(row.id, row.status)}>Poništi</button>
              </>
            )}
          />

          <Pagination
            page={page} last={lastPage}
            onPrev={() => setPage(p => p - 1)}
            onNext={() => setPage(p => p + 1)}
          />

          <Modal open={open} onClose={close} title={editing ? "Izmeni prijavu" : "Nova prijava"}>
            <form onSubmit={handleSubmit} className="modal-form">
              {!editing && (
                <label>Predmet ID:
                  <input name="predmet_id" type="number" value={form.predmet_id}
                         onChange={e => setForm({ ...form, predmet_id: e.target.value })} required />
                </label>
              )}
              <label>Rok:
                <input name="rok" type="number" min="1" max="6" value={form.rok}
                       onChange={e => setForm({ ...form, rok: e.target.value })} required />
              </label>
              <div className="modal-buttons">
                <button type="submit">Sačuvaj</button>
                <button type="button" onClick={close}>Otkaži</button>
              </div>
            </form>
          </Modal>
        </>
      )}
    </div>
  );
};

export default Prijave;
