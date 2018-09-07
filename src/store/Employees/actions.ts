import firebase from "firebase";
import { NavigationScreenProp } from "react-navigation";
import { Dispatch } from "redux";
import { action as createAction } from "typesafe-actions";

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
  const onEmployeesFetched = (snapshot: firebase.database.DataSnapshot) =>
    dispatch(createAction(EmployeesActionType.EMPLOYEES_FETCHED, snapshot));
  const unsubscribe = () =>
    firebase
      .database()
      .ref(refString)
      .off("value", onEmployeesFetched);

  dispatch(createAction(EmployeesActionType.WATCH_START, unsubscribe));
  firebase
    .database()
    .ref(refString)
    .on("value", onEmployeesFetched);
  return onEmployeesFetched;
};
