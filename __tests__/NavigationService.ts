import "jest-enzyme";

import { NavigationActions } from "react-navigation";

import { navigate, setNavigation } from "../src/NavigationService";

beforeEach(() => {
  jest.resetAllMocks();
});

describe("NavigationService", () => {
  describe("`navigate`", () => {
    describe("before `setNavigation` is called", () => {
      let freshModule: any;
      // Need to use require to get a fresh copy of the module or else
      // another test may have already set the navigator before getting here
      beforeEach(() => {
        /* eslint-disable-next-line global-require */
        freshModule = require("../src/NavigationService");
      });

      it("does not throw an error", () => {
        expect(() => freshModule.navigate("foo", "bar")).not.toThrow();
      });
    });

    describe("after the navigator has been set", () => {
      const mockDispatch = jest.fn();
      const navigatorComponent = { dispatch: mockDispatch };
      beforeEach(() => {
        setNavigation(navigatorComponent as any);
      });

      it("dispatches a navigate action with the given routeName and params", () => {
        const routeName = "login";
        const params = { foo: "foo" };
        const expectedAction = NavigationActions.navigate({
          params,
          routeName,
        });

        navigate(routeName, params);

        expect(mockDispatch).toHaveBeenCalledTimes(1);
        expect(mockDispatch).toHaveBeenCalledWith(expectedAction);
      });
    });
  });
});
