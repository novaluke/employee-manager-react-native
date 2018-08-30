import "jest-enzyme";

import firebase from "firebase";
import { NavigationScreenProp } from "react-navigation";

import { stubNavigation } from "../helpers/react-navigation";

import { Async } from "../../src/store";
import {
  EmployeesActionType,
  employeesReducer as reducer,
  IEmployeesState,
  INITIAL_STATE,
  unwatchEmployees,
  watchEmployees,
} from "../../src/store/Employees";

describe("reducer", () => {
  let testState: IEmployeesState;
  beforeEach(() => {
    testState = {
      employeesAction: { state: "PROGRESS" } as Async<any>,
      unsubscribe: jest.fn(),
    };
  });

  it("sets the initial state", () => {
    // Redux uses an action of {type: 'init'} to initialize state, but that is
    // internal to Redux implementation and we don't want to include that in
    // every reducer's action types. That then means the init action isn't
    // allowed by the type system, so we have to cast it as `any` to get around
    // that.
    expect(reducer(undefined, {} as any)).toEqual(INITIAL_STATE);
  });

  describe("watching the employees data", () => {
    describe("when started", () => {
      it("updates the asyncAction to in progress", () => {
        const expectedAction = { state: "PROGRESS" };
        testState.employeesAction.state = "INIT";

        expect(testState.employeesAction).not.toEqual(expectedAction);
        const state = reducer(testState, {
          payload: () => null,
          type: EmployeesActionType.WATCH_START,
        });

        expect(state).toEqual({
          ...testState,
          employeesAction: expectedAction,
          unsubscribe: expect.any(Function),
        });
      });

      it("updates the unsubscribe function", () => {
        const unsubscribeFn = jest.fn();

        const state = reducer(testState, {
          payload: unsubscribeFn,
          type: EmployeesActionType.WATCH_START,
        });

        expect(state.unsubscribe).toBe(unsubscribeFn);
      });

      it("calls the previous unsubscribe function", () => {
        // Only allow one watcher in order to keep resource use clean
        testState.unsubscribe = jest.fn();

        reducer(testState, {
          payload: () => null,
          type: EmployeesActionType.WATCH_START,
        });

        expect(testState.unsubscribe).toHaveBeenCalledTimes(1);
      });
    });

    describe("when employees are fetched", () => {
      it("marks the asyncAction as complete", () => {
        const expectedAction = { state: "COMPLETE", value: expect.any(Object) };

        expect(testState.employeesAction).not.toEqual(expectedAction);
        const state = reducer(testState, {
          payload: { val: jest.fn() } as any,
          type: EmployeesActionType.EMPLOYEES_FETCHED,
        });

        expect(state.employeesAction).toEqual(expectedAction);
      });

      it("overwrites previously fetched data", () => {
        const data = { foo: "bar" };

        const state = reducer(testState, {
          payload: { val: jest.fn(() => data) } as any,
          type: EmployeesActionType.EMPLOYEES_FETCHED,
        });

        expect(state.employeesAction.state).toEqual("COMPLETE");
        if (state.employeesAction.state === "COMPLETE") {
          expect(state.employeesAction.value).toBe(data);
        }
      });

      it("sets the data as empty if the return value is null", () => {
        testState.employeesAction = {
          state: "COMPLETE",
          value: { foo: "bar" } as any,
        };
        const state = reducer(testState, {
          payload: { val: jest.fn(() => null) } as any,
          type: EmployeesActionType.EMPLOYEES_FETCHED,
        });

        expect(state.employeesAction.state).toEqual("COMPLETE");
        if (state.employeesAction.state === "COMPLETE") {
          expect(state.employeesAction.value).toEqual({});
        }
      });
    });
  });

  describe("unsubscribing from the employees data", () => {
    it("resets the asyncAction to its initial state", () => {
      const expectedAction = { state: "INIT" };

      expect(testState.employeesAction).not.toEqual(expectedAction);
      const state = reducer(testState, {
        type: EmployeesActionType.UNSUBSCRIBE,
      });

      expect(state).toEqual({ ...testState, employeesAction: expectedAction });
    });

    it("calls the unsubscribe function", () => {
      const { unsubscribe } = testState;

      expect(unsubscribe).not.toHaveBeenCalled();
      reducer(testState, { type: EmployeesActionType.UNSUBSCRIBE });

      expect(unsubscribe).toHaveBeenCalledTimes(1);
    });
  });
});

