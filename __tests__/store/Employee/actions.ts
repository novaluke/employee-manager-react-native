import "jest-enzyme";

import firebase from "firebase";
import { of } from "rxjs";
import { marbles } from "rxjs-marbles/jest";
import { toArray } from "rxjs/operators";

import { Action } from "../../../src/store/common/Async";
import {
  closeFireModal,
  createEmployee,
  createEmployeeEpic,
  editEmployee,
  EmployeeAction,
  EmployeeActionType,
  fireEmployee,
  fireEmployeeEpic,
  IEmployee,
  resetForm,
  ShiftDay,
  showFireModal,
  updateEmployee,
  updateEmployeeEpic,
  updateField,
} from "../../../src/store/Employee";

import { navigate } from "../../../src/NavigationService";

jest.mock("../../../src/NavigationService");

beforeEach(() => {
  jest.resetAllMocks();
});

describe("createEmployeeEpic", () => {
  let testAction: EmployeeAction;
  let newEmployee: IEmployee<null>;
  const mockUser = { uid: "uid1" };
  const mockPush = jest.fn();
  const mockRef = jest.fn();
  beforeEach(() => {
    newEmployee = {
      employeeName: "Taylor",
      phone: "555-5555",
      shift: ShiftDay.Friday,
      uid: null,
    };
    testAction = createEmployee(newEmployee);
    (firebase.database as any).mockImplementation(() => ({ ref: mockRef }));
    mockRef.mockImplementation(() => ({ push: mockPush }));
    mockPush.mockImplementation(() => new Promise(() => null));
  });

  describe("when not logged in", () => {
    beforeEach(() => {
      (firebase.auth as any).mockImplementation(() => ({ currentUser: null }));
    });

    it(
      "emits no actions",
      marbles(m => {
        const values = {
          a: testAction,
        };
        const action$ = m.cold("-a-|", values);
        const expected$ = "---|";

        m.expect(createEmployeeEpic(action$)).toBeObservable(expected$);
      }),
    );

    it("does not attempt to create the employee", () => {
      const action$ = of(testAction);

      createEmployeeEpic(action$).subscribe(jest.fn());

      expect(mockPush).not.toHaveBeenCalled();
    });

    it("redirects to the Auth route", () => {
      const action$ = of(testAction);

      createEmployeeEpic(action$).subscribe(jest.fn());

      expect(navigate).toHaveBeenCalledWith("Auth");
    });
  });

  describe("when logged in", () => {
    beforeEach(() => {
      (firebase.auth as any).mockImplementation(() => ({
        currentUser: mockUser,
      }));
    });

    describe("after CREATE_EMPLOYEE is dispatched", () => {
      it(
        "emits the creation request started action",
        marbles(m => {
          const values = {
            a: testAction,
            b: {
              payload: Action.start(),
              type: EmployeeActionType.CREATE_ACTION,
            } as EmployeeAction,
          };
          const action$ = m.cold("  -a-", values);
          const expected$ = m.cold("-b-", values);

          m.expect(createEmployeeEpic(action$)).toBeObservable(expected$);
        }),
      );

      it("sends a request to create the employee in firebase", () => {
        const action$ = of(testAction);

        createEmployeeEpic(action$).subscribe(jest.fn());

        expect(mockRef).toHaveBeenCalledTimes(1);
        expect(mockRef).toHaveBeenCalledWith(
          `/users/${mockUser.uid}/employees`,
        );

        expect(mockPush).toHaveBeenCalledTimes(1);
        expect(mockPush).toHaveBeenCalledWith(newEmployee);
      });

      describe("when creation is successful", () => {
        beforeEach(() => {
          mockPush.mockImplementation(() => Promise.resolve());
        });

        it("emits the creation successful action", done => {
          const action$ = of(testAction);
          const resultAction: EmployeeAction = {
            payload: Action.success(null),
            type: EmployeeActionType.CREATE_ACTION,
          };

          createEmployeeEpic(action$)
            .pipe(toArray())
            .subscribe(emitted => {
              expect(emitted).toContainEqual(resultAction);
              done();
            });
        });

        it("navigates to the employee list route", done => {
          const action$ = of(testAction);

          createEmployeeEpic(action$).subscribe({
            complete: () => {
              expect(navigate).toHaveBeenCalledWith("EmployeeList");
              done();
            },
          });
        });
      });

      describe("when creation fails", () => {
        beforeEach(() => {
          mockPush.mockImplementation(() => Promise.reject());
        });

        it("emits the creation failed action", done => {
          const action$ = of(testAction);
          const resultAction: EmployeeAction = {
            payload: Action.failure(expect.any(String)),
            type: EmployeeActionType.CREATE_ACTION,
          };

          createEmployeeEpic(action$)
            .pipe(toArray())
            .subscribe(emitted => {
              expect(emitted).toContainEqual(resultAction);
              done();
            });
        });
      });
    });
  });
});

