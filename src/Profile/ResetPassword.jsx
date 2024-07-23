import React, { useEffect, useState, useRef, useContext } from "react";
import { Formik } from "formik";
import * as Yup from "yup";
import { toast } from "react-toastify";
import ManageAccountsIcon from "@mui/icons-material/LockReset";

import StudentApi from "../api/StudentApi";
import CommonApi from "../component/common/CommonApi";

import preFunction from "../component/common/CommonFunction";
import CustomActivityIndicator from "../component/common/CustomActivityIndicator";
import TextFieldFormik from "../component/FormField/TextFieldFormik";
import SelectFieldFormik from "../component/FormField/SelectFieldFormik";
import Button from "../component/FormField/Button";
import ScreenTitle from "../component/common/ScreenTitle";
import AuthContext from "../auth/context";
import { useNavigate } from "react-router-dom";
import { Password } from "@mui/icons-material";
import libraryapi from "../api/libraryapi";

function ResetPassword() {
  const [load, setLoad] = useState(false);
  const navigate = useNavigate();
  const loggedEmail = sessionStorage.getItem("email");
  const formikRef = useRef();
  const { unSavedChanges, setUnSavedChanges, role } = useContext(AuthContext);
  const [empCodeList, setEmpCodeList] = useState([]);

  const [correctPassword, setCorrectPassword] = useState(false);

  const formSchema = Yup.object().shape({
    employeeNumber:
      role != "Staff"
        ? Yup.object().required("Please select Employee")
        : Yup.mixed().notRequired(),
    oldPassword:
      role == "Staff"
        ? Yup.string().required("Please enter Old Password").trim()
        : Yup.mixed().notRequired(),
    newPassword: Yup.string().required("Please enter New Password"),
    confirmPassword:
      role == "Staff"
        ? Yup.string().required("Please enter Confirm Password").trim()
        : Yup.mixed().notRequired(),
  });

  const handleSavePassword = async (values, { resetForm }) => {
    console.log("values", values);

    if (!correctPassword) {
      document.getElementById("newPassword").focus();
      return;
    }

    if (load) return;
    if (role == "Staff") {
      if (values.newPassword !== values.confirmPassword) {
        formikRef.current.setErrors({
          confirmPassword: "New Password and Confirm Password does not match",
        });
        document.getElementById("confirmPassword").focus();
        return;
      }
    }
    try {
      setLoad(true);
      const passwordRes = await libraryapi.resetPassword(
        role == "Staff" ? loggedEmail : values.employeeNumber.personal_email,
        values.oldPassword ? values.oldPassword : null,
        values.newPassword
      );
      console.log("passwordRes", passwordRes);

      if (passwordRes.data.message.success) {
        handleUnSavedChanges(0);
        toast.success(passwordRes.data.message.message);
        resetForm();
        navigate("/logout");
        setLoad(false);
        return;
      } else {
        formikRef.current.setErrors({
          oldPassword: "Old Password is incorrect",
        });
        document.getElementById("oldPassword").focus();
      }
      setLoad(false);
    } catch (error) {
      console.log("error", error);
      setLoad(false);
    }
  };

  const handleUnSavedChanges = (changed) => {
    if (changed == 1) {
      sessionStorage.setItem("unSavedChanges", true);
      setUnSavedChanges(true);
    } else {
      sessionStorage.setItem("unSavedChanges", false);
      setUnSavedChanges(false);
    }
  };

  const searchEmployee = async (text) => {
    const empList = await CommonApi.searchEmployee(text);
    setEmpCodeList(empList);
  };

  const [conditions, setConditions] = useState({
    length: false,
    upperCase: false,
    number: false,
    specialChar: false,
  });

  const checkConditions = (pwd) => {
    if (pwd) {
      const length = pwd.length >= 6;
      const upperCase = /[A-Z]/.test(pwd);
      const number = /[0-9]/.test(pwd);
      const specialChar = /[!@#$%^&*()_+{}\[\]:;<>,.?~\\-]/.test(pwd);

      setConditions({ length, upperCase, number, specialChar });
      if (length && upperCase && number && specialChar) {
        setCorrectPassword(true);
      } else {
        setCorrectPassword(false);
      }
    } else {
      setConditions({
        length: false,
        upperCase: false,
        number: false,
        specialChar: false,
      });
    }
  };
  useEffect(() => {}, []);

  return (
    <div className="content-area-report" onClick={preFunction.hideNavbar}>
      <CustomActivityIndicator
        style={{ height: 100, alignSelf: "center" }}
        visible={load}
      />
      <div className="row no-gutters bg-white-report">
        <ScreenTitle titleClass={"page-heading-position-report"} />
        <div className="row no-gutters">
          <Formik
            innerRef={formikRef}
            enableReinitialize={true}
            autoComplete={"nope"}
            initialValues={{
              employeeNumber: "",
              oldPassword: "",
              newPassword: "",
              confirmPassword: "",
            }}
            validationSchema={formSchema}
            onSubmit={handleSavePassword}
          >
            {({
              errors,
              values,
              touched,
              setFieldTouched,
              handleSubmit,
              handleChange,
              handleBlur,
              setFieldValue,
            }) => {
              return (
                <form onSubmit={handleSubmit} autoComplete="off">
                  <div className="row no-gutters mt-1">
                    <div className="col-lg-9">
                      {role != "Staff" && (
                        <SelectFieldFormik
                          autoFocus
                          label="Employee No. / Name"
                          id="employeeNumber"
                          mandatory={1}
                          options={empCodeList}
                          searchIcon={true}
                          clear={true}
                          labelSize={4}
                          getOptionLabel={(option) =>
                            option.custom_employeeid +
                            " - " +
                            option.employee_name
                          }
                          getOptionValue={(option) => option.name}
                          onInputChange={(inputValue) => {
                            searchEmployee(inputValue);
                          }}
                          onChange={(text) => {
                            setFieldValue("employeeNumber", text);
                          }}
                          style={{ width: "80%" }}
                        />
                      )}

                      {role == "Staff" && (
                        <TextFieldFormik
                          autoFocus
                          type="password"
                          tabIndex={0}
                          id="oldPassword"
                          label="Old Password"
                          labelSize={4}
                          maxlength={12}
                          mandatory={1}
                          onChange={(e) => {
                            setFieldValue("oldPassword", e.target.value);
                            handleUnSavedChanges(1);
                          }}
                          style={{ width: "40%" }}
                        />
                      )}
                      <TextFieldFormik
                        type="password"
                        tabIndex={1}
                        id="newPassword"
                        label="New Password"
                        labelSize={4}
                        maxlength={12}
                        mandatory={1}
                        onChange={(e) => {
                          setFieldValue("newPassword", e.target.value);
                          handleUnSavedChanges(1);
                          checkConditions(e.target.value);
                        }}
                        style={{ width: "40%" }}
                      />

                      <div className="row mt-2">
                        <div className="col-lg-4 "></div>
                        <div className="col-lg-5 suggestions-list">
                          <div
                            style={{
                              padding: "8px 8px 8px 12px",
                              color: "#0008ff",
                            }}
                          >
                            Password must contain
                          </div>
                          <div
                            className={`suggestion-item ${
                              conditions.upperCase ? "met" : ""
                            }`}
                          >
                            At least one uppercase letter
                          </div>
                          <div
                            className={`suggestion-item ${
                              conditions.number ? "met" : ""
                            }`}
                          >
                            At least one number
                          </div>
                          <div
                            className={`suggestion-item ${
                              conditions.specialChar ? "met" : ""
                            }`}
                          >
                            At least one special character
                          </div>
                          <div
                            className={`suggestion-item ${
                              conditions.length ? "met" : ""
                            }`}
                          >
                            At least 6 characters
                          </div>
                        </div>
                        <div className="col-lg-3"></div>
                      </div>

                      {role == "Staff" && (
                        <TextFieldFormik
                          type="password"
                          tabIndex={2}
                          id="confirmPassword"
                          label="Confirm Password"
                          labelSize={4}
                          maxlength={12}
                          mandatory={1}
                          onChange={(e) => {
                            setFieldValue("confirmPassword", e.target.value);
                            handleUnSavedChanges(1);
                          }}
                          style={{ width: "40%" }}
                        />
                      )}
                    </div>
                    {/* <div
                      className="row col-lg-3"
                      style={{
                        color: "#2455b7",
                        fontSize: "16px",
                        // fontWeight: "bold",
                      }}
                    >
                      <div className="col-lg-2" style={{ color: "red" }}></div>
                      <div className="col-lg-10">
                        <div className=" mt-2">Password must contain</div>
                        <div>* one uppercase</div>
                        <div>* one number</div>
                        <div>* one special character</div>
                        <div>* minimum 6 characters</div>
                      </div>
                    </div> */}
                  </div>
                  <Button
                    text="F4 - Save"
                    type="submit"
                    tabIndex={3}
                    id="save"
                    onClick={() => preFunction.handleErrorFocus(errors)}
                  />
                </form>
              );
            }}
          </Formik>
        </div>
      </div>
    </div>
  );
}
export default ResetPassword;
