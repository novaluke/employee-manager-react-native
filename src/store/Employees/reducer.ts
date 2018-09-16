import { Reducer } from "redux";

import { AsyncValue } from "../common/Async";
import { IEmployee } from "../Employee";

import { EmployeesAction, EmployeesActionType } from "./actions";

export interface IEmployeesState {
  employeesAction: AsyncValue<{ [uid: string]: IEmployee<string> }>;
}

export const INITIAL_STATE: IEmployeesState = {
  employeesAction: { state: "INIT" },
};

export const employeesReducer: Reducer<IEmployeesState, EmployeesAction> = (
  state = INITIAL_STATE,
  action,
) => {
  switch (action.type) {
    case EmployeesActionType.WATCH_START:
      return { ...state, employeesAction: { state: "PROGRESS" } };
    case EmployeesActionType.UNSUBSCRIBE:
      return { ...state, employeesAction: { state: "INIT" } };
    case EmployeesActionType.EMPLOYEES_FETCHED:
      return {
        ...state,
        employeesAction: {
          state: "COMPLETE",
          value: action.payload || {},
        },
      };
    default:
      return state;
  }
};
