import firebase from "firebase";
import { NavigationScreenProp } from "react-navigation";
import { Dispatch, Reducer } from "redux";
import { action as createAction } from "typesafe-actions";

import { Async } from "./common";
import { IEmployee } from "./Employee";

export enum EmployeesActionType {
  WATCH_START = "WATCH_START",
  WATCH_END = "WATCH_END",
  EMPLOYEES_FETCHED = "EMPLOYEES_FETCHED",
}

export type EmployeesAction =
  | { type: EmployeesActionType.WATCH_START }
  | { type: EmployeesActionType.WATCH_END }
  | {
      type: EmployeesActionType.EMPLOYEES_FETCHED;
      payload: firebase.database.DataSnapshot;
    };
type EmployeesDispatch = Dispatch<EmployeesAction>;

export interface IEmployeesState {
  employeesAction: Async<{ [uid: string]: IEmployee<string> }>;
}

const INITIAL_STATE: IEmployeesState = {
  employeesAction: { state: "INIT" },
};

export const employeesReducer: Reducer<IEmployeesState, EmployeesAction> = (
  state = INITIAL_STATE,
  action,
) => {
  switch (action.type) {
    case EmployeesActionType.WATCH_START:
      return { ...state, employeesAction: { state: "PROGRESS" } };
    case EmployeesActionType.WATCH_END:
      return state;
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

let watchingFunc:
  | ((snapshot: firebase.database.DataSnapshot) => void)
  | undefined;

export const unwatchEmployees = (
  navigation: NavigationScreenProp<any>,
) => () => {
  const { currentUser } = firebase.auth();
  if (currentUser === null) {
    navigation.navigate("Auth");
  } else {
    firebase
      .database()
      .ref(`/users/${currentUser.uid}/employees`)
      .off("value", watchingFunc);
    watchingFunc = undefined;
  }
};

export const watchEmployees = (navigation: NavigationScreenProp<any>) => (
  dispatch: EmployeesDispatch,
) => {
  const { currentUser } = firebase.auth();
  if (currentUser === null) {
    navigation.navigate("Auth");
  } else if (watchingFunc === undefined) {
    dispatch(createAction(EmployeesActionType.WATCH_START));
    watchingFunc = firebase
      .database()
      .ref(`/users/${currentUser.uid}/employees`)
      .on(
        "value",
        (snapshot: firebase.database.DataSnapshot | null) =>
          snapshot
            ? dispatch(
                createAction(EmployeesActionType.EMPLOYEES_FETCHED, snapshot),
              )
            : null,
      );
  }
};
