import "jest-enzyme";
import React from "react";

import { shallow } from "enzyme";
import reactTestRenderer from "react-test-renderer";

import Button, { IProps } from "../../../src/components/common/Button";

describe("Button", () => {
  const defProps: IProps = { onPress: jest.fn() };
  const mkWrapper = (propOverrides?: Partial<IProps>) => {
    const props = { ...defProps, ...propOverrides };
    return shallow(<Button {...props} />);
  };

  it("triggers `onPress` on press", () => {
    const { onPress } = defProps;
    const wrapper = mkWrapper();
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
