import firebase from "firebase";
import { NavigationScreenProp } from "react-navigation";
import { Dispatch, Reducer } from "redux";
import { action as createAction } from "typesafe-actions";

export enum AuthActionType {
  EMAIL_CHANGED = "EMAIL_CHANGED",
  PASSWORD_CHANGED = "PASSWORD_CHANGED",
  LOGIN_SUCCESS = "LOGIN_SUCCESS",
  LOGIN_FAIL = "LOGIN_FAIL",
  LOGIN_START = "LOGIN_START",
}

export interface IAuthState {
  email: string;
  password: string;
  loading: boolean;
  error: string;
  user: firebase.auth.UserCredential | null;
}

const INITIAL_STATE: IAuthState = {
  email: "",
  error: "",
  loading: false,
  password: "",
  user: null,
};

export type AuthAction =
  | { type: AuthActionType.EMAIL_CHANGED; payload: string }
  | { type: AuthActionType.PASSWORD_CHANGED; payload: string }
  | {
      type: AuthActionType.LOGIN_SUCCESS;
      payload: firebase.auth.UserCredential;
    }
  | { type: AuthActionType.LOGIN_FAIL }
  | { type: AuthActionType.LOGIN_START };

type AuthDispatch = Dispatch<AuthAction>;

export const authReducer: Reducer<IAuthState, AuthAction> = (
  state = INITIAL_STATE,
  action,
) => {
  switch (action.type) {
    case AuthActionType.EMAIL_CHANGED:
      return { ...state, email: action.payload };
    case AuthActionType.PASSWORD_CHANGED:
      return { ...state, password: action.payload };
    case AuthActionType.LOGIN_START:
      return { ...state, loading: true, error: "" };
    case AuthActionType.LOGIN_SUCCESS:
      return { ...state, ...INITIAL_STATE, user: action.payload };
    case AuthActionType.LOGIN_FAIL:
      return { ...state, loading: false, error: "Something went wrong!" };
    default:
      return state;
  }
};

const loginSuccess = (dispatch: AuthDispatch, navigate: any) => (
  user: firebase.auth.UserCredential,
) => {
  dispatch(createAction(AuthActionType.LOGIN_SUCCESS, user));
  navigate("Main");
};

const loginFail = (dispatch: AuthDispatch) => () =>
  dispatch(createAction(AuthActionType.LOGIN_FAIL));

export const emailChanged = (email: string) =>
  createAction(AuthActionType.EMAIL_CHANGED, email);

export const passwordChanged = (password: string) =>
  createAction(AuthActionType.PASSWORD_CHANGED, password);

export const logIn = (
  email: string,
  password: string,
  navigation: NavigationScreenProp<any>,
) => (dispatch: AuthDispatch) => {
  dispatch(createAction(AuthActionType.LOGIN_START));
  firebase
    .auth()
    .signInWithEmailAndPassword(email, password)
    .then(loginSuccess(dispatch, navigation.navigate))
    .catch(() =>
      firebase
        .auth()
        .createUserWithEmailAndPassword(email, password)
        .then(loginSuccess(dispatch, navigation.navigate))
        .catch(loginFail(dispatch)),
    );
};
