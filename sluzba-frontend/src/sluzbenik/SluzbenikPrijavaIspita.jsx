import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import DataTable from '../reusable/DataTable';
import Pagination from '../reusable/Pagination';
import Modal from '../reusable/Modal';
import TableToolbar from '../reusable/TableToolbar';
import Breadcrumbs from '../reusable/Breadcrumbs';

const columns = [
  { key: 'student',       label: 'Student' },
  { key: 'broj_indeksa',  label: 'Br. indeksa' },
  { key: 'predmet',       label: 'Predmet' },
  { key: 'godina',        label: 'Godina' },
  { key: 'semestar',      label: 'Semestar' },
  { key: 'rok',           label: 'Rok' },
  { key: 'broj_prijave',  label: 'Br. prijave' },
  { key: 'status',        label: 'Status' },
  { key: 'ocena',         label: 'Ocena' },
];

const SluzbenikPrijave = () => {
  const [rows, setRows] = useState([]);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState(null);

  // search + filters
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({
    status: '',
    rok: '',
    godina: '',
    semestar: ''
  });

  const filtersConfig = [
    { key: 'status',   type: 'select', label: 'Status',   options: ['', 'prijavljen', 'polozen', 'nepolozen'].map(v => ({ value: v, label: v || 'Svi' })) },
    { key: 'rok',      type: 'select', label: 'Rok',      options: ['', 1,2,3,4,5,6].map(v => ({ value: v, label: v === '' ? 'Svi' : v })) },
    { key: 'godina',   type: 'select', label: 'Godina',   options: ['',1,2,3,4].map(v => ({ value: v, label: v === '' ? 'Sve' : v })) },
    { key: 'semestar', type: 'select', label: 'Semestar', options: ['',1,2].map(v => ({ value: v, label: v === '' ? 'Svi' : v })) },
  ];

  // modal (ažuriranje ocene)
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    ocena: 5,
    status: 'nepolozen', // API dozvoljava samo 'polozen' | 'nepolozen' za update
  });

  const tokenHeader = () => ({
    headers: {
      Authorization: `Bearer ${sessionStorage.getItem('access_token')}`,
      Accept: 'application/json'
    }
  });

  const loadPrijave = async (p = 1) => {
    setLoading(true);
    setError(null);
    try {
      const r = await axios.get(`http://127.0.0.1:8000/api/sluzbenik/prijave?page=${p}`, tokenHeader());
      // mapiranje na "flat" redove za DataTable
      const mapped = r.data.data.map(item => ({
        id: item.id,
        rok: item.rok,
        broj_prijave: item.broj_prijave,
        status: item.status,
        ocena: item.ocena ?? '',
        student: `${item.user.ime} ${item.user.prezime}`,
        broj_indeksa: item.user.broj_indeksa,
        predmet: item.predmet.naziv,
        godina: item.predmet.godina,
        semestar: item.predmet.semestar,
        _raw: item,
      }));
      setRows(mapped);
      setPage(r.data.meta.current_page);
      setLastPage(r.data.meta.last_page);
    } catch (e) {
      console.error(e);
      setError('Greška pri učitavanju prijava.');
    } finally {
      setLoading(false);
    }
  };

  // reset na stranu 1 kad se promene filteri / pretraga
  useEffect(() => {
    setPage(1);
  }, [search, filters]);

  // učitaj kad se promeni strana
  useEffect(() => {
    loadPrijave(page);
  }, [page]);

  const openEdit = (row) => {
    setEditingId(row.id);
    // ako je status trenutne prijave 'prijavljen', postavi default 'nepolozen' dok se ne izabere
    const initialStatus = (row.status === 'prijavljen') ? 'nepolozen' : row.status;
    const initialOcena  = row.ocena ? Number(row.ocena) : 5;

    setForm({
      status: initialStatus === 'polozen' || initialStatus === 'nepolozen' ? initialStatus : 'nepolozen',
      ocena: initialOcena
    });
    setOpen(true);
  };

  const close = () => { setOpen(false); setEditingId(null); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // validacije na klijentu (API već ima backend validaciju)
    const oc = Number(form.ocena);
    if (!Number.isInteger(oc) || oc < 5 || oc > 10) {
      alert('Ocena mora biti ceo broj između 5 i 10.');
      return;
    }
    if (!['polozen', 'nepolozen'].includes(form.status)) {
      alert('Status mora biti polozen ili nepolozen.');
      return;
    }

    try {
      await axios.patch(
        `http://127.0.0.1:8000/api/sluzbenik/prijave/${editingId}/ocena`,
        { ocena: oc, status: form.status },
        { ...tokenHeader(), 'Content-Type': 'application/json' }
      );
      close();
      // osveži trenutnu stranu
      alert('Ocena je uspešno izmenjena.');
      loadPrijave(page);
    } catch (err) {
      console.error(err);
      alert('Validaciona greška – proveri unos');
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  // lokalna pretraga + filtriranje
  const viewRows = useMemo(() => {
    const q = search.trim().toLowerCase();

    return rows.filter(r => {
      const matchesSearch =
        !q ||
        r.student.toLowerCase().includes(q) ||
        r.predmet.toLowerCase().includes(q) ||
        (r.broj_indeksa ?? '').toLowerCase().includes(q);

      const matchesFilters = Object.entries(filters).every(([k, v]) => {
        if (v === '' || v === null || typeof v === 'undefined') return true;
        // numerički filteri moraju se poklopiti brojčano
        if (['rok', 'godina', 'semestar'].includes(k)) {
          return Number(r[k]) === Number(v);
        }
        // status
        if (k === 'status') {
          return (r.status || '').toString().toLowerCase() === v.toString().toLowerCase();
        }
        return true;
      });

      return matchesSearch && matchesFilters;
    });
  }, [rows, search, filters]);

  return (
    <div className="page">
      <h1>Prijave ispita</h1>

      <Breadcrumbs
        items={[
          { label: 'Početna', link: '/sluzbenik/home' },
          { label: 'Prijave ispita' }
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
            placeholder="Pretraga po studentu, predmetu ili indeksu…"
          />

          <DataTable
            columns={columns}
            data={viewRows}
            renderActions={(row) => (
              <button onClick={() => openEdit(row)}>Oceni / Izmeni</button>
            )}
          />

          <Pagination
            page={page}
            last={lastPage}
            onPrev={() => setPage(p => Math.max(1, p - 1))}
            onNext={() => setPage(p => Math.min(lastPage, p + 1))}
          />

          <Modal open={open} onClose={close} title="Ažuriraj ocenu prijave">
            <form onSubmit={handleSubmit} className="modal-form">
              <div style={{ marginBottom: 8 }}>
                <strong>Napomena:</strong> Status može biti samo <em>polozen</em> ili <em>nepolozen</em>.
              </div>

              <label>Ocena (5–10):
                <input
                  name="ocena"
                  type="number"
                  min="5"
                  max="10"
                  value={form.ocena}
                  onChange={e => setForm({ ...form, ocena: e.target.value ? Number(e.target.value) : '' })}
                  required
                />
              </label>

              <label>Status:
                <select
                  name="status"
                  value={form.status}
                  onChange={e => setForm({ ...form, status: e.target.value })}
                  required
                >
                  <option value="polozen">polozen</option>
                  <option value="nepolozen">nepolozen</option>
                </select>
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

export default SluzbenikPrijave;
