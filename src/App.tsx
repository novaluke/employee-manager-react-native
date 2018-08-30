import firebase from "firebase";
import * as React from "react";
import { Text, View } from "react-native";
import { createStackNavigator, createSwitchNavigator } from "react-navigation";
import { Provider } from "react-redux";

import firebaseConfigJson from "../firebaseConfig.json";
import { store } from "./store";

import InitializingScreen from "./components/InitializingScreen";
import LoginForm from "./components/LoginForm";

const Home = () => <Text>Home</Text>;

const MainStackNavigator = createStackNavigator({
  Home,
});

const RootNavigator = createSwitchNavigator(
  {
    Auth: LoginForm,
    Initializing: InitializingScreen,
    Main: MainStackNavigator,
  },
  { initialRouteName: "Initializing" },
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
