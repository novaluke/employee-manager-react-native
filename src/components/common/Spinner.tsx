import React from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";

const styles = StyleSheet.create({
  spinnerStyle: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
  },
});

export enum Size {
  Large = "large",
  Small = "small",
}

const Spinner: React.SFC<{ size: Size }> = ({ size }) => {
  const { spinnerStyle } = styles;
  return (
    <View style={spinnerStyle}>
      <ActivityIndicator size={size} />
    </View>
  );
};

export default Spinner;
