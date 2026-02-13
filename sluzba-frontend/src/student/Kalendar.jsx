import React, { useMemo, useState } from "react";
import useHolidays from "../hooks/useHolidays";
import Pagination from "../reusable/Pagination";
import Breadcrumbs from "../reusable/Breadcrumbs";

const Kalendar = () => {
  const [year, setYear] = useState(new Date().getFullYear());

  const { holidays, loading, error } = useHolidays(year, "RS");

  // PAGINATION.
  const itemsPerPage = 3;
  const [page, setPage] = useState(1);

  const sortedHolidays = useMemo(() => {
    return [...holidays].sort((a, b) =>
      String(a?.date || "").localeCompare(String(b?.date || ""))
    );
  }, [holidays]);

  const lastPage = Math.max(1, Math.ceil(sortedHolidays.length / itemsPerPage));

  const paginatedHolidays = sortedHolidays.slice(
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
          { label: "Početna", link: "/home" },
          { label: "Kalendar" },
        ]}
      />

      <p>Pogledajte detaljan pregled praznika u Srbiji za izabranu godinu.</p>

      <label className="holiday-year-label">
        Godina:
        <input
          type="number"
          value={year}
          onChange={(e) => {
            const val = parseInt(e.target.value, 10);
            setYear(Number.isNaN(val) ? new Date().getFullYear() : val);
            setPage(1);
          }}
          className="holiday-year-input"
        />
      </label>

      {loading ? (
        <p className="loading-text">Učitavanje...</p>
      ) : error ? (
        <p className="loading-text">Greška: {error}</p>
      ) : paginatedHolidays.length === 0 ? (
        <p className="loading-text">Nema dostupnih praznika za ovu godinu.</p>
      ) : (
        <>
          <div className="holiday-grid">
            {paginatedHolidays.map((holiday) => {
              const dateStr = holiday?.date; // "YYYY-MM-DD"
              const dt = dateStr ? new Date(`${dateStr}T00:00:00`) : null;

              return (
                <div key={`${holiday?.name}-${dateStr}`} className="card">
                  <div className="holiday-card-date">
                    <span className="holiday-day">{dt ? dt.getDate() : "-"}</span>
                    <span className="holiday-month">
                      {dt
                        ? dt.toLocaleString("sr-RS", { month: "short" })
                        : "-"}
                    </span>
                  </div>

                  <div className="holiday-card-body">
                    {/* Prikaži lokalni naziv (srpski), a ispod engleski. */}
                    <h4>{holiday?.localName || holiday?.name}</h4>
                    {holiday?.localName && holiday?.name ? (
                      <p>{holiday.name}</p>
                    ) : null}

                    {/* Types je niz, npr. ["Public"] */}
                    {Array.isArray(holiday?.types) && holiday.types.length > 0 ? (
                      <p>{holiday.types.join(", ")}</p>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>

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
