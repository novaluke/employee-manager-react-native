import "jest-enzyme";

import firebase from "firebase";

import { AsyncValue } from "../../../src/store";
import {
  AuthActionType,
  authReducer as reducer,
  IAuthState,
  INITIAL_STATE,
} from "../../../src/store/Auth";

describe("Auth reducer", () => {
  const testState: IAuthState = {
    email: "user@website.com",
    loginAction: { state: "PROGRESS" } as AsyncValue<any>,
    password: "supersecure",
    user: {} as firebase.auth.UserCredential,
  };

  it("sets the initial state", () => {
    // Redux uses an action of {type: 'init'} to initialize state, but that is
    // internal to Redux implementation and we don't want to include that in
    // every reducer's action types. That then means the init action isn't
    // allowed by the type system, so we have to cast it as `any` to get around
    // that.
    expect(reducer(undefined, {} as any)).toEqual(INITIAL_STATE);
  });

  it("updates the email when it is changed", () => {
    const newEmail = "example@website.com";
    expect(newEmail).not.toEqual(testState.email);

    const state = reducer(testState, {
      payload: newEmail,
      type: AuthActionType.EMAIL_CHANGED,
    });

    expect(state).toEqual({ ...testState, email: newEmail });
  });

  it("updates the password when it is changed", () => {
    const newPassword = "mypassword";
    expect(newPassword).not.toEqual(testState.password);

    const state = reducer(testState, {
      payload: newPassword,
      type: AuthActionType.PASSWORD_CHANGED,
    });

    expect(state).toEqual({ ...testState, password: newPassword });
  });

  describe("login flow", () => {
    describe("when login request is started", () => {
      it("sets the asyncAction to in progress", () => {
        const state = reducer(testState, {
          type: AuthActionType.LOGIN_START,
        });
        expect(state).toEqual({
          ...testState,
          loginAction: { state: "PROGRESS" },
        });
      });
    });

    describe("when login is successful", () => {
      it("sets the current user", () => {
        const user = {} as firebase.auth.UserCredential;
        const state = reducer(testState, {
          payload: user,
          type: AuthActionType.LOGIN_SUCCESS,
        });
        expect(state.user).toBe(user);
      });

      it("resets the rest of the state", () => {
        const state = reducer(testState, {
          payload: {} as firebase.auth.UserCredential,
          type: AuthActionType.LOGIN_SUCCESS,
        });
        expect(state.email).toEqual(INITIAL_STATE.email);
        expect(state.password).toEqual(INITIAL_STATE.password);
        expect(state.loginAction).toEqual(INITIAL_STATE.loginAction);
      });
    });

    describe("when login fails", () => {
      it("marks the request as having errored", () => {
        const state = reducer(testState, {
          type: AuthActionType.LOGIN_FAIL,
        });
        expect(state).toEqual({
          ...testState,
          loginAction: { state: "ERROR", error: expect.any(String) },
        });
      });

      it("sets an error message matching a snapshot", () => {
        const state = reducer(testState, {
          type: AuthActionType.LOGIN_FAIL,
        });

        // Can't just expect on loginAction.error since not all AsyncActions
        // include that property (typechecking will fail). First fail if it's
        // not an error, then also fail if it is an error (ensuring the type
        // includes `.error`) but doesn't match the expectation. Thus all bases
        // are covered.
        expect(state.loginAction.state).toEqual("ERROR");
        if (state.loginAction.state === "ERROR") {
          expect(state.loginAction.error).toMatchSnapshot();
        }
      });
    });
  });
});
