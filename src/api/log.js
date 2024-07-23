import client from "./client";

const sendError = async (
  method,
  parameter,
  os_name,
  emailid,
  raw_error_message,
  error_message
) => {
  const data = await client.post(
    "/api/method/erpnext.healthcare.doctype.healthcare_practitioner.api.error_log",
    {
      method,
      parameter,
      os_name,
      emailid,
      raw_error_message,
      error_message,
    }
  );
  return data;
};

export default {
  sendError,
};
