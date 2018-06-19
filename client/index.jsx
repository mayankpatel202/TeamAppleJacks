import React from "react";
import ReactDOM from "react-dom";
import QuizListComponent from "./components/QuizListComponent.jsx";
import Leaderboard from "./components/Leaderboard.jsx";
import Root from "./components/Root.jsx";
import { BrowserRouter, Route, Link, Switch } from "react-router-dom";
// import 'bootstrap/dist/css/bootstrap.min.css';

class App extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <BrowserRouter>
        <div>
          <div className="nav">
            <ul>
              <li><Link to="/">Home</Link></li>
              <li><Link to="/games">Games</Link></li>
              <li><Link to="/leaderboard">Leaderboard</Link></li>
            </ul>
          </div>
          <Route exact path="/" component={Root} />
          <Route path="/games" render={(props) => <QuizListComponent {...props} />} />
          <Route path="/leaderboard" component={Leaderboard} />
        </div>
      </BrowserRouter>
    );
  }
}

ReactDOM.render(< App />, document.getElementById('app'));