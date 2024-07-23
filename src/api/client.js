import { create } from "apisauce";
import storage from "../auth/storage";
import string from "../string";

const apiClient = create({
  baseURL: string.TESTBASEURL,
  headers: {
    "Content-Type": "application/json",
  },
});
apiClient.addAsyncRequestTransform(async (request) => {
  const adminToken = storage.getAdminToken();
  const authToken = sessionStorage.getItem("token");

  const studentToken = storage.getStudentToken();
  console.log(
    "token---",
    studentToken ? studentToken : authToken ? authToken : adminToken
  );
  request.headers["Authorization"] = studentToken
    ? studentToken
    : authToken
    ? authToken
    : adminToken;
});

export default apiClient;
