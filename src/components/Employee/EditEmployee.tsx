import React, { Component } from "react";
import reactNativeCommunications from "react-native-communications";
import { NavigationScreenProp, NavigationScreenProps } from "react-navigation";
import { connect } from "react-redux";

import { Async, IRootState } from "../../store";
import {
  IEmployee,
  resetForm,
  ShiftDay,
  updateEmployee,
  updateField,
} from "../../store/Employee";
import { Button, Card, CardSection, Spinner, SpinnerSize } from "../common";
import EmployeeForm, { IFormProps } from "./EmployeeForm";

interface IProps extends IFormProps, NavigationScreenProps {
  employeeName: string;
  phone: string;
  shift: ShiftDay;
  uid: string | null;
  updateAction: Async<null>;
  dispatchUpdateEmployee: (
    employee: IEmployee<string | null>,
    navigation: NavigationScreenProp<any>,
  ) => void;
  dispatchResetForm: () => void;
}

const renderButton = (isLoading: boolean, onSubmit: () => void) => {
  if (isLoading) {
    return <Spinner size={SpinnerSize.Large} />;
  }
  return <Button onPress={onSubmit}>Save</Button>;
};

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
      updateAction,
      dispatchUpdateEmployee,
      navigation,
    } = this.props;
    return (
      <Card>
        <EmployeeForm {...this.props} asyncAction={updateAction} />

        <CardSection>
          {renderButton(updateAction.state === "PROGRESS", () =>
            dispatchUpdateEmployee(
              {
                employeeName,
                phone,
                shift,
                uid,
              },
              navigation,
            ),
          )}
        </CardSection>

        <CardSection>
          <Button onPress={textSchedule(phone, shift)}>Text schedule</Button>
        </CardSection>
      </Card>
    );
  }
}

const mapStateToProps = (state: IRootState) => {
  const { employeeName, phone, shift, uid, updateAction } = state.employee;
  return {
    employeeName,
    phone,
    shift,
    uid,
    updateAction,
  };
};

export default connect(
  mapStateToProps,
  {
    dispatchFieldUpdate: updateField,
    dispatchResetForm: resetForm,
    dispatchUpdateEmployee: updateEmployee,
  },
)(EditEmployee);
