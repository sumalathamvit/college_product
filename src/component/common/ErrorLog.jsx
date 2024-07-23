import log from "../../api/log";
import storage from "../../auth/storage";
import string from "../../string";

const ErrorLog = async (
  url,
  rawErrorResponse,
  errorMessage,
  parameter = ""
) => {
  const res = JSON.parse(rawErrorResponse);
  if (res.data.exception.indexOf("PermissionError") != -1) {
    window.location.replace("/logout");
    return;
  }
  try {
    const emailId = storage.getID();
    const res = await log.sendError(
      string.VERSION + " " + url,
      parameter,
      "Web",
      emailId ? emailId : "guest",
      JSON.stringify(rawErrorResponse),
      JSON.stringify(errorMessage)
    );
    console.log("errorlogRes----------", res);
  } catch (error) {
    console.log("Error---", error);
  }
};
export default ErrorLog;
