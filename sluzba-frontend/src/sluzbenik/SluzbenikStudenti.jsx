// pages/SluzbenikStudenti.jsx
import { useEffect, useState } from 'react';
import axios from 'axios';
import DataTable from '../reusable/DataTable';
import Pagination from '../reusable/Pagination';
import Breadcrumbs from '../reusable/Breadcrumbs';

const columns = [
  { key: 'ime',            label: 'Ime'              },
  { key: 'prezime',        label: 'Prezime'          },
  { key: 'broj_indeksa',   label: 'Broj indeksa'     },
  { key: 'godina_studija', label: 'Godina studija'   },
  { key: 'smer',           label: 'Smer'             },
];

const SluzbenikStudenti = () => {
  const [studenti, setStudenti]   = useState([]);
  const [page,     setPage]       = useState(1);
  const [lastPage, setLastPage]   = useState(1);
  const [loading,  setLoading]    = useState(false);
  const [error,    setError]      = useState(null);

  /*  helper za header s tokenom  */
  const tokenHeader = () => ({
    headers: {
      Authorization: `Bearer ${sessionStorage.getItem('access_token')}`,
      Accept:        'application/json',
    },
  });

  const fetchStudenti = async (p = 1) => {
    setLoading(true); setError(null);
    try {
      const r = await axios.get(
        `http://127.0.0.1:8000/api/sluzbenik/studenti?page=${p}`,
        tokenHeader()
      );
      setStudenti(r.data.data || []);
      setPage(r.data.meta?.current_page || p);
      setLastPage(r.data.meta?.last_page || 1);
    } catch (e) {
      console.error(e);
      setError('Greška prilikom učitavanja studenata.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchStudenti(page); }, [page]);

  return (
    <div className="page">
      <h1>Lista studenata</h1>

       <Breadcrumbs
        items={[
          { label: 'Početna', link: '/sluzbenik/home' },
          { label: 'Studenti' },
        ]}
      />

      {loading && <p>Učitavanje…</p>}
      {error && !loading && <p style={{ color: 'red' }}>{error}</p>}

      {!loading && !error && (
        <>
          <DataTable columns={columns} data={studenti} />

          <Pagination
            page={page}
            last={lastPage}
            onPrev={() => setPage(p => p - 1)}
            onNext={() => setPage(p => p + 1)}
          />
        </>
      )}
    </div>
  );
};

export default SluzbenikStudenti;
