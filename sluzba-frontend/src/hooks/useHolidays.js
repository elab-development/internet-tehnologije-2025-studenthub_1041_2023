import { useEffect, useState } from "react";

const useHolidays = (year, country = "RS") => {
  const [holidays, setHolidays] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const y = Number(year);
    if (!Number.isFinite(y)) return;

    const controller = new AbortController();

    (async () => {
      setLoading(true);
      setError("");
      try {
        const url = `https://date.nager.at/api/v3/PublicHolidays/${y}/${String(country).toUpperCase()}`;
        const res = await fetch(url, { signal: controller.signal });
        if (!res.ok) throw new Error(`HTTP ${res.status}.`);
        const data = await res.json();
        setHolidays(Array.isArray(data) ? data : []);
      } catch (e) {
        if (e.name !== "AbortError") setError(e.message || "Greška.");
      } finally {
        setLoading(false);
      }
    })();

    return () => controller.abort();
  }, [year, country]);

  return { holidays, loading, error };
};

export default useHolidays;
