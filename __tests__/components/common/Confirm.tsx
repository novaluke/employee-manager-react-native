import "jest-enzyme";
import React from "react";

import { shallow } from "enzyme";

import { Confirm } from "../../../src/components/common";

// Some components show up in snapshots as <Component> if we don't mock them
jest.mock("react-native", () => ({
  Modal: "Modal",
  StyleSheet: { create: jest.fn(obj => obj) },
  Text: "Text",
  View: "View",
}));

describe("Confirm", () => {
  const defProps = {
    isVisible: false,
    noText: "No",
    onNo: jest.fn(),
    onYes: jest.fn(),
    text: "Are you sure you want to do that?",
    yesText: "Yes",
  };
  const mkWrapper = (propOverrides?: any) => {
    const props = { ...defProps, ...propOverrides };
    return shallow(<Confirm {...props} />);
  };

  it("renders correctly", () => {
    expect(mkWrapper()).toMatchSnapshot();
  });

  it("passes `isVisible` to the underlying Modal", () => {
    expect(
      mkWrapper()
        .find("Modal")
        .prop("visible"),
    ).toEqual(defProps.isVisible);
  });

  describe("when the hardware back button is pressed", () => {
    it("acts as if the user pressed 'no'", () => {
      expect(defProps.onNo).not.toHaveBeenCalled();
      mkWrapper()
        .find("Modal")
        .simulate("requestClose");
      expect(defProps.onNo).toHaveBeenCalledTimes(1);
    });
  });

  it("calls `onYes` when the yes button is clicked", () => {
    expect(defProps.onYes).not.toHaveBeenCalled();
    mkWrapper()
      .find("Button")
      .forEach(button => {
        if (button.children().text() === defProps.yesText) {
          button.simulate("press");
        }
      });
    expect(defProps.onYes).toHaveBeenCalledTimes(1);
  });

  it("calls `onNo` when the no button is clicked", () => {
    expect(defProps.onNo).not.toHaveBeenCalled();
    mkWrapper()
      .find("Button")
      .forEach(button => {
        if (button.children().text() === defProps.noText) {
          button.simulate("press");
        }
      });
    expect(defProps.onNo).toHaveBeenCalledTimes(1);
  });
});
