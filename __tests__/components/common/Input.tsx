import "jest-enzyme";
import React from "react";

import { shallow } from "enzyme";

import Input, { IProps } from "../../../src/components/common/Input";

// Some components show up in snapshots as <Component> if we don't mock them
jest.mock("react-native", () => ({
  StyleSheet: { create: jest.fn(obj => obj) },
  Text: "Text",
  TextInput: "TextInput",
  View: "View",
}));

describe("Input", () => {
  const defProps: IProps = {
    label: "Enter text here",
  };
  const mkWrapper = (propOverrides?: Partial<IProps>) => {
    const props = { ...defProps, ...propOverrides };
    return shallow(<Input {...props} />);
  };

  it("renders correctly", () => {
    expect(mkWrapper()).toMatchSnapshot();
  });

  it("passes all props down to the TextInput", () => {
    const propName = "autoFocus";
    const props = { [propName]: true };
    expect(
      mkWrapper(props)
        .find("TextInput")
        .prop(propName),
    ).toEqual(props[propName]);
  });
});
