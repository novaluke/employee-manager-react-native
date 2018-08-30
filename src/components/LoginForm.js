import React from "react";
import { Text } from "react-native";
import { connect } from "react-redux";
import PropTypes from "prop-types";

import { emailChanged, passwordChanged, logIn } from "../actions";

import { Card, CardSection, Input, Button, Spinner } from "./common";

const renderButton = (isLoading, onSubmit) => {
  if (isLoading) {
    return <Spinner size="large" />;
  }

  return <Button onPress={onSubmit}>Log in</Button>;
};

const styles = {
  errorTextStyle: {
    color: "red",
    fontSize: 20,
    alignSelf: "center"
  }
};

const LoginForm = props => {
  const { errorTextStyle } = styles;
  const {
    email,
    password,
    dispatchEmailChanged,
    dispatchPasswordChanged,
    dispatchLogIn,
    error,
    loading
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

LoginForm.propTypes = {
  dispatchEmailChanged: PropTypes.func.isRequired,
  dispatchPasswordChanged: PropTypes.func.isRequired,
  dispatchLogIn: PropTypes.func.isRequired,
  email: PropTypes.string,
  password: PropTypes.string,
  error: PropTypes.string,
  loading: PropTypes.bool
};

LoginForm.defaultProps = {
  email: "",
  password: "",
  error: "",
  loading: false
};

const mapStateToProps = state => {
  const { email, password, loading, error } = state.auth;
  return {
    email,
    password,
    loading,
    error
  };
};

export default connect(
  mapStateToProps,
  {
    dispatchEmailChanged: emailChanged,
    dispatchPasswordChanged: passwordChanged,
    dispatchLogIn: logIn
  }
)(LoginForm);
