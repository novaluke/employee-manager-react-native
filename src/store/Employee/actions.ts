import firebase from "firebase";
import { ofType } from "redux-observable";
import { empty, Observable, of, pipe } from "rxjs";
import {
  catchError,
  map,
  mapTo,
  startWith,
  switchAll,
  tap,
} from "rxjs/operators";
import { action as createAction } from "typesafe-actions";

import { IEmployee, IEmployeeState, ShiftDay } from "./reducer";

import { navigate } from "../../NavigationService";
import { Action } from "../common/Async";
import { firebasePush, firebaseRemove, firebaseSet } from "../common/Firebase";

export enum EmployeeActionType {
  UPDATE_FIELD = "UPDATE_FIELD",
  EDIT = "EDIT",
  RESET = "RESET",
  SHOW_MODAL = "SHOW_MODAL",
  CLOSE_MODAL = "CLOSE_MODAL",
  CREATE_EMPLOYEE = "CREATE_EMPLOYEE",
  CREATE_ACTION = "CREATE_ACTION",
  UPDATE_EMPLOYEE = "UPDATE_EMPLOYEE",
  UPDATE_ACTION = "UPDATE_ACTION",
  FIRE_ACTION = "FIRE_ACTION",
  FIRE_EMPLOYEE = "FIRE_EMPLOYEE",
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
  | { type: EmployeeActionType.CREATE_EMPLOYEE; payload: IEmployee<null> }
  | {
      type: EmployeeActionType.CREATE_ACTION;
      payload: Action<string, null, IEmployeeState>;
    }
  | { type: EmployeeActionType.UPDATE_EMPLOYEE; payload: IEmployee<string> }
  | {
      type: EmployeeActionType.UPDATE_ACTION;
      payload: Action<string, null, IEmployeeState>;
    }
  | { type: EmployeeActionType.FIRE_EMPLOYEE; payload: string }
  | {
      type: EmployeeActionType.FIRE_ACTION;
      payload: Action<string, null, IEmployeeState>;
    };

export const updateField = (payload: FieldUpdatePayload) =>
  createAction(EmployeeActionType.UPDATE_FIELD, payload);

const handleCreateSuccess = pipe(
  tap(() => navigate("EmployeeList")),
  mapTo<any, EmployeeAction>({
    payload: Action.success(null),
    type: EmployeeActionType.CREATE_ACTION,
  }),
);

const handleCreateFail = () =>
  of<EmployeeAction>({
    payload: Action.failure(""),
    type: EmployeeActionType.CREATE_ACTION,
  });

export const createEmployee = (employee: IEmployee<null>) =>
  createAction(EmployeeActionType.CREATE_EMPLOYEE, employee);

export const createEmployeeEpic = (
  action$: Observable<EmployeeAction>,
): Observable<EmployeeAction> =>
  action$.pipe(
    ofType(EmployeeActionType.CREATE_EMPLOYEE),
    map(action => {
      const { currentUser } = firebase.auth();
      if (currentUser === null) {
        navigate("Auth");
      } else if (action.type === EmployeeActionType.CREATE_EMPLOYEE) {
        // Still need the `if` even after `ofType` in order to narrow the type
        // properly, unless we want to specify the type parameter in `ofType`,
        // which is slightly more verbose than this `else if`
        const { payload } = action;
        return firebasePush(
          `/users/${currentUser.uid}/employees`,
          payload,
        ).pipe(
          handleCreateSuccess,
          catchError(handleCreateFail),
          // Must come after handleCreateSuccess to avoid getting mapped by it
          startWith<EmployeeAction, EmployeeAction>({
            payload: Action.start(),
            type: EmployeeActionType.CREATE_ACTION,
          }),
        );
      }
      return empty();
    }),
    switchAll(),
  );

export const editEmployee = (employee: IEmployee<string>) => {
  navigate("EditEmployee", { employeeName: employee.employeeName });
  return createAction(EmployeeActionType.EDIT, employee);
};

export const resetForm = () => createAction(EmployeeActionType.RESET);

export const updateEmployee = (
  employee: IEmployee<string>,
): EmployeeAction => ({
  payload: employee,
  type: EmployeeActionType.UPDATE_EMPLOYEE,
});

const handleUpdateSuccess = pipe(
  tap<any>(() => navigate("EmployeeList")),
  mapTo<any, EmployeeAction>({
    payload: Action.success(null),
    type: EmployeeActionType.UPDATE_ACTION,
  }),
);

const handleUpdateFail = () =>
  of<EmployeeAction>({
    payload: Action.failure(""),
    type: EmployeeActionType.UPDATE_ACTION,
  });

export const updateEmployeeEpic = (
  action$: Observable<EmployeeAction>,
): Observable<EmployeeAction> =>
  action$.pipe(
    ofType(EmployeeActionType.UPDATE_EMPLOYEE),
    map(action => {
      const { currentUser } = firebase.auth();
      if (currentUser === null) {
        navigate("Auth");
      } else if (action.type === EmployeeActionType.UPDATE_EMPLOYEE) {
        const {
          payload: { uid, ...employee },
        } = action;
        return firebaseSet(
          `/users/${currentUser.uid}/employees/${uid}`,
          employee,
        ).pipe(
          handleUpdateSuccess,
          catchError(handleUpdateFail),
          startWith<EmployeeAction, EmployeeAction>({
            payload: Action.start(),
            type: EmployeeActionType.UPDATE_ACTION,
          }),
        );
      }
      return empty();
    }),
    switchAll(),
  );

export const showFireModal = () => createAction(EmployeeActionType.SHOW_MODAL);
export const closeFireModal = () =>
  createAction(EmployeeActionType.CLOSE_MODAL);

export const fireEmployee = (uid: string) =>
  createAction(EmployeeActionType.FIRE_EMPLOYEE, uid);

const handleFireSuccess = pipe(
  tap<any>(() => navigate("EmployeeList")),
  mapTo<any, EmployeeAction>({
    payload: Action.success(null),
    type: EmployeeActionType.FIRE_ACTION,
  }),
);

const handleFireFail = () =>
  of<EmployeeAction>({
    payload: Action.failure(""),
    type: EmployeeActionType.FIRE_ACTION,
  });

export const fireEmployeeEpic = (
  action$: Observable<EmployeeAction>,
): Observable<EmployeeAction> =>
  action$.pipe(
    ofType(EmployeeActionType.FIRE_EMPLOYEE),
    map(action => {
      const { currentUser } = firebase.auth();
      if (currentUser === null) {
        navigate("Auth");
      } else if (action.type === EmployeeActionType.FIRE_EMPLOYEE) {
        const uid = action.payload;
        return firebaseRemove(
          `/users/${currentUser.uid}/employees/${uid}`,
        ).pipe(
          handleFireSuccess,
          catchError(handleFireFail),
          startWith<EmployeeAction, EmployeeAction>({
            payload: Action.start(),
            type: EmployeeActionType.FIRE_ACTION,
          }),
        );
      }
      return empty();
    }),
    switchAll(),
  );
