import { applyMiddleware, combineReducers, createStore, Store } from "redux";
import { combineEpics, createEpicMiddleware } from "redux-observable";
import reduxThunk from "redux-thunk";

import { AuthAction, authReducer, IAuthState } from "./Auth";
import {
  createEmployeeEpic,
  employeeReducer,
  fireEmployeeEpic,
  IEmployeeState,
  updateEmployeeEpic,
} from "./Employee";
import {
  employeesReducer,
  employeesSubscriptionEpic,
  IEmployeesState,
} from "./Employees";

const rootReducer = combineReducers({
  auth: authReducer,
  employee: employeeReducer,
  employees: employeesReducer,
});

const rootEpic = combineEpics(
  createEmployeeEpic,
  fireEmployeeEpic,
  updateEmployeeEpic,
  employeesSubscriptionEpic,
);

const epicMiddleware = createEpicMiddleware();

export interface IRootState {
  auth: IAuthState;
  employee: IEmployeeState;
  employees: IEmployeesState;
}

export const store: Store<IRootState, RootAction> = createStore(
  rootReducer,
  {},
  applyMiddleware(reduxThunk, epicMiddleware),
);

epicMiddleware.run(rootEpic);

export type RootAction = AuthAction;
export * from "./common/Async";
