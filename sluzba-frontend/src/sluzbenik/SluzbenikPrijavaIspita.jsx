import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import DataTable from '../reusable/DataTable';
import Pagination from '../reusable/Pagination';
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

        if (['rok', 'godina', 'semestar'].includes(k)) {
          return Number(r[k]) === Number(v);
        }

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
          />

          <Pagination
            page={page}
            last={lastPage}
            onPrev={() => setPage(p => Math.max(1, p - 1))}
            onNext={() => setPage(p => Math.min(lastPage, p + 1))}
          />
        </>
      )}
    </div>
  );
};

export default SluzbenikPrijave;