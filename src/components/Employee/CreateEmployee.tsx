import React, { Component } from "react";
import { NavigationScreenProp, NavigationScreenProps } from "react-navigation";
import { connect } from "react-redux";

import { IRootState } from "../../store";
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
  loading: boolean;
  phone: string;
  shift: ShiftDay;
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
      loading,
      navigation,
    } = this.props;
    return (
      <Card>
        <EmployeeForm {...this.props} />

        <CardSection>
          {renderButton(loading, () =>
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
  const { employeeName, phone, shift, loading, error } = state.employee;
  return {
    employeeName,
    error,
    loading,
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
