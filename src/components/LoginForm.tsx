import React from "react";
import { StyleSheet, Text } from "react-native";
import { NavigationScreenProp, NavigationScreenProps } from "react-navigation";
import { connect } from "react-redux";

import { Async, IRootState } from "../store";
import { emailChanged, logIn, passwordChanged } from "../store/Auth";

import {
  Button,
  Card,
  CardSection,
  Input,
  Spinner,
  SpinnerSize,
} from "./common";

const renderButton = (isLoading: boolean, onSubmit: () => void) => {
  if (isLoading) {
    return <Spinner size={SpinnerSize.Large} />;
  }

  return <Button onPress={onSubmit}>Log in</Button>;
};

const styles = StyleSheet.create({
  errorTextStyle: {
    alignSelf: "center",
    color: "red",
    fontSize: 20,
  },
});

interface IProps extends NavigationScreenProps {
  email: string;
  password: string;
  dispatchPasswordChanged: (password: string) => void;
  dispatchLogIn: (
    email: string,
    password: string,
    navigation: NavigationScreenProp<any>,
  ) => void;
  loginAction: Async<null>;
  dispatchEmailChanged: (email: string) => void;
}

const LoginForm: React.SFC<IProps> = props => {
  const { errorTextStyle } = styles;
  const {
    email,
    password,
    loginAction,
    dispatchEmailChanged,
    dispatchPasswordChanged,
    dispatchLogIn,
    navigation,
  } = props;
  return (
    <Card>
      <CardSection>
        <Input
          value={email}
          label="Email"
          placeholder="user@gmail.com"
          autoCorrect={false}
          onChangeText={dispatchEmailChanged}
        />
      </CardSection>
      <CardSection>
        <Input
          value={password}
          label="Password"
          placeholder="supersecretpassword"
          autoCorrect={false}
          secureTextEntry
          onChangeText={dispatchPasswordChanged}
        />
      </CardSection>

      {loginAction.state === "ERROR" && (
        <CardSection>
          <Text style={errorTextStyle}>{loginAction.error}</Text>
        </CardSection>
      )}

      <CardSection>
        {renderButton(loginAction.state === "PROGRESS", () =>
          dispatchLogIn(email, password, navigation),
        )}
      </CardSection>
    </Card>
  );
};

const mapStateToProps = (state: IRootState) => {
  const { email, password, loginAction } = state.auth;
  return {
    email,
    loginAction,
    password,
  };
};

export default connect(
  mapStateToProps,
  {
    dispatchEmailChanged: emailChanged,
    dispatchLogIn: logIn,
    dispatchPasswordChanged: passwordChanged,
  },
)(LoginForm);
