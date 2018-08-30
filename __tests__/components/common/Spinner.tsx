import "jest-enzyme";
import React from "react";

import { shallow } from "enzyme";

import { Spinner, SpinnerSize } from "../../../src/components/common";

// Some components show up in snapshots as <Component> if we don't mock them
jest.mock("react-native", () => ({
  ActivityIndicator: "ActivityIndicator",
  StyleSheet: { create: jest.fn(obj => obj) },
  View: "View",
}));

describe("Spinner", () => {
  const defProps = {
    size: SpinnerSize.Large,
  };
  const mkWrapper = (propOverrides?: any) => {
    const props = { ...defProps, ...propOverrides };
    return shallow(<Spinner {...props} />);
  };

  it("renders correctly", () => {
    expect(mkWrapper()).toMatchSnapshot();
  });

  it("sets the size of the ActivityIndicator", () => {
    const size = SpinnerSize.Small;
    expect(
      mkWrapper({ size })
        .find("ActivityIndicator")
        .prop("size"),
    ).toEqual(size);
  });
});