describe("updateEmployeeEpic", () => {
  let testAction: EmployeeAction;
  let testEmployee: IEmployee<string>;
  const mockUser = { uid: "uid1" };
  const mockSet = jest.fn();
  const mockRef = jest.fn();
  beforeEach(() => {
    testEmployee = {
      employeeName: "Taylor",
      phone: "555-5555",
      shift: ShiftDay.Friday,
      uid: "uid1",
    };
    testAction = updateEmployee(testEmployee);
    (firebase.database as any).mockImplementation(() => ({ ref: mockRef }));
    mockRef.mockImplementation(() => ({ set: mockSet }));
    mockSet.mockImplementation(() => new Promise(() => null));
  });

  describe("when not logged in", () => {
    beforeEach(() => {
      (firebase.auth as any).mockImplementation(() => ({ currentUser: null }));
    });

    it(
      "emits no actions",
      marbles(m => {
        const values = {
          a: testAction,
        };
        const action$ = m.cold("-a-|", values);
        const expected$ = "---|";

        m.expect(updateEmployeeEpic(action$)).toBeObservable(expected$);
      }),
    );

    it("does not attempt to save the employee", () => {
      const action$ = of(testAction);

      updateEmployeeEpic(action$).subscribe(jest.fn());

      expect(mockSet).not.toHaveBeenCalled();
    });

    it("redirects to the Auth route", () => {
      const action$ = of(testAction);

      updateEmployeeEpic(action$).subscribe(jest.fn());

      expect(navigate).toHaveBeenCalledWith("Auth");
    });
  });

  describe("when logged in", () => {
    beforeEach(() => {
      (firebase.auth as any).mockImplementation(() => ({
        currentUser: mockUser,
      }));
    });

    describe("after UPDATE_EMPLOYEE is dispatched", () => {
      it(
        "emits the update request started action",
        marbles(m => {
          const values = {
            a: testAction,
            b: {
              payload: Action.start(),
              type: EmployeeActionType.UPDATE_ACTION,
            } as EmployeeAction,
          };
          const action$ = m.cold("  -a-", values);
          const expected$ = m.cold("-b-", values);

          m.expect(updateEmployeeEpic(action$)).toBeObservable(expected$);
        }),
      );

      it("sends a request to save the employee in firebase", () => {
        const action$ = of(testAction);
        const { uid, ...employee } = testEmployee;

        updateEmployeeEpic(action$).subscribe(jest.fn());

        expect(mockRef).toHaveBeenCalledTimes(1);
        expect(mockRef).toHaveBeenCalledWith(
          `/users/${mockUser.uid}/employees/${uid}`,
        );

        expect(mockSet).toHaveBeenCalledTimes(1);
        expect(mockSet).toHaveBeenCalledWith(employee);
      });

      describe("when updating is successful", () => {
        beforeEach(() => {
          mockSet.mockImplementation(() => Promise.resolve());
        });

        it("emits the update successful action", done => {
          const action$ = of(testAction);
          const resultAction: EmployeeAction = {
            payload: Action.success(null),
            type: EmployeeActionType.UPDATE_ACTION,
          };

          updateEmployeeEpic(action$)
            .pipe(toArray())
            .subscribe(emitted => {
              expect(emitted).toContainEqual(resultAction);
              done();
            });
        });

        it("navigates to the employee list route", done => {
          const action$ = of(testAction);

          updateEmployeeEpic(action$).subscribe({
            complete: () => {
              expect(navigate).toHaveBeenCalledWith("EmployeeList");
              done();
            },
          });
        });
      });

      describe("when updating fails", () => {
        beforeEach(() => {
          mockSet.mockImplementation(() => Promise.reject());
        });

        it("emits the update failed action", done => {
          const action$ = of(testAction);
          const resultAction: EmployeeAction = {
            payload: Action.failure(expect.any(String)),
            type: EmployeeActionType.UPDATE_ACTION,
          };

          updateEmployeeEpic(action$)
            .pipe(toArray())
            .subscribe(emitted => {
              expect(emitted).toContainEqual(resultAction);
              done();
            });
        });
      });
    });
  });
});

