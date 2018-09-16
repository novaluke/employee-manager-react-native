import firebase from "firebase";
import { ofType } from "redux-observable";
import { empty, Observable } from "rxjs";
import { map, switchAll } from "rxjs/operators";
import { action as createAction } from "typesafe-actions";

import { firebaseOn } from "../common/Firebase";
import { IEmployee } from "../Employee";

export enum EmployeesActionType {
  WATCH_START = "WATCH_START",
  UNSUBSCRIBE = "UNSUBSCRIBE",
  EMPLOYEES_FETCHED = "EMPLOYEES_FETCHED",
}

export type EmployeesAction =
  | { type: EmployeesActionType.WATCH_START }
  | { type: EmployeesActionType.UNSUBSCRIBE }
  | {
      type: EmployeesActionType.EMPLOYEES_FETCHED;
      payload: { [uid: string]: IEmployee<string> } | null;
    };

export const unwatchEmployees = () =>
  createAction(EmployeesActionType.UNSUBSCRIBE);

export const watchEmployees = () =>
  createAction(EmployeesActionType.WATCH_START);

export const employeesSubscriptionEpic = (
  action$: Observable<EmployeesAction>,
): Observable<EmployeesAction> =>
  action$.pipe(
    ofType(EmployeesActionType.WATCH_START, EmployeesActionType.UNSUBSCRIBE),
    map(action => {
      const { currentUser } = firebase.auth();
      if (
        currentUser !== null &&
        action.type === EmployeesActionType.WATCH_START
      ) {
        return firebaseOn(`/users/${currentUser.uid}/employees`);
      }
      return empty();
    }),
    switchAll(),
    map<any, EmployeesAction>(payload => ({
      payload,
      type: EmployeesActionType.EMPLOYEES_FETCHED,
    })),
  );
