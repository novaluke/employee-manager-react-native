import firebase from "firebase";
import { Reducer } from "redux";

import { Async } from "../common";

import { AuthAction, AuthActionType } from "./actions";

export interface IAuthState {
  email: string;
  password: string;
  loginAction: Async<null>;
  user: firebase.auth.UserCredential | null;
}

export const INITIAL_STATE: IAuthState = {
  email: "",
  loginAction: { state: "INIT" },
  password: "",
  user: null,
};

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
      return { ...state, loginAction: { state: "PROGRESS" } };
    case AuthActionType.LOGIN_SUCCESS:
      return { ...INITIAL_STATE, user: action.payload };
    case AuthActionType.LOGIN_FAIL:
      return {
        ...state,
        loginAction: { state: "ERROR", error: "Something went wrong!" },
      };
    default:
      return state;
  }
};
