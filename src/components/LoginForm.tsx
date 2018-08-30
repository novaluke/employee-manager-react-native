import React from "react";
import { StyleSheet, Text } from "react-native";
import { connect } from "react-redux";

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

interface IProps {
  email: string;
  password: string;
  dispatchPasswordChanged: (password: string) => void;
  dispatchLogIn: (email: string, password: string) => void;
  error: string;
  loading: boolean;
  dispatchEmailChanged: (email: string) => void;
}

const LoginForm: React.SFC<IProps> = props => {
  const { errorTextStyle } = styles;
  const {
    email,
    password,
    dispatchEmailChanged,
    dispatchPasswordChanged,
    dispatchLogIn,
    error,
    loading,
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

      {error !== "" && (
        <CardSection>
          <Text style={errorTextStyle}>{error}</Text>
        </CardSection>
      )}

      <CardSection>
        {renderButton(loading, () => dispatchLogIn(email, password))}
      </CardSection>
    </Card>
  );
};

interface IState {
  auth: {
    email: string;
    error: string;
    loading: boolean;
    password: string;
  };
}

const mapStateToProps = (state: IState) => {
  const { email, password, loading, error } = state.auth;
  return {
    email,
    error,
    loading,
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
