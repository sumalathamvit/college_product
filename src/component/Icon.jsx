import React from "react";
import PropTypes from "prop-types";

// Import all icons from MUI icons library
import * as MuiIcons from "@mui/icons-material";

// Define Icon component
const Icon = ({ iconName, color, fontSize, ...rest }) => {
  // Dynamically get the icon component based on iconName
  const IconComponent = MuiIcons[iconName];

  if (!IconComponent) {
    console.error(`Icon "${iconName}" not found`);
    return null;
  }

  return <IconComponent color={color} fontSize={fontSize} {...rest} />;
};

// Define prop types for Icon component
Icon.propTypes = {
  // Name of the icon to render
  iconName: PropTypes.string.isRequired,
  // Color of the icon
  color: PropTypes.string,
  // Font size of the icon
  fontSize: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

// Set default props for Icon component
Icon.defaultProps = {
  color: "inherit",
  fontSize: "default",
};

export default Icon;
