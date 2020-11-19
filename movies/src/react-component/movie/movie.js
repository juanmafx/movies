import React, { useEffect, useRef } from "react";

import { useHistory, useRouteMatch } from "react-router-dom";

import "./movie.css";

const Movie = ({ movie }) => {
  const divDescript = useRef();
  const history = useHistory();
  const match = useRouteMatch();

  useEffect(() => {
    divDescript.current.innerHTML = movie.show.summary;
  }, []);
  return (
    <div
      className="container_movie"
      onClick={(e) => history.push(`${match.path}${movie.show.id}`)}
    >
      <div className="container_preview">
        <img src={movie.show.image.medium} alt={movie.show.name} />
      </div>
      <h3>{movie.show.name}</h3>
      <div ref={divDescript} className="description"></div>
    </div>
  );
};

export default Movie;
