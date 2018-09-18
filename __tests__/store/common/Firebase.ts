import "jest-enzyme";

import firebase from "firebase";
import { toArray } from "rxjs/operators";

import {
  firebaseOn,
  firebasePush,
  firebaseSet,
} from "../../../src/store/common/Firebase";

beforeEach(() => {
  jest.resetAllMocks();
});

describe("firebase helpers", () => {
  describe("firebaseOn", () => {
    const mockRef = jest.fn();
    const mockOn = jest.fn();
    const mockOff = jest.fn();
    const refPath = "foo";
    const eventType = "child_added";
    beforeEach(() => {
      (firebase.database as any).mockImplementation(() => ({ ref: mockRef }));
      mockRef.mockImplementation(() => ({ on: mockOn, off: mockOff }));
      mockOn.mockImplementation(() => new Promise(() => null));
    });

    describe("when subscribed to", () => {
      it("subscribes to the given refPath and eventType", () => {
        firebaseOn(refPath, eventType).subscribe(jest.fn());

        expect(mockRef).toHaveBeenCalledTimes(1);
        expect(mockRef).toHaveBeenCalledWith(refPath);

        expect(mockOn).toHaveBeenCalledTimes(1);
        expect(mockOn).toHaveBeenCalledWith(eventType, expect.any(Function));
      });
    });

    describe("when unsubscribed from", () => {
      it("unsubscribes from firebase", () => {
        const subscription = firebaseOn(refPath, eventType).subscribe(
          jest.fn(),
        );
        expect(mockOff).not.toHaveBeenCalled();

        subscription.unsubscribe();

        expect(mockOff).toHaveBeenCalledTimes(1);
        const onHandlers = mockOn.mock.calls.map(args => args[1]);
        const offHandlers = mockOff.mock.calls.map(args => args[1]);
        expect(onHandlers).toEqual(offHandlers);
      });
    });

    it("emits values from `on`", () => {
      const firstItem = { name: "foo" };
      const secondItem = { name: "bar" };
      function snapshot<T>(item: T) {
        return { val: () => item };
      }
      const results: Array<typeof firstItem> = [];

      firebaseOn(refPath, eventType).subscribe(x => results.push(x));

      const returnHandler = mockOn.mock.calls[0][1];
      returnHandler(snapshot(firstItem));
      returnHandler(snapshot(secondItem));

      expect(results).toEqual([firstItem, secondItem]);
    });
  });

  describe("firebasePush", () => {
    const mockRef = jest.fn();
    const mockPush = jest.fn();
    const refPath = "foo";
    const payload = { foo: "foo" };
    let resolvePush: (x: any) => void;
    let rejectPush: (x: any) => void;
    beforeEach(() => {
      (firebase.database as any).mockImplementation(() => ({ ref: mockRef }));
      mockRef.mockImplementation(() => ({ push: mockPush }));
      mockPush.mockImplementation(
        () =>
          new Promise((resolve, reject) => {
            resolvePush = resolve;
            rejectPush = reject;
          }),
      );
    });

    describe("when subscribed to", () => {
      it("pushes the payload to the firebase refPath", () => {
        firebasePush(refPath, payload).subscribe(jest.fn());

        expect(mockRef).toHaveBeenCalledTimes(1);
        expect(mockRef).toHaveBeenCalledWith(refPath);

        expect(mockPush).toHaveBeenCalledTimes(1);
        expect(mockPush).toHaveBeenCalledWith(payload);
      });

      describe("when push is successful", () => {
        it("emits the result", done => {
          const result = { bar: "bar" };
          firebasePush(refPath, payload)
            .pipe(toArray())
            .subscribe(results => {
              expect(results).toEqual([result]);
              done();
            });
          resolvePush(result);
        });

        it("completes the stream", done => {
          // No expectations here since the only requirement is that it reaches
          // `done` - if it doesn't, it will fail due to timeout
          firebasePush(refPath, payload)
            .toPromise()
            .then(done);

          resolvePush(null);
        });
      });

      describe("when push is unsuccessful", () => {
        it("emits the error from push", done => {
          const error = { reason: "For science!" };

          firebasePush(refPath, payload).subscribe({
            error: e => {
              expect(e).toBe(error);
              done();
            },
          });

          rejectPush(error);
        });
      });
    });
  });

  describe("firebaseSet", () => {
    const mockRef = jest.fn();
    const mockSet = jest.fn();
    const refPath = "foo";
    const payload = { foo: "foo" };
    let resolveSet: (x: any) => void;
    let rejectSet: (x: any) => void;
    beforeEach(() => {
      (firebase.database as any).mockImplementation(() => ({ ref: mockRef }));
      mockRef.mockImplementation(() => ({ set: mockSet }));
      mockSet.mockImplementation(
        () =>
          new Promise((resolve, reject) => {
            resolveSet = resolve;
            rejectSet = reject;
          }),
      );
    });

    describe("when subscribed to", () => {
      it("sets the payload at the firebase refPath", () => {
        firebaseSet(refPath, payload).subscribe(jest.fn());

        expect(mockRef).toHaveBeenCalledTimes(1);
        expect(mockRef).toHaveBeenCalledWith(refPath);

        expect(mockSet).toHaveBeenCalledTimes(1);
        expect(mockSet).toHaveBeenCalledWith(payload);
      });

      describe("when set is successful", () => {
        it("emits the result", done => {
          const result = { bar: "bar" };
          firebaseSet(refPath, payload)
            .pipe(toArray())
            .subscribe(results => {
              expect(results).toEqual([result]);
              done();
            });
          resolveSet(result);
        });

        it("completes the stream", done => {
          // No expectations here since the only requirement is that it reaches
          // `done` - if it doesn't, it will fail due to timeout
          firebaseSet(refPath, payload)
            .toPromise()
            .then(done);

          resolveSet(null);
        });
      });

      describe("when set is unsuccessful", () => {
        it("emits the error from set", done => {
          const error = { reason: "For science!" };

          firebaseSet(refPath, payload).subscribe({
            error: e => {
              expect(e).toBe(error);
              done();
            },
          });

          rejectSet(error);
        });
      });
    });
  });
});
