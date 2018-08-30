import "jest-enzyme";
import React from "react";

import { shallow } from "enzyme";

import { stubNavigation } from "../../helpers/react-navigation";
import { StubbedStore } from "../../helpers/redux";

import EmployeeForm from "../../../src/components/Employee/EmployeeForm";
import {
  IEmployeeState,
  ShiftDay,
  updateField,
} from "../../../src/store/Employee";

jest.mock("../../../src/store/Employee");

describe("EmployeeForm", () => {
  let props: any;
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
    shallow(<EmployeeForm {...props} />, {
      context: { store },
    }).dive();

  describe("employee name input", () => {
    let input: any;
    beforeEach(() => {
      input = mkWrapper().find({ label: "Name" });
    });

    it("dispatches updates via updateField", () => {
      const newName = "Casey";
      expect(updateField).not.toHaveBeenCalled();

      input.simulate("changeText", newName);

      expect(updateField).toHaveBeenCalledTimes(1);
      expect(updateField).toHaveBeenCalledWith({
        field: "employeeName",
        value: newName,
      });
    });
    it("renders the store value", () => {
      expect(input.prop("value")).toEqual(state.employee.employeeName);
    });
  });

  describe("phone number input", () => {
    let input: any;
    beforeEach(() => {
      input = mkWrapper().find({ label: "Phone" });
    });

    it("dispatches updates via updateField", () => {
      const newPhone = "123-456-7890";
      expect(updateField).not.toHaveBeenCalled();

      input.simulate("changeText", newPhone);

      expect(updateField).toHaveBeenCalledTimes(1);
      expect(updateField).toHaveBeenCalledWith({
        field: "phone",
        value: newPhone,
      });
    });
    it("renders the store value", () => {
      expect(input.prop("value")).toEqual(state.employee.phone);
    });
  });

  describe("shift input", () => {
    let input: any;
    beforeEach(() => {
      input = mkWrapper().find("Picker");
    });

    it("dispatches updates via updateField", () => {
      const newShift = ShiftDay.Friday;
      expect(updateField).not.toHaveBeenCalled();

      input.simulate("valueChange", newShift);

      expect(updateField).toHaveBeenCalledTimes(1);
      expect(updateField).toHaveBeenCalledWith({
        field: "shift",
        value: newShift,
      });
    });
    it("renders the store value", () => {
      expect(input.prop("selectedValue")).toEqual(state.employee.shift);
    });
    it("provides options matching the ShiftDay enum", () => {
      const values = input
        .find("PickerItem")
        .map((item: any) => item.prop("value"));
      expect(values.sort()).toEqual(Object.keys(ShiftDay).sort());
    });
  });
});
