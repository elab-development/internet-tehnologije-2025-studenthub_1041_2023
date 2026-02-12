import { useState, useEffect } from "react";

const useHolidays = (year, country = "RS") => {
  const [holidays, setHolidays] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchHolidays = async () => {
      setLoading(true);
      try {
        const apiKey = process.env.REACT_APP_CALENDARIFIC_API_KEY;
        const url = `https://calendarific.com/api/v2/holidays?&api_key=${apiKey}&country=${country}&year=${year}`;

        const response = await fetch(url);
        const data = await response.json();

        if (data.meta.code === 200) {
          setHolidays(data.response.holidays);
        } else {
          console.error("Greška u API odgovoru:", data);
        }
      } catch (error) {
        console.error("Greška pri dohvatanju podataka:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHolidays();
  }, [year, country]);

  return { holidays, loading };
};

export default useHolidays;