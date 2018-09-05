import React, { Component } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { NavigationScreenProp, NavigationScreenProps } from "react-navigation";
import { connect } from "react-redux";

import { Async, IRootState } from "../../store";
import { editEmployee, IEmployee } from "../../store/Employee";
import { unwatchEmployees, watchEmployees } from "../../store/Employees";

import { CardSection, Spinner, SpinnerSize } from "../common";

const addEmployee = (navigation: NavigationScreenProp<any>) => () =>
  navigation.navigate("CreateEmployee");

const styles = StyleSheet.create({
  addEmployeeTextStyle: {
    alignSelf: "center",
    color: "#007aff",
    fontSize: 16,
    fontWeight: "600",
    paddingRight: 10,
  },
});

interface IProps extends NavigationScreenProps {
  dispatchWatchEmployees: (navigation: NavigationScreenProp<any>) => void;
  dispatchEditEmployee: any;
  employeesAction: Async<{ [uid: string]: IEmployee<string> }>;
}

class EmployeeList extends Component<IProps> {
  public static navigationOptions = ({
    navigation,
  }: {
    navigation: NavigationScreenProp<any>;
  }) => ({
    // TODO extract this into a reusable component
    headerRight: (
      <TouchableOpacity onPress={addEmployee(navigation)}>
        <Text style={styles.addEmployeeTextStyle}>Create employee</Text>
      </TouchableOpacity>
    ),
    title: "Employees",
  });

  public componentDidMount() {
    const { dispatchWatchEmployees, navigation } = this.props;
    dispatchWatchEmployees(navigation);
  }

  public componentWillUnmount() {
    unwatchEmployees();
  }

  private renderEmployee = ({
    item: employee,
  }: {
    item: IEmployee<string>;
  }) => {
    const { dispatchEditEmployee, navigation } = this.props;
    const onPress = () => dispatchEditEmployee(employee, navigation);
    return (
      <TouchableOpacity onPress={onPress}>
        <CardSection>
          <Text>{employee.employeeName}</Text>
        </CardSection>
      </TouchableOpacity>
    );
  };

  public render() {
    const { employeesAction } = this.props;
    const keyExtractor = ({ uid }: IEmployee<string>) => uid;
    return (
      <View>
        {employeesAction.state === "PROGRESS" && (
          <Spinner size={SpinnerSize.Large} />
        )}
        {employeesAction.state === "COMPLETE" && (
          <FlatList
            data={Object.keys(employeesAction.value).map((uid: string) => ({
              uid,
              ...employeesAction.value[uid],
            }))}
            renderItem={this.renderEmployee}
            keyExtractor={keyExtractor}
          />
        )}
      </View>
    );
  }
}

const mapStateToProps = (state: IRootState) => {
  const { employeesAction } = state.employees;
  return {
    employeesAction,
  };
};

export default connect(
  mapStateToProps,
  {
    dispatchEditEmployee: editEmployee,
    dispatchWatchEmployees: watchEmployees,
  },
)(EmployeeList);
