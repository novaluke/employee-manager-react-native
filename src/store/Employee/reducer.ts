import { Reducer } from "redux";

import { asyncReducer, AsyncValue } from "../common/Async";

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
  createAction: AsyncValue<null>;
  updateAction: AsyncValue<null>;
  fireAction: AsyncValue<null>;
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
    case EmployeeActionType.CREATE_ACTION:
      return asyncReducer(
        state,
        createAction => ({ createAction }),
        action.payload
          .failure(_ => ["Something went wrong!", {}])
          .success(x => [x, INITIAL_STATE]),
      );
    case EmployeeActionType.UPDATE_ACTION:
      return asyncReducer(
        state,
        updateAction => ({ updateAction }),
        action.payload
          .failure(_ => ["Something went wrong!", {}])
          .success(x => [x, INITIAL_STATE]),
      );
    case EmployeeActionType.FIRE_ACTION:
      return asyncReducer(
        state,
        fireAction => ({ fireAction }),
        action.payload
          .failure(_ => ["Something went wrong!", {}])
          .success(x => [x, INITIAL_STATE]),
      );
    case EmployeeActionType.EDIT:
      return { ...state, ...action.payload };
    case EmployeeActionType.RESET:
      return INITIAL_STATE;
    case EmployeeActionType.SHOW_MODAL:
      return { ...state, fireModalShown: true };
    case EmployeeActionType.CLOSE_MODAL:
      return { ...state, fireModalShown: false };
    default:
      return state;
  }
};
