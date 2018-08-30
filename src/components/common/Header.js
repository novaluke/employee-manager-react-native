import React from "react";
import { View, Text } from "react-native";
import PropTypes from "prop-types";

const styles = {
  viewStyle: {
    backgroundColor: "#f8f8f8",
    justifyContent: "center",
    alignItems: "center",
    height: 60,
    elevation: 2
  },
  textStyle: {
    fontSize: 20
  }
};

const Header = ({ headerText }) => {
  const { textStyle, viewStyle } = styles;
  return (
    <View style={viewStyle}>
      <Text style={textStyle}>{headerText}</Text>
    </View>
  );
};

Header.propTypes = {
  headerText: PropTypes.string.isRequired
};

export { Header };
