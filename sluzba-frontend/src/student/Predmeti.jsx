// src/pages/Predmeti.jsx
import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import DataTable from '../reusable/DataTable';
import Pagination from '../reusable/Pagination';
import Modal from '../reusable/Modal';
import Breadcrumbs from '../reusable/Breadcrumbs';

const columns = [
  { key: 'naziv',    label: 'Naziv' },
  { key: 'espb',     label: 'ESPB' },
  { key: 'godina',   label: 'Godina' },
  { key: 'semestar', label: 'Semestar' },
  { key: 'profesor', label: 'Profesor' },
  { key: 'upisano_u_godini', label: 'Upisano u godini' },
];

const PER_PAGE = 10;

const Predmeti = () => {
  const [predmeti, setPredmeti] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // detalji
  const [open, setOpen] = useState(false);
  const [detalj, setDetalj] = useState(null);
  const [detaljLoading, setDetaljLoading] = useState(false);

  const tokenHeader = () => ({
    headers: {
      Authorization: `Bearer ${sessionStorage.getItem('access_token')}`,
      Accept: 'application/json'
    }
  });

  const loadUpisani = async () => {
    setLoading(true);
    setError(null);
    try {
      const r = await axios.get('http://127.0.0.1:8000/api/student/predmeti/upisani', tokenHeader());
      const list = (r.data?.data ?? r.data ?? []).map(d => ({
        id: d.id,
        naziv: d.naziv,
        espb: d.espb,
        godina: d.godina,
        semestar: d.semestar,
        profesor: d.profesor, // iz PredmetUserResource: string "Ime Prezime"
        upisano_u_godini: d.pivot?.upisano_u_godini ?? '',
        // cuvamo pivot radi konzistentnosti
        _pivot: d.pivot ?? null,
      }));
      setPredmeti(list);
    } catch (e) {
      console.error(e);
      setError('Greška pri učitavanju upisanih predmeta.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUpisani();
  }, []);

  const lastPage = Math.max(1, Math.ceil(predmeti.length / PER_PAGE));
  const viewRows = useMemo(() => {
    const start = (page - 1) * PER_PAGE;
    return predmeti.slice(start, start + PER_PAGE);
  }, [predmeti, page]);

  const openDetails = async (id) => {
    setOpen(true);
    setDetalj(null);
    setDetaljLoading(true);
    try {
      const r = await axios.get(`http://127.0.0.1:8000/api/student/predmeti/upisani/${id}`, tokenHeader());
      // resurs vraća u .data jedan predmet
      const d = r.data?.data ?? r.data;
      setDetalj({
        id: d.id,
        naziv: d.naziv,
        espb: d.espb,
        godina: d.godina,
        semestar: d.semestar,
        profesor: d.profesor,
        pivot: d.pivot ?? {},
      });
    } catch (e) {
      console.error(e);
      setDetalj(null);
    } finally {
      setDetaljLoading(false);
    }
  };

  const close = () => { setOpen(false); setDetalj(null); };

  return (
    <div className="page">
      <h1>Moji upisani predmeti</h1>

      <Breadcrumbs
        items={[
          { label: 'Početna', link: '/student/home' },
          { label: 'Upisani predmeti' }
        ]}
      />

      {loading && <p>Učitavanje…</p>}
      {error && !loading && <p style={{ color: 'red' }}>{error}</p>}

      {!loading && !error && (
        <>
          <DataTable
            columns={columns}
            data={viewRows}
            renderActions={(row) => (
              <button onClick={() => openDetails(row.id)}>Detalji</button>
            )}
          />

          <Pagination
            page={page}
            last={lastPage}
            onPrev={() => setPage(p => Math.max(1, p - 1))}
            onNext={() => setPage(p => Math.min(lastPage, p + 1))}
          />

          <Modal open={open} onClose={close} title="Detalji predmeta">
            {detaljLoading && <p>Učitavanje detalja…</p>}
            {!detaljLoading && !detalj && (
              <p style={{ color: 'red' }}>Nije moguće učitati detalje.</p>
            )}
            {!detaljLoading && detalj && (
              <div className="modal-body">
                <div className="field"><strong>Naziv:</strong> {detalj.naziv}</div>
                <div className="field"><strong>ESPB:</strong> {detalj.espb}</div>
                <div className="field"><strong>Godina:</strong> {detalj.godina}</div>
                <div className="field"><strong>Semestar:</strong> {detalj.semestar}</div>
                <div className="field"><strong>Profesor:</strong> {detalj.profesor}</div>
                <hr />
                <div className="field"><strong>Upisano u godini:</strong> {detalj.pivot?.upisano_u_godini ?? '—'}</div>
                <div className="field"><strong>Status predavanja:</strong> {detalj.pivot?.status_predavanja ?? '—'}</div>
              </div>
            )}
          </Modal>
        </>
      )}
    </div>
  );
};

export default Predmeti;
