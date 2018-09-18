import "jest-enzyme";

import firebase from "firebase";

import { firebaseOn } from "../../../src/store/common/Firebase";

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
});
