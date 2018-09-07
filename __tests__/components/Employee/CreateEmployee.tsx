import "jest-enzyme";
import React from "react";

import { shallow } from "enzyme";

import { NavigationScreenProps } from "react-navigation";

import { stubNavigation } from "../../helpers/react-navigation";
import { StubbedStore } from "../../helpers/redux";

import { AsyncButton } from "../../../src/components/common";
import CreateEmployee from "../../../src/components/Employee/CreateEmployee";
import EmployeeForm from "../../../src/components/Employee/EmployeeForm";
import {
  createEmployee,
  IEmployeeState,
  resetForm,
  ShiftDay,
  updateField,
} from "../../../src/store/Employee";

jest.mock("../../../src/store/Employee");
jest.mock(
  "../../../src/components/Employee/EmployeeForm",
  () => "EmployeeForm",
);

// For some reason TypeScript doesn't know about a `connect`ed class' static
// methods, and no solution is readily available after searching, so just
// override the types here until a better solution can be found.
const { navigationOptions } = CreateEmployee as any;

describe("CreateEmployee", () => {
  let props: NavigationScreenProps;
  let store: StubbedStore;
  let state: { employee: IEmployeeState };
  beforeEach(() => {
    state = {
      employee: {
        createAction: { state: "INIT" },
        employeeName: "Taylor",
        fireAction: { state: "INIT" },
        fireModalShown: false,
        phone: "555-5555",
        shift: ShiftDay.Monday,
        uid: null,
        updateAction: { state: "INIT" },
      },
    };
    store = new StubbedStore(state);
    props = {
      navigation: stubNavigation(),
    };
  });
  // This has side effects! Don't put this in beforeEach in case a test needs to
  // do something *before* running those side effects!
  const mkWrapper = () =>
    shallow(<CreateEmployee {...props} />, {
      context: { store },
    }).dive();

  it("renders properly", () => {
    expect(mkWrapper()).toMatchSnapshot();
  });

  it("passes dispatchFieldUpdate to the EmployeeForm", () => {
    const employeeForm = mkWrapper().find(EmployeeForm);
    // Can't just check the functions are equal since the dispatch* version is
    // wrapped inside another function in order to hook up the dispatch
    expect(updateField).toHaveBeenCalledTimes(0);

    employeeForm.props().dispatchFieldUpdate();
    expect(updateField).toHaveBeenCalledTimes(1);
  });

  it("uses an AsyncButton connected to createAction", () => {
    const button = mkWrapper().find({ label: "Create" });

    expect(button.type()).toBe(AsyncButton);
    expect(button.prop("asyncAction")).toBe(state.employee.createAction);
  });

  it("creates the employee when submitted", () => {
    const { employeeName, phone, shift } = state.employee;
    const button = mkWrapper().find({ label: "Create" });

    expect(createEmployee).not.toHaveBeenCalled();
    button.simulate("press");

    expect(createEmployee).toHaveBeenCalledTimes(1);
    expect(createEmployee).toHaveBeenCalledWith(
      { employeeName, phone, shift, uid: null },
      props.navigation,
    );
  });

  it("sets the page title", () => {
    expect(navigationOptions.title).toEqual("Add an employee");
  });

  it("resets the form when unmounted", () => {
    const wrapper = mkWrapper();
    expect(resetForm).not.toHaveBeenCalled();

    wrapper.unmount();

    expect(resetForm).toHaveBeenCalledTimes(1);
  });
});
