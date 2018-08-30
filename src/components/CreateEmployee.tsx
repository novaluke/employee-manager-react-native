import React, { Component } from "react";
import { Picker, StyleSheet, Text } from "react-native";
import { NavigationScreenProp, NavigationScreenProps } from "react-navigation";
import { connect } from "react-redux";

import { IRootState } from "../store";
import {
  createEmployee,
  FieldUpdatePayload,
  IEmployee,
  resetForm,
  ShiftDay,
  updateField,
} from "../store/Employee";
import {
  Button,
  Card,
  CardSection,
  Input,
  Spinner,
  SpinnerSize,
} from "./common";

const renderButton = (isLoading: boolean, onSubmit: () => void) => {
  if (isLoading) {
    return <Spinner size={SpinnerSize.Large} />;
  }
  return <Button onPress={onSubmit}>Create</Button>;
};

const styles = StyleSheet.create({
  errorTextStyle: {
    alignSelf: "center",
    color: "red",
    fontSize: 20,
  },
  pickerContainerStyle: {
    flexDirection: "column",
    paddingLeft: 25,
  },
  pickerLabelStyle: {
    fontSize: 18,
  },
});

interface IProps extends NavigationScreenProps {
  employeeName: string;
  error: string;
  loading: boolean;
  phone: string;
  shift: ShiftDay;
  dispatchFieldUpdate: (payload: FieldUpdatePayload) => void;
  dispatchCreateEmployee: (
    employee: IEmployee,
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
      dispatchFieldUpdate,
      dispatchCreateEmployee,
      error,
      loading,
      navigation,
    } = this.props;
    const dispatchUpdateName = (value: string) =>
      dispatchFieldUpdate({ value, field: "employeeName" });
    const dispatchUpdatePhone = (value: string) =>
      dispatchFieldUpdate({ value, field: "phone" });
    const dispatchUpdateShift = (value: ShiftDay) =>
      dispatchFieldUpdate({ value, field: "shift" });
    return (
      <Card>
        <CardSection>
          <Input
            label="Name"
            placeholder="Taylor"
            value={employeeName}
            onChangeText={dispatchUpdateName}
          />
        </CardSection>
        <CardSection>
          <Input
            label="Phone"
            placeholder="555-555-5555"
            value={phone}
            onChangeText={dispatchUpdatePhone}
          />
        </CardSection>

        <CardSection style={styles.pickerContainerStyle}>
          <Text style={styles.pickerLabelStyle}>Shift day</Text>
          <Picker selectedValue={shift} onValueChange={dispatchUpdateShift}>
            <Picker.Item label={ShiftDay.Monday} value={ShiftDay.Monday} />
            <Picker.Item label={ShiftDay.Tuesday} value={ShiftDay.Tuesday} />
            <Picker.Item
              label={ShiftDay.Wednesday}
              value={ShiftDay.Wednesday}
            />
            <Picker.Item label={ShiftDay.Thursday} value={ShiftDay.Thursday} />
            <Picker.Item label={ShiftDay.Friday} value={ShiftDay.Friday} />
            <Picker.Item label={ShiftDay.Saturday} value={ShiftDay.Saturday} />
            <Picker.Item label={ShiftDay.Sunday} value={ShiftDay.Sunday} />
          </Picker>
        </CardSection>

        {error !== "" && (
          <CardSection>
            <Text style={styles.errorTextStyle}>{error}</Text>
          </CardSection>
        )}

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
