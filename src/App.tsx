// React must come first to supply polyfills for the React Native environment
import * as React from "react";
import { View } from "react-native";

import firebase from "firebase";
import { createStackNavigator, createSwitchNavigator } from "react-navigation";
import { Provider } from "react-redux";

import firebaseConfigJson from "../firebaseConfig.json";
import { store } from "./store";

import CreateEmployee from "./components/Employee/CreateEmployee";
import EditEmployee from "./components/Employee/EditEmployee";
import EmployeeList from "./components/Employee/EmployeeList";
import InitializingScreen from "./components/InitializingScreen";
import LoginForm from "./components/LoginForm";

const MainStackNavigator = createStackNavigator(
  {
    CreateEmployee,
    EditEmployee,
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
  { initialRouteName: "Initializing" },
);

firebase.initializeApp(firebaseConfigJson);

const App: React.SFC = () => (
  <Provider store={store}>
    <View style={{ flex: 1 }}>
      <RootNavigator />
    </View>
  </Provider>
);

export default App;
