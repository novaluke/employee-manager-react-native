import React from "react";
import { View } from "react-native";
import PropTypes from "prop-types";

const styles = {
  containerStyle: {
    borderWidth: 1,
    borderRadius: 2,
    borderColor: "#ddd",
    borderBottomWidth: 0,
    elevation: 1,
    marginLeft: 5,
    marginRight: 5,
    marginTop: 10
  }
};

const Card = ({ children }) => {
  const { containerStyle } = styles;
  return <View style={containerStyle}>{children}</View>;
};

Card.propTypes = {
  children: PropTypes.node.isRequired
};

export default Card;
