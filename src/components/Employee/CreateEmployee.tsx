import React, { Component } from "react";
import { NavigationScreenProp, NavigationScreenProps } from "react-navigation";
import { connect } from "react-redux";

import { AsyncValue, IRootState } from "../../store";
import {
  createEmployee,
  IEmployee,
  resetForm,
  ShiftDay,
  updateField,
} from "../../store/Employee";
import { AsyncButton, Card, CardSection } from "../common";
import EmployeeForm, { IFormProps } from "./EmployeeForm";

interface IProps extends IFormProps, NavigationScreenProps {
  employeeName: string;
  phone: string;
  shift: ShiftDay;
  createAction: AsyncValue<null>;
  dispatchCreateEmployee: (
    employee: IEmployee<null>,
    navigation: NavigationScreenProp<any>,
  ) => void;
  dispatchResetForm: () => void;
}

class CreateEmployee extends Component<IProps> {
  public static navigationOptions = {
    title: "Add an employee",
  };

  public componentWillUnmount() {
    const { dispatchResetForm } = this.props;
    dispatchResetForm();
  }

  public render() {
    const {
      employeeName,
      phone,
      shift,
      dispatchCreateEmployee,
      createAction,
      navigation,
    } = this.props;
    const onCreateEmployee = () =>
      dispatchCreateEmployee(
        {
          employeeName,
          phone,
          shift,
          uid: null,
        },
        navigation,
      );
    return (
      <Card>
        <EmployeeForm {...this.props} />

        <CardSection>
          <AsyncButton
            label="Create"
            asyncAction={createAction}
            onPress={onCreateEmployee}
          />
        </CardSection>
      </Card>
    );
  }
}

const mapStateToProps = (state: IRootState) => {
  const { employeeName, phone, shift, createAction } = state.employee;
  return {
    createAction,
    employeeName,
    phone,
    shift,
  };
};

export default connect(
  mapStateToProps,
  {
    dispatchCreateEmployee: createEmployee,
    dispatchFieldUpdate: updateField,
    dispatchResetForm: resetForm,
  },
)(CreateEmployee);
