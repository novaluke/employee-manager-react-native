import firebase from "firebase";
import { ofType } from "redux-observable";
import { empty, from, Observable, of, pipe } from "rxjs";
import { catchError, concat, map, switchAll, tap } from "rxjs/operators";
import { action as createAction } from "typesafe-actions";

import { navigate } from "../../NavigationService";

export type AuthAction =
  | { type: AuthActionType.EMAIL_CHANGED; payload: string }
  | { type: AuthActionType.PASSWORD_CHANGED; payload: string }
  | {
      type: AuthActionType.LOGIN_SUCCESS;
      payload: firebase.auth.UserCredential;
    }
  | { type: AuthActionType.LOGIN_FAIL }
  | { type: AuthActionType.LOGIN_START }
  | {
      type: AuthActionType.LOG_IN;
      payload: { email: string; password: string };
    };

export enum AuthActionType {
  EMAIL_CHANGED = "EMAIL_CHANGED",
  PASSWORD_CHANGED = "PASSWORD_CHANGED",
  LOGIN_SUCCESS = "LOGIN_SUCCESS",
  LOGIN_FAIL = "LOGIN_FAIL",
  LOGIN_START = "LOGIN_START",
  LOG_IN = "LOG_IN",
}

export const emailChanged = (email: string) =>
  createAction(AuthActionType.EMAIL_CHANGED, email);

export const passwordChanged = (password: string) =>
  createAction(AuthActionType.PASSWORD_CHANGED, password);

export const logIn = (email: string, password: string) =>
  createAction(AuthActionType.LOG_IN, { email, password });

const handleLoginSuccess = pipe(
  tap<firebase.auth.UserCredential>(() => navigate("Main")),
  map<firebase.auth.UserCredential, AuthAction>(user => ({
    payload: user,
    type: AuthActionType.LOGIN_SUCCESS,
  })),
);

const handleLoginFail = () => of(createAction(AuthActionType.LOGIN_FAIL));

export const logInEpic = (
  action$: Observable<AuthAction>,
): Observable<AuthAction> =>
  action$.pipe(
    ofType(AuthActionType.LOG_IN),
    map(action => {
      if (action.type !== AuthActionType.LOG_IN) {
        return empty();
      }
      const { email, password } = action.payload;
      return of(createAction(AuthActionType.LOGIN_START)).pipe(
        concat(
          from(
            firebase.auth().signInWithEmailAndPassword(email, password),
          ).pipe(
            catchError(() =>
              from(
                firebase.auth().createUserWithEmailAndPassword(email, password),
              ),
            ),
            handleLoginSuccess,
            catchError(handleLoginFail),
          ),
        ),
      );
    }),
    switchAll(),
  );
