import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import * as Yup from "yup";
import { Formik } from "formik";
import Paper from "@mui/material/Paper";
import LockOpenIcon from "@mui/icons-material/LockOpen";

import preFunction from "../component/common/CommonFunction";
import Button from "../component/FormField/Button";
import TextFieldFormik from "../component/FormFieldLibrary/TextFieldFormik";
import ModalComponent from "../component/ModalComponent";
import CustomActivityIndicator from "../component/common/CustomActivityIndicator";

import login from "../api/login";

import string from "../string";
import AuthContext from "../auth/context";

function InstituteRegister() {
  //#region const
  const { instituteName } = useContext(AuthContext);
  const navigate = useNavigate();

  const [load, setLoad] = useState(false);

  const [modalErrorOpen, setModalErrorOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [modalTitle, setModalTitle] = useState("");
  const [otpnumber, setOtpNumber] = useState();
  const [getOtp, setGetOtp] = useState(false);
  const [captchaText, setCaptchaText] = useState("");
  const [checkCaptcha, setCheckCaptcha] = useState(false);

  const StudentFormSchema = Yup.object().shape({
    mobile: Yup.string()
      .test(
        "is-ten-digits",
        "Mobile number must be exactly 10 digits",
        (value) => /^[0-9]{10}$/.test(String(value))
      )
      .test(
        "is-valid-starting-digit",
        "Mobile number must start with 6, 7, 8, or 9",
        (value) => /^[6-9][0-9]{9}$/.test(String(value))
      )
      .required("Please enter Mobile Number"),
    captcha: getOtp ? null : Yup.string().required("Please enter Captcha"),

    otp: getOtp ? Yup.string().required("Please enter OTP") : null,
  });
  //#endregion

  const generateCaptcha = () => {
    const characters =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let captcha = "";
    for (let i = 0; i < 6; i++) {
      captcha += characters.charAt(
        Math.floor(Math.random() * characters.length)
      );
    }
    console.log(captcha, "captcha");
    setCaptchaText(captcha);
  };

  const handleGetOTP = async (values) => {
    console.log("handleGetOTP", values);
    try {
      setLoad(true);
      // Verify CAPTCHA token before proceeding
      console.log(values.captcha, captchaText, "values.captcha");
      if (values.captcha !== captchaText) {
        setCheckCaptcha(true);
        generateCaptcha();
        setLoad(false);
        return;
      }
      setCheckCaptcha(false);

      const response = await login.getRegisterOTP(
        values.mobile,
        sessionStorage.getItem("INSTITUTE_NAME") ?? string.INSTITUTE_NAME
      );
      console.log(response, "response");

      if (!response.data.message.result) {
        setModalErrorOpen(true);
        setModalMessage(response.data.message.data);
        setModalTitle("Message");
        setLoad(false);
        return;
      }

      setGetOtp(true);
      setOtpNumber(response.data.message.otp);
      setLoad(false);
    } catch (error) {
      setLoad(false);
    }
  };

  const handleOTPVerify = async (value) => {
    console.log(value, "value");

    try {
      const enterOtp = value.otp;
      console.log(enterOtp, otpnumber, "enterOtp");
      if (parseInt(otpnumber) !== parseInt(enterOtp)) {
        setModalErrorOpen(true);
        setModalMessage("Invalid OTP");
        setModalTitle("Message");
        return;
      }

      setGetOtp(false);
      navigate("/registration", {
        state: { mobileNo: value.mobile },
      });
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    setLoad(false);
    generateCaptcha();
  }, []);

  return (
    <>
      <CustomActivityIndicator
        style={{ height: 100, alignSelf: "center" }}
        visible={load}
      />
      <ModalComponent
        title={modalTitle}
        isOpen={modalErrorOpen}
        message={modalMessage}
        okClick={() => setModalErrorOpen(false)}
      />
      <div className="container mt-5 pt-5">
        <div className="row no-gutters">
          <div
            className="row p-4"
            style={{
              backgroundColor: "#fff",
              minHeight: "700px",
              borderRadius: "35px",
            }}
          >
            <div className="col-lg-6">
              <Paper elevation={4} className="paper mobile-number-page">
                <div className="row p-3">
                  <div className="text-center">
                    <LockOpenIcon
                      style={{
                        width: "2em",
                        height: "2em",
                        color: "#3d5179",
                      }}
                    />
                    <div className="logheader">{"Course Registration"}</div>
                  </div>

                  <Formik
                    enableReinitialize={false}
                    initialValues={{
                      mobile: "",
                      captcha: "",
                      otp: "",
                    }}
                    validationSchema={StudentFormSchema}
                    onSubmit={getOtp ? handleOTPVerify : handleGetOTP}
                  >
                    {({
                      errors,
                      handleSubmit,
                      handleChange,
                      setFieldValue,
                    }) => {
                      return (
                        <form onSubmit={handleSubmit} autoComplete="off">
                          <div className="row">
                            <div className="col-lg-2"></div>
                            <div className="col-lg-8">
                              <div className="row no-gutters mt-3 text-center">
                                <label>Mobile Number</label>
                              </div>
                              <TextFieldFormik
                                autoFocus
                                id="mobile"
                                name="mobile"
                                placeholder="Mobile Number"
                                maxLength={10}
                                tabIndex={1}
                                mandatory={1}
                                onChange={(e) => {
                                  if (
                                    preFunction.amountValidation(e.target.value)
                                  )
                                    setFieldValue("mobile", e.target.value);
                                }}
                                disabled={getOtp}
                              />

                              {!getOtp && (
                                <div className="captcha-container mt-3">
                                  <div className="captcha">
                                    {captchaText
                                      .split("")
                                      .map((char, index) => (
                                        <span
                                          key={index}
                                          className="captcha-char"
                                        >
                                          {char}
                                        </span>
                                      ))}
                                  </div>
                                  <TextFieldFormik
                                    labelSize={4}
                                    id="captcha"
                                    name="captcha"
                                    placeholder={"Enter the Captcha"}
                                    tabIndex={2}
                                    maxlength={6}
                                    mandatory={1}
                                    onChange={(e) => {
                                      setFieldValue("captcha", e.target.value);
                                      setCheckCaptcha(false);
                                    }}
                                  />
                                  {checkCaptcha && (
                                    <div className="error-message">
                                      Incorrect Captcha
                                    </div>
                                  )}
                                </div>
                              )}

                              {getOtp && (
                                <div className="mt-3">
                                  <TextFieldFormik
                                    autoFocus
                                    id="otp"
                                    name="otp"
                                    placeholder="Enter Six digit OTP"
                                    maxLength={6}
                                    tabIndex={3}
                                    mandatory={1}
                                    onChange={(e) => {
                                      if (
                                        preFunction.amountValidation(
                                          e.target.value
                                        )
                                      ) {
                                        setFieldValue("otp", e.target.value);
                                      }
                                    }}
                                  />
                                </div>
                              )}
                            </div>
                          </div>
                          {getOtp && (
                            <div className="error-message text-center mt-1">
                              OTP has been sent to your Mobile Number
                            </div>
                          )}

                          <Button
                            type="submit"
                            text={"Register"}
                            tabIndex={getOtp ? 4 : 3}
                            onClick={(e) => {
                              preFunction.handleErrorFocus(errors);
                            }}
                          />
                        </form>
                      );
                    }}
                  </Formik>
                </div>
              </Paper>
            </div>

            <div className="col-lg-6 my-2 mr-2">
              <div className="loginbluebgbox">
                <div className="row no-gutters px-4">
                  <div className="col-lg-6"></div>
                  <div className="col-lg-6 loginlefttext">
                    {instituteName != ""
                      ? instituteName
                      : string.INSTITUTE_NAME}
                  </div>
                </div>

                <div style={{ padding: "18% 20%" }}>
                  <div className="streamtext">WELCOME TO</div>
                  <div className="login-library-text">Institute Management</div>
                  <div className="login-login-text mt-3 pt-3">
                    Login to Access Dashboard
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default InstituteRegister;
