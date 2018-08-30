import "jest-enzyme";
import React from "react";

import { shallow } from "enzyme";
import firebase from "firebase";
import { NavigationScreenProp } from "react-navigation";

import { stubNavigation } from "../helpers/react-navigation";

import InitializingScreen, {
  IProps,
} from "../../src/components/InitializingScreen";

describe("InitializingScreen", () => {
  let stubbedNavigation: NavigationScreenProp<any>;
  let stubbedProps: IProps;
  beforeEach(() => {
    stubbedNavigation = stubNavigation();
    stubbedProps = {
      navigation: stubbedNavigation,
    };
  });

  describe("when mounted", () => {
    it("subscribes to onAuthStateChanged", () => {
      const onAuthStub = jest.fn();
      firebase.auth.mockImplementation(() => ({
        onAuthStateChanged: onAuthStub,
      }));

      shallow(<InitializingScreen {...stubbedProps} />);

      expect(onAuthStub).toHaveBeenCalledTimes(1);
    });
  });

  describe("when unmounted", () => {
    it("unsubscribes from onAuthStateChanged", () => {
      const unsubscribeStub = jest.fn();
      firebase.auth.mockImplementation(() => ({
        onAuthStateChanged: () => unsubscribeStub,
      }));

      const wrapper = shallow(<InitializingScreen {...stubbedProps} />);
      wrapper.unmount();

      expect(unsubscribeStub).toHaveBeenCalledTimes(1);
    });
  });

  describe("when auth state changes", () => {
    let onAuthCallback = (user: any) => user; // no-op
    beforeEach(() => {
      firebase.auth.mockImplementation(() => ({
        /* eslint-disable-next-line no-return-assign */
        onAuthStateChanged: (callback: any) => (onAuthCallback = callback),
      }));

      shallow(<InitializingScreen {...stubbedProps} />);
    });

    it("navigates to Main if logged in", () => {
      onAuthCallback({ userId: 1 });

      expect(stubbedNavigation.navigate).toHaveBeenCalledTimes(1);
      expect(stubbedNavigation.navigate).toHaveBeenCalledWith("Main");
    });

    it("navigates to Auth if not logged in", () => {
      onAuthCallback(null);

      expect(stubbedNavigation.navigate).toHaveBeenCalledTimes(1);
      expect(stubbedNavigation.navigate).toHaveBeenCalledWith("Auth");
    });
  });

  it("renders a spinner", () => {
    const wrapper = shallow(<InitializingScreen {...stubbedProps} />);
    expect(wrapper.find("Spinner").length).toBe(1);
  });
});
