import React from "react";
import { useEffect, useState } from "react";
import { getMovies } from "../../service/service";
import Movie from "../movie/movie";
import "./movies.css";

const Movies = () => {
  const [arrayMovie, setarrayMovie] = useState([]);

  const abortController = new AbortController();

  const callback = (date) => {
    if (Array.isArray(date)) {
      setarrayMovie(date);
    }
  };

  useEffect(() => {
    getMovies(abortController, callback);
  }, []);

  return (
    <div className="container_main">
      <h1>Movies</h1>
      <div className="container_movies">
        {Array.isArray(arrayMovie) &&
          arrayMovie.map((movie, index) => {
            return <Movie movie={movie} key={index} />;
          })}
      </div>
    </div>
  );
};

export default Movies;