describe("fireEmployeeEpic", () => {
  let testAction: EmployeeAction;
  const employeeUid = "uid1";
  const mockUser = { uid: "uid1" };
  const mockRemove = jest.fn();
  const mockRef = jest.fn();
  beforeEach(() => {
    testAction = fireEmployee(employeeUid);
    (firebase.database as any).mockImplementation(() => ({ ref: mockRef }));
    mockRef.mockImplementation(() => ({ remove: mockRemove }));
    mockRemove.mockImplementation(() => new Promise(() => null));
  });

  describe("when not logged in", () => {
    beforeEach(() => {
      (firebase.auth as any).mockImplementation(() => ({ currentUser: null }));
    });

    it(
      "emits no actions",
      marbles(m => {
        const values = {
          a: testAction,
        };
        const action$ = m.cold("-a-|", values);
        const expected$ = "---|";

        m.expect(fireEmployeeEpic(action$)).toBeObservable(expected$);
      }),
    );

    it("does not attempt to fire the employee", () => {
      const action$ = of(testAction);

      fireEmployeeEpic(action$).subscribe(jest.fn());

      expect(mockRemove).not.toHaveBeenCalled();
    });

    it("redirects to the Auth route", () => {
      const action$ = of(testAction);

      fireEmployeeEpic(action$).subscribe(jest.fn());

      expect(navigate).toHaveBeenCalledWith("Auth");
    });
  });

  describe("when logged in", () => {
    beforeEach(() => {
      (firebase.auth as any).mockImplementation(() => ({
        currentUser: mockUser,
      }));
    });

    describe("after FIRE_EMPLOYEE is dispatched", () => {
      it(
        "emits the fire request started action",
        marbles(m => {
          const values = {
            a: testAction,
            b: {
              payload: Action.start(),
              type: EmployeeActionType.FIRE_ACTION,
            } as EmployeeAction,
          };
          const action$ = m.cold("  -a-", values);
          const expected$ = m.cold("-b-", values);

          m.expect(fireEmployeeEpic(action$)).toBeObservable(expected$);
        }),
      );

      it("sends a request to remove the employee from firebase", () => {
        const action$ = of(testAction);

        fireEmployeeEpic(action$).subscribe(jest.fn());

        expect(mockRef).toHaveBeenCalledTimes(1);
        expect(mockRef).toHaveBeenCalledWith(
          `/users/${mockUser.uid}/employees/${employeeUid}`,
        );

        expect(mockRemove).toHaveBeenCalledTimes(1);
      });

      describe("when removal is successful", () => {
        beforeEach(() => {
          mockRemove.mockImplementation(() => Promise.resolve());
        });

        it("emits the fire successful action", done => {
          const action$ = of(testAction);
          const resultAction: EmployeeAction = {
            payload: Action.success(null),
            type: EmployeeActionType.FIRE_ACTION,
          };

          fireEmployeeEpic(action$)
            .pipe(toArray())
            .subscribe(emitted => {
              expect(emitted).toContainEqual(resultAction);
              done();
            });
        });

        it("navigates to the employee list route", done => {
          const action$ = of(testAction);

          fireEmployeeEpic(action$).subscribe({
            complete: () => {
              expect(navigate).toHaveBeenCalledWith("EmployeeList");
              done();
            },
          });
        });
      });

      describe("when removal fails", () => {
        beforeEach(() => {
          mockRemove.mockImplementation(() => Promise.reject());
        });

        it("emits the fire failed action", done => {
          const action$ = of(testAction);
          const resultAction: EmployeeAction = {
            payload: Action.failure(expect.any(String)),
            type: EmployeeActionType.FIRE_ACTION,
          };

          fireEmployeeEpic(action$)
            .pipe(toArray())
            .subscribe(emitted => {
              expect(emitted).toContainEqual(resultAction);
              done();
            });
        });
      });
    });
  });
});

