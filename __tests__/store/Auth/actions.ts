import "jest-enzyme";

import firebase from "firebase";
import { NavigationScreenProp } from "react-navigation";

import { stubNavigation } from "../../helpers/react-navigation";

import {
  AuthActionType,
  emailChanged,
  logIn,
  passwordChanged,
} from "../../../src/store/Auth";

describe("Auth action creators", () => {
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
    const authReturn: Partial<firebase.auth.Auth> = {};
    let navigation: NavigationScreenProp<any>;
    beforeEach(() => {
      navigation = stubNavigation();
      (firebase.auth as any).mockImplementation(() => authReturn);
    });

    it("first dispatches the login request started action", () => {
      const signInMock = jest.fn(() => new Promise(() => ({})));
      authReturn.signInWithEmailAndPassword = signInMock;
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
      authReturn.signInWithEmailAndPassword = signInMock;

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
        authReturn.createUserWithEmailAndPassword = signUpMock;
        authReturn.signInWithEmailAndPassword = jest.fn(() => signInPromise);

        return logIn(email, password, navigation)(jest.fn()).then(() => {
          expect(signUpMock).toHaveBeenCalledTimes(1);
          expect(signUpMock).toHaveBeenCalledWith(email, password);
        });
      });

      describe("and automatic user creation fails", () => {
        it("dispatches the login failure action", () => {
          const dispatch = jest.fn();
          authReturn.createUserWithEmailAndPassword = jest.fn(() =>
            Promise.reject(),
          );
          authReturn.signInWithEmailAndPassword = jest.fn(() =>
            Promise.reject(),
          );

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
          authReturn.createUserWithEmailAndPassword = jest.fn(() =>
            Promise.resolve(user),
          );
          authReturn.signInWithEmailAndPassword = jest.fn(() =>
            Promise.reject(),
          );

          return logIn("", "", navigation)(dispatch).then(() => {
            expect(dispatch).toHaveBeenCalledWith({
              payload: user,
              type: AuthActionType.LOGIN_SUCCESS,
            });
          });
        });

        it("redirects to the main navigation stack", () => {
          authReturn.createUserWithEmailAndPassword = jest.fn(() =>
            Promise.resolve(),
          );
          authReturn.signInWithEmailAndPassword = jest.fn(() =>
            Promise.reject(),
          );
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
        authReturn.signInWithEmailAndPassword = jest.fn(() =>
          Promise.resolve(user),
        );

        return logIn("", "", navigation)(dispatch).then(() => {
          expect(dispatch).toHaveBeenCalledWith({
            payload: user,
            type: AuthActionType.LOGIN_SUCCESS,
          });
        });
      });

      it("redirects to the main navigation stack", () => {
        const user = {};
        authReturn.signInWithEmailAndPassword = jest.fn(() =>
          Promise.resolve(user),
        );
        expect(navigation.navigate).not.toHaveBeenCalled();

        return logIn("", "", navigation)(jest.fn()).then(() => {
          expect(navigation.navigate).toHaveBeenCalledTimes(1);
          expect(navigation.navigate).toHaveBeenCalledWith("Main");
        });
      });
    });
  });
});
