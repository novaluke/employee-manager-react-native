import firebase from "firebase";
import { NavigationScreenProp } from "react-navigation";
import { Dispatch, Reducer } from "redux";
import { action as createAction } from "typesafe-actions";

import { Async } from "./common";

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

export enum ShiftDay {
  Monday = "Monday",
  Tuesday = "Tuesday",
  Wednesday = "Wednesday",
  Thursday = "Thursday",
  Friday = "Friday",
  Saturday = "Saturday",
  Sunday = "Sunday",
}

export interface IEmployee<T extends null | string> {
  employeeName: string;
  phone: string;
  shift: ShiftDay;
  uid: T;
}

export interface IEmployeeState extends IEmployee<null | string> {
  createAction: Async<null>;
  updateAction: Async<null>;
  fireAction: Async<null>;
  fireModalShown: boolean;
}

export const INITIAL_STATE: IEmployeeState = {
  createAction: { state: "INIT" },
  employeeName: "",
  fireAction: { state: "INIT" },
  fireModalShown: false,
  phone: "",
  shift: ShiftDay.Monday,
  uid: null,
  updateAction: { state: "INIT" },
};

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

export const employeeReducer: Reducer<IEmployeeState, EmployeeAction> = (
  state = INITIAL_STATE,
  action,
) => {
  switch (action.type) {
    case EmployeeActionType.UPDATE_FIELD:
      return { ...state, [action.payload.field]: action.payload.value };
    case EmployeeActionType.CREATE_START:
      return { ...state, createAction: { state: "PROGRESS" } };
    case EmployeeActionType.CREATE_SUCCESS:
      return INITIAL_STATE;
    case EmployeeActionType.CREATE_FAIL:
      return {
        ...state,
        createAction: { state: "ERROR", error: "Something went wrong!" },
      };
    case EmployeeActionType.UPDATE_START:
      return { ...state, updateAction: { state: "PROGRESS" } };
    case EmployeeActionType.UPDATE_SUCCESS:
      return INITIAL_STATE;
    case EmployeeActionType.UPDATE_FAIL:
      return {
        ...state,
        updateAction: { state: "ERROR", error: "Something went wrong!" },
      };
    case EmployeeActionType.EDIT:
      return { ...state, ...action.payload };
    case EmployeeActionType.RESET:
      return INITIAL_STATE;
    case EmployeeActionType.SHOW_MODAL:
      return { ...state, fireModalShown: true };
    case EmployeeActionType.CLOSE_MODAL:
      return { ...state, fireModalShown: false };
    case EmployeeActionType.FIRE_START:
      return {
        ...state,
        fireAction: { state: "PROGRESS" },
        fireModalShown: false,
      };
    case EmployeeActionType.FIRE_SUCCESS:
      return INITIAL_STATE;
    case EmployeeActionType.FIRE_FAIL:
      return {
        ...state,
        fireAction: { state: "ERROR", error: "Something went wrong!" },
      };
    default:
      return state;
  }
};

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
  navigation: NavigationScreenProp<any>,
  employee: IEmployee<string>,
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
