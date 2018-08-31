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

afterEach(() =>
  // Clean up firebase initialization state after each test run.
  // For some reason firebase.apps is defined as possibly containing null
  // values, so it's necessary to check for non-null before invoking `.delete`
  Promise.all(firebase.apps.map(app => app && app.delete())));

describe("root App component", () => {
  it("provides the store to all components", () => {
    const wrapper = shallow(<App />);
    expect(wrapper).toHaveTagName("Provider");
    expect(wrapper).toHaveProp("store", store);
  });

  it("initializes the firebase instance", () => {
    shallow(<App />);
    expect(firebase.apps[0] && firebase.apps[0]!.options).toEqual(
      firebaseConfigJson,
    );
  });

  it("doesn't attempt to initialize firebase if it's already initialized", () => {
    firebase.initializeApp({});
    firebase.initializeApp = jest.fn();

    shallow(<App />);

    expect(firebase.initializeApp).not.toHaveBeenCalled();
  });

  it("loads InitializingScreen as the initial screen", () => {
    const { root } = create(<App />);
    expect(root.findAllByType("InitializingScreen").length).toBe(1);
  });
});
