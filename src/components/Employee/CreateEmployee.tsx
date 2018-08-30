import React, { Component } from "react";
import { NavigationScreenProp, NavigationScreenProps } from "react-navigation";
import { connect } from "react-redux";

import { Async, IRootState } from "../../store";
import {
  createEmployee,
  IEmployee,
  resetForm,
  ShiftDay,
  updateField,
} from "../../store/Employee";
import { Button, Card, CardSection, Spinner, SpinnerSize } from "../common";
import EmployeeForm, { IFormProps } from "./EmployeeForm";

// TODO extract into a reusable component
const renderButton = (isLoading: boolean, onSubmit: () => void) => {
  if (isLoading) {
    return <Spinner size={SpinnerSize.Large} />;
  }
  return <Button onPress={onSubmit}>Create</Button>;
};

interface IProps extends IFormProps, NavigationScreenProps {
  employeeName: string;
  phone: string;
  shift: ShiftDay;
  createAction: Async<null>;
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
    return (
      <Card>
        <EmployeeForm {...this.props} asyncAction={createAction} />

        <CardSection>
          {renderButton(createAction.state === "PROGRESS", () =>
            dispatchCreateEmployee(
              {
                employeeName,
                phone,
                shift,
                uid: null,
              },
              navigation,
            ),
          )}
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
