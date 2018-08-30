import React from "react";
import { StyleSheet, Text, View } from "react-native";

const styles = StyleSheet.create({
  textStyle: {
    fontSize: 20,
  },
  viewStyle: {
    alignItems: "center",
    backgroundColor: "#f8f8f8",
    elevation: 2,
    height: 60,
    justifyContent: "center",
  },
});

const Header: React.SFC<{ headerText: string }> = ({ headerText }) => {
  const { textStyle, viewStyle } = styles;
  return (
    <View style={viewStyle}>
      <Text style={textStyle}>{headerText}</Text>
    </View>
  );
};

export default Header;
