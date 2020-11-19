import "./App.css";
import ReactDOM from 'react-dom'

import {
  BrowserRouter as Router,
  Route,
  Switch,
} from "react-router-dom";

import Movies from "./react-component/movies/movies";
import Detalle from "./react-component/detalle/detalle";

function App() {
  return (
    <div className="App">
      <Router>
        <Switch>
          <Route path="/:id">
            <Detalle />
          </Route>
          <Route exact path="/">
            <Movies />
          </Route>
        </Switch>
      </Router>
    </div>
  );
}

export default App;
