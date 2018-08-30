import "jest-enzyme";
import React from "react";

import reactTestRenderer from "react-test-renderer";

import { Card } from "../../../src/components/common";

describe("Card", () => {
  it("renders correctly", () => {
    const tree = reactTestRenderer.create(<Card>Card children</Card>);
    expect(tree.toJSON()).toMatchSnapshot();
  });
});
