import React, { Component } from "react";
import ReactDOM from "react-dom";
import $ from "jquery";
import {Redirect} from 'react-router-dom';
import Dinosaur from "../../database/exampleData.js";
import QuizListComponent from "./components/Home/QuizListComponent.jsx";
import Leaderboard from "./components/LeaderboardComponents/Leaderboard.jsx";

import Root from "./components/Root/Root.jsx";
import QuizSelected from "./components/QuizTaking/QuizSelected.jsx";
import UserData from "./UserExampleData";

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      view: "root",
      quizzes: [],
      currentQuiz: '',
      redirect: false
    };
    this.viewUpdate = this.viewUpdate.bind(this);
  }

  //change the view of our website
  viewUpdate(newView) {
    this.setState({
      view: newView
    });
  }

  componentDidMount() {
    this.quizFetch();
  }

  //ajax fetch our list of quizzes from the server
  ajaxQuizFetch(cb) {
    $.ajax({
      url: '/home/quizzes',
      method: 'GET',
      success: (data) => {
        cb(data);
      },
      err: (err) => {
        console.log('could not fetch', err);
      }
    })
  }

  //set the data of our quizzes from the server
  quizFetch() {
    this.ajaxQuizFetch((data) => this.setState({quizzes: data}))
  }

  //send our user to the quiz taking page
  quizTaking(quiz) {
    // console.log(quiz)
    this.setState({
      currentQuiz: quiz,
      view: 'quizMode'
    })
  }

  //load different components depending on the website

 currentPage() {
    if(this.state.view === "root") {
      return <Root /> }
    else if (this.state.view === "home") {
      return <QuizListComponent quizData={Dinosaur.quizzes} clickHandler={this.quizTaking.bind(this)} />;
    } else if (this.state.view === "quizMode") {
      return <QuizSelected questionsData={Dinosaur.quizzes}/>;
    } else if (this.state.view === "leaderboard") {
      return <Leaderboard data={UserData} />;
    }
  }

  //render our nav bar
  render () {
    return (
      <div className="nav">
        <ul>
          <li className="logo">Quiz o' Saurus</li>
          <li
            className="nav-ui"
            onClick={() => {
              this.viewUpdate("home");
            }}
          >
            <a>Home</a>
          </li>
          <li
            className="nav-ui"
            onClick={() => {
              this.viewUpdate("leaderboard");
            }}
          >
            <a>Leaderboard</a>
          </li>
        </ul>
        <div>
          <div className="pageRender">{this.currentPage()}</div>
        </div>
      </div>
    );
  }
}

ReactDOM.render(<App />, document.getElementById("app"));
