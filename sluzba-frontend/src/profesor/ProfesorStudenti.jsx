import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Breadcrumbs from '../reusable/Breadcrumbs';
import DataTable from '../reusable/DataTable';
import Pagination from '../reusable/Pagination';
import Modal from '../reusable/Modal';
import TableToolbar from '../reusable/TableToolbar';

const API = 'http://127.0.0.1:8000/api';

const studentColumns = [
  { key: 'student', label: 'Student' },
  { key: 'broj_indeksa', label: 'Br. indeksa' },
  { key: 'status_predavanja', label: 'Status' },
  { key: 'upisano_u_godini', label: 'Upisano' },
];

const prijaveColumns = [
  { key: 'student', label: 'Student' },
  { key: 'broj_indeksa', label: 'Br. indeksa' },
  { key: 'rok', label: 'Rok' },
  { key: 'broj_prijave', label: 'Br. prijave' },
  { key: 'status', label: 'Status' },
  { key: 'ocena', label: 'Ocena' },
];

function getPredmetIdFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get('predmetId');
}

const ProfesorStudenti = () => {
  const navigate = useNavigate();

  const [predmetId, setPredmetId] = useState(getPredmetIdFromUrl());

  const [studenti, setStudenti] = useState([]);
  const [prijave, setPrijave] = useState([]);

  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [searchStudents, setSearchStudents] = useState('');
  const [searchPrijave, setSearchPrijave] = useState('');

  const [filtersPrijave, setFiltersPrijave] = useState({
    status: '',
    rok: '',
  });

  const filtersPrijaveConfig = [
    { key: 'status', type: 'select', label: 'Status', options: ['', 'prijavljen', 'polozen', 'nepolozen'].map(v => ({ value: v, label: v || 'Svi' })) },
    { key: 'rok', type: 'select', label: 'Rok', options: ['', 1,2,3,4,5,6].map(v => ({ value: v, label: v === '' ? 'Svi' : v })) },
  ];

  // modal (ocenjivanje)
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [ocena, setOcena] = useState(6);

  const tokenHeader = () => ({
    headers: {
      Authorization: `Bearer ${sessionStorage.getItem('access_token')}`,
      Accept: 'application/json',
    },
  });

  const loadStudenti = async () => {
    const r = await axios.get(`${API}/profesor/predmeti/${predmetId}/studenti`, tokenHeader());
    const list = Array.isArray(r.data) ? r.data : (r.data?.data ?? []);
    setStudenti(list);
  };

  const loadPrijave = async (p = 1) => {
    const r = await axios.get(`${API}/profesor/predmeti/${predmetId}/prijave-ispita?page=${p}`, tokenHeader());
    const list = r.data?.data ?? [];
    const meta = r.data?.meta;

    const mapped = list.map(item => ({
      id: item.id ?? item.prijava_id,
      rok: item.rok,
      broj_prijave: item.broj_prijave,
      status: item.status,
      ocena: item.ocena ?? '',
      student: `${item.user?.ime ?? ''} ${item.user?.prezime ?? ''}`.trim(),
      broj_indeksa: item.user?.broj_indeksa ?? '',
      _raw: item,
    }));

    setPrijave(mapped);
    if (meta?.current_page) setPage(meta.current_page);
    if (meta?.last_page) setLastPage(meta.last_page);
  };

  const loadAll = async (targetPage = page) => {
    if (!predmetId || predmetId === 'undefined') {
      setError('Nedostaje predmetId. Vrati se i izaberi predmet ponovo.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await Promise.all([loadStudenti(), loadPrijave(targetPage)]);
    } catch (e) {
      console.error(e);
      setError('Greška pri učitavanju podataka.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const id = getPredmetIdFromUrl();
    setPredmetId(id);
  }, []);

  useEffect(() => {
    if (!predmetId) return;
    loadAll(1);
    setPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [predmetId]);

  useEffect(() => {
    if (!predmetId) return;
    loadPrijave(page).catch(e => console.error(e));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const viewStudentRows = useMemo(() => {
    const q = searchStudents.trim().toLowerCase();
    const normalized = (studenti || []).map(s => ({
      id: s.id,
      student: `${s.ime ?? ''} ${s.prezime ?? ''}`.trim(),
      broj_indeksa: s.broj_indeksa ?? '',
      status_predavanja: s.pivot?.status_predavanja ?? '',
      upisano_u_godini: s.pivot?.upisano_u_godini ?? '',
      _raw: s,
    }));

    if (!q) return normalized;

    return normalized.filter(r =>
      r.student.toLowerCase().includes(q) ||
      (r.broj_indeksa || '').toLowerCase().includes(q)
    );
  }, [studenti, searchStudents]);

  const viewPrijaveRows = useMemo(() => {
    const q = searchPrijave.trim().toLowerCase();

    return (prijave || []).filter(r => {
      const matchesSearch =
        !q ||
        r.student.toLowerCase().includes(q) ||
        (r.broj_indeksa || '').toLowerCase().includes(q);

      const matchesFilters = Object.entries(filtersPrijave).every(([k, v]) => {
        if (v === '' || v === null || typeof v === 'undefined') return true;

        if (k === 'rok') return Number(r.rok) === Number(v);
        if (k === 'status') return (r.status || '').toLowerCase() === String(v).toLowerCase();
        return true;
      });

      return matchesSearch && matchesFilters;
    });
  }, [prijave, searchPrijave, filtersPrijave]);

  const openGrade = (e, row) => {
    e.preventDefault();
    e.stopPropagation();
    setEditing(row);
    setOcena(row.ocena ? Number(row.ocena) : 6);
    setOpen(true);
  };

  const close = () => {
    setOpen(false);
    setEditing(null);
  };

  const derivedStatus = (Number(ocena) === 5) ? 'nepoložen' : 'položen';

  const submitGrade = async (e) => {
    e.preventDefault();

    const value = Number(ocena);
    if (!Number.isInteger(value) || value < 5 || value > 10) {
      alert('Ocena mora biti ceo broj između 5 i 10.');
      return;
    }

    try {
      await axios.patch(
        `${API}/profesor/prijave-ispita/${editing.id}/ocena`,
        { ocena: value },
        { ...tokenHeader(), 'Content-Type': 'application/json' }
      );

      alert('Ocena je uspešno upisana.');
      close();
      loadPrijave(page);
    } catch (err) {
      console.error(err);
      alert('Greška pri upisu ocene.');
    }
  };

  const handleFilterChangePrijave = (key, value) => {
    setFiltersPrijave(prev => ({ ...prev, [key]: value }));
    setPage(1);
  };

  if (!predmetId || predmetId === 'undefined') {
    return (
      <div className="page exfProf__page">
        <div className="exfProf__header">
          <div>
            <h1 className="exfProf__title">Studenti i ocenjivanje</h1>
            <p className="exfProf__subtitle">Nije izabran predmet. Vrati se i izaberi predmet ponovo.</p>
          </div>
          <button
            className="exfProf__btn exfProf__btn--primary"
            type="button"
            onClick={() => navigate('/profesor/home')}
          >
            Nazad na predmete
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page exfProf__page">
      <div className="exfProf__header">
        <div>
          <h1 className="exfProf__title">Studenti i ocenjivanje</h1>
          <p className="exfProf__subtitle">Ocene se unose preko prijava ispita za izabrani predmet.</p>
        </div>

        <div className="exfProf__headerActions">
          <button
            className="exfProf__btn exfProf__btn--ghost"
            onClick={() => navigate('/profesor/home')}
            type="button"
          >
            Nazad
          </button>

          <button
            className="exfProf__btn exfProf__btn--ghost"
            onClick={() => loadAll(page)}
            disabled={loading}
            type="button"
          >
            Osveži
          </button>
        </div>
      </div>

      <Breadcrumbs
        items={[
          { label: 'Početna', link: '/profesor/home' },
          { label: 'Studenti / Ocene' }
        ]}
      />

      {loading && <p>Učitavanje…</p>}
      {error && !loading && <p className="exfProf__error">{error}</p>}

      {!loading && !error && (
        <div className="exfProf__grid">
          <div className="exfProf__panel">
            <div className="exfProf__panelHead">
              <div className="exfProf__panelTitle">Studenti koji slušaju predmet</div>
              <div className="exfProf__panelMeta">{viewStudentRows.length} studenata</div>
            </div>

            <div className="exfProf__toolbarWrap">
              <TableToolbar
                search={searchStudents}
                onSearchChange={setSearchStudents}
                filtersConfig={[]}
                filtersValues={{}}
                onFilterChange={() => {}}
                placeholder="Pretraga po studentu ili indeksu…"
              />
            </div>

            <div className="exfProf__tableWrap">
              <DataTable columns={studentColumns} data={viewStudentRows} />
            </div>
          </div>

          <div className="exfProf__panel">
            <div className="exfProf__panelHead">
              <div className="exfProf__panelTitle">Prijave ispita (ocenjivanje)</div>
              <div className="exfProf__panelMeta">Strana {page} / {lastPage}</div>
            </div>

            <div className="exfProf__toolbarWrap">
              <TableToolbar
                search={searchPrijave}
                onSearchChange={setSearchPrijave}
                filtersConfig={filtersPrijaveConfig}
                filtersValues={filtersPrijave}
                onFilterChange={handleFilterChangePrijave}
                placeholder="Pretraga po studentu ili indeksu…"
              />
            </div>

            <div className="exfProf__tableWrap">
              <DataTable
                columns={prijaveColumns}
                data={viewPrijaveRows}
                renderActions={(row) => (
                  <button
                    className="exfProf__btn exfProf__btn--primary"
                    type="button"
                    onClick={(e) => openGrade(e, row)}
                  >
                    Oceni
                  </button>
                )}
              />
            </div>

            <div className="exfProf__paginationWrap">
              <Pagination
                page={page}
                last={lastPage}
                onPrev={() => setPage(p => Math.max(1, p - 1))}
                onNext={() => setPage(p => Math.min(lastPage, p + 1))}
              />
            </div>
          </div>

          <Modal open={open} onClose={close} title="Upis ocene">
            <form onSubmit={submitGrade} className="exfProf__modalForm">
              <div className="exfProf__modalBox">
                <div><span className="exfProf__muted">Student:</span> <strong>{editing?.student}</strong></div>
                <div><span className="exfProf__muted">Indeks:</span> <strong>{editing?.broj_indeksa}</strong></div>
                <div><span className="exfProf__muted">Rok:</span> <strong>{editing?.rok}</strong></div>
              </div>

              <div className="exfProf__modalRow">
                <label className="exfProf__label">
                  Ocena (5–10)
                  <input
                    className="exfProf__input"
                    type="number"
                    min="5"
                    max="10"
                    value={ocena}
                    onChange={(e) => setOcena(e.target.value ? Number(e.target.value) : '')}
                    required
                  />
                </label>

                <label className="exfProf__label">
                  Status (automatski)
                  <input className="exfProf__input" type="text" value={derivedStatus} readOnly />
                </label>
              </div>

              <div className="exfProf__modalActions">
                <button className="exfProf__btn exfProf__btn--primary" type="submit">Sačuvaj</button>
                <button className="exfProf__btn exfProf__btn--ghost" type="button" onClick={close}>Otkaži</button>
              </div>
            </form>
          </Modal>
        </div>
      )}
    </div>
  );
};

export default ProfesorStudenti;