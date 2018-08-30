import React from "react";
import { StyleSheet, View, ViewProps } from "react-native";

const styles = StyleSheet.create({
  containerStyle: {
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderColor: "#ddd",
    flexDirection: "row",
    justifyContent: "flex-start",
    padding: 5,
    position: "relative",
  },
});

const CardSection: React.SFC<ViewProps> = ({ children, style, ...rest }) => (
  <View style={[styles.containerStyle, style]} {...rest}>
    {children}
  </View>
);

export default CardSection;
