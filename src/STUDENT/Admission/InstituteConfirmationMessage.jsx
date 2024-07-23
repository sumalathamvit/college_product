//need to write the code for the confirmation message for the institute
import React from "react";

function InstituteConfirmationMessage() {
  //clear all location history
  window.history.pushState(null, "", window.location.href);

  return (
    <div className="success-message-container">
      <div className="success-icon">
        <svg
          width="100"
          height="100"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="12" cy="12" r="12" fill="#4caf50" />
          <path
            d="M16.5 8.5L10.5 14.5L7.5 11.5"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <h1 className="institute-success">Success!</h1>
      <p className="fs-2 institute-success-message">
        Thank you for your submission!
      </p>
    </div>
  );
}

export default InstituteConfirmationMessage;
