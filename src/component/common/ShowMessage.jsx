import React from "react";
import CustomText from "./CustomText";

function ShowMessage({ view = false, Message, className }) {
  if (!view) return false;

  return (
    <div
      className="text-center"
      style={{
        // backgroundColor: "#64b5f6",
        width: "100%",
        bottom: 0,
        flexDirection: "column",
        margin: "5px",
        color: "green",
      }}
    >
      <CustomText
        style={{ color: "green", fontWeight: "bold", marginLeft: "10px" }}
        className={className}
      >
        <div
          dangerouslySetInnerHTML={{
            __html: Message,
          }}
        ></div>
        {/* {Message} */}
      </CustomText>
    </div>
  );
}

export default ShowMessage;
