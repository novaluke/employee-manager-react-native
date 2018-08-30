import React, { Component } from "react";
import { ScrollView, StyleSheet, Text } from "react-native";
import reactNativeCommunications from "react-native-communications";
import { NavigationScreenProp, NavigationScreenProps } from "react-navigation";
import { connect } from "react-redux";

import { Async, IRootState } from "../../store";
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
import {
  Button,
  Card,
  CardSection,
  Confirm,
  Spinner,
  SpinnerSize,
} from "../common";
import EmployeeForm, { IFormProps } from "./EmployeeForm";

const styles = StyleSheet.create({
  errorTextStyle: {
    alignSelf: "center",
    color: "red",
    fontSize: 20,
  },
});

interface IProps extends IFormProps, NavigationScreenProps {
  employeeName: string;
  phone: string;
  shift: ShiftDay;
  uid: string | null;
  fireAction: Async<null>;
  fireModalShown: boolean;
  updateAction: Async<null>;
  dispatchShowFireModal: () => void;
  dispatchUpdateEmployee: (
    employee: IEmployee<string | null>,
    navigation: NavigationScreenProp<any>,
  ) => void;
  dispatchResetForm: () => void;
  dispatchCloseModal: () => void;
  dispatchFireEmployee: (
    uid: string | null,
    navigation: NavigationScreenProp<any>,
  ) => void;
}

const renderButton = (
  label: string,
  isLoading: boolean,
  onSubmit: () => void,
  size: SpinnerSize = SpinnerSize.Large,
) => {
  if (isLoading) {
    return <Spinner size={size} />;
  }
  return <Button onPress={onSubmit}>{label}</Button>;
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
      fireAction,
      fireModalShown,
      updateAction,
      dispatchShowFireModal,
      dispatchUpdateEmployee,
      dispatchCloseModal,
      dispatchFireEmployee,
      navigation,
    } = this.props;
    const { errorTextStyle } = styles;
    const onFireEmployee = () => dispatchFireEmployee(uid, navigation);
    return (
      <ScrollView>
        <Card>
          <EmployeeForm {...this.props} />

          {updateAction.state === "ERROR" && (
            <CardSection>
              <Text style={errorTextStyle}>{updateAction.error}</Text>
            </CardSection>
          )}
          <CardSection>
            {renderButton("Save", updateAction.state === "PROGRESS", () =>
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

          {fireAction.state === "ERROR" && (
            <CardSection>
              <Text style={errorTextStyle}>{fireAction.error}</Text>
            </CardSection>
          )}
          <CardSection>
            {renderButton(
              "Fire",
              fireAction.state === "PROGRESS",
              dispatchShowFireModal,
            )}
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
