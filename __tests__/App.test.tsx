import "jest-enzyme";
import React from "react";

import { shallow } from "enzyme";
import firebase from "firebase";
import { create } from "react-test-renderer";

import firebaseConfigJson from "../firebaseConfig.json";
import App from "../src/App";

import { store } from "../src/store";

jest.mock("../src/components/InitializingScreen", () => "InitializingScreen");
jest.unmock("firebase");

describe("root App component", () => {
  it("provides the store to all components", () => {
    const wrapper = shallow(<App />);
    expect(wrapper).toHaveTagName("Provider");
    expect(wrapper).toHaveProp("store", store);
  });

  it("initializes the firebase instance", () => {
    expect(firebase.apps[0] && firebase.apps[0]!.options).toEqual(
      firebaseConfigJson,
    );
  });

  it("loads InitializingScreen as the initial screen", () => {
    const { root } = create(<App />);
    expect(root.findAllByType("InitializingScreen").length).toBe(1);
  });
});
