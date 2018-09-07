import "jest-enzyme";
import React from "react";

import { shallow, ShallowWrapper } from "enzyme";
import { ScrollView } from "react-native";
import reactNativeCommunications from "react-native-communications";
import { NavigationScreenProps } from "react-navigation";

import { stubNavigation } from "../../helpers/react-navigation";
import { StubbedStore } from "../../helpers/redux";

import { AsyncButton } from "../../../src/components/common";
import EditEmployee from "../../../src/components/Employee/EditEmployee";
import EmployeeForm from "../../../src/components/Employee/EmployeeForm";
import {
  closeFireModal,
  fireEmployee,
  IEmployeeState,
  resetForm,
  ShiftDay,
  showFireModal,
  updateEmployee,
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
const { navigationOptions } = EditEmployee as any;

describe("EmployeeList", () => {
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
        uid: "uid1",
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
    shallow(<EditEmployee {...props} />, {
      context: { store },
    }).dive();

  it("is scrollable", () => {
    expect(mkWrapper().type()).toBe(ScrollView);
  });

  it("passes dispatchFieldUpdate to the EmployeeForm", () => {
    // Need to use the actual component type rather than a string or we lose
    // type safety
    const employeeForm = mkWrapper().find(EmployeeForm);
    // Can't just check the functions are equal since the dispatch* version is
    // wrapped inside another function in order to hook up the dispatch
    expect(updateField).toHaveBeenCalledTimes(0);

    employeeForm.props().dispatchFieldUpdate();
    expect(updateField).toHaveBeenCalledTimes(1);
  });

  describe("save button", () => {
    let button: ShallowWrapper;
    beforeEach(() => {
      button = mkWrapper().find({ label: "Save" });
    });

    it("uses an AsyncButton connected to updateAction", () => {
      expect(button.type()).toBe(AsyncButton);
      expect(button.prop("asyncAction")).toBe(state.employee.updateAction);
    });

    it("updates the Employee when pressed", () => {
      const { employeeName, phone, shift, uid } = state.employee;

      expect(updateEmployee).not.toHaveBeenCalled();
      button.simulate("press");

      expect(updateEmployee).toHaveBeenCalledTimes(1);
      expect(updateEmployee).toHaveBeenCalledWith(
        { employeeName, phone, shift, uid },
        props.navigation,
      );
    });
  });

  describe("text schedule button", () => {
    it("creates a text in the default texting app", () => {
      reactNativeCommunications.text = jest.fn();
      const button = mkWrapper().find("Button");
      const { phone, shift } = state.employee;
      expect(reactNativeCommunications.text).not.toHaveBeenCalled();

      button.simulate("press");

      expect(reactNativeCommunications.text).toHaveBeenCalledTimes(1);
      expect(reactNativeCommunications.text).toHaveBeenCalledWith(
        phone,
        expect.stringContaining(shift),
      );
    });
  });

  describe("fire button", () => {
    let button: ShallowWrapper;
    beforeEach(() => {
      button = mkWrapper().find({ label: "Fire" });
    });

    it("uses an AsyncButton connected to fireAction", () => {
      expect(button.type()).toBe(AsyncButton);
      expect(button.prop("asyncAction")).toBe(state.employee.fireAction);
    });

    it("shows the confirmation modal without firing the Employee", () => {
      expect(showFireModal).not.toHaveBeenCalled();
      button.simulate("press");

      expect(fireEmployee).not.toHaveBeenCalled();
      expect(showFireModal).toHaveBeenCalledTimes(1);
    });
  });

  describe("fire employee confirmation modal", () => {
    let modal: ShallowWrapper;
    beforeEach(() => {
      modal = mkWrapper().find("Confirm");
    });

    it("renders correctly", () => {
      expect(modal).toMatchSnapshot();
    });
    describe("when accepted", () => {
      it("fires the employee", () => {
        const { uid } = state.employee;
        expect(fireEmployee).not.toHaveBeenCalled();

        modal.simulate("yes");

        expect(fireEmployee).toHaveBeenCalledTimes(1);
        expect(fireEmployee).toHaveBeenCalledWith(uid, props.navigation);
      });
    });
    describe("when rejected", () => {
      it("does not fire the employee", () => {
        modal.simulate("no");
        expect(fireEmployee).not.toHaveBeenCalled();
      });
      it("closes the modal", () => {
        expect(closeFireModal).not.toHaveBeenCalled();

        modal.simulate("no");

        expect(closeFireModal).toHaveBeenCalledTimes(1);
      });
    });
  });

  it("sets the page title based on the employeeName", () => {
    const mockGetParam = jest.fn(() => state.employee.employeeName);
    expect(
      navigationOptions({ navigation: { getParam: mockGetParam } }).title,
    ).toMatchSnapshot();
    expect(mockGetParam).toHaveBeenCalledWith("employeeName");
  });

  it("resets the form when unmounted", () => {
    const wrapper = mkWrapper();
    expect(resetForm).not.toHaveBeenCalled();

    wrapper.unmount();

    expect(resetForm).toHaveBeenCalledTimes(1);
  });
});
