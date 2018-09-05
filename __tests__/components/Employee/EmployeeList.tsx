import "jest-enzyme";
import React from "react";

import { shallow } from "enzyme";
import { TouchableOpacity } from "react-native";
import { Provider } from "react-redux";
import reactTestRenderer from "react-test-renderer";

import { stubNavigation } from "../../helpers/react-navigation";
import { StubbedStore } from "../../helpers/redux";

import EmployeeList from "../../../src/components/Employee/EmployeeList";
import { editEmployee, ShiftDay } from "../../../src/store/Employee";
import {
  IEmployeesState,
  unwatchEmployees,
  watchEmployees,
} from "../../../src/store/Employees";

jest.mock("../../../src/store/Employee");
jest.mock("../../../src/store/Employees");

// Otherwise TouchableOpacity does not get rendered properly for some reason,
// and does not have an onPress
jest.mock("TouchableOpacity", () => "TouchableOpacity");

describe("EmployeeList", () => {
  let props: any;
  let store: StubbedStore;
  let state: { employees: IEmployeesState };
  beforeEach(() => {
    state = {
      employees: { employeesAction: { state: "INIT" } },
    };
    store = new StubbedStore(state);
    props = {
      navigation: stubNavigation(),
    };
  });
  // This has side effects! Don't put this in beforeEach in case a test needs to
  // do something *before* running those side effects!
  const mkWrapper = () =>
    shallow(<EmployeeList {...props} />, {
      context: { store },
    }).dive();

  it("shows a spinner when data is loading", () => {
    state.employees = { employeesAction: { state: "PROGRESS" } };

    const wrapper = mkWrapper();

    expect(wrapper.find("Spinner").length).toBe(1);
  });

  it("does not show a spinner when data is not loading", () => {
    state.employees = { employeesAction: { state: "INIT" } }; // Good to be explicit

    const wrapper = mkWrapper();

    expect(wrapper.find("Spinner").length).toBe(0);
  });

  describe("with loaded Employees", () => {
    const foo = {
      employeeName: "foo",
      phone: "1234",
      shift: ShiftDay.Monday,
      uid: "uid1",
    };
    const bar = { ...foo, employeeName: "bar", uid: "uid2" };
    let component: any;
    beforeEach(() => {
      state.employees = {
        employeesAction: {
          state: "COMPLETE",
          value: { foo, bar },
        },
      };
      component = reactTestRenderer.create(
        <Provider store={store}>
          <EmployeeList {...props} />
        </Provider>,
      );
    });
    it("displays loaded Employees", () => {
      // Using a snapshot appears to be the only reasonable way to test this at
      // this point, even though it results in a clumsily-large snapshot
      expect(component.toJSON()).toMatchSnapshot();
    });
    it("links each Employee to EditEmployee", () => {
      const { navigation } = props;
      const employeeComponents = component.root.findAllByType(TouchableOpacity);

      employeeComponents[0].props.onPress();
      expect(editEmployee).toHaveBeenCalledWith(foo, navigation);

      employeeComponents[1].props.onPress();
      expect(editEmployee).toHaveBeenCalledWith(bar, navigation);

      expect(editEmployee).toHaveBeenCalledTimes(2);
    });
  });

  it("adds a button for CreateEmployee to the header", () => {
    const { navigation } = props;
    const headerRightWrapped = shallow(
      EmployeeList.navigationOptions({ navigation }).headerRight,
    );
    expect(navigation.navigate).not.toHaveBeenCalled();

    headerRightWrapped.find("[onPress]").simulate("press");

    expect(navigation.navigate).toHaveBeenCalledWith("CreateEmployee");
  });

  it("sets the page title", () => {
    expect(EmployeeList.navigationOptions({}).title).toEqual("Employees");
  });

  it("watches the Employees data on mount", () => {
    expect(watchEmployees).not.toHaveBeenCalled();
    mkWrapper();
    expect(watchEmployees).toHaveBeenCalledWith(props.navigation);
  });

  it("clears the watch on Employees on umount", () => {
    const wrapper = mkWrapper();
    expect(unwatchEmployees).not.toHaveBeenCalled();

    wrapper.unmount();
    expect(unwatchEmployees).toHaveBeenCalledWith(props.navigation);
  });
});
