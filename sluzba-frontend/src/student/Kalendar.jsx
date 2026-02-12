import React, { useState } from "react";
import useHolidays from "../hooks/useHolidays";
import Pagination from "../reusable/Pagination";
import Breadcrumbs from '../reusable/Breadcrumbs';

const Kalendar = () => {
  const [year, setYear] = useState(new Date().getFullYear());
  const { holidays, loading } = useHolidays(year, "RS");

  // PAGINATION
  const itemsPerPage = 3; 
  const [page, setPage] = useState(1);
  const lastPage = Math.ceil(holidays.length / itemsPerPage);

  const paginatedHolidays = holidays.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  const handlePrev = () => setPage((prev) => Math.max(prev - 1, 1));
  const handleNext = () => setPage((prev) => Math.min(prev + 1, lastPage));

  return (
    <div className="holiday-container">
      <h1>Praznici u Srbiji ({year})</h1>
      <Breadcrumbs
        items={[
          { label: 'Početna', link: '/home' },
          { label: 'Kalendar' },
          ]}
        />

      <p> Pogledajte detaljan pregled praznika u Srbiji za izabranu godinu.</p>

      <label className="holiday-year-label">
        Godina:
        <input
          type="number"
          value={year}
          onChange={(e) => {
            setYear(e.target.value);
            setPage(1); // resetuj stranu kad se promeni godina
          }}
          className="holiday-year-input"
        />
      </label>

      {loading ? (
        <p className="loading-text">Učitavanje...</p>
      ) : paginatedHolidays.length === 0 ? (
        <p className="loading-text">Nema dostupnih praznika za ovu godinu.</p>
      ) : (
        <>
          <div className="holiday-grid">
            {paginatedHolidays.map((holiday) => (
              <div key={holiday.date.iso} className="card">
                <div className="holiday-card-date">
                  <span className="holiday-day">
                    {new Date(holiday.date.iso).getDate()}
                  </span>
                  <span className="holiday-month">
                    {new Date(holiday.date.iso).toLocaleString("en-US", {
                      month: "short",
                    })}
                  </span>
                </div>
                <div className="holiday-card-body">
                  <h4>{holiday.name}</h4>
                  {holiday.primary_type && <p>{holiday.primary_type}</p>}
                  {holiday.description && <p>{holiday.description}</p>}
                </div>
              </div>
            ))}
          </div>

          {/* PAGINATION */}
          <Pagination
            page={page}
            last={lastPage}
            onPrev={handlePrev}
            onNext={handleNext}
          />
        </>
      )}
    </div>
  );
};

export default Kalendar;
