import firebase from "firebase";
import React, { Component } from "react";
import { NavigationScreenProps } from "react-navigation";

import { Spinner, SpinnerSize } from "./common";

interface IProps extends NavigationScreenProps {
  dispatchAuthChanged: (user: firebase.User | null) => void;
}

class InitializingScreen extends Component<IProps> {
  private unsubscribeAuthChanged: (() => void) | null = null;

  public componentDidMount() {
    const { navigation } = this.props;
    this.unsubscribeAuthChanged = firebase.auth().onAuthStateChanged(user => {
      navigation.navigate(user ? "Main" : "Auth");
    });
  }

  public componentWillUnmount() {
    if (this.unsubscribeAuthChanged) {
      this.unsubscribeAuthChanged();
    }
  }

  public render() {
    return <Spinner size={SpinnerSize.Large} />;
  }
}

export default InitializingScreen;
