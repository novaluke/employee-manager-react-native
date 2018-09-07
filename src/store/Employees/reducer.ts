import { Reducer } from "redux";

import { AsyncValue } from "../common/Async";
import { IEmployee } from "../Employee";

import { EmployeesAction, EmployeesActionType } from "./actions";

export interface IEmployeesState {
  employeesAction: AsyncValue<{ [uid: string]: IEmployee<string> }>;
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
