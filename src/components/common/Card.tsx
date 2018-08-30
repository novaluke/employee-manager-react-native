import React from "react";
import { StyleSheet, View } from "react-native";

const styles = StyleSheet.create({
  containerStyle: {
    borderBottomWidth: 0,
    borderColor: "#ddd",
    borderRadius: 2,
    borderWidth: 1,
    elevation: 1,
    marginLeft: 5,
    marginRight: 5,
    marginTop: 10,
  },
});

const Card: React.SFC<{}> = ({ children }) => {
  const { containerStyle } = styles;
  return <View style={containerStyle}>{children}</View>;
};

export default Card;
