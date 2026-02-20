import { useEffect, useMemo, useState } from 'react';
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

// ====== ROKOVI (PODESI DATUME) ======
const ROK_RANGES = {
  1: { label: 'Januarski',  from: '2026-01-10', to: '2026-01-25' },
  2: { label: 'Februarski', from: '2026-02-01', to: '2026-02-15' },
  3: { label: 'Aprilski',   from: '2026-04-01', to: '2026-04-12' },
  4: { label: 'Junski',     from: '2026-06-10', to: '2026-06-25' },
  5: { label: 'Septembarski', from: '2026-09-01', to: '2026-09-15' },
  6: { label: 'Oktobarski', from: '2026-10-01', to: '2026-10-10' },
};

function parseYMD(ymd) {
  const [y, m, d] = ymd.split('-').map(Number);
  return new Date(y, m - 1, d, 0, 0, 0, 0);
}

function endOfDay(date) {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
}

// Rok je "u prošlosti" ako je njegov "to" datum < danas (sada).
function isRokPast(rokNumber) {
  const cfg = ROK_RANGES[rokNumber];
  if (!cfg) return false;
  const now = new Date();
  const to = endOfDay(parseYMD(cfg.to));
  return to < now;
}

// Rok je "dozvoljen" ako nije prošao (dakle, sada ili budućnost).
function canPickRok(rokNumber) {
  const rok = Number(rokNumber);
  if (!ROK_RANGES[rok]) return false;
  return !isRokPast(rok);
}

