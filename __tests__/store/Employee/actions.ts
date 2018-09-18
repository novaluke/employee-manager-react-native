import "jest-enzyme";

import firebase from "firebase";
import { NavigationScreenProp } from "react-navigation";
import { of } from "rxjs";
import { marbles } from "rxjs-marbles/jest";
import { toArray } from "rxjs/operators";

import { stubNavigation } from "../../helpers/react-navigation";

import { Action } from "../../../src/store/common/Async";
import {
  closeFireModal,
  createEmployee,
  createEmployeeEpic,
  editEmployee,
  EmployeeAction,
  EmployeeActionType,
  fireEmployee,
  IEmployee,
  resetForm,
  ShiftDay,
  showFireModal,
  updateEmployee,
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

describe("Employee actions", () => {
  let testEmployee: IEmployee<string>;
  let newEmployee: IEmployee<string>;
  let navigation: NavigationScreenProp<any>;
  let user: { uid: string };
  const dispatch = jest.fn();
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
    navigation = stubNavigation();
    user = { uid: "uid1" };
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
      editEmployee(employee, navigation)(dispatch);

    it("dispatches the edit action with the employee as payload", () => {
      runAction(testEmployee);

      expect(dispatch).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledWith({
        payload: testEmployee,
        type: EmployeeActionType.EDIT,
      });
    });

    it("navigates to the edit employee route with the employee name as params", () => {
      const { employeeName } = testEmployee;

      runAction(testEmployee);

      expect(navigation.navigate).toHaveBeenCalledTimes(1);
      expect(navigation.navigate).toHaveBeenCalledWith("EditEmployee", {
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
    const runAction = (employee = testEmployee) =>
      updateEmployee(employee, navigation)(dispatch);

    describe("when not logged in", () => {
      it("redirects to the Auth route", () => {
        (firebase.auth as any).mockImplementation(() => ({
          currentUser: null,
        }));

        expect(navigation.navigate).not.toHaveBeenCalled();
        runAction();

        expect(navigation.navigate).toHaveBeenCalledTimes(1);
        expect(navigation.navigate).toHaveBeenCalledWith("Auth");
      });
    });

    describe("when logged in", () => {
      const set = jest.fn();
      const ref = jest.fn();
      beforeEach(() => {
        (firebase.auth as any).mockImplementation(() => ({
          currentUser: user,
        }));
        (firebase.database as any).mockImplementation(() => ({ ref }));
        ref.mockImplementation(() => ({ set }));
      });

      it("dispatches the update started action", () => {
        // Assuming the dispatch is synchronous and the test can therefore be
        // done without waiting for the Promise would couple the test too
        // tightly, so the promise has to be completed one way or another before
        // checking the dispatch (even though it doesn't matter if it resolves
        // or rejects)
        set.mockImplementation(() => Promise.resolve());

        return runAction().then(() => {
          expect(dispatch).toHaveBeenCalledWith({
            payload: Action.start(),
            type: EmployeeActionType.UPDATE_ACTION,
          });
        });
      });

      it("updates the employee in firebase", () => {
        const { uid, ...data } = newEmployee;
        const refString = `/users/${user.uid}/employees/${uid}`;
        set.mockImplementation(() => Promise.resolve());

        expect(ref).not.toHaveBeenCalled();
        expect(set).not.toHaveBeenCalled();

        return runAction(newEmployee).then(() => {
          expect(ref).toHaveBeenCalledTimes(1);
          expect(ref).toHaveBeenCalledWith(refString);

          expect(set).toHaveBeenCalledTimes(1);
          expect(set).toHaveBeenCalledWith(data);
        });
      });

      describe("when updating succeeds", () => {
        beforeEach(() => {
          set.mockImplementation(() => Promise.resolve());
        });

        it("dispatches the update success action", () =>
          runAction().then(() => {
            expect(dispatch).toHaveBeenCalledWith({
              payload: Action.success(null),
              type: EmployeeActionType.UPDATE_ACTION,
            });
          }));

        it("navigates to the employee list", () =>
          runAction().then(() => {
            expect(navigation.navigate).toHaveBeenCalledTimes(1);
            expect(navigation.navigate).toHaveBeenCalledWith("EmployeeList");
          }));
      });

      describe("when updating fails", () => {
        it("dispatches the update failure action", () => {
          set.mockImplementation(() => Promise.reject());

          return runAction().then(() => {
            expect(dispatch).toHaveBeenCalledWith({
              payload: Action.failure(expect.any(String)),
              type: EmployeeActionType.UPDATE_ACTION,
            });
          });
        });
      });
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
    const runAction = (uid = "") => fireEmployee(uid, navigation)(dispatch);

    describe("when not logged in", () => {
      it("redirects to the Auth route", () => {
        (firebase.auth as any).mockImplementation(() => ({
          currentUser: null,
        }));

        expect(navigation.navigate).not.toHaveBeenCalled();
        runAction();

        expect(navigation.navigate).toHaveBeenCalledTimes(1);
        expect(navigation.navigate).toHaveBeenCalledWith("Auth");
      });
    });

    describe("when logged in", () => {
      const remove = jest.fn();
      const ref = jest.fn();
      beforeEach(() => {
        (firebase.auth as any).mockImplementation(() => ({
          currentUser: user,
        }));
        (firebase.database as any).mockImplementation(() => ({ ref }));
        ref.mockImplementation(() => ({ remove }));
      });

      it("dispatches the 'fire employee' started action", () => {
        // Assuming the dispatch is synchronous and the test can therefore be
        // done without waiting for the Promise would couple the test too
        // tightly, so the promise has to be completed one way or another before
        // checking the dispatch (even though it doesn't matter if it resolves
        // or rejects)
        remove.mockImplementation(() => Promise.resolve());

        return runAction().then(() => {
          expect(dispatch).toHaveBeenCalledWith({
            payload: Action.start(),
            type: EmployeeActionType.FIRE_ACTION,
          });
        });
      });

      it("deletes the employee from firebase", () => {
        const { uid } = testEmployee;
        const refString = `/users/${user.uid}/employees/${uid}`;
        remove.mockImplementation(() => Promise.resolve());

        expect(ref).not.toHaveBeenCalled();
        expect(remove).not.toHaveBeenCalled();

        return runAction(uid).then(() => {
          expect(ref).toHaveBeenCalledTimes(1);
          expect(ref).toHaveBeenCalledWith(refString);
          expect(remove).toHaveBeenCalledTimes(1);
        });
      });

      describe("when firing succeeds", () => {
        beforeEach(() => {
          remove.mockImplementation(() => Promise.resolve());
        });

        it("dispatches the 'fire employee' success action", () =>
          runAction().then(() => {
            expect(dispatch).toHaveBeenCalledWith({
              payload: Action.success(null),
              type: EmployeeActionType.FIRE_ACTION,
            });
          }));

        it("navigates to the employee list", () =>
          runAction().then(() => {
            expect(navigation.navigate).toHaveBeenCalledTimes(1);
            expect(navigation.navigate).toHaveBeenCalledWith("EmployeeList");
          }));
      });

      describe("when firing fails", () => {
        it("dispatches the 'fire employee' failure action", () => {
          remove.mockImplementation(() => Promise.reject());

          return runAction().then(() => {
            expect(dispatch).toHaveBeenCalledWith({
              payload: Action.failure(expect.any(String)),
              type: EmployeeActionType.FIRE_ACTION,
            });
          });
        });
      });
    });
  });
});
