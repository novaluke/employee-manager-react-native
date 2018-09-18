import "jest-enzyme";
import React from "react";

import { shallow } from "enzyme";
import firebase from "firebase";
import { create } from "react-test-renderer";

import firebaseConfigJson from "../firebaseConfig.json";
import App from "../src/App";

import { setNavigation } from "../src/NavigationService";
import { store } from "../src/store";

jest.mock("../src/components/InitializingScreen", () => "InitializingScreen");
jest.mock("../src/NavigationService");
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

  it("sets the navigation component", () => {
    const renderer = create(<App />);
    // Can't test that it was called with the right argument as there isn't a
    // way to access the <RootNavigator> component with the test renderers, so
    // it's not possible to check that the arg matches that commponent
    expect(setNavigation).toHaveBeenCalled();

    // Clean up to avoid warnings from react-navigation
    renderer.unmount();
  });

  it("doesn't attempt to initialize firebase if it's already initialized", () => {
    firebase.initializeApp({});
    firebase.initializeApp = jest.fn();

    shallow(<App />);

    expect(firebase.initializeApp).not.toHaveBeenCalled();
  });

  it("loads InitializingScreen as the initial screen", () => {
    const renderer = create(<App />);
    expect(renderer.root.findAllByType("InitializingScreen").length).toBe(1);

    // Clean up to avoid warnings from react-navigation
    renderer.unmount();
  });
});
