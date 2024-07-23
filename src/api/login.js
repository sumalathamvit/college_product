import client from "./client";
import clientWithNoToken from "./clientWithNoToken";

const getToken = async (email, password) => {
  const data = await clientWithNoToken.post(
    "/api/method/education.smvss.app_api.app_token",
    {
      email,
      password,
    }
  );
  return data;
};
const logIn = async (email, password) => {
  const data = await client.post(
    "/api/method/education.smvss.app_api.student_login",
    {
      email,
      password,
    }
  );
  return data;
};

const emailOtp = async (email) => {
  const data = await client.post(
    "/api/method/education.smvss.app_api.send_email_otp",
    {
      email,
    }
  );
  return data;
};

const passwordUpdate = async (email, new_password) => {
  const data = await client.put(`/api/resource/User/${email}`, {
    new_password,
  });
  return data;
};

const pushNotificationTokenUpdate = async (student_id, device_token) => {
  const data = await client.post(
    `/api/method/education.smvss.app_api.add_device_notification_id`,
    {
      student_id,
      device_token,
    }
  );
  return data;
};

// const updateapp = async (appVersion) => {
//   const data = await client.post(
//     "/api/method/education.smvss.app_api.app_force_update",
//     {
//       appName: "student",
//       osName: Platform.OS,
//       appVersion,
//     }
//   );
//   return data;
// };

const getConfig = async (college_id) => {
  const data = await client.post(
    "/api/method/education.smvss.staff.get_config_details",
    {
      college_id,
    }
  );
  return data;
};

const sendOtp = async (mobile_number) => {
  const data = await client.post(
    "/api/method/education.smvss.app_api.student_mobile_login",
    {
      mobile_number,
    }
  );
  return data;
};

const getBaseUrl = async (user_url) => {
  const data = await client.post(
    "/api/method/education.smvss.app_api.app_master",
    {
      user_url,
    }
  );
  return data;
};

const getRegisterOTP = async (mobile_number, college_name) => {
  const data = await client.post(
    "/api/method/education.smvss.app_api.student_register_otp",
    {
      mobile_number,
      college_name,
    }
  );
  return data;
};

const getVersionData = async () => {
  const data = await client.post(
    "/api/method/education.smvss.app_api.get_version_data",
    {
      osName: "website",
    }
  );
  return data;
};

export default {
  getToken,
  logIn,
  emailOtp,
  passwordUpdate,
  pushNotificationTokenUpdate,
  getConfig,
  sendOtp,
  getBaseUrl,
  getRegisterOTP,
  getVersionData,
};