function formatRange(rokNumber) {
  const cfg = ROK_RANGES[rokNumber];
  if (!cfg) return `Rok ${rokNumber}`;
  return `${rokNumber} — ${cfg.label} (${cfg.from} → ${cfg.to})`;
}

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
  const [editingRokOriginal, setEditingRokOriginal] = useState(null); // ✅ zapamti originalni rok kada editujemo
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
      setLastPage(1);
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
    setEditingRokOriginal(null);
    setForm({ predmet_id: '', rok: '' });
    setOpen(true);
  };

  const openEdit = (row) => {
    if (row.status !== 'prijavljen') {
      alert('Može se menjati samo prijava u statusu "prijavljen".');
      return;
    }

    // ✅ Ako je prijava u roku koji je već prošao, ne dozvoljavamo izmenu (nema smisla).
    if (isRokPast(row.rok)) {
      alert(`Ova prijava je vezana za rok koji je prošao.\n${formatRange(row.rok)}\nNe može se menjati.`);
      return;
    }

    setEditing(row.id);
    setEditingRokOriginal(Number(row.rok));
    setForm({ predmet_id: row.predmet_id || '', rok: row.rok });
    setOpen(true);
  };

  const close = () => { setOpen(false); setEditing(null); setEditingRokOriginal(null); };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const rokNum = Number(form.rok);
    const predmetIdNum = Number(form.predmet_id);

    if (!Number.isInteger(rokNum) || rokNum < 1 || rokNum > 6) {
      alert('Rok mora biti broj od 1 do 6.');
      return;
    }

    // ✅ GLAVNO PRAVILO: ne može prošli rok.
    if (!canPickRok(rokNum)) {
      alert(`Ne možeš izabrati rok koji je u prošlosti.\nIzabrani rok: ${formatRange(rokNum)}`);
      return;
    }

    // ✅ Kod izmene: dozvoli samo prelazak na kasniji rok (ne raniji).
    if (editing) {
      const orig = Number(editingRokOriginal);

      if (Number.isFinite(orig)) {
        if (rokNum < orig) {
          alert(`Ne možeš promeniti prijavu na raniji rok.\nTrenutni rok: ${formatRange(orig)}\nIzabrani rok: ${formatRange(rokNum)}`);
          return;
        }
        if (rokNum === orig) {
          alert('Izabrala si isti rok. Ako želiš promenu, izaberi kasniji rok.');
          return;
        }
      }
    } else {
      // Nova prijava: minimalna validacija predmet_id
      if (!Number.isInteger(predmetIdNum) || predmetIdNum <= 0) {
        alert('Predmet ID mora biti validan broj.');
        return;
      }
    }

    try {
      if (editing) {
        await axios.put(
          `http://127.0.0.1:8000/api/student/prijave/${editing}`,
          { rok: rokNum },
          { ...tokenHeader(), 'Content-Type': 'application/json' }
        );
      } else {
        await axios.post(
          `http://127.0.0.1:8000/api/student/prijave`,
          { predmet_id: predmetIdNum, rok: rokNum },
          { ...tokenHeader(), 'Content-Type': 'application/json' }
        );
      }
      close();
      alert('Prijava uspešno sačuvana.');
      loadPrijave();
    } catch (err) {
      console.error(err);
      alert('Validaciona greška – proveri unos.');
    }
  };

  const handleDelete = async (id, status, rok) => {
    if (status !== 'prijavljen') {
      alert('Može se poništiti samo prijava u statusu "prijavljen".');
      return;
    }

    // ✅ Poništavanje: takođe zabrani ako je rok prošao (frontend-only).
    if (isRokPast(rok)) {
      alert(`Ne možeš poništiti prijavu jer je rok prošao.\n${formatRange(rok)}`);
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

  const viewRows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return prijave.filter(r => {
      const bySearch = (r.predmet || '').toLowerCase().includes(q);
      const byFilters = Object.keys(filters).every(key => {
        if (!filters[key]) return true;
        return r[key]?.toString().toLowerCase().includes(filters[key].toString().toLowerCase());
      });
      return bySearch && byFilters;
    });
  }, [prijave, search, filters]);

  // Informativno: koji rokovi su zabranjeni/dopušteni.
  const rokInfo = useMemo(() => {
    const nowOk = [];
    const past = [];
    for (let i = 1; i <= 6; i++) {
      if (canPickRok(i)) nowOk.push(i);
      else past.push(i);
    }
    return { nowOk, past };
  }, []);

  return (
    <div className="page">
      <h1>Moje prijave ispita</h1>

      <Breadcrumbs
        items={[
          { label: 'Početna', link: '/student/home' },
          { label: 'Moje prijave' }
        ]}
      />

      <div style={{ marginBottom: 10, opacity: 0.85, fontSize: 13 }}>
        <strong>Dozvoljeni rokovi (danas/budućnost):</strong> {rokInfo.nowOk.length ? rokInfo.nowOk.map(formatRange).join(' | ') : 'Nema.'}<br/>
        <strong>Zabranjeni rokovi (prošli):</strong> {rokInfo.past.length ? rokInfo.past.map(formatRange).join(' | ') : 'Nema.'}
      </div>

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
                <button onClick={() => handleDelete(row.id, row.status, row.rok)}>Poništi</button>
              </>
            )}
          />

          <Pagination
            page={page} last={lastPage}
            onPrev={() => setPage(p => Math.max(1, p - 1))}
            onNext={() => setPage(p => Math.min(lastPage, p + 1))}
          />

          <Modal open={open} onClose={close} title={editing ? "Izmeni prijavu" : "Nova prijava"}>
            <form onSubmit={handleSubmit} className="modal-form">
              {!editing && (
                <label>Predmet ID:
                  <input
                    name="predmet_id"
                    type="number"
                    value={form.predmet_id}
                    onChange={e => setForm({ ...form, predmet_id: e.target.value })}
                    required
                  />
                </label>
              )}

              <label>Rok:
                <input
                  name="rok"
                  type="number"
                  min="1"
                  max="6"
                  value={form.rok}
                  onChange={e => setForm({ ...form, rok: e.target.value })}
                  required
                />
              </label>

              {form.rok && Number(form.rok) >= 1 && Number(form.rok) <= 6 && (
                <div style={{ marginTop: 8, fontSize: 13, opacity: 0.85 }}>
                  <strong>Izabrani rok:</strong> {formatRange(Number(form.rok))}<br />
                  <strong>Dozvola:</strong> {canPickRok(Number(form.rok)) ? 'OK (danas/budućnost).' : 'Zabranjeno (prošao).'}
                  {editing && Number.isFinite(editingRokOriginal) && (
                    <>
                      <br />
                      <strong>Trenutni rok:</strong> {formatRange(Number(editingRokOriginal))}
                      <br />
                      <strong>Pravilo izmene:</strong> samo na kasniji rok.
                    </>
                  )}
                </div>
              )}

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