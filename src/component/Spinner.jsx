import { Box, CircularProgress } from "@mui/material";
import React from "react";

const Spinner = ({ sx, ...other }) => {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        ".MuiCircularProgress-root": {
          color: "#3d5179;",
          // color: "#fff;",
          width: "40px",
          height: "40px",
        },
        ...sx,
      }}
    >
      <CircularProgress {...other} />
    </Box>
  );
};

export default Spinner;
