import "jest-enzyme";
import React from "react";

import { shallow } from "enzyme";
import reactTestRenderer from "react-test-renderer";

import { StyleSheet, ViewProps } from "react-native";

import { CardSection } from "../../../src/components/common";

describe("CardSection", () => {
  it("renders correctly", () => {
    const props = { children: ["Child component"] };
    const tree = reactTestRenderer.create(<CardSection {...props} />);
    expect(tree.toJSON()).toMatchSnapshot();
  });

  it("adopts styles passed to it", () => {
    const styles = StyleSheet.create({
      testStyle: {
        backgroundColor: "papayawhip",
      },
    });
    const appliedStyles = shallow(
      <CardSection style={styles.testStyle} />,
    ).prop("style");
    expect(appliedStyles[appliedStyles.length - 1]).toEqual(styles.testStyle);
  });

  it("passes props through to the underlying view", () => {
    const props = { foo: "bar" } as ViewProps & { foo: string };
    const wrapper = shallow(<CardSection {...props} />);
    expect(wrapper.prop("foo")).toBe(props.foo);
  });
});
