import React from "react";
import CustomText from "./CustomText";

function ErrorMessage({ view = false, Message, className }) {
  if (!view) return false;
  return (
    <div className="error-message">
      <div
        dangerouslySetInnerHTML={{
          __html: Message,
        }}
      ></div>
    </div>
  );
}

export default ErrorMessage;
