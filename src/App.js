import React from "react";
import Particles from "react-particles-js";
import Clarifai from "clarifai";

import Navigation from "./components/navigation/navigation.component";
import Logo from "./components/logo/logo.component";
import ImageLinkForm from "./components/ImageLinkForm/ImageLinkForm.component";
import Rank from "./components/Rank/Rank.component";
import FaceRecognition from "./components/FaceRecognition/FaceRecognition.component";

import "./App.css";

const app = new Clarifai.App({
  apiKey: "071ed8cc23c54e00ae37f118e31faf77"
});

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
      box: {}
    };
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

  displayFaceBox = box => {
    this.setState({ box: box });
    console.log(box);
  };

  onInputChange = event => {
    this.setState({ input: event.target.value });
  };

  onButtonSubmit = () => {
    this.setState({ imageUrl: this.state.input });

    app.models
      .predict(
        Clarifai.FACE_DETECT_MODEL,
        // URL
        this.state.input
      )
      .then(response =>
        this.displayFaceBox(this.calaculateFaceLocation(response))
      )
      .catch(err => console.log(err));
  };

  render() {
    return (
      <div className="App">
        <Particles className="particles" params={particlesOptions} />
        <Navigation />
        <Logo />
        <Rank name="Sush" entries="1" />
        <ImageLinkForm
          onInputChange={this.onInputChange}
          onButtonSubmit={this.onButtonSubmit}
        />
        <FaceRecognition imageUrl={this.state.imageUrl} box={this.state.box} />
      </div>
    );
  }
}

export default App;
