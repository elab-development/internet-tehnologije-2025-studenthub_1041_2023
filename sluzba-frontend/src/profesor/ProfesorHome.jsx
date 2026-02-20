import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Breadcrumbs from '../reusable/Breadcrumbs';
import DataTable from '../reusable/DataTable';
import TableToolbar from '../reusable/TableToolbar';

const API = 'http://127.0.0.1:8000/api';

const columns = [
  { key: 'naziv', label: 'Predmet' },
  { key: 'godina', label: 'Godina' },
  { key: 'semestar', label: 'Semestar' },
  { key: 'espb', label: 'ESPB' },
];

const ProfesorHome = () => {
  const navigate = useNavigate();

  const [predmeti, setPredmeti] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [search, setSearch] = useState('');

  const tokenHeader = () => ({
    headers: {
      Authorization: `Bearer ${sessionStorage.getItem('access_token')}`,
      Accept: 'application/json',
    },
  });

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const r = await axios.get(`${API}/profesor/predmeti`, tokenHeader());
      const list = Array.isArray(r.data) ? r.data : (r.data?.data ?? []);
      setPredmeti(list);
    } catch (e) {
      console.error(e);
      setError('Greška pri učitavanju predmeta.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const viewRows = useMemo(() => {
    const q = search.trim().toLowerCase();

    // ✅ ID fallback: p.id ili p.predmet_id
    const normalized = (predmeti || []).map(p => ({
      id: p.id ?? p.predmet_id,
      naziv: p.naziv,
      godina: p.godina,
      semestar: p.semestar,
      espb: p.espb,
      _raw: p,
    }));

    if (!q) return normalized;

    return normalized.filter(p =>
      (p.naziv || '').toLowerCase().includes(q) ||
      String(p.godina ?? '').includes(q) ||
      String(p.semestar ?? '').includes(q)
    );
  }, [predmeti, search]);

  // ✅ Navigacija bez refresh-a + stopPropagation
  const goToStudenti = (e, row) => {
    e.preventDefault();
    e.stopPropagation();

    const predmetId = row?.id;
    if (!predmetId) {
      console.log('Row without id:', row);
      alert('Greška: predmet nema id (proveri API response).');
      return;
    }

    navigate(`/profesor/studenti?predmetId=${predmetId}`);
  };

  return (
    <div className="page exfProf__page">
      <div className="exfProf__header">
        <div>
          <h1 className="exfProf__title">Profesor panel</h1>
          <p className="exfProf__subtitle">Odaberi predmet i oceni studente preko prijava ispita.</p>
        </div>

        <button
          className="exfProf__btn exfProf__btn--ghost"
          onClick={load}
          disabled={loading}
          type="button"
        >
          Osveži
        </button>
      </div>

      <Breadcrumbs
        items={[
          { label: 'Početna', link: '/profesor/home' },
          { label: 'Moji predmeti' },
        ]}
      />

      <div className="exfProf__cards">
        <div className="exfProf__card">
          <div className="exfProf__cardLabel">Ukupno predmeta</div>
          <div className="exfProf__cardValue">{predmeti?.length ?? 0}</div>
        </div>

        <div className="exfProf__card exfProf__card--hint">
          <div className="exfProf__cardLabel">Kako radi ocenjivanje</div>
          <div className="exfProf__cardText">
            Ocenu upisuješ kroz listu prijava ispita za predmet. Status se postavlja automatski (5 = nepoložen, 6–10 = položen).
          </div>
        </div>
      </div>

      {loading && <p>Učitavanje…</p>}
      {error && !loading && <p className="exfProf__error">{error}</p>}

      {!loading && !error && (
        <div className="exfProf__section">
          <div className="exfProf__sectionHead">
            <div className="exfProf__sectionTitle">Moji predmeti</div>
            <div className="exfProf__sectionMeta">Klikni “Studenti / Ocene”.</div>
          </div>

          <div className="exfProf__toolbarWrap">
            <TableToolbar
              search={search}
              onSearchChange={setSearch}
              filtersConfig={[]}
              filtersValues={{}}
              onFilterChange={() => {}}
              placeholder="Pretraga po nazivu / godini / semestru…"
            />
          </div>

          <div className="exfProf__tableWrap">
            <DataTable
              columns={columns}
              data={viewRows}
              renderActions={(row) => (
                <button
                  className="exfProf__btn exfProf__btn--primary"
                  type="button"
                  onClick={(e) => goToStudenti(e, row)}
                >
                  Studenti / Ocene
                </button>
              )}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfesorHome;