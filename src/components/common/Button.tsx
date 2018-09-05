import React from "react";
import { StyleSheet, Text, TouchableOpacity } from "react-native";

const styles = StyleSheet.create({
  buttonStyle: {
    backgroundColor: "#fff",
    borderColor: "#007aff",
    borderRadius: 5,
    borderWidth: 1,
    marginLeft: 5,
    marginRight: 5,
  },
  textStyle: {
    alignSelf: "center",
    color: "#007aff",
    fontSize: 16,
    fontWeight: "600",
    paddingBottom: 10,
    paddingTop: 10,
  },
});

const Button: React.SFC<{ onPress: () => void }> = ({ onPress, children }) => {
  const { buttonStyle, textStyle } = styles;
  return (
    <TouchableOpacity style={buttonStyle} onPress={onPress}>
      <Text style={textStyle}>{children}</Text>
    </TouchableOpacity>
  );
};

export default Button;
