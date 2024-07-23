import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import * as Yup from "yup";
import { Formik } from "formik";
import Paper from "@mui/material/Paper";
import LockOpenIcon from "@mui/icons-material/LockOpen";
import { useDispatch } from "react-redux";

import EmployeeApi from "../api/EmployeeApi";
import login from "../api/login";

import string from "../string";

import storage from "../auth/storage";
import AuthContext from "../auth/context";
import useAuth from "../auth/useAuth";

import { webSliceActions } from "../store/web";

import preFunction from "../component/common/CommonFunction";
import Button from "../component/FormField/Button";
import TextFieldFormik from "../component/FormFieldLibrary/TextFieldFormik";
import ModalComponent from "../component/ModalComponent";
import MenuArrayFunction from "../component/common/MenuArrayFunction";
import MenuArrayFunctionSchool from "../component/common/MenuArrayFunctionSchool";
import CustomActivityIndicator from "../component/common/CustomActivityIndicator";
import InstituteMenuArrayFunction from "../component/common/InstituteMenuArrayFunction";
import StudentListModal from "../component/StudentListModal";

const FormSchema = Yup.object().shape({
  email: Yup.string()
    .email("Please enter valid Email")
    .required("Please enter Email")
    .trim(),
  password: Yup.string().required("Please enter Password").trim(),
});

