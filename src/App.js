import React, { Component } from "react";
import { View, Text } from "react-native";
import { Provider } from "react-redux";
import { createStore } from "redux";
import firebase from "firebase";

import reducers from "./reducers";
import firebaseJson from "../firebaseConfig.json";

class App extends Component {
  componentDidMount() {
    firebase.initializeApp(firebaseJson);
  }

  render() {
    return (
      <Provider store={createStore(reducers)}>
        <View>
          <Text>React App</Text>
        </View>
      </Provider>
    );
  }
}

export default App;
