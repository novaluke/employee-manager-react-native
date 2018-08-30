import * as React from "react";
import { Modal, StyleSheet, Text, View } from "react-native";

import Button from "./Button";
import CardSection from "./CardSection";

interface IProps {
  text: string;
  yesText?: string;
  noText?: string;
  isVisible: boolean;
  onYes: () => void;
  onNo: () => void;
}

const styles = StyleSheet.create({
  containerStyle: {
    justifyContent: "space-between",
  },
  textStyle: {
    fontSize: 18,
    paddingLeft: 5,
    paddingRight: 5,
  },
});

const Confirm: React.SFC<IProps> = ({
  text,
  isVisible,
  yesText = "Yes",
  noText = "No",
  onYes,
  onNo,
}) => (
  <Modal animationType="slide" visible={isVisible} onRequestClose={onNo}>
    <View>
      <CardSection>
        <Text style={styles.textStyle}>{text}</Text>
      </CardSection>
    </View>

    <View>
      <CardSection>
        <Button onPress={onYes}>{yesText}</Button>
      </CardSection>
      <CardSection>
        <Button onPress={onNo}>{noText}</Button>
      </CardSection>
    </View>
  </Modal>
);

export default Confirm;