describe("Employee actions", () => {
  let testEmployee: IEmployee<string>;
  beforeEach(() => {
    testEmployee = {
      employeeName: "Taylor",
      phone: "555-5555",
      shift: ShiftDay.Friday,
      uid: "uid1",
    };
  });

  describe("updateField", () => {
    it("creates a field update action with the field name and value as payload", () => {
      const field = "employeeName";
      const value = testEmployee[field];

      expect(updateField({ field, value })).toEqual({
        payload: { field, value },
        type: EmployeeActionType.UPDATE_FIELD,
      });
    });
  });

  describe("createEmployee", () => {
    it("creates the action to create the given employee", () => {
      const employee = { ...testEmployee, uid: null };
      const expectedAction = {
        payload: employee,
        type: EmployeeActionType.CREATE_EMPLOYEE,
      };
      expect(createEmployee(employee)).toEqual(expectedAction);
    });
  });

  describe("editEmployee", () => {
    const runAction = (employee: IEmployee<string>) =>
      editEmployee(employee);

    it("creates the edit action with the employee as payload", () => {
      expect(runAction(testEmployee)).toEqual({
        payload: testEmployee,
        type: EmployeeActionType.EDIT,
      });
    });

    it("navigates to the edit employee route with the employee name as params", () => {
      const { employeeName } = testEmployee;

      runAction(testEmployee);

      expect(navigate).toHaveBeenCalledTimes(1);
      expect(navigate).toHaveBeenCalledWith("EditEmployee", {
        employeeName,
      });
    });
  });

  describe("resetForm", () => {
    it("creates the form reset action", () => {
      expect(resetForm()).toEqual({ type: EmployeeActionType.RESET });
    });
  });

  describe("updateEmployee", () => {
    it("creates the action to update the given employee", () => {
      const expectedAction = {
        payload: testEmployee,
        type: EmployeeActionType.UPDATE_EMPLOYEE,
      };
      expect(updateEmployee(testEmployee)).toEqual(expectedAction);
    });
  });

  describe("showFireModal", () => {
    it("creates an action to show the fire employee confirmation modal", () => {
      expect(showFireModal()).toEqual({
        type: EmployeeActionType.SHOW_MODAL,
      });
    });
  });

  describe("closeFireModal", () => {
    it("creates an action to close the fire employee confirmation modal", () => {
      expect(closeFireModal()).toEqual({
        type: EmployeeActionType.CLOSE_MODAL,
      });
    });
  });

  describe("fireEmployee", () => {
    it("creates the action to fire the employee with the given uid", () => {
      const { uid } = testEmployee;
      const expectedAction = {
        payload: uid,
        type: EmployeeActionType.FIRE_EMPLOYEE,
      };
      expect(fireEmployee(uid)).toEqual(expectedAction);
    });
  });
});
