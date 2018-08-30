import firebase from "firebase";
import { NavigationScreenProp } from "react-navigation";
import { Dispatch, Reducer } from "redux";
import { action as createAction } from "typesafe-actions";

import { Async } from "./common";
import { IEmployee } from "./Employee";

export enum EmployeesActionType {
  WATCH_START = "WATCH_START",
  UNSUBSCRIBE = "UNSUBSCRIBE",
  EMPLOYEES_FETCHED = "EMPLOYEES_FETCHED",
}

export type EmployeesAction =
  | { type: EmployeesActionType.WATCH_START; payload: () => void }
  | { type: EmployeesActionType.UNSUBSCRIBE }
  | {
      type: EmployeesActionType.EMPLOYEES_FETCHED;
      payload: firebase.database.DataSnapshot;
    };
type EmployeesDispatch = Dispatch<EmployeesAction>;

export interface IEmployeesState {
  employeesAction: Async<{ [uid: string]: IEmployee<string> }>;
  unsubscribe: (() => void) | null;
}

export const INITIAL_STATE: IEmployeesState = {
  employeesAction: { state: "INIT" },
  unsubscribe: null,
};

export const employeesReducer: Reducer<IEmployeesState, EmployeesAction> = (
  state = INITIAL_STATE,
  action,
) => {
  switch (action.type) {
    case EmployeesActionType.WATCH_START:
      if (state.unsubscribe) {
        state.unsubscribe();
      }
      return {
        ...state,
        employeesAction: { state: "PROGRESS" },
        unsubscribe: action.payload,
      };
    case EmployeesActionType.UNSUBSCRIBE:
      if (state.unsubscribe) {
        state.unsubscribe();
      }
      return { ...state, employeesAction: { state: "INIT" } };
    case EmployeesActionType.EMPLOYEES_FETCHED:
      return {
        ...state,
        employeesAction: {
          state: "COMPLETE",
          value: action.payload.val() || {},
        },
      };
    default:
      return state;
  }
};

export const unwatchEmployees = () =>
  createAction(EmployeesActionType.UNSUBSCRIBE);

export const watchEmployees = (navigation: NavigationScreenProp<any>) => (
  dispatch: EmployeesDispatch,
) => {
  const { currentUser } = firebase.auth();
  if (currentUser === null) {
    navigation.navigate("Auth");
    return () => null;
  }
  const refString = `/users/${currentUser.uid}/employees`;
  // Need to type annotate it or else firebase complains when passing the
  // function to `.off`, which is probably a bug since `.off` is supposed to
  // accept functions passed to `.on`, so anything `.on` accepts `.off` should
  // also accept.
  const watchingFunc: (a: firebase.database.DataSnapshot) => void = firebase
    .database()
    .ref(refString)
    .on(
      "value",
      (snapshot: firebase.database.DataSnapshot | null) =>
        snapshot
          ? dispatch(
              createAction(EmployeesActionType.EMPLOYEES_FETCHED, snapshot),
            )
          : null,
    );
  const unsubscribe = () =>
    firebase
      .database()
      .ref(refString)
      .off("value", watchingFunc);
  dispatch(createAction(EmployeesActionType.WATCH_START, unsubscribe));
  return watchingFunc;
};
