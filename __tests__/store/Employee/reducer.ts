import "jest-enzyme";

import { Async } from "../../../src/store";
import {
  EmployeeActionType,
  employeeReducer as reducer,
  IEmployee,
  IEmployeeState,
  INITIAL_STATE,
  ShiftDay,
} from "../../../src/store/Employee";

beforeEach(() => {
  jest.resetAllMocks();
});

describe("Employee reducer", () => {
  let testState: IEmployeeState;
  let testEmployee: IEmployee<string>;
  let newEmployee: IEmployee<string>;
  beforeEach(() => {
    testEmployee = {
      employeeName: "Taylor",
      phone: "555-5555",
      shift: ShiftDay.Friday,
      uid: "uid1",
    };
    newEmployee = {
      employeeName: "Casey",
      phone: "123-456-7890",
      shift: ShiftDay.Tuesday,
      uid: "uid2",
    };
    testState = {
      createAction: { state: "PROGRESS" } as Async<null>,
      fireAction: { state: "PROGRESS" } as Async<null>,
      fireModalShown: false,
      updateAction: { state: "PROGRESS" } as Async<null>,
      ...testEmployee,
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

  it("updates fields that are changed", () => {
    const { employeeName, phone } = newEmployee;

    const newState = reducer(testState, {
      payload: { field: "employeeName", value: employeeName },
      type: EmployeeActionType.UPDATE_FIELD,
    });
    expect(newState).toEqual({ ...testState, employeeName });

    const finalState = reducer(newState, {
      payload: { field: "phone", value: phone },
      type: EmployeeActionType.UPDATE_FIELD,
    });
    expect(finalState).toEqual({ ...newState, phone });
  });

  it("resets the form when a reset is dispatched", () => {
    const state = reducer(testState, {
      type: EmployeeActionType.RESET,
    });
    expect(state).toEqual(INITIAL_STATE);
  });

  describe("employee creation", () => {
    it("updates the creation asyncAction when the request is started", () => {
      const expectedAction = { state: "PROGRESS" };
      testState.createAction = { state: "INIT" };

      expect(testState.createAction).not.toEqual(expectedAction);
      const state = reducer(testState, {
        type: EmployeeActionType.CREATE_START,
      });

      expect(state).toEqual({ ...testState, createAction: expectedAction });
    });

    it("resets the state when the request succeeds", () => {
      const state = reducer(testState, {
        type: EmployeeActionType.CREATE_SUCCESS,
      });

      expect(state).toEqual(INITIAL_STATE);
    });

    describe("when the request fails", () => {
      it("marks the creation asyncAction as having errored", () => {
        const expectedAction = { state: "ERROR", error: expect.any(String) };

        expect(testState.createAction).not.toEqual(expectedAction);
        const state = reducer(testState, {
          type: EmployeeActionType.CREATE_FAIL,
        });

        expect(state).toEqual({ ...testState, createAction: expectedAction });
      });

      it("sets an error message on the creation asyncAction that matches a snapshot", () => {
        const state = reducer(testState, {
          type: EmployeeActionType.CREATE_FAIL,
        });

        expect(state.createAction.state).toEqual("ERROR");
        if (state.createAction.state === "ERROR") {
          expect(state.createAction.error).toMatchSnapshot();
        }
      });
    });
  });

  describe("saving an existing employee", () => {
    it("updates the update asyncAction when the request is started", () => {
      const expectedAction = { state: "PROGRESS" };
      testState.updateAction = { state: "INIT" };

      expect(testState.updateAction).not.toEqual(expectedAction);
      const state = reducer(testState, {
        type: EmployeeActionType.UPDATE_START,
      });

      expect(state).toEqual({ ...testState, updateAction: expectedAction });
    });

    it("resets the state when the request succeeds", () => {
      const state = reducer(testState, {
        type: EmployeeActionType.UPDATE_SUCCESS,
      });

      expect(state).toEqual(INITIAL_STATE);
    });

    describe("when the request fails", () => {
      it("marks the update asyncAction as having errored", () => {
        const expectedAction = { state: "ERROR", error: expect.any(String) };

        expect(testState.updateAction).not.toEqual(expectedAction);
        const state = reducer(testState, {
          type: EmployeeActionType.UPDATE_FAIL,
        });

        expect(state).toEqual({ ...testState, updateAction: expectedAction });
      });

      it("sets an error message on the update asyncAction that matches a snapshot", () => {
        const state = reducer(testState, {
          type: EmployeeActionType.UPDATE_FAIL,
        });

        expect(state.updateAction.state).toEqual("ERROR");
        if (state.updateAction.state === "ERROR") {
          expect(state.updateAction.error).toMatchSnapshot();
        }
      });
    });
  });

  describe("firing an employee", () => {
    describe("when the request starts", () => {
      it("updates the 'fire employee' asyncAction when the request is started", () => {
        const expectedAction = { state: "PROGRESS" };
        testState.fireAction = { state: "INIT" };

        expect(testState.fireAction).not.toEqual(expectedAction);
        const state = reducer(testState, {
          type: EmployeeActionType.FIRE_START,
        });

        expect(state).toEqual({
          ...testState,
          fireAction: expectedAction,
          fireModalShown: expect.any(Boolean),
        });
      });

      it("closes the fire employee modal", () => {
        const state = reducer(testState, {
          type: EmployeeActionType.FIRE_START,
        });

        expect(state).toEqual({
          ...testState,
          fireAction: expect.any(Object),
          fireModalShown: false,
        });
      });
    });

    it("resets the state when the request succeeds", () => {
      const state = reducer(testState, {
        type: EmployeeActionType.FIRE_SUCCESS,
      });

      expect(state).toEqual(INITIAL_STATE);
    });

    describe("when the request fails", () => {
      it("marks the 'fire employee' asyncAction as having errored", () => {
        const expectedAction = { state: "ERROR", error: expect.any(String) };

        expect(testState.fireAction).not.toEqual(expectedAction);
        const state = reducer(testState, {
          type: EmployeeActionType.FIRE_FAIL,
        });

        expect(state).toEqual({ ...testState, fireAction: expectedAction });
      });

      it("sets an error message on the 'fire employee' asyncAction that matches a snapshot", () => {
        const state = reducer(testState, {
          type: EmployeeActionType.FIRE_FAIL,
        });

        expect(state.fireAction.state).toEqual("ERROR");
        if (state.fireAction.state === "ERROR") {
          expect(state.fireAction.error).toMatchSnapshot();
        }
      });
    });
  });
});
