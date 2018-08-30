import "jest-enzyme";
import React from "react";

import { Text } from "react-native";

import { shallow } from "enzyme";

import {
  AsyncButton,
  Button,
  Spinner,
  SpinnerSize,
} from "../../../src/components/common";
import { Async } from "../../../src/store";

describe("AsyncButton", () => {
  const defProps = {
    asyncAction: { state: "INIT" },
    label: "Click me",
    onPress: jest.fn(),
    size: SpinnerSize.Small,
  };
  const mkWrapper = (propOverrides?: any) => {
    const props = { ...defProps, ...propOverrides };
    return shallow(<AsyncButton {...props} />);
  };

  describe("when asyncAction is 'INIT'", () => {
    let wrapper: any;
    beforeEach(() => {
      wrapper = mkWrapper();
    });

    describe("the rendered button", () => {
      it("triggers AsyncButton's `onPress` on press", () => {
        const { onPress } = defProps;
        expect(onPress).not.toHaveBeenCalled();

        wrapper.find(Button).simulate("press");

        expect(onPress).toHaveBeenCalled();
      });

      it("uses AsyncButton's `label` as the Button text", () => {
        expect(
          wrapper
            .find(Button)
            .children()
            .text(),
        ).toEqual(defProps.label);
      });
    });

    it("doesn't show a spinner", () => {
      expect(wrapper.find(Spinner).exists()).toBe(false);
    });

    it("doesn't show an error", () => {
      expect(wrapper.find(Text).exists()).toBe(false);
    });
  });

  describe("when asyncAction is 'PROGRESS'", () => {
    let wrapper: any;
    beforeEach(() => {
      wrapper = mkWrapper({ asyncAction: { state: "PROGRESS" } });
    });

    it("doesn't show the button", () => {
      expect(wrapper.find(Button).exists()).toBe(false);
    });

    it("doesn't show the error", () => {
      expect(wrapper.find(Text).exists()).toBe(false);
    });

    it("shows a spinner with AsyncButton's `size` prop", () => {
      expect(wrapper.find(Spinner).prop("size")).toEqual(defProps.size);
    });
  });

  describe("when asyncAction is 'ERROR'", () => {
    let wrapper: any;
    const errText = "Something went wrong!";
    beforeEach(() => {
      wrapper = mkWrapper({ asyncAction: { state: "ERROR", error: errText } });
    });

    it("shows the button", () => {
      expect(wrapper.find(Button).exists()).toBe(true);
    });

    it("doesn't show the spinner", () => {
      expect(wrapper.find(Spinner).exists()).toBe(false);
    });

    it("renders the error from asyncAction", () => {
      expect(
        wrapper
          .find(Text)
          .children()
          .text(),
      ).toEqual(errText);
    });
  });

  describe("when asyncAction is 'COMPLETE'", () => {
    it("is the same as when asyncAction is 'INIT'", () => {
      const completeProps = {
        ...defProps,
        asyncAction: { state: "COMPLETE", value: "" } as Async<any>,
      };
      const initWrapper = mkWrapper({ asyncAction: { state: "INIT" } });
      const completeComponent = <AsyncButton {...completeProps} />;
      expect(initWrapper).toMatchElement(completeComponent, {
        ignoreProps: false,
      });
    });
  });
});