describe("actions", () => {
  let navigation: NavigationScreenProp<any>;
  beforeEach(() => {
    navigation = stubNavigation();
  });

  describe("watchEmployees", () => {
    describe("when not logged in", () => {
      it("redirects to the Auth route", () => {
        (firebase.auth as any).mockImplementation(() => ({
          currentUser: null,
        }));

        expect(navigation.navigate).not.toHaveBeenCalled();
        watchEmployees(navigation)(jest.fn());

        expect(navigation.navigate).toHaveBeenCalledTimes(1);
        expect(navigation.navigate).toHaveBeenCalledWith("Auth");
      });
    });

    describe("when logged in", () => {
      const user = { uid: "uid1" };
      const refString = `/users/${user.uid}/employees`;
      const on = jest.fn();
      const off = jest.fn();
      const ref = jest.fn(() => ({ on, off }));
      beforeEach(() => {
        (firebase.auth as any).mockImplementation(() => ({
          currentUser: user,
        }));
        (firebase.database as any).mockImplementation(() => ({ ref }));
      });

      it("dispatches the employees watch started action", () => {
        const dispatch = jest.fn();

        watchEmployees(navigation)(dispatch);

        expect(dispatch).toHaveBeenCalledTimes(1);
        expect(dispatch).toHaveBeenCalledWith({
          payload: expect.any(Function),
          type: EmployeesActionType.WATCH_START,
        });
      });

      it("sets an unsubscribe function to the watch started action payload", () => {
        const dispatch = jest.fn(({ payload }) => payload());

        const watchingFunc = watchEmployees(navigation)(dispatch);

        // unsubscribe is called by dispatch as soon as the action is dispatched
        expect(off).toHaveBeenCalledTimes(1);
        expect(off).toHaveBeenCalledWith("value", watchingFunc);
      });

      it("sets up a watch on the current user's employees", () => {
        expect(ref).not.toHaveBeenCalled();
        expect(on).not.toHaveBeenCalled();

        watchEmployees(navigation)(jest.fn());

        expect(ref).toHaveBeenCalledTimes(1);
        expect(ref).toHaveBeenCalledWith(refString);

        expect(on).toHaveBeenCalledTimes(1);
        expect(on).toHaveBeenCalledWith("value", expect.any(Function));
      });

      describe("when the watch is triggered", () => {
        describe("with a DataSnapshot", () => {
          it("dispatches the 'data fetched' action with the snapshot as payload", () => {
            const dispatch = jest.fn();
            const payload = {};
            on.mockImplementation((_, callback) => callback(payload));

            watchEmployees(navigation)(dispatch);

            // The watcher is triggered as soon as it's registered (see above)
            expect(dispatch).toHaveBeenCalledWith({
              payload,
              type: EmployeesActionType.EMPLOYEES_FETCHED,
            });
          });
        });

        // Note that this is necessary because the type definition for `.on`
        // indicates that it might pass a snapshot *or* null, so we must satisfy
        // that constraint, even though the docs seem to imply it will always pass
        // a snapshot.
        describe("with no argument", () => {
          it("does not dispatch the 'data fetched' action", () => {
            const dispatch = jest.fn();
            on.mockImplementation((_, callback) => callback(null));

            watchEmployees(navigation)(dispatch);

            expect(dispatch).not.toHaveBeenCalledWith({
              payload: expect.any(Object),
              type: EmployeesActionType.EMPLOYEES_FETCHED,
            });
          });
        });
      });
    });
  });

  describe("unwatchEmployees", () => {
    it("creates the unsubscribe action", () => {
      expect(unwatchEmployees()).toEqual({
        type: EmployeesActionType.UNSUBSCRIBE,
      });
    });
  });
});
