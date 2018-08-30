import "jest-enzyme";
import React from "react";

import { shallow } from "enzyme";

import { stubNavigation } from "../helpers/react-navigation";
import { StubbedStore } from "../helpers/redux";

import { AsyncButton } from "../../src/components/common";
import LoginForm from "../../src/components/LoginForm";
import {
  emailChanged,
  IAuthState,
  logIn,
  passwordChanged,
} from "../../src/store/Auth";

jest.mock("../../src/store/Auth");

describe("LoginForm", () => {
  let stubbedProps: any;
  let store: StubbedStore;
  let state: { auth: IAuthState };
  beforeEach(() => {
    state = {
      auth: {
        email: "user@example.com",
        loginAction: { state: "INIT" },
        password: "supersecretpassword",
        user: null,
      },
    };
    store = new StubbedStore(state);
    stubbedProps = {
      navigation: stubNavigation(),
    };
  });
  // This has side effects! Don't put this in beforeEach in case a test needs to
  // do something *before* running those side effects!
  const mkWrapper = () =>
    shallow(<LoginForm {...stubbedProps} />, {
      context: { store },
    }).dive();

  it("dispatches updates when the email address is updated", () => {
    const wrapper = mkWrapper();

    expect(emailChanged).not.toHaveBeenCalled();
    wrapper
      .find({ label: "Email" })
      .simulate("changeText", "email@example.com");

    expect(emailChanged).toHaveBeenCalledTimes(1);
    expect(emailChanged).toHaveBeenCalledWith("email@example.com");
  });

  it("dispatches updates when the password is updated", () => {
    const wrapper = mkWrapper();

    expect(passwordChanged).not.toHaveBeenCalled();
    wrapper
      .find({ label: "Password" })
      .simulate("changeText", "reallyweakpassword");

    expect(passwordChanged).toHaveBeenCalledTimes(1);
    expect(passwordChanged).toHaveBeenCalledWith("reallyweakpassword");
  });

  it("dispatches the login action on submit", () => {
    const wrapper = mkWrapper();

    expect(logIn).not.toHaveBeenCalled();
    wrapper.find({ label: "Log in" }).simulate("press");

    expect(logIn).toHaveBeenCalledTimes(1);
    expect(logIn).toHaveBeenCalledWith(
      state.auth.email,
      state.auth.password,
      stubbedProps.navigation,
    );
  });

  it("it renders the store values to the inputs", () => {
    const wrapper = mkWrapper();

    expect(
      wrapper
        .find({
          label: "Email",
        })
        .prop("value"),
    ).toEqual(state.auth.email);
    expect(
      wrapper
        .find({
          label: "Email",
        })
        .prop("value"),
    ).toEqual(state.auth.email);
  });

  it("uses an AsyncButton connected to loginAction", () => {
    const button = mkWrapper().find({ label: "Log in" });

    expect(button.type()).toBe(AsyncButton);
    expect(button.prop("asyncAction")).toBe(state.auth.loginAction);
  });
});
