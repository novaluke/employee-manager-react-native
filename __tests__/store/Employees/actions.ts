import "jest-enzyme";

import firebase from "firebase";
import { NavigationScreenProp } from "react-navigation";

import { stubNavigation } from "../../helpers/react-navigation";

import {
  EmployeesActionType,
  unwatchEmployees,
  watchEmployees,
} from "../../../src/store/Employees";

describe("Employees actions", () => {
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
        on.mockImplementation((_, callback) => callback);

        watchEmployees(navigation)(dispatch);
        const watchingFunc = on.mock.calls[0][1];

        // unsubscribe is called by the mock dispatch as soon as the action is
        // dispatched
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
