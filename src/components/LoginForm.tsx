import React from "react";
import { NavigationScreenProp, NavigationScreenProps } from "react-navigation";
import { connect } from "react-redux";

import { AsyncValue, IRootState } from "../store";
import { emailChanged, logIn, passwordChanged } from "../store/Auth";

import { AsyncButton, Card, CardSection, Input } from "./common";

export interface IProps extends NavigationScreenProps {
  email: string;
  password: string;
  dispatchPasswordChanged: (password: string) => void;
  dispatchLogIn: (
    email: string,
    password: string,
    navigation: NavigationScreenProp<any>,
  ) => void;
  loginAction: AsyncValue<null>;
  dispatchEmailChanged: (email: string) => void;
}

const LoginForm: React.SFC<IProps> = props => {
  const {
    email,
    password,
    loginAction,
    dispatchEmailChanged,
    dispatchPasswordChanged,
    dispatchLogIn,
    navigation,
  } = props;
  const onLogIn = () => dispatchLogIn(email, password, navigation);
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

      <CardSection>
        <AsyncButton
          label="Log in"
          asyncAction={loginAction}
          onPress={onLogIn}
        />
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
