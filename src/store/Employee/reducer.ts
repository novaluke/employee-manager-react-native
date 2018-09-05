import { Reducer } from "redux";

import { Async } from "../common";

import { EmployeeAction, EmployeeActionType } from "./actions";

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
