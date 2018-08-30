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

import { IRootState } from "../store";
import { editEmployee, IEmployee } from "../store/Employee";
import { unwatchEmployees, watchEmployees } from "../store/Employees";

import { CardSection, Spinner, SpinnerSize } from "./common";

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
  employees: { [uid: string]: IEmployee };
  loading: boolean;
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
    const { navigation } = this.props;
    unwatchEmployees(navigation);
  }

  private renderEmployee = ({ item: employee }: { item: IEmployee }) => {
    const { dispatchEditEmployee, navigation } = this.props;
    const onPress = () => dispatchEditEmployee(navigation, employee);
    return (
      <TouchableOpacity onPress={onPress}>
        <CardSection>
          <Text>{employee.employeeName}</Text>
        </CardSection>
      </TouchableOpacity>
    );
  };

  public render() {
    const { loading, employees } = this.props;
    return (
      <View>
        {loading === true && <Spinner size={SpinnerSize.Large} />}
        <FlatList
          data={Object.keys(employees).map((uid: string) => ({
            uid,
            key: uid, // For React element list indexing
            ...employees[uid],
          }))}
          renderItem={this.renderEmployee}
        />
      </View>
    );
  }
}

const mapStateToProps = (state: IRootState) => {
  const { loading, employees } = state.employees;
  return {
    employees,
    loading,
  };
};

export default connect(
  mapStateToProps,
  {
    dispatchEditEmployee: editEmployee,
    dispatchWatchEmployees: watchEmployees,
  },
)(EmployeeList);

// export default EmployeeList;
