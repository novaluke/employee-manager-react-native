import "jest-enzyme";
import React from "react";

import firebase from "firebase";
import { NavigationScreenProp } from "react-navigation";

import { stubNavigation } from "../helpers/react-navigation";

import { Async } from "../../src/store";
import {
  AuthActionType,
  authReducer as reducer,
  emailChanged,
  INITIAL_STATE,
  logIn,
  passwordChanged,
} from "../../src/store/Auth";

describe("reducer", () => {
  const testState = {
    email: "user@website.com",
    loginAction: { state: "PROGRESS" } as Async<any>,
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

describe("action creators", () => {
  describe("emailChanged", () => {
    it("creates the email changed action with the email as payload", () => {
      const email = "user@example.com";
      const expected = { type: AuthActionType.EMAIL_CHANGED, payload: email };
      expect(emailChanged(email)).toEqual(expected);
    });
  });

  describe("passwordChanged", () => {
    it("creates the password change action with the password as payload", () => {
      const password = "mypassword";
      const expected = {
        payload: password,
        type: AuthActionType.PASSWORD_CHANGED,
      };
      expect(passwordChanged(password)).toEqual(expected);
    });
  });

  describe("logIn", () => {
    let navigation: NavigationScreenProp<any>;
    beforeEach(() => {
      navigation = stubNavigation();
    });

    it("first dispatches the login request started action", () => {
      const signInMock = jest.fn(() => new Promise(() => {}));
      firebase.auth.mockImplementation(() => ({
        signInWithEmailAndPassword: signInMock,
      }));

      const dispatch = jest.fn();

      logIn("", "", navigation)(dispatch);

      expect(dispatch).toHaveBeenNthCalledWith(1, {
        type: AuthActionType.LOGIN_START,
      });
    });

    it("tries to sign in to firebase with the email and password", () => {
      const email = "user@example.com";
      const password = "mypassword";
      const signInMock = jest.fn(() => Promise.resolve());
      firebase.auth.mockImplementation(() => ({
        signInWithEmailAndPassword: signInMock,
      }));

      return logIn(email, password, navigation)(jest.fn()).then(() => {
        expect(signInMock).toHaveBeenCalledTimes(1);
        expect(signInMock).toHaveBeenCalledWith(email, password);
      });
    });

    describe("when login fails", () => {
      it("tries to create a user with the email and password", () => {
        const email = "user@example.com";
        const password = "mypassword";
        const signUpMock = jest.fn(() => Promise.resolve());
        const signInPromise = Promise.reject();
        firebase.auth.mockImplementation(() => ({
          createUserWithEmailAndPassword: signUpMock,
          signInWithEmailAndPassword: jest.fn(() => signInPromise),
        }));

        return logIn(email, password, navigation)(jest.fn()).then(() => {
          expect(signUpMock).toHaveBeenCalledTimes(1);
          expect(signUpMock).toHaveBeenCalledWith(email, password);
        });
      });

      describe("and automatic user creation fails", () => {
        it("dispatches the login failure action", () => {
          const dispatch = jest.fn();
          firebase.auth.mockImplementation(() => ({
            createUserWithEmailAndPassword: jest.fn(() => Promise.reject()),
            signInWithEmailAndPassword: jest.fn(() => Promise.reject()),
          }));

          return logIn("", "", navigation)(dispatch).then(() => {
            expect(dispatch).toHaveBeenCalledWith({
              type: AuthActionType.LOGIN_FAIL,
            });
          });
        });
      });

      describe("and automatic user creation succeeds", () => {
        it("dispatches the user logged in action with the user as payload", () => {
          const user = {};
          const dispatch = jest.fn();
          firebase.auth.mockImplementation(() => ({
            createUserWithEmailAndPassword: jest.fn(() =>
              Promise.resolve(user),
            ),
            signInWithEmailAndPassword: jest.fn(() => Promise.reject()),
          }));

          return logIn("", "", navigation)(dispatch).then(() => {
            expect(dispatch).toHaveBeenCalledWith({
              payload: user,
              type: AuthActionType.LOGIN_SUCCESS,
            });
          });
        });

        it("redirects to the main navigation stack", () => {
          firebase.auth.mockImplementation(() => ({
            createUserWithEmailAndPassword: jest.fn(() => Promise.resolve()),
            signInWithEmailAndPassword: jest.fn(() => Promise.reject()),
          }));
          expect(navigation.navigate).not.toHaveBeenCalled();

          return logIn("", "", navigation)(jest.fn()).then(() => {
            expect(navigation.navigate).toHaveBeenCalledTimes(1);
            expect(navigation.navigate).toHaveBeenCalledWith("Main");
          });
        });
      });
    });
    describe("when login succeeds", () => {
      it("dispatches the user logged in action with the user as payload", () => {
        const user = {};
        const dispatch = jest.fn();
        firebase.auth.mockImplementation(() => ({
          signInWithEmailAndPassword: jest.fn(() => Promise.resolve(user)),
        }));

        return logIn("", "", navigation)(dispatch).then(() => {
          expect(dispatch).toHaveBeenCalledWith({
            payload: user,
            type: AuthActionType.LOGIN_SUCCESS,
          });
        });
      });

      it("redirects to the main navigation stack", () => {
        const user = {};
        firebase.auth.mockImplementation(() => ({
          signInWithEmailAndPassword: jest.fn(() => Promise.resolve(user)),
        }));
        expect(navigation.navigate).not.toHaveBeenCalled();

        return logIn("", "", navigation)(jest.fn()).then(() => {
          expect(navigation.navigate).toHaveBeenCalledTimes(1);
          expect(navigation.navigate).toHaveBeenCalledWith("Main");
        });
      });
    });
  });
});
