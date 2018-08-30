import React from "react";
import { View, ActivityIndicator } from "react-native";
import PropTypes from "prop-types";

const styles = {
  spinnerStyle: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  }
};

const Spinner = ({ size }) => {
  const { spinnerStyle } = styles;
  return (
    <View style={spinnerStyle}>
      <ActivityIndicator size={size} />
    </View>
  );
};

Spinner.propTypes = {
  size: PropTypes.oneOf(["small", "large"])
};

Spinner.defaultProps = {
  size: "large"
};

export default Spinner;
