import { useEffect, useState } from 'react';
import axios from 'axios';
import DataTable from '../reusable/DataTable';
import Pagination from '../reusable/Pagination';
import Modal from '../reusable/Modal';
import TableToolbar from '../reusable/TableToolbar';
import Breadcrumbs from '../reusable/Breadcrumbs';

const columns = [
  { key: 'naziv',    label: 'Naziv'   },
  { key: 'espb',     label: 'ESPB'    },
  { key: 'godina',   label: 'Godina'  },
  { key: 'obavezan', label: 'Obavezan/Izborni' },
  { key: 'semestar', label: 'Semestar' },
  { key: 'profesor', label: 'Profesor' }
];

const SluzbenikPredmeti = () => {
  const [predmeti, setPredmeti] = useState([]);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // search + filters
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({});

  const filtersConfig = [
    { key: 'godina', type: 'select', label: 'Godina', options: [1, 2, 3, 4].map(g => ({ value: g, label: g })) },
    { key: 'profesor', type: 'text', label: 'Profesor' }
  ];

  // modal
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    naziv: '', espb: '', godina: '', obavezan: false, semestar: '', profesor_id: ''
  });

  const tokenHeader = () => ({
    headers: {
      Authorization: `Bearer ${sessionStorage.getItem('access_token')}`,
      Accept: 'application/json'
    }
  });

  const loadPredmeti = async (p = 1) => {
    setLoading(true);
    setError(null);
    try {
      const r = await axios.get(`http://127.0.0.1:8000/api/sluzbenik/predmeti?page=${p}`, tokenHeader());
      const rows = r.data.data.map(d => ({
        ...d,
        profesor: `${d.profesor.ime} ${d.profesor.prezime}`
      }));
      setPredmeti(rows);
      setPage(r.data.meta.current_page);
      setLastPage(r.data.meta.last_page);
    } catch (e) {
      setError('Greška pri učitavanju');
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // kad se promeni search ili filter → resetuj na stranu 1
  useEffect(() => {
    setPage(1);
  }, [search, filters]);

  // kad se promeni page → učitaj podatke
  useEffect(() => {
    loadPredmeti(page);
  }, [page]);

  const openEdit = (row) => {
    setEditing(row.id);
    setForm({
      naziv: row.naziv, espb: row.espb, godina: row.godina,
      obavezan: row.obavezan === 'Obavezan', semestar: row.semestar,
      profesor_id: ''
    });
    setOpen(true);
  };

  const close = () => { setOpen(false); setEditing(null); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      naziv: form.naziv.trim(),
      espb: Number(form.espb),
      godina: Number(form.godina),
      obavezan: form.obavezan,
      semestar: Number(form.semestar),
      profesor_id: form.profesor_id || null
    };
    try {
      await axios.put(
        `http://127.0.0.1:8000/api/sluzbenik/predmeti/${editing}`,
        payload,
        { ...tokenHeader(), 'Content-Type': 'application/json' }
      );
      close();
      loadPredmeti(page);
    } catch (err) {
      console.error(err);
      alert('Validaciona greška – proveri unos');
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  // lokalna pretraga i filtriranje
  const viewRows = predmeti.filter(r => {
    const bySearch = r.naziv.toLowerCase().includes(search.trim().toLowerCase());

    const byFilters = Object.keys(filters).every(key => {
      if (!filters[key]) return true;
      return r[key]?.toString().toLowerCase().includes(filters[key].toString().toLowerCase());
    });

    return bySearch && byFilters;
  });

  return (
    <div className="page">
      <h1>Lista predmeta</h1>

      <Breadcrumbs
        items={[
          { label: 'Početna', link: '/sluzbenik/home' },
          { label: 'Lista predmeta' }
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

          <DataTable
            columns={columns}
            data={viewRows}
            renderActions={(row) => (
              <button onClick={() => openEdit(row)}>Izmeni</button>
            )}
          />

          <Pagination
            page={page} last={lastPage}
            onPrev={() => setPage(p => p - 1)}
            onNext={() => setPage(p => p + 1)}
          />

          <Modal open={open} onClose={close} title="Ažuriraj predmet">
            <form onSubmit={handleSubmit} className="modal-form">
              <label>Naziv:
                <input name="naziv" value={form.naziv}
                       onChange={e => setForm({ ...form, naziv: e.target.value })} required />
              </label>
              <label>ESPB:
                <input name="espb" type="number" value={form.espb}
                       onChange={e => setForm({ ...form, espb: e.target.value })} required />
              </label>
              <label>Godina:
                <input name="godina" type="number" min="1" max="6" value={form.godina}
                       onChange={e => setForm({ ...form, godina: e.target.value })} required />
              </label>
              <label>Obavezan:
                <input type="checkbox" checked={form.obavezan}
                       onChange={e => setForm({ ...form, obavezan: e.target.checked })} />
              </label>
              <label>Semestar:
                <input name="semestar" type="number" min="1" max="2" value={form.semestar}
                       onChange={e => setForm({ ...form, semestar: e.target.value })} required />
              </label>
              <label>Profesor ID:
                <input name="profesor_id" type="number" value={form.profesor_id}
                       onChange={e => setForm({ ...form, profesor_id: e.target.value })} />
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

export default SluzbenikPredmeti;
