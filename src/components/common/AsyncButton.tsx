import * as React from "react";
import { StyleSheet, Text, View } from "react-native";

import { Async } from "../../store";
import Button from "./Button";
import Spinner, { Size as SpinnerSize } from "./Spinner";

interface IProps {
  label: string;
  asyncAction: Async<any>;
  onPress: () => void;
  size?: SpinnerSize;
}

const styles = StyleSheet.create({
  errorTextStyle: {
    alignSelf: "center",
    color: "red",
    fontSize: 20,
  },
});

const AsyncButton: React.SFC<IProps> = ({
  label,
  asyncAction,
  onPress,
  size = SpinnerSize.Large,
}) => (
  <View style={{ flex: 1, flexDirection: "row" }}>
    {asyncAction.state === "ERROR" && (
      <Text style={styles.errorTextStyle}>{asyncAction.error}</Text>
    )}
    {asyncAction.state === "PROGRESS" ? (
      <Spinner size={size} />
    ) : (
      <Button onPress={onPress}>{label}</Button>
    )}
  </View>
);

export default AsyncButton;
