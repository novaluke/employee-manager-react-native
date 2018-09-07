import React from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
} from "react-native";

const styles = StyleSheet.create({
  containerStyle: {
    alignItems: "center",
    flex: 1,
    flexDirection: "row",
    height: 40,
  },
  inputStyle: {
    borderColor: "#000",
    borderWidth: 1,
    color: "#000",
    flex: 2,
    fontSize: 18,
    lineHeight: 23,
    paddingLeft: 5,
    paddingRight: 5,
  },
  labelStyle: {
    flex: 1,
    fontSize: 18,
    paddingLeft: 20,
  },
});

export interface IProps extends TextInputProps {
  label: string;
}

const Input: React.SFC<IProps> = props => {
  const { label } = props;
  const { containerStyle, inputStyle, labelStyle } = styles;
  return (
    <View style={containerStyle}>
      <Text style={labelStyle}>{label}</Text>
      <TextInput {...props} style={inputStyle} />
    </View>
  );
};

export default Input;
