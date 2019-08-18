import React from "react";
import Particles from "react-particles-js";
// import Clarifai from "clarifai";

import Navigation from "./components/navigation/navigation.component";
import Logo from "./components/logo/logo.component";
import ImageLinkForm from "./components/ImageLinkForm/ImageLinkForm.component";
import Rank from "./components/Rank/Rank.component";
import FaceRecognition from "./components/FaceRecognition/FaceRecognition.component";
import Signin from './components/Signin/Signin.component'
import Register from './components/Register/Register.component'

import "./App.css";

const initialState={
  input: "",
  imageUrl: "",
  box: {},
  route:'signin',
  isSignedIn: false,
  user: {
    id: '',
    name: '',
    email: '',
    entries: 0,
    joined: ''
  }
};

// const app = new Clarifai.App({
//   apiKey: "071ed8cc23c54e00ae37f118e31faf77"
// });

const particlesOptions = {
  particles: {
    number: {
      value: 30,
      density: {
        enable: true,
        value_area: 800
      }
    }
  }
};

class App extends React.Component {
  constructor() {
    super();

    this.state = {
      input: "",
      imageUrl: "",
      box: {},
      route:'signin',
      isSignedIn: false,
      user: {
        id: '',
        name: '',
        email: '',
        entries: 0,
        joined: ''
      }
    };
  }

  loadUser = (data) => {
    this.setState({user: {
      id: data.id,
      name: data.name,
      email: data.email,
      entries: data.entries,
      joined: data.joined
    }})
  }

  calaculateFaceLocation = (data) => {
    const clarifaiFace =
      data.outputs[0].data.regions[0].region_info.bounding_box;
    const image = document.getElementById("inputimage");
    const width = Number(image.width);
    const height = Number(image.height);
    return {
      leftCol: clarifaiFace.left_col * width,
      topRow: clarifaiFace.top_row * height,
      rightCol: width - clarifaiFace.right_col * width,
      bottomRow: height - clarifaiFace.bottom_row * height
    };
  };

  componentDidMount(){
    fetch('https://immense-spire-51345.herokuapp.com/')
    .then(response=>response.json())
    .then(console.log);
  }

  displayFaceBox = box => {
    this.setState({ box: box });
    console.log(box);
  };

  onInputChange = event => {
    this.setState({ input: event.target.value });
  };

  onButtonSubmit = () => {
    this.setState({imageUrl: this.state.input});
    // app.models
    //   .predict(
    //     Clarifai.FACE_DETECT_MODEL,
    //     this.state.input)
    fetch('https://immense-spire-51345.herokuapp.com/imageurl', {
      method: 'post',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        input: this.state.input
      })
    })
      .then(response=>response.json())
      .then(response => {
        if (response) {
          fetch('https://immense-spire-51345.herokuapp.com/image', {
            method: 'put',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
              id: this.state.user.id
            })
          })
            .then(response => response.json())
            .then(count => {
              this.setState(Object.assign(this.state.user, { entries: count}))
            })

        }
        this.displayFaceBox(this.calaculateFaceLocation(response))
      })
      .catch(err => console.log(err));
  }

  onRouteChange=(route)=>{
    if (route === 'signout') {
      this.setState(initialState)
    } else if (route === 'home') {
      this.setState({isSignedIn: true})
    }
    this.setState({route:route});
  }

  render() {
    return (
      <div className="App">
        <Particles className="particles" params={particlesOptions} />
        <Navigation onRouteChange={this.onRouteChange} isSignedIn={this.state.isSignedIn}/>
        <Logo />
        
        {this.state.route==='home'?
        <div>
        <Rank name={this.state.user.name} entries={this.state.user.entries} />
        <ImageLinkForm
          onInputChange={this.onInputChange}
          onButtonSubmit={this.onButtonSubmit}
        />
        <FaceRecognition imageUrl={this.state.imageUrl} box={this.state.box} />
        </div>:(
          this.state.route==='signin'?
          <Signin onRouteChange={this.onRouteChange} loadUser={this.loadUser}/>:
          <Register onRouteChange={this.onRouteChange} loadUser={this.loadUser} />
        )
          
          
      }
      </div>
    );
  }
}

export default App;
