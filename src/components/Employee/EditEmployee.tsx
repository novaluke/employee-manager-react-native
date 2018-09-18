import React, { Component } from "react";
import { ScrollView, View } from "react-native";
import reactNativeCommunications from "react-native-communications";
import { NavigationScreenProp, NavigationScreenProps } from "react-navigation";
import { connect } from "react-redux";

import { AsyncValue, IRootState } from "../../store";
import {
  closeFireModal,
  fireEmployee,
  IEmployee,
  resetForm,
  ShiftDay,
  showFireModal,
  updateEmployee,
  updateField,
} from "../../store/Employee";
import { AsyncButton, Button, Card, CardSection, Confirm } from "../common";
import EmployeeForm, { IFormProps } from "./EmployeeForm";

interface IProps extends IFormProps, NavigationScreenProps {
  employeeName: string;
  phone: string;
  shift: ShiftDay;
  uid: string | null;
  fireAction: AsyncValue<null>;
  fireModalShown: boolean;
  updateAction: AsyncValue<null>;
  dispatchShowFireModal: () => void;
  dispatchUpdateEmployee: (employee: IEmployee<string>) => void;
  dispatchResetForm: () => void;
  dispatchCloseModal: () => void;
  dispatchFireEmployee: (
    uid: string | null,
    navigation: NavigationScreenProp<any>,
  ) => void;
}

const textSchedule = (phone: string, shift: ShiftDay) => () =>
  reactNativeCommunications.text(phone, `Your upcoming shift is on ${shift}`);

class EditEmployee extends Component<IProps> {
  public static navigationOptions = ({
    navigation,
  }: {
    navigation: NavigationScreenProp<any>;
  }) => ({
    title: `Edit ${navigation.getParam("employeeName")}`,
  });

  public componentWillUnmount() {
    const { dispatchResetForm } = this.props;
    dispatchResetForm();
  }

  public render() {
    const {
      employeeName,
      phone,
      shift,
      uid,
      fireAction,
      fireModalShown,
      updateAction,
      dispatchShowFireModal,
      dispatchUpdateEmployee,
      dispatchCloseModal,
      dispatchFireEmployee,
      navigation,
    } = this.props;
    // Short-circuit and redirect if the employee to edit has not actually been
    // saved yet (can't edit something non-persisted)
    if (uid === null) {
      navigation.navigate("EmployeeList");
      return null;
    }
    const onFireEmployee = () => dispatchFireEmployee(uid, navigation);
    const onUpdateEmployee = () =>
      dispatchUpdateEmployee({
        employeeName,
        phone,
        shift,
        uid,
      });
    return (
      <ScrollView>
        <Card>
          <EmployeeForm {...this.props} />

          <CardSection>
            <AsyncButton
              label="Save"
              asyncAction={updateAction}
              onPress={onUpdateEmployee}
            />
          </CardSection>

          <CardSection>
            <View style={{ flex: 1 }}>
              <Button onPress={textSchedule(phone, shift)}>
                Text schedule
              </Button>
            </View>
          </CardSection>

          <CardSection>
            <AsyncButton
              label="Fire"
              asyncAction={fireAction}
              onPress={dispatchShowFireModal}
            />
          </CardSection>
          <Confirm
            text={`Are you sure you want to fire ${employeeName}?`}
            isVisible={fireModalShown}
            onYes={onFireEmployee}
            onNo={dispatchCloseModal}
          />
        </Card>
      </ScrollView>
    );
  }
}

const mapStateToProps = (state: IRootState) => {
  const {
    employeeName,
    phone,
    shift,
    uid,
    fireModalShown,
    fireAction,
    updateAction,
  } = state.employee;
  return {
    employeeName,
    fireAction,
    fireModalShown,
    phone,
    shift,
    uid,
    updateAction,
  };
};

export default connect(
  mapStateToProps,
  {
    dispatchCloseModal: closeFireModal,
    dispatchFieldUpdate: updateField,
    dispatchFireEmployee: fireEmployee,
    dispatchResetForm: resetForm,
    dispatchShowFireModal: showFireModal,
    dispatchUpdateEmployee: updateEmployee,
  },
)(EditEmployee);
