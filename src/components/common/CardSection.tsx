import React from "react";
import { StyleSheet, View } from "react-native";

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

const CardSection: React.SFC<{}> = ({ children }) => (
  <View style={styles.containerStyle}>{children}</View>
);

export default CardSection;
