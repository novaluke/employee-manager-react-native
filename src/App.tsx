// React must come first to supply polyfills for the React Native environment
import * as React from "react";
import { View } from "react-native";

import firebase from "firebase";
import { createStackNavigator, createSwitchNavigator } from "react-navigation";
import { Provider } from "react-redux";

import firebaseConfigJson from "../firebaseConfig.json";
import { store } from "./store";

import CreateEmployee from "./components/CreateEmployee";
import EmployeeList from "./components/EmployeeList";
import InitializingScreen from "./components/InitializingScreen";
import LoginForm from "./components/LoginForm";

const MainStackNavigator = createStackNavigator(
  {
    CreateEmployee,
    EmployeeList,
  },
  { initialRouteName: "EmployeeList" },
);

const RootNavigator = createSwitchNavigator(
  {
    Auth: LoginForm,
    Initializing: InitializingScreen,
    Main: MainStackNavigator,
  },
  { initialRouteName: "Main" },
);

firebase.initializeApp(firebaseConfigJson);

const App = () => (
  <Provider store={store}>
    <View style={{ flex: 1 }}>
      <RootNavigator />
    </View>
  </Provider>
);

export default App;
