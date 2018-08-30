import firebase from "firebase";
import React, { Component } from "react";
import { View } from "react-native";
import { Provider } from "react-redux";

import firebaseConfigJson from "../firebaseConfig.json";
import { store } from "./store";

import LoginForm from "./components/LoginForm";

class App extends Component {
  public componentDidMount() {
    firebase.initializeApp(firebaseConfigJson);
  }

  public render() {
    return (
      <Provider store={store}>
        <View>
          <LoginForm />
        </View>
      </Provider>
    );
  }
}

export default App;
