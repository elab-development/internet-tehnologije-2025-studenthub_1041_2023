import React, { useState } from "react";
import useYouTubeVideos from "../hooks/useYoutubeVideos";
import Breadcrumbs from "../reusable/Breadcrumbs";

const YoutubeEdukacija = () => {
  const [query, setQuery] = useState("YoutubeEdukacija experience");
  const { videos, loading } = useYouTubeVideos(query);

  const handleSearch = (e) => {
    e.preventDefault();
    const input = e.target.elements.search.value.trim();
    if (input) setQuery(input);
  };

  return (
    <div className="home">
      <h1>YouTube Edukacija</h1>
      <Breadcrumbs items={[{ label: "Početna", link: "/home" }, { label: "YouTube" }]} />
      <p>Pretraži edukativne video klipove za YoutubeEdukacija i studiranje u inostranstvu:</p>

      <form onSubmit={handleSearch} className="youtube-search-form">
        <input name="search" placeholder="Unesite pojam (npr. Study in Germany)" />
        <button type="submit">Pretraži</button>
      </form>

      {loading ? (
        <p>Učitavanje...</p>
      ) : (
        <div className="youtube-grid">
          {videos.map((video) => (
            <div key={video.id.videoId} className="card">
              <iframe
                width="100%"
                height="200"
                src={`https://www.youtube.com/embed/${video.id.videoId}`}
                title={video.snippet.title}
                allowFullScreen
              />
              <h4>{video.snippet.title}</h4>
              <p>{video.snippet.channelTitle}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default YoutubeEdukacija;
