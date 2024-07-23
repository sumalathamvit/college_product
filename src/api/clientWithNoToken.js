import { create } from "apisauce";
import storage from "../auth/storage";
import string from "../string";

const apiClientNoToken = create({
  baseURL: string.TESTBASEURL,
  headers: {
    "Content-Type": "application/json",
  },
});

export default apiClientNoToken;
