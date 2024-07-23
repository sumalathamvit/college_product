import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import * as Yup from "yup";
import { Formik } from "formik";
import Paper from "@mui/material/Paper";
import LockOpenIcon from "@mui/icons-material/LockOpen";

import api from "../api/EmployeeApi";

import preFunction from "../component/common/CommonFunction";
import Button from "../component/FormField/Button";
import string from "../string";
import storage from "../auth/storage";
import TextFieldFormik from "../component/FormFieldLibrary/TextFieldFormik";
import ModalComponent from "../component/ModalComponent";
import useAuth from "../auth/useAuth";

import AuthContext from "../auth/context";
import MenuArrayFunction from "../component/common/MenuArrayFunction";
import MenuArrayFunctionSchool from "../component/common/MenuArrayFunctionSchool";

import CustomActivityIndicator from "../component/common/CustomActivityIndicator";
import { useDispatch } from "react-redux";
import { webSliceActions } from "../store/web";
import login from "../api/login";

const FormSchema = Yup.object().shape({
  email: Yup.string()
    .email("Please enter valid Email")
    .required("Please enter Email")
    .trim(),
  password: Yup.string().required("Please enter Password").trim(),
});
const StudentFormSchema = Yup.object().shape({
  mobile: Yup.string()
    .required("Please enter Mobile Number")
    .matches(/^[0-9]{10}$/, "Please enter valid Mobile Number"),
});

function LoginOTPVerification() {
  //#region const
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [load, setLoad] = useState(false);
  const { setTopMenuData } = useContext(AuthContext);
  const authLogin = useAuth();

  const [modalErrorOpen, setModalErrorOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [modalTitle, setModalTitle] = useState("");
  const [open, setOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState(false);
  const [message, setMessage] = useState("");
  const [studentData, setStudentData] = useState({});

  const [studentLogin, setStudentLogin] = useState(false);
  //#endregion

  return (
    <>
      <div>Test</div>
    </>
  );
}

export default LoginOTPVerification;
