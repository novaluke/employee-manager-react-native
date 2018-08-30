import React from "react";
import { TextInput, View, Text } from "react-native";
import PropTypes from "prop-types";

const styles = {
  containerStyle: {
    height: 40,
    flex: 1,
    flexDirection: "row",
    alignItems: "center"
  },
  inputStyle: {
    borderColor: "#000",
    borderWidth: 1,
    color: "#000",
    paddingRight: 5,
    paddingLeft: 5,
    fontSize: 18,
    lineHeight: 23,
    flex: 2
  },
  labelStyle: {
    flex: 1,
    fontSize: 18,
    paddingLeft: 20
  }
};

const Input = props => {
  const { value, label, placeholder, onChangeText } = props;
  const { containerStyle, inputStyle, labelStyle } = styles;
  return (
    <View style={containerStyle}>
      <Text style={labelStyle}>{label}</Text>
      <TextInput
        {...props}
        value={value}
        style={inputStyle}
        onChangeText={onChangeText}
        placeholder={placeholder}
      />
    </View>
  );
};

Input.propTypes = {
  value: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  placeholder: PropTypes.string,
  onChangeText: PropTypes.func.isRequired
};

Input.defaultProps = {
  placeholder: ""
};

export { Input };
