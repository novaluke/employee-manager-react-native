import "jest-enzyme";

import { Async } from "../../../src/store";
import {
  EmployeesActionType,
  employeesReducer as reducer,
  IEmployeesState,
  INITIAL_STATE,
} from "../../../src/store/Employees";

describe("Employees reducer", () => {
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
