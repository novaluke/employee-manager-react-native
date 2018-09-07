import firebase from "firebase";
import { NavigationScreenProp } from "react-navigation";
import { Dispatch } from "redux";
import { action as createAction } from "typesafe-actions";

import { IEmployee, IEmployeeState, ShiftDay } from "./reducer";

import { Action } from "../common/Async";

export enum EmployeeActionType {
  UPDATE_FIELD = "UPDATE_FIELD",
  EDIT = "EDIT",
  RESET = "RESET",
  SHOW_MODAL = "SHOW_MODAL",
  CLOSE_MODAL = "CLOSE_MODAL",
  CREATE_ACTION = "CREATE_ACTION",
  UPDATE_ACTION = "UPDATE_ACTION",
  FIRE_ACTION = "FIRE_ACTION",
}

export type FieldUpdatePayload =
  | { field: "employeeName" | "phone"; value: string }
  | { field: "shift"; value: ShiftDay };

export type EmployeeAction =
  | {
      type: EmployeeActionType.UPDATE_FIELD;
      payload: FieldUpdatePayload;
    }
  | { type: EmployeeActionType.EDIT; payload: IEmployee<string> }
  | { type: EmployeeActionType.RESET }
  | { type: EmployeeActionType.SHOW_MODAL }
  | { type: EmployeeActionType.CLOSE_MODAL }
  | {
      type: EmployeeActionType.CREATE_ACTION;
      payload: Action<string, null, IEmployeeState>;
    }
  | {
      type: EmployeeActionType.UPDATE_ACTION;
      payload: Action<string, null, IEmployeeState>;
    }
  | {
      type: EmployeeActionType.FIRE_ACTION;
      payload: Action<string, null, IEmployeeState>;
    };

type EmployeeDispatch = Dispatch<EmployeeAction>;

export const updateField = (payload: FieldUpdatePayload) =>
  createAction(EmployeeActionType.UPDATE_FIELD, payload);

const createSuccess = (
  dispatch: EmployeeDispatch,
  navigate: NavigationScreenProp<any>["navigate"],
) => () => {
  navigate("EmployeeList");
  dispatch({
    payload: Action.success(null),
    type: EmployeeActionType.CREATE_ACTION,
  });
};

const createFail = (dispatch: EmployeeDispatch) => () =>
  dispatch({
    payload: Action.failure(""),
    type: EmployeeActionType.CREATE_ACTION,
  });

export const createEmployee = (
  employee: IEmployee<null>,
  navigation: NavigationScreenProp<any>,
) => (dispatch: EmployeeDispatch) => {
  const { currentUser } = firebase.auth();
  if (currentUser === null) {
    navigation.navigate("Auth");
  } else {
    dispatch({
      payload: Action.start(),
      type: EmployeeActionType.CREATE_ACTION,
    });
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
  dispatch({
    payload: Action.success(null),
    type: EmployeeActionType.UPDATE_ACTION,
  });
};

const updateFail = (dispatch: EmployeeDispatch) => () =>
  dispatch({
    payload: Action.failure(""),
    type: EmployeeActionType.UPDATE_ACTION,
  });

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
    dispatch({
      payload: Action.start(),
      type: EmployeeActionType.UPDATE_ACTION,
    });
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
  dispatch({
    payload: Action.success(null),
    type: EmployeeActionType.FIRE_ACTION,
  });
};

const fireFail = (dispatch: EmployeeDispatch) => () =>
  dispatch({
    payload: Action.failure(""),
    type: EmployeeActionType.FIRE_ACTION,
  });

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
    dispatch({
      payload: Action.start(),
      type: EmployeeActionType.FIRE_ACTION,
    });
    return firebase
      .database()
      .ref(`/users/${currentUser.uid}/employees/${uid}`)
      .remove()
      .then(fireSuccess(dispatch, navigation), fireFail(dispatch));
  }
  return Promise.reject();
};
