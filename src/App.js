import React, { Component } from "react";
import { View } from "react-native";
import { Provider } from "react-redux";
import { createStore, applyMiddleware } from "redux";
import ReduxThunk from "redux-thunk";
import firebase from "firebase";

import reducers from "./reducers";
import firebaseJson from "../firebaseConfig.json";

import LoginForm from "./components/LoginForm";

class App extends Component {
  componentDidMount() {
    firebase.initializeApp(firebaseJson);
  }

  render() {
    return (
      <Provider store={createStore(reducers, {}, applyMiddleware(ReduxThunk))}>
        <View>
          <LoginForm />
        </View>
      </Provider>
    );
  }
}

export default App;
