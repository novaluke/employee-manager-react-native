import firebase from "firebase";

import {
  EMAIL_CHANGED,
  PASSWORD_CHANGED,
  LOGIN_SUCCESS,
  LOGIN_FAIL,
  LOGIN_START
} from "./types";

export const emailChanged = text => ({
  type: EMAIL_CHANGED,
  payload: text
});

export const passwordChanged = password => ({
  type: PASSWORD_CHANGED,
  payload: password
});

const loginSuccess = dispatch => user =>
  dispatch({ type: LOGIN_SUCCESS, payload: user });

const loginFail = dispatch => () => dispatch({ type: LOGIN_FAIL });

export const logIn = (email, password) => dispatch => {
  dispatch({ type: LOGIN_START });
  firebase
    .auth()
    .signInWithEmailAndPassword(email, password)
    .then(loginSuccess(dispatch))
    .catch(() =>
      firebase
        .auth()
        .createUserWithEmailAndPassword(email, password)
        .then(loginSuccess(dispatch))
        .catch(loginFail(dispatch))
    );
};
