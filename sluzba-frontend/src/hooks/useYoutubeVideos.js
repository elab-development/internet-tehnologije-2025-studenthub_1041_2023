import { useEffect, useState } from "react";

const useYouTubeVideos = (query = "Erasmus experience") => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(false);
  const apiKey = process.env.REACT_APP_YOUTUBE_API_KEY;

  useEffect(() => {
    const fetchVideos = async () => {
      setLoading(true);
      try {
        const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(
          query
        )}&type=video&maxResults=9&key=${apiKey}`;
        const response = await fetch(url);
        const data = await response.json();
        setVideos(data.items || []);
      } catch (err) {
        console.error("Greška pri dohvatanju videa:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
  }, [query]);

  return { videos, loading };
};

export default useYouTubeVideos;
