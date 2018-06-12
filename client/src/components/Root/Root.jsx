import React, { Component } from "react";
import GoogleLogin from "react-google-login";
import { FetchGoogle } from "./FetchGoogle.jsx";
import { Redirect } from "react-router-dom";

class Root extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loginError: false,
      redirect: false
    };
    this.google = this.google.bind(this);
  }

  google(res, type) {
    console.log('yaooooona')
    let postData;
    if (type === "google" && res.w3.U3) {
      postData = {
        name: res.w3.ig,
        provider: type,
        email: res.w3.U3,
        provider_id: res.El,
        token: res.Zi.access_token,
        provider_pic: res.w3.Paa
      };

      if (postData) {
        FetchGoogle("google", postData).then(result => {
          let responseJson = result;
          sessionStorage.setItem("userData", JSON.stringify(responseJson));
          this.setState({ redirect: true });
        });
      } else {
        console.log("goooooogle errrror");
      }
    }
  }

  render() {
    if (this.state.redirect || sessionStorage.getItem("userData")) {
      return <Redirect to={"/home/leaderboard"} />;
    }

    const responseGoogle = response => {
      console.log("google console");
      console.log(response);
      this.google(response, "google");
    };

    return (
      <div className="rootContainer">
        <div className="loginButton">
          <GoogleLogin
            clientId="693481139065-u6kaus22pakvl1l3t9llh81ndpav3sht.apps.googleusercontent.com"
            buttonText="Click here to login with Google"
            onSuccess={responseGoogle}
            onFailure={responseGoogle}
          />
          <img src={"https://cdn130.picsart.com/238899884057212.png?r1024x1024"} />
        </div>
        <div className="dino-view">
        <b>Learn your dino facts here!</b>
          <img
            src={
              "https://content.mycutegraphics.com/graphics/chalkboard/dinosaur-chalkboard.png"
            }
            className="dino-img"
          />
         
        </div>
      </div>
    );
  }
}

export default Root;
