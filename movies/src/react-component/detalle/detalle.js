import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import React from "react";
import "./detalle.css";
import { getMovies } from "../../service/service";

import { useHistory } from "react-router-dom";

const Detalle = () => {
  const abortController = new AbortController();
  const { id } = useParams();
  const divDescript = useRef();

  const history = useHistory();

  const [imagen, setimagen] = useState("");
  const [title, settitle] = useState("initialState");
  const [detalle, setdetalle] = useState("");

  const callback = (dates) => {
    if (Array.isArray(dates)) {
      const movie = dates.find((date) => String(date.show.id) === id);
      setimagen(movie.show.image.original);
      settitle(movie.show.name);
      setdetalle(movie.show.summary);
    }
  };

  useEffect(() => {
    getMovies(abortController, callback);
  }, []);

  useEffect(() => {
    divDescript.current.innerHTML = detalle;
  }, [detalle]);

  return (
    <div className="container_detalle">
      <button onClick={(e) => history.goBack()}>Back</button>
      <h3>{title}</h3>
      <div className="subcontainer">
        <div className="elements">
          <div className="container_img_portada">
            <img src={imagen} alt={`ds`} />
          </div>
          <div ref={divDescript} className="descriptions"></div>
        </div>
      </div>
    </div>
  );
};

export default Detalle;
