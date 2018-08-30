import "jest-enzyme";
import React from "react";

import firebase from "firebase";

import { Async } from "../../src/store";
import {
  AuthActionType,
  authReducer as reducer,
  INITIAL_STATE,
} from "../../src/store/Auth";

describe("reducer", () => {
  const testState = {
    email: "user@website.com",
    loginAction: { state: "PROGRESS" } as Async<any>,
    password: "supersecure",
    user: {} as firebase.auth.UserCredential,
  };

  it("sets the initial state", () => {
    // TODO figure out how to test this without violating the type system and
    // without having to create a type specifically just to handle this one time
    // we want to have it do nothing but return the initial state (production
    // code existing just to enable testing is not a good thing)
    expect(reducer(undefined, {})).toEqual(INITIAL_STATE);
  });

  it("updates the email when it is changed", () => {
    const email = "user@website.com";
    const state = reducer(testState, {
      payload: email,
      type: AuthActionType.EMAIL_CHANGED,
    });
    expect(state).toEqual({ ...testState, email });
  });

  it("updates the password when it is changed", () => {
    const password = "supersecure";
    const state = reducer(testState, {
      payload: password,
      type: AuthActionType.PASSWORD_CHANGED,
    });
    expect(state).toEqual({ ...testState, password });
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
        const prevState = {
          email: "foo@bar.com",
          loginAction: { state: "ERROR", error: "" } as Async<any>,
          password: "notsecure",
          user: null,
        };
        const state = reducer(prevState, {
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
        // TODO figure out how to make the type system happy here without
        // confusing verbosity
        expect(state.loginAction.error).toMatchSnapshot();
      });
    });
  });
});
