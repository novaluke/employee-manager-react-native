import "jest-enzyme";

import firebase from "firebase";
import { of } from "rxjs";
import { marbles } from "rxjs-marbles/jest";
import { toArray } from "rxjs/operators";

import { navigate } from "../../../src/NavigationService";
import {
  AuthAction,
  AuthActionType,
  emailChanged,
  logIn,
  logInEpic,
  passwordChanged,
} from "../../../src/store/Auth";

jest.mock("../../../src/NavigationService");

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
    it("creates the action to log in with the given email and password", () => {
      const email = "user@example.com";
      const password = "secretpassword";
      const expectedAction = {
        payload: { email, password },
        type: AuthActionType.LOG_IN,
      };
      expect(logIn(email, password)).toEqual(expectedAction);
    });
  });

  describe("logInEpic", () => {
    describe("after the log in action is dispatched", () => {
      const email = "user@example.com";
      const password = "secretpassword";
      const testAction = logIn(email, password);
      const authReturn: Partial<firebase.auth.Auth> = {
        signInWithEmailAndPassword: jest.fn(() => new Promise(() => null)),
      };
      beforeEach(() => {
        (firebase.auth as any).mockImplementation(() => authReturn);
      });

      it(
        "first emits the login request started action",
        marbles(m => {
          const values = {
            a: testAction,
            b: { type: AuthActionType.LOGIN_START } as AuthAction,
          };
          const action$ = m.cold("  -a-", values);
          const expected$ = m.cold("-b-", values);

          m.expect(logInEpic(action$)).toBeObservable(expected$);
        }),
      );

      it("tries to log in to firebase with the email and password", () => {
        const action$ = of(testAction);
        const mockSignIn = authReturn.signInWithEmailAndPassword;

        logInEpic(action$).subscribe(jest.fn());

        expect(mockSignIn).toHaveBeenCalledTimes(1);
        expect(mockSignIn).toHaveBeenCalledWith(email, password);
      });

      describe("when login fails", () => {
        beforeEach(() => {
          authReturn.signInWithEmailAndPassword = () => Promise.reject();
        });

        it("tries to create a user with the email and password", done => {
          const action$ = of(testAction);
          const mockCreate = jest.fn();
          authReturn.createUserWithEmailAndPassword = mockCreate;

          logInEpic(action$)
            .toPromise()
            .then(() => {
              expect(mockCreate).toHaveBeenCalledTimes(1);
              expect(mockCreate).toHaveBeenCalledWith(email, password);
              done();
            });
        });

        describe("and automatic user creation fails", () => {
          beforeEach(() => {
            authReturn.createUserWithEmailAndPassword = () => Promise.reject();
          });

          it("emits the login failure action", done => {
            const action$ = of(testAction);
            const failureAction = { type: AuthActionType.LOGIN_FAIL };

            logInEpic(action$)
              .pipe(toArray())
              .subscribe(emitted => {
                expect(emitted).toContainEqual(failureAction);
                done();
              });
          });
        });

        describe("and automatic user creation succeeds", () => {
          const createdUser = {};
          beforeEach(() => {
            authReturn.createUserWithEmailAndPassword = () =>
              Promise.resolve(createdUser);
          });

          it("emits the user logged in action with the user as payload", done => {
            const action$ = of(testAction);
            const expectedAction = {
              payload: createdUser,
              type: AuthActionType.LOGIN_SUCCESS,
            };

            logInEpic(action$)
              .pipe(toArray())
              .subscribe(emitted => {
                expect(emitted).toContainEqual(expectedAction);
                done();
              });
          });

          it("redirects to the main navigation stack", done => {
            const action$ = of(testAction);

            logInEpic(action$)
              .toPromise()
              .then(() => {
                expect(navigate).toHaveBeenCalledWith("Main");
                done();
              });
          });
        });
      });

      describe("when login succeeds", () => {
        const user = {};
        beforeEach(() => {
          authReturn.signInWithEmailAndPassword = () => Promise.resolve(user);
        });

        it("dispatches the user logged in action with the user as payload", done => {
          const action$ = of(testAction);
          const expectedAction = {
            payload: user,
            type: AuthActionType.LOGIN_SUCCESS,
          };

          logInEpic(action$)
            .pipe(toArray())
            .subscribe(emitted => {
              expect(emitted).toContainEqual(expectedAction);
              done();
            });
        });

        it("redirects to the main navigation stack", done => {
          const action$ = of(testAction);

          logInEpic(action$)
            .toPromise()
            .then(() => {
              expect(navigate).toHaveBeenCalledWith("Main");
              done();
            });
        });
      });
    });
  });
});
