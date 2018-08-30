import * as React from "react";
import { Picker, StyleSheet, Text, View } from "react-native";
import { connect } from "react-redux";

import { IRootState } from "../../store";
import {
  FieldUpdatePayload,
  ShiftDay,
  updateField,
} from "../../store/Employee";
import { CardSection, Input } from "../common";

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

export interface IFormProps {
  employeeName: string;
  phone: string;
  shift: ShiftDay;
  dispatchFieldUpdate: (payload: FieldUpdatePayload) => void;
  error: string;
}

const Form = ({
  employeeName,
  phone,
  shift,
  dispatchFieldUpdate,
  error,
}: IFormProps) => {
  const dispatchUpdateName = (value: string) =>
    dispatchFieldUpdate({ value, field: "employeeName" });
  const dispatchUpdatePhone = (value: string) =>
    dispatchFieldUpdate({ value, field: "phone" });
  const dispatchUpdateShift = (value: ShiftDay) =>
    dispatchFieldUpdate({ value, field: "shift" });
  return (
    <View>
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
          {Object.keys(ShiftDay).map(key => (
            <Picker.Item
              key={key}
              value={key}
              label={ShiftDay[key as keyof typeof ShiftDay]}
            />
          ))}
        </Picker>
      </CardSection>

      {error !== "" && (
        <CardSection>
          <Text style={styles.errorTextStyle}>{error}</Text>
        </CardSection>
      )}
    </View>
  );
};

const mapStateToProps = (state: IRootState) => {
  const { employeeName, phone, shift } = state.employee;
  return { employeeName, phone, shift };
};

export default connect(
  mapStateToProps,
  { dispatchFieldUpdate: updateField },
)(Form);
