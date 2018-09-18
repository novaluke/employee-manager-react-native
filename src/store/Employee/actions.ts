import firebase from "firebase";
import { NavigationScreenProp } from "react-navigation";
import { Dispatch } from "redux";
import { ofType } from "redux-observable";
import { empty, Observable, of, pipe } from "rxjs";
import { catchError, concat, map, mapTo, switchAll, tap } from "rxjs/operators";
import { action as createAction } from "typesafe-actions";

import { IEmployee, IEmployeeState, ShiftDay } from "./reducer";

import { navigate } from "../../NavigationService";
import { Action } from "../common/Async";
import { firebasePush } from "../common/Firebase";

export enum EmployeeActionType {
  UPDATE_FIELD = "UPDATE_FIELD",
  EDIT = "EDIT",
  RESET = "RESET",
  SHOW_MODAL = "SHOW_MODAL",
  CLOSE_MODAL = "CLOSE_MODAL",
  CREATE_EMPLOYEE = "CREATE_EMPLOYEE",
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
  | { type: EmployeeActionType.CREATE_EMPLOYEE; payload: IEmployee<null> }
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
        return of<EmployeeAction>({
          payload: Action.start(),
          type: EmployeeActionType.CREATE_ACTION,
        }).pipe(
          concat(
            firebasePush(`/users/${currentUser.uid}/employees`, payload).pipe(
              handleCreateSuccess,
              catchError(handleCreateFail),
            ),
          ),
        );
      }
      return empty();
    }),
    switchAll(),
  );

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
