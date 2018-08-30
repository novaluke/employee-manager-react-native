import firebase from "firebase";
import { NavigationScreenProp } from "react-navigation";
import { Dispatch, Reducer } from "redux";
import { action as createAction } from "typesafe-actions";

export enum EmployeeActionType {
  UPDATE_FIELD = "UPDATE_FIELD",
  CREATE_START = "CREATE_START",
  CREATE_SUCCESS = "CREATE_SUCCESS",
  CREATE_FAIL = "CREATE_FAIL",
  EDIT = "EDIT",
  RESET = "RESET",
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

export interface IEmployee {
  employeeName: string;
  phone: string;
  shift: ShiftDay;
  uid: null | string;
}

export interface IEmployeeState extends IEmployee {
  error: string;
  loading: boolean;
}

const INITIAL_STATE: IEmployeeState = {
  employeeName: "",
  error: "",
  loading: false,
  phone: "",
  shift: ShiftDay.Monday,
  uid: null,
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
  | { type: EmployeeActionType.EDIT; payload: IEmployee }
  | { type: EmployeeActionType.RESET; payload: IEmployee };

type EmployeeDispatch = Dispatch<EmployeeAction>;

export const employeeReducer: Reducer<IEmployeeState, EmployeeAction> = (
  state = INITIAL_STATE,
  action,
) => {
  switch (action.type) {
    case EmployeeActionType.UPDATE_FIELD:
      return { ...state, [action.payload.field]: action.payload.value };
    case EmployeeActionType.CREATE_START:
      return { ...state, loading: true };
    case EmployeeActionType.CREATE_SUCCESS:
      return INITIAL_STATE;
    case EmployeeActionType.CREATE_FAIL:
      return { ...state, error: "Something went wrong!", loading: false };
    case EmployeeActionType.EDIT:
      return { ...state, ...action.payload };
    case EmployeeActionType.RESET:
      return INITIAL_STATE;
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
  employee: IEmployee,
  navigation: NavigationScreenProp<any>,
) => (dispatch: EmployeeDispatch) => {
  const { currentUser } = firebase.auth();
  if (currentUser === null) {
    navigation.navigate("Auth");
  } else {
    dispatch(createAction(EmployeeActionType.CREATE_START));
    firebase
      .database()
      .ref(`/users/${currentUser.uid}/employees`)
      .push(employee)
      // Have to put error handler within `.then` due to Firebase idiosyncracity
      .then(createSuccess(dispatch, navigation.navigate), createFail(dispatch));
  }
};

export const editEmployee = (
  navigation: NavigationScreenProp<any>,
  employee: IEmployee,
) => (dispatch: EmployeeDispatch) => {
  dispatch(createAction(EmployeeActionType.EDIT, employee));
  navigation.navigate("CreateEmployee");
};

export const resetForm = () => createAction(EmployeeActionType.RESET);
