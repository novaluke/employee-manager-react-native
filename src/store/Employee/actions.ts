import firebase from "firebase";
import { NavigationScreenProp } from "react-navigation";
import { Dispatch } from "redux";
import { action as createAction } from "typesafe-actions";

import { IEmployee, ShiftDay } from "./reducer";

export enum EmployeeActionType {
  UPDATE_FIELD = "UPDATE_FIELD",
  CREATE_START = "CREATE_START",
  CREATE_SUCCESS = "CREATE_SUCCESS",
  CREATE_FAIL = "CREATE_FAIL",
  UPDATE_START = "UPDATE_START",
  UPDATE_SUCCESS = "UPDATE_SUCCESS",
  UPDATE_FAIL = "UPDATE_FAIL",
  EDIT = "EDIT",
  RESET = "RESET",
  SHOW_MODAL = "SHOW_MODAL",
  CLOSE_MODAL = "CLOSE_MODAL",
  FIRE_START = "FIRE_START",
  FIRE_SUCCESS = "FIRE_SUCCESS",
  FIRE_FAIL = "FIRE_FAIL",
}

export type FieldUpdatePayload =
  | { field: "employeeName" | "phone"; value: string }
  | { field: "shift"; value: ShiftDay };

export type EmployeeAction =
  | {
      type: EmployeeActionType.UPDATE_FIELD;
      payload: FieldUpdatePayload;
    }
  | { type: EmployeeActionType.CREATE_START }
  | { type: EmployeeActionType.CREATE_SUCCESS }
  | { type: EmployeeActionType.CREATE_FAIL }
  | { type: EmployeeActionType.UPDATE_START }
  | { type: EmployeeActionType.UPDATE_SUCCESS }
  | { type: EmployeeActionType.UPDATE_FAIL }
  | { type: EmployeeActionType.EDIT; payload: IEmployee<string> }
  | { type: EmployeeActionType.RESET }
  | { type: EmployeeActionType.SHOW_MODAL }
  | { type: EmployeeActionType.CLOSE_MODAL }
  | { type: EmployeeActionType.FIRE_START }
  | { type: EmployeeActionType.FIRE_SUCCESS }
  | { type: EmployeeActionType.FIRE_FAIL };

type EmployeeDispatch = Dispatch<EmployeeAction>;

export const updateField = (payload: FieldUpdatePayload) =>
  createAction(EmployeeActionType.UPDATE_FIELD, payload);

const createSuccess = (dispatch: EmployeeDispatch, navigate: any) => () => {
  navigate("EmployeeList");
  dispatch(createAction(EmployeeActionType.CREATE_SUCCESS));
};

const createFail = (dispatch: EmployeeDispatch) => () =>
  dispatch(createAction(EmployeeActionType.CREATE_FAIL));

export const createEmployee = (
  employee: IEmployee<null>,
  navigation: NavigationScreenProp<any>,
) => (dispatch: EmployeeDispatch) => {
  const { currentUser } = firebase.auth();
  if (currentUser === null) {
    navigation.navigate("Auth");
  } else {
    dispatch(createAction(EmployeeActionType.CREATE_START));
    return (
      firebase
        .database()
        .ref(`/users/${currentUser.uid}/employees`)
        .push(employee)
        // Have to put error handler within `.then` due to Firebase idiosyncracity
        .then(
          createSuccess(dispatch, navigation.navigate),
          createFail(dispatch),
        )
    );
  }
  return Promise.reject();
};

export const editEmployee = (
  employee: IEmployee<string>,
  navigation: NavigationScreenProp<any>,
) => (dispatch: EmployeeDispatch) => {
  dispatch(createAction(EmployeeActionType.EDIT, employee));
  navigation.navigate("EditEmployee", { employeeName: employee.employeeName });
};

export const resetForm = () => createAction(EmployeeActionType.RESET);

const updateSuccess = (
  dispatch: EmployeeDispatch,
  navigation: NavigationScreenProp<any>,
) => () => {
  navigation.navigate("EmployeeList");
  dispatch(createAction(EmployeeActionType.UPDATE_SUCCESS));
};

const updateFail = (dispatch: EmployeeDispatch) => () => {
  dispatch(createAction(EmployeeActionType.UPDATE_FAIL));
};

export const updateEmployee = (
  { uid, ...employee }: IEmployee<null | string>,
  navigation: NavigationScreenProp<any>,
) => (dispatch: EmployeeDispatch) => {
  const { currentUser } = firebase.auth();
  if (currentUser === null) {
    navigation.navigate("Auth");
  } else if (uid === null) {
    // TODO handle this better, either by making it impossible to get here (via
    // type safety) or showing an error message at least
    navigation.navigate("EmployeeList");
  } else {
    dispatch(createAction(EmployeeActionType.UPDATE_START));
    return firebase
      .database()
      .ref(`/users/${currentUser.uid}/employees/${uid}`)
      .set(employee)
      .then(updateSuccess(dispatch, navigation), updateFail(dispatch));
  }
  return Promise.reject();
};

const fireSuccess = (
  dispatch: EmployeeDispatch,
  navigation: NavigationScreenProp<any>,
) => () => {
  navigation.navigate("EmployeeList");
  dispatch(createAction(EmployeeActionType.FIRE_SUCCESS));
};

const fireFail = (dispatch: EmployeeDispatch) => () =>
  dispatch(createAction(EmployeeActionType.FIRE_FAIL));

export const showFireModal = () => createAction(EmployeeActionType.SHOW_MODAL);
export const closeFireModal = () =>
  createAction(EmployeeActionType.CLOSE_MODAL);

export const fireEmployee = (
  uid: string | null,
  navigation: NavigationScreenProp<any>,
) => (dispatch: EmployeeDispatch) => {
  const { currentUser } = firebase.auth();
  if (currentUser === null) {
    navigation.navigate("Auth");
  } else if (uid === null) {
    // TODO handle this better, either by making it impossible to get here (via
    // type safety) or showing an error message at least
    navigation.navigate("EmployeeList");
  } else {
    dispatch(createAction(EmployeeActionType.FIRE_START));
    return firebase
      .database()
      .ref(`/users/${currentUser.uid}/employees/${uid}`)
      .remove()
      .then(fireSuccess(dispatch, navigation), fireFail(dispatch));
  }
  return Promise.reject();
};
