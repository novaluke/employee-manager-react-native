import "jest-enzyme";

import firebase from "firebase";
import { Observable, of } from "rxjs";

import {
  EmployeesAction,
  EmployeesActionType,
  employeesSubscriptionEpic,
  unwatchEmployees,
  watchEmployees,
} from "../../../src/store/Employees";

describe("watchEmployees", () => {
  it("creates the watch start action", () => {
    expect(watchEmployees()).toEqual({
      type: EmployeesActionType.WATCH_START,
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

describe("subscription epic", () => {
  const on = jest.fn();
  const off = jest.fn();
  const ref = jest.fn(() => ({ on, off }));
  beforeEach(() => {
    (firebase.database as any).mockImplementation(() => ({ ref }));
  });

  describe("when logged in", () => {
    const user = { uid: "uid1" };
    beforeEach(() => {
      (firebase.auth as any).mockImplementation(() => ({ currentUser: user }));
    });

    it("subscribes to firebase when WATCH_START is dispatched", () => {
      const action$ = of(watchEmployees());
      const refString = `/users/${user.uid}/employees`;

      employeesSubscriptionEpic(action$).subscribe(jest.fn());

      expect(ref).toHaveBeenCalledTimes(1);
      expect(ref).toHaveBeenCalledWith(refString);

      expect(on).toHaveBeenCalledTimes(1);
      expect(on).toHaveBeenCalledWith("value", expect.any(Function));
    });

    describe("after subscribing", () => {
      it("dispatches EMPLOYEES_FETCHED when firebase emits data", () => {
        const action$ = of(watchEmployees());
        const data = { foo: "bar" };
        const stubbedSnapshot = { val: () => data };
        let handler: any;
        /* eslint-disable-next-line no-return-assign */
        on.mockImplementation((_, callback) => (handler = callback));

        let lastValue = null;
        /* eslint-disable-next-line no-return-assign */
        employeesSubscriptionEpic(action$).subscribe(val => (lastValue = val));
        expect(lastValue).toBe(null);

        handler!(stubbedSnapshot);
        expect(lastValue).toEqual({
          payload: data,
          type: EmployeesActionType.EMPLOYEES_FETCHED,
        });
      });

      it("unsubscribes when UNSUBSCRIBE is dispatched", () => {
        const action$ = of(watchEmployees(), unwatchEmployees());
        let handler: any;
        /* eslint-disable-next-line no-return-assign */
        on.mockImplementation((_, callback) => (handler = callback));

        employeesSubscriptionEpic(action$).subscribe(jest.fn());

        expect(off).toHaveBeenCalledTimes(1);
        expect(off).toHaveBeenCalledWith("value", handler);
      });

      it("replaces the original subscription when WATCH_START is dispatched again", () => {
        const action$ = of(watchEmployees(), watchEmployees());

        employeesSubscriptionEpic(action$).subscribe(jest.fn());

        expect(on).toHaveBeenCalledTimes(2);
        expect(off).toHaveBeenCalledTimes(1);
        expect(off).toHaveBeenCalledWith("value", on.mock.calls[0][1]);
      });

      describe("after unsubscribing", () => {
        it("resubscribes when WATCH_START is dispatched again", () => {
          const action$: Observable<EmployeesAction> = of(
            watchEmployees(),
            unwatchEmployees(),
            watchEmployees(),
          );

          employeesSubscriptionEpic(action$).subscribe(jest.fn());

          expect(on).toHaveBeenCalledTimes(2);
        });
      });
    });
  });

  describe("when not logged in", () => {
    beforeEach(() => {
      (firebase.auth as any).mockImplementation(() => ({ currentUser: null }));
    });

    it("doesn't subscribe to firebase when WATCH_START is dispatched", () => {
      const action$ = of(watchEmployees());

      employeesSubscriptionEpic(action$).subscribe(jest.fn());

      expect(on).not.toHaveBeenCalled();
    });
  });
});
