import "jest-enzyme";
import React from "react";

import { shallow } from "enzyme";

import { Input } from "../../../src/components/common";

// Some components show up in snapshots as <Component> if we don't mock them
jest.mock("react-native", () => ({
  StyleSheet: { create: jest.fn(obj => obj) },
  Text: "Text",
  TextInput: "TextInput",
  View: "View",
}));

describe("Input", () => {
  const defProps = {
    label: "Enter text here",
  };
  const mkWrapper = (propOverrides?: any) => {
    const props = { ...defProps, ...propOverrides };
    return shallow(<Input {...props} />);
  };

  it("renders correctly", () => {
    expect(mkWrapper()).toMatchSnapshot();
  });

  it("passes all props down to the TextInput", () => {
    const props = { foo: "bar" };
    expect(
      mkWrapper(props)
        .find("TextInput")
        .prop("foo"),
    ).toEqual(props.foo);
  });
});
