import "jest-enzyme";
import React from "react";

import { shallow } from "enzyme";
import reactTestRenderer from "react-test-renderer";

import { Button } from "../../../src/components/common";

describe("Button", () => {
  const defProps = { onPress: jest.fn() };
  const mkWrapper = (propOverrides?: any) => {
    const props = { ...defProps, ...propOverrides };
    return shallow(<Button {...props} />);
  };

  let wrapper: any;
  beforeEach(() => {
    wrapper = mkWrapper();
  });

  it("triggers `onPress` on press", () => {
    const { onPress } = defProps;
    expect(onPress).not.toHaveBeenCalled();

    wrapper.simulate("press");

    expect(onPress).toHaveBeenCalled();
  });

  it("renders properly", () => {
    const props = { ...defProps, children: ["Button label"] };
    const tree = reactTestRenderer.create(<Button {...props} />);
    expect(tree.toJSON()).toMatchSnapshot();
  });
});