function Login() {
  //#region const
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [load, setLoad] = useState(false);
  const { setTopMenuData, setRole, role, instituteName, setStudentList } =
    useContext(AuthContext);
  const authLogin = useAuth();

  const [modalErrorOpen, setModalErrorOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [modalTitle, setModalTitle] = useState("");
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [studentData, setStudentData] = useState([]);
  const [studentLogin, setStudentLogin] = useState(false);
  const [otpnumber, setOtpNumber] = useState();
  const [studentListModal, setStudentListModal] = useState(false);

  const StudentFormSchema = Yup.object().shape({
    mobile: Yup.string()
      .required("Please enter Mobile Number")
      .matches(/^[0-9]{10}$/, "Please enter valid Mobile Number"),

    otp:
      studentData.length > 0 ? Yup.string().required("Please enter OTP") : null,
  });

  //#endregion

  const redirectLoggedIn = async () => {
    if (sessionStorage.getItem("token")) {
      navigate(role === "student" ? "/lms-my-course" : "/library-dashboard");
    }
  };
  const handleSubmit = async (values) => {
    if (load) return;
    console.log("email---", values?.email, "pass--", values?.password);

    try {
      setLoad(true);
      const loginRes = await EmployeeApi.loginTOWebsite(
        values?.email,
        values?.password
      );
      console.log("loginRes---", loginRes);
      if (!loginRes.data.message.result) {
        setModalMessage("Invalid login credentials");
        setModalErrorOpen(true);
        setModalTitle("Invalid");
        setLoad(false);
        return;
      }
      storage.storePageConfig(loginRes.data.message.data.page_config);
      console.log(
        "role_profile_name---",
        loginRes?.data?.message?.data.role_profile_name
      );
      if (
        loginRes?.data?.message?.data.role_profile_name?.toUpperCase() ===
        string.SUPER_ADMIN_ROLE
      ) {
        console.log("Super Admin---");
        let newMenuArr =
          loginRes.data.message.data.config_data.institution_type === 5
            ? InstituteMenuArrayFunction()
            : loginRes.data.message.data.config_data.institution_type === 1
            ? MenuArrayFunctionSchool()
            : MenuArrayFunction();
        console.log("newMenuArr---", newMenuArr);
        console.log("---", loginRes.data.message.data.config_data);
        setTopMenuData(newMenuArr);
        storage.storeTopMenuData(newMenuArr);
      } else if (
        loginRes.data.message.data.access_form &&
        loginRes.data.message.data.access_form.length > 0
      ) {
        const accessFormArr = loginRes.data.message.data.access_form[0].link
          .split(",")
          .map((item) => item.trim());
        const accessModule =
          loginRes.data.message.data.access_module[0].module.split(",");
        console.log("accessFormArr---", accessFormArr, accessModule);

        // Checking Billing Access

        let billAccess = 0;
        if (accessFormArr.includes("payment-entry")) {
          billAccess = 1;
        }

        sessionStorage.setItem("BILL_ACCESS", billAccess);

        let newMenuArr =
          loginRes.data.message.data.config_data.institution_type === 5
            ? InstituteMenuArrayFunction()
            : loginRes.data.message.data.config_data.institution_type === 1
            ? MenuArrayFunctionSchool()
            : MenuArrayFunction();
        // console.log("menuData---", menuData);.

        newMenuArr.map((item, index) => {
          item.subMenu.map((subMenu, index1) => {
            // console.log("subMenu---", subMenu);
            subMenu.subData.map((subData, index2) => {
              // console.log("subData---1234", subMenu.subData, subData, index2);

              // console.log("subData---", subData, index2, subData.subMenu);
              if (subData.subMenu) {
                subData.subMenu.map((subMenu1, index3) => {
                  // console.log("subMenu1---", subMenu1, subMenu1.link);
                  let contains1 = 0;
                  if (accessFormArr.includes(subMenu1.link.substring(1))) {
                    contains1 = 1;
                  }
                  if (
                    contains1 === 0 &&
                    newMenuArr[index]?.subMenu[index1]?.subData[index2]?.subMenu
                  ) {
                    // console.log(
                    //   "subMenu1---",
                    //   newMenuArr[index].subMenu[index1].subData[index2].subMenu
                    // );
                    newMenuArr[index].subMenu[index1].subData[index2].subMenu =
                      newMenuArr[index].subMenu[index1].subData[
                        index2
                      ].subMenu.filter((item) => item.title !== subMenu1.title);
                  }
                });
              }
            });
            subMenu.subData.map((subData, index2) => {
              if (!subData.subMenu) {
                let contains = 0;
                if (subData.link) {
                  if (accessFormArr.includes(subData.link.substring(1))) {
                    contains = 1;
                  }
                }
                if (contains === 0) {
                  newMenuArr[index].subMenu[index1].subData = newMenuArr[
                    index
                  ].subMenu[index1].subData.filter(
                    (item) => item.title !== subData.title
                  );
                }
              }
            });
          });
        });
        newMenuArr.map((item, index) => {
          item.subMenu.map((subMenu) => {
            if (subMenu.subData.length === 0) {
              newMenuArr[index].subMenu = newMenuArr[index].subMenu.filter(
                (item) => item.title !== subMenu.title
              );
            }
            subMenu.subData.map((subData) => {
              if (subData.subMenu) {
                newMenuArr[index].subMenu = newMenuArr[index].subMenu.filter(
                  (item) => item.title !== subData.title
                  //  &&
                  //   (subData.subMenu.length > 0 || subData.link)
                );
              }
            });
          });
        });

        // filter new menu array title and access module array item and "home"
        newMenuArr = newMenuArr.filter(
          (item) => accessModule.includes(item.title) || item.title === "Home"
        );
        newMenuArr = newMenuArr.filter(
          (item) => item.subMenu.length !== 0 || item.title === "Home"
        );

        console.log("newMenuArr---", newMenuArr);
        setLoad(false);
        setTopMenuData(newMenuArr);
        storage.storeTopMenuData(newMenuArr);
      }

      sessionStorage.setItem(
        "EMPLOYEE_DETAIL",
        JSON.stringify(loginRes.data.message.data.employee_details)
      );
      sessionStorage.setItem("email", values.email);
      sessionStorage.setItem(
        "COMPANY",
        loginRes.data.message.data.company_name
      );
      sessionStorage.setItem(
        "DEFAULT_SHIFT",
        loginRes.data.message.data.default_shift ?? "S1"
      );
      sessionStorage.setItem(
        "PAYROLL_PAYABLE_ACCOUNT",
        loginRes.data.message.data.payroll_payable_account
      );
      sessionStorage.setItem(
        "COST_CENTER",
        loginRes.data.message.data.cost_center
      );
      sessionStorage.setItem("NO_OF_PERIOD", string.NO_OF_PERIOD);
      sessionStorage.setItem("SESSION", true);

      // sessionStorage.setItem("C", string.common_logo);

      authLogin.logIn(
        loginRes.data.message.data.token,
        loginRes.data.message.data.employee_details
          ? loginRes.data.message.data.employee_details.employee_name
          : "",
        loginRes.data.message.data.role_profile_name,
        loginRes.data.message.data.employee_details
          ? loginRes.data.message.data.employee_details.custom_employeeid
          : "",
        loginRes.data.message.data.college_id,
        loginRes.data.message.data.company_name,
        loginRes.data.message.data.employee_details
          ? loginRes.data.message.data.employee_details.department
          : "",
        loginRes.data.message.data.role
      );
      dispatch(
        webSliceActions.replaceCollege({
          institution_type:
            loginRes.data.message.data.config_data.institution_type,
          is_semester: loginRes.data.message.data.config_data.is_sem,
          is_university:
            loginRes.data.message.data.config_data.institution_type === 4
              ? true
              : false,
          collegeList: loginRes.data.message.data.config_data.college_detail,
          validity: loginRes.data.message.data.config_data.validity,
          address: loginRes.data.message.data.config_data.address,
          second_line: loginRes.data.message.data.config_data.second_line,
          third_line: loginRes.data.message.data.config_data.third_line,
          fourth_line: loginRes.data.message.data.config_data.fourth_line,
          fifth_line: loginRes.data.message.data.config_data.fifth_line,
          phone: loginRes.data.message.data.config_data.phone,
          fax: loginRes.data.message.data.config_data.fax,
          print_email: loginRes.data.message.data.config_data.print_email,
          logo:
            string.TESTBASEURL + loginRes.data.message.data.config_data.logo,
          no_of_term: loginRes.data.message.data.config_data.no_of_term,
          common_cashier: loginRes.data.message.data.config_data.common_cashier,
          common_logo: loginRes.data.message.data.config_data.common_logo,
        })
      );

      if (parseInt(values?.password)) {
        // navigate("/reset-password");

        // need to navigate & pass one data
        navigate("/reset-password", {
          state: {
            empDetails: {
              ...loginRes.data.message.data.employee_details,
              personal_email: values.email,
            },
          },
        });
      } else {
        navigate("/library-dashboard");
      }

      setLoad(false);
    } catch (error) {
      console.log("Error", error);
      setLoad(false);
      return;
    }
  };

  const handleGetOTP = async ({ mobile }) => {
    console.log(mobile, "mobile");
    try {
      setLoad(true);
      console.log(mobile, "mobile");
      const response = await login.sendOtp(mobile);

      console.log(response, "response");
      if (!response.ok) {
        setLoad(false);

        return;
      }
      console.log(response.data.message.otp, "otp");

      if (response.data.message.result === false) {
        setLoad(false);
        // setOpen(true);
        // setErrorMessage(true);
        // setMessage(response.data.message.data);
        // setTimeout(() => {
        //   setOpen(false);
        //   setErrorMessage(false);
        // }, 3000);

        setModalErrorOpen(true);
        setModalMessage(response.data.message.data);
        setModalTitle("Error");
      } else {
        setOtpNumber(response.data.message.otp);
        setLoad(false);
        setStudentData(response.data.message.student);
        setStudentList(response.data.message.student);
      }
    } catch (error) {
      setLoad(false);
    }
  };

  const handleOTPVerify = async (value) => {
    console.log(value, "value");
    if (!value.otp) {
      setModalErrorOpen(true);
      setModalMessage("Please enter OTP");
      setModalTitle("Error");

      return;
    }

    try {
      const enterOtp = value.otp;
      console.log(enterOtp, otpnumber, "enterOtp");
      if (!enterOtp) {
        setModalErrorOpen(true);
        setModalMessage("Please enter Valid OTP");
        setModalTitle("Error");
        return;
      }

      if (parseInt(otpnumber) !== parseInt(enterOtp)) {
        setModalErrorOpen(true);
        setModalMessage("Invalid OTP");
        setModalTitle("Error");

        return;
      }

      console.log(studentData[0], "Valid OTP");

      if (studentData && studentData.length > 1) {
        setStudentListModal(true);
        storage.storeStudentList(studentData);
        return;
      }

      storage.storeToken(studentData[0].token);
      if (studentData && studentData.length > 0) {
        setRole("student");
        storage.storeRole("student");
        authLogin.studentLogIn(
          studentData[0].name,
          studentData[0].email,
          studentData[0].studentID || studentData[0].studentID === 0
            ? studentData[0].studentID.toString()
            : "",
          studentData[0].registrationNo || studentData[0].registrationNo === 0
            ? studentData[0].registrationNo.toString()
            : "",
          studentData[0].enrollNo || studentData[0].enrollNo === 0
            ? studentData[0].enrollNo.toString()
            : "",
          studentData[0].classID || studentData[0].classID === 0
            ? studentData[0].classID.toString()
            : "",
          studentData[0].batch_id || studentData[0].batch_id === 0
            ? studentData[0].batch_id.toString()
            : "",
          studentData[0].courseID || studentData[0].courseID === 0
            ? studentData[0].courseID.toString()
            : "",
          studentData[0].collegeID || studentData[0].collegeID === 0
            ? studentData[0].collegeID.toString()
            : "",
          studentData[0].semester || studentData[0].semester === 0
            ? studentData[0].semester.toString()
            : "",
          new Date().toString(),
          studentData[0].photo ? studentData[0].photo : "",
          studentData[0].className ? studentData[0].className : "",
          studentData[0].token ? studentData[0].token : "",
          studentData[0].studyYear || studentData[0].studyYear === 0
            ? studentData[0].studyYear.toString()
            : ""
        );

        let newMenuArr = [
          {
            title: "LMS Dashboard",
            class: "",
            subMenu: [],
            icon: "Home",
            link: "/lms-my-course",
            mainTitleID: 1,
            subTitleID: 1,
          },
        ];

        storage.storeTopMenuData(newMenuArr);

        setTopMenuData(newMenuArr);
        navigate("/lms-my-course");
      } else {
        setOpen(true);
        setMessage("User not found");
        setTimeout(() => {
          setOpen(false);
        }, 3000);
        return;
      }
    } catch (error) {
      console.log(error);
    }
  };

  // const getConfig = async (college_id) => {
  //   console.log("college_id---", college_id);
  //   try {
  //     const res = await login.getConfig(college_id);

  //     console.log("res---", res.data.message);

  //     dispatch(
  //       authSliceActions.replaceConfig({
  //         institution_type: res.data.message.data.config_data.institution_type,
  //         is_semester: res.data.message.data.config_data.is_sem,
  //         is_university:
  //           res.data.message.data.config_data.institution_type === 4
  //             ? true
  //             : false,
  //         // is_university: false,
  //         collegeList: res.data.message.data.config_data.college_detail,
  //         validity: res.data.message.data.config_data.validity,
  //         address: res.data.message.data.config_data.address,
  //         phone: res.data.message.data.config_data.Phone,
  //         logo: res.data.message.data.config_data.logo,
  //       })
  //     );
  //   } catch (error) {
  //     // setLoad(false);
  //     // // setOpenModal(false);
  //     // console.log("Exception---", error);
  //   }
  // };

  const getAdminToken = async () => {
    try {
      const res = await login.getToken(string.testEmail, string.testPassword);
      console.log("res----", res);
      if (res.data.message.result === true) {
        console.log(res.data.message.data, "res.data.message.data");
        storage.storeAdminToken(res.data.message.data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    setLoad(false);
    redirectLoggedIn();
    getAdminToken();
  }, []);

  // useEffect(() => {
  //   console.log(
  //     "sessionStorage.getItem(INSTITUTE_NAME)---",
  //     sessionStorage.getItem("INSTITUTE_NAME")
  //   );
  //   setInstituteName(sessionStorage.getItem("INSTITUTE_NAME"));
  // }, [sessionStorage.getItem("INSTITUTE_NAME")]);

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
            className="row no-gutters p-4"
            style={{
              backgroundColor: "#fff",
              borderRadius: "35px",
            }}
          >
            {/* <div
              style={{
                textAlign: "right",
              }}
            >
              <a
                onClick={() => setStudentLogin(true)}
                className="student-text-lms"
              >
                Student Login
              </a>
              &nbsp;&nbsp; &nbsp;&nbsp; &nbsp;&nbsp;
              <a
                onClick={() => setStudentLogin(false)}
                className="student-text-lms "
              >
                Staff Login
              </a>
              &nbsp;&nbsp; &nbsp;&nbsp;
            </div> */}
            <div className="col-lg-6" style={{ minHeight: "650px" }}>
              <Paper elevation={4} className="paper">
                <div className="row p-3 ">
                  <div className="text-center mt-5">
                    <LockOpenIcon
                      style={{
                        width: "2em",
                        height: "2em",
                        color: "#3d5179",
                      }}
                    />
                    <div className="logheader">
                      {studentLogin ? "Student Login Here" : "Login here"}
                    </div>
                  </div>

                  {studentLogin ? (
                    <Formik
                      enableReinitialize={false}
                      initialValues={{
                        mobile: "",
                        otp: "",
                      }}
                      validationSchema={StudentFormSchema}
                      onSubmit={
                        studentData.length > 0 ? handleOTPVerify : handleGetOTP
                      }
                    >
                      {({
                        errors,
                        handleSubmit,
                        handleChange,
                        setFieldValue,
                      }) => {
                        return (
                          <form onSubmit={handleSubmit} autoComplete="off">
                            <TextFieldFormik
                              autoFocus
                              id="mobile"
                              name="mobile"
                              label="Mobile Number"
                              maxLength={10}
                              tabIndex={1}
                              mandatory={1}
                              onChange={(e) => {
                                {
                                  if (
                                    preFunction.amountValidation(e.target.value)
                                  )
                                    setFieldValue("mobile", e.target.value);
                                }
                                setStudentData([]);
                                setStudentList([]);
                              }}
                              // disabled={studentData.length > 0}
                            />

                            {studentData.length > 0 ? (
                              <div className="text-center mt-3">
                                <TextFieldFormik
                                  id="otp"
                                  name="otp"
                                  placeholder="Enter Six digit OTP"
                                  maxLength={6}
                                  tabIndex={2}
                                  mandatory={1}
                                  onChange={(e) => {
                                    {
                                      if (
                                        preFunction.amountValidation(
                                          e.target.value
                                        )
                                      ) {
                                        setFieldValue("otp", e.target.value);
                                      }
                                    }
                                  }}
                                />

                                <div className="mt-1">
                                  OTP has been sent to your mobile number
                                </div>
                              </div>
                            ) : null}

                            <Button
                              type="submit"
                              title="Login"
                              text={"Login"}
                              tabIndex={3}
                              onClick={(e) => {
                                preFunction.handleErrorFocus(errors);
                              }}
                            />

                            {/* {studentData.length > 0 ? (
                              <div
                                className="text-center mt-1"
                                style={{ color: "#0669ad", cursor: "pointer" }}
                                onClick={() => {
                                  setStudentData([]);
                                }}
                              >
                                Resend OTP
                              </div>
                            ) : null} */}
                          </form>
                        );
                      }}
                    </Formik>
                  ) : (
                    <Formik
                      enableReinitialize={false}
                      initialValues={{
                        email: "",
                        password: "",
                      }}
                      validationSchema={FormSchema}
                      onSubmit={handleSubmit}
                    >
                      {({ errors, handleSubmit, handleChange }) => {
                        return (
                          <form onSubmit={handleSubmit} autoComplete="off">
                            <TextFieldFormik
                              autoFocus
                              id="email"
                              name="email"
                              label="Email"
                              maxLength={65}
                              tabIndex={1}
                              mandatory={1}
                              onChange={handleChange}
                            />
                            <TextFieldFormik
                              type="password"
                              id="password"
                              name="password"
                              label="Password"
                              maxlength={20}
                              tabIndex={2}
                              mandatory={1}
                              onChange={handleChange}
                            />
                            <Button
                              type="submit"
                              title="Login"
                              text={"Login"}
                              tabIndex={3}
                              onClick={(e) => {
                                preFunction.handleErrorFocus(errors);
                              }}
                            />
                          </form>
                        );
                      }}
                    </Formik>
                  )}
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

      <StudentListModal
        title={"Student List"}
        isOpen={studentListModal}
        okClick={() => setStudentListModal(false)}
        studentList={studentData}
      />
      <div className="row mt-3 text-center row ">
        <div
          className="footer-text col-6 text-right"
          onClick={() => window.open("https://www.bloombyte.io/", "_blank")}
        >
          Copyright © 2024 Bloombyte
        </div>
        <div
          className="footer-text  col-6 text-left"
          onClick={() => navigate("/privacy-policy")}
        >
          Privacy Policy
        </div>
      </div>
    </>
  );
}

export default Login;
