import { applyMiddleware, combineReducers, createStore, Store } from "redux";
import reduxThunk from "redux-thunk";

import { AuthAction, authReducer, IAuthState } from "./Auth";
import { employeeReducer, IEmployeeState } from "./Employee";
import { employeesReducer, IEmployeesState } from "./Employees";

const rootReducer = combineReducers({
  auth: authReducer,
  employee: employeeReducer,
  employees: employeesReducer,
});

export interface IRootState {
  auth: IAuthState;
  employee: IEmployeeState;
  employees: IEmployeesState;
}

export const store: Store<IRootState, RootAction> = createStore(
  rootReducer,
  {},
  applyMiddleware(reduxThunk),
);

export type RootAction = AuthAction;
