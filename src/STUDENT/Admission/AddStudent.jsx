import React, { useEffect, useState, useRef, useContext } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Modal, Tab, Tabs } from "react-bootstrap";
import { Formik } from "formik";
import ReactCrop from "react-image-crop";
import { useSelector } from "react-redux";
import moment from "moment";
import * as Yup from "yup";
import { toast } from "react-toastify";
import "react-image-crop/dist/ReactCrop.css";
import $ from "jquery";

import StudentApi from "../../api/StudentApi";

import preFunction from "../../component/common/CommonFunction";
import CustomActivityIndicator from "../../component/common/CustomActivityIndicator";
import ErrorMessage from "../../component/common/ErrorMessage";
import { mediumList } from "../../component/common/CommonArray";
import TextFieldFormik from "../../component/FormField/TextFieldFormik";
import SelectFieldFormik from "../../component/FormField/SelectFieldFormik";
import DateFieldFormik from "../../component/FormField/DateFieldFormik";
import SwitchField from "../../component/FormField/SwitchField";
import Button from "../../component/FormField/Button";
import ScreenTitle from "../../component/common/ScreenTitle";
import ModalComponent from "../../component/ModalComponent";
import DisplayText from "../../component/FormField/DisplayText";

import string from "../../string";

import AuthContext from "../../auth/context";

import photo from "../../assests/png/camera.png";
import blankProfile from "../../assests/png/blank-profile-picture.png";
import deleteIcon from "../../assests/svg/delete-icon.svg";

let otherCity = false;
let tempOtherCity = false;

const emailValidation = Yup.string().test(
  "valid-email",
  "Please enter valid Email",
  function (value) {
    if (value && value.trim() !== "") {
      return Yup.string()
        .test("email", "Please enter valid Email", function (value) {
          if (!value) return false;
          const emailRegex = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/;
          return emailRegex.test(value);
        })
        .isValidSync(value);
    }
    return true;
  }
);

const optionalMobileValdiation = Yup.string().test(
  "valid-aadhar",
  "Please enter valid Mobile No.",
  function (value) {
    if (value && value.trim() !== "") {
      return Yup.number()
        .test(
          "is-ten-digits",
          "Mobile No. must be exactly 10 digits",
          (value) => /^[0-9]{10}$/.test(String(value))
        )
        .test(
          "is-valid-starting-digit",
          "Mobile No. must start with 6, 7, 8, or 9",
          (value) => /^[6-9][0-9]{9}$/.test(String(value))
        )
        .isValidSync(value);
    }
    return true;
  }
);

const mobileValidation = Yup.number()
  .test("is-ten-digits", "Mobile No. must be exactly 10 digits", (value) =>
    /^[0-9]{10}$/.test(String(value))
  )
  .test(
    "is-valid-starting-digit",
    "Mobile No. must start with 6, 7, 8, or 9",
    (value) => /^[6-9][0-9]{9}$/.test(String(value))
  )
  .required("Please enter Mobile No.");

const optionalAadhaarValidation = Yup.string().test(
  "is-twelve-digits",
  "Aadhaar Number must be exactly 12 digits",
  function (value) {
    if (value && value.trim() !== "") {
      return Yup.number()
        .test(
          "is-twelve-digits",
          "Aadhaar Number must be exactly 12 digits",
          (value) => /^[0-9]{12}$/.test(String(value))
        )
        .isValidSync(value);
    }
    return true;
  }
);

const AddressSchema = Yup.object().shape({
  fatherEmail: emailValidation,
  fatherMobile: Yup.number().when("isGuardian", (isGuardian, schema) => {
    if (!isGuardian[0]) {
      return mobileValidation;
    }
    return schema;
  }),
  motherName: Yup.string()
    .min(3, "Must be at least 3 characters long")
    .matches(/^[A-Za-z@. ]+$/, "Please Enter valid Mother Name")
    .required("Please enter Mother Name")
    .trim(),
  motherEmail: emailValidation,
  motherMobile: optionalMobileValdiation,
  isGuardian: Yup.boolean(),

  guardianName: Yup.string().when("isGuardian", (isGuardian, schema) => {
    if (isGuardian[0]) {
      return Yup.string()
        .min(3, "Must be at least 3 characters long")
        .matches(/^[A-Za-z@. ]+$/, "Please enter valid Guardian Name")
        .required("Please enter Guardian Name")
        .trim();
    }
    return schema;
  }),
  guardianEmail: emailValidation,
  guardianMobile: Yup.number().when("isGuardian", (isGuardian, schema) => {
    if (isGuardian[0]) {
      return mobileValidation;
    }
    return schema;
  }),

  addressline1: Yup.string()
    .min(3, "Must be at least 3 characters long")
    .required("Please enter address line 1")
    .trim(),

  // addressline2: Yup.string()
  //   .transform((originalValue, originalObject) => {
  //     return originalValue === null ? "" : originalValue;
  //   })
  //   .nullable()
  //   .min(3, "Must be at least 3 characters long")
  //   .matches(/^[a-zA-Z0-9,.'\-&@#/]+$/, "Please enter valid Address")
  //   .trim(),

  place: Yup.string()
    .min(3, "Must be at least 3 characters long")
    .matches(/^[A-Za-z0-9\s,.@#]+$/, "Please enter valid Place")
    .required("Please enter Place")
    .trim(),

  state: Yup.object().required("Please select State"),

  city: Yup.object().when("state", (state, schema) => {
    if (state[0]?.state == "Tamil Nadu" || state[0]?.state == "Puducherry") {
      return Yup.object().required("Please select City/District");
    }
    return schema;
  }),
  otherCity: Yup.string().when("state", (state, schema) => {
    if (state[0]?.state != "Tamil Nadu" && state[0]?.state != "Puducherry") {
      return Yup.string().required("Please enter City/District");
    }
    return schema;
  }),
  pinCode: Yup.number()
    .test("is-six-digits", "Pincode must be exactly 6 digits", (value) =>
      /^[0-9]{6}$/.test(String(value))
    )
    .required("Please enter Pincode"),
  country: Yup.object().required("Please select Country"),

  tempAddressline1: Yup.string()
    .min(3, "Must be at least 3 characters long")
    .required("Please enter Address Line 1")
    .trim(),

  // tempAddressline2: Yup.string()
  //   .transform((originalValue, originalObject) => {
  //     return originalValue === null ? "" : originalValue;
  //   })
  //   .nullable()
  //   .min(3, "Must be at least 3 characters long")
  //   .matches(/^[a-zA-Z0-9,.'\-&@#/]+$/, "Please enter valid Address Line 2")
  //   .trim(),

  tempPlace: Yup.string()
    .min(3, "Must be at least 3 characters long")
    .matches(/^[A-Za-z0-9\s,.@#]+$/, "Please enter valid Place")
    .required("Please enter Place")
    .trim(),

  tempState: Yup.object().required("Please select State"),

  tempCity: Yup.object().when("tempState", (tempState, schema) => {
    if (
      tempState[0]?.state == "Tamil Nadu" ||
      tempState[0]?.state == "Puducherry"
    ) {
      return Yup.object().required("Please select City/District");
    }
    return schema;
  }),
  tempOtherCity: Yup.string().when("tempState", (tempState, schema) => {
    if (
      tempState[0]?.state != "Tamil Nadu" &&
      tempState[0]?.state != "Puducherry"
    ) {
      return Yup.string().required("Please enter City/District");
    }
    return schema;
  }),

  tempPinCode: Yup.number()
    .test("is-six-digits", "Pincode must be exactly 6 digits", (value) =>
      /^[0-9]{6}$/.test(String(value))
    )
    .required("Please enter Pincode"),
  tempCountry: Yup.object().required("Please select Country"),
});

const isRequiredWhenTransfer = function (value) {
  const modeOfAdmission = this.parent.modeOfAdmission;
  return (
    !(modeOfAdmission && modeOfAdmission.admissionMode === "Transfer") ||
    !!value
  );
};

const qualificationSchema = Yup.object().shape({
  qualifiedExam: Yup.object().required("Please select Qualified Exam"),
  institution: Yup.string()
    .min(3, "Must be at least 3 characters long")
    .matches(
      /^[A-Za-z0-9\s,.'\-&@#]+$/,
      "Please enter valid School/College Name"
    )
    .required("Please enter School/College Name")
    .trim(),
  boardUniversity: Yup.string()
    .min(3, "Must be at least 3 characters long")
    .matches(
      /^[A-Za-z0-9\s,.'\-&@#]+$/,
      "Please enter valid Board/University Name"
    )
    .required("Please enter Board/University")
    .trim(),
  yearSemSubject: Yup.object().required("Please select Year/Sem/Subject"),
  maxMark: Yup.number()
    .required("Please enter Maximum Mark")
    .max(1200, "Max mark should be less than or equal to 1200")
    .min(0, "Max mark should be greater than or equal to 0"),
  markObtained: Yup.string()
    .required("Please enter Mark Obtained")
    .min(0, "Max mark should be greater than or equal to 0")
    .test(
      "is-less-than-or-equal",
      "Mark Obtained should be less than or equal to Maximum Mark",
      function (value) {
        const maxMark = this.parent.maxMark;
        const markObtained = value;

        if (maxMark && markObtained) {
          return parseInt(markObtained, 10) <= parseInt(maxMark, 10);
        }

        return true; // Allow empty values, you may adjust this based on your requirements
      }
    ),

  monthYear: Yup.string().required("Please select Month/Year"),
});

function Student() {
  //#region const
  const RENAME = useSelector((state) => state.web.rename);
  const [load, setLoad] = useState(false);
  const [studentId, setStudentId] = useState();
  const navigate = useNavigate();
  const location = useLocation();
  const [defaultActiveKey, setDefaultActiveKey] = useState("1");
  const [communicationId, setCommunicationID] = useState("");
  const [loginID, setLoginID] = useState("");
  const [oldAddressArray, setOldAddressArray] = useState("");

  // Personal Data ----
  const [genderList, setGenderList] = useState([]);
  const [communityList, setCommunityList] = useState([]);
  const [religionList, setReligionList] = useState([]);
  const [nationalityList, setNationalityList] = useState([]);
  const [bloodGroupList, setBloodGroupList] = useState([]);

  const [courseList, setCourseList] = useState([]);
  const [scholarshipList, setScholarshipList] = useState([]);
  const [admissionTypeList, setAdmissionTypeList] = useState([]);
  const [modeOfAdmissionList, setModeOfAdmissionList] = useState([]);
  const [transferYearList, setTransferYearList] = useState([]);
  const [cityList, setCityList] = useState([]);
  const [tempCityList, setTempCityList] = useState([]);
  const [stateList, setStateList] = useState([]);
  const [countryList, setCountryList] = useState([]);
  const [qualifiedExamList, setQualifiedExamList] = useState([]);
  const [yearSemSubjectList, setYearSemSubjectList] = useState([]);

  const [qualificationArr, setQualificationArr] = useState([]);
  const [newQualificationArr, setNewQualificationArr] = useState([]);
  const [displayImage, setDisplayImage] = useState(blankProfile);

  const [showImg, setShowImg] = useState(false);
  const [photoMessage, setPhotoMessage] = useState("");
  const [onChangeImage, setonChangeImage] = useState(false);
  const [src, setSrc] = useState(null);
  const [fileType, setFileType] = useState(null);
  const [CropOpen, setCropOpen] = useState(false);
  const [openModel, setOpenModal] = useState(false);

  const [oldImageUrl, setOldImageUrl] = useState("");
  const [status, setStatus] = useState(0);

  const [modalErrorOpen, setModalErrorOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [modalTitle, setModalTitle] = useState("");
  const collegeConfig = useSelector((state) => state.web.college);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [enrollNumber, setEnrollNumber] = useState();
  const [batchID, setBatchID] = useState();
  const [openLeavePageModel, setOpenLeavePageModel] = useState(false);
  const [openConfirmEmailModel, setOpenConfirmEmailModel] = useState(false);
  const [studentEmail, setStudentEmail] = useState("");
  const [studentNumber, setStudentNumber] = useState("");
  const [tabKey, setTabKey] = useState("1");
  const [skipQualification, setSkipQualification] = useState(false);

  const [crop, setCrop] = useState({
    unit: "px",
    width: 150,
    height: 150,
    minwidth: 150,
    minheight: 150,
    aspect: 1,
  });

  const [image, setImage] = useState(null);
  const formikRef = useRef();
  const academicRef = useRef();
  const addressRef = useRef();
  const qualificationRef = useRef();
  const loggedEmail = sessionStorage.getItem("email");

  const { unSavedChanges, setUnSavedChanges } = useContext(AuthContext);
  const { collegeId, collegeName } = useContext(AuthContext);

  const PersonalSchema = Yup.object().shape({
    studentName: Yup.string()
      .min(3, "Must be at least 3 characters long")
      .matches(/^[A-Za-z@. ]+$/, "Please enter valid Student Name")
      .required("Please enter Student Name")
      .trim(),
    fatherName: Yup.string()
      .min(3, "Must be at least 3 characters long")
      .matches(/^[A-Za-z@. ]+$/, "Please enter valid Father Name")
      .required("Please enter Father Name")
      .trim(),
    dateofBirth: Yup.date().required("Please select Date of Birth"),
    gender: Yup.object().required("Please select Gender"),
    studentMobile: optionalMobileValdiation,
    // studentEmail: Yup.string()
    //   .test("email", "Please enter valid Email", function (value) {
    //     if (!value) return false;
    //     const emailRegex = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/;
    //     return emailRegex.test(value);
    //   })
    //   .required("Please enter Student Email ID"),
    studentEmail: emailValidation,
    // aadhaar: Yup.number()
    //   .test(
    //     "is-twelve-digits",
    //     "Aadhaar No. must be exactly 12 digits",
    //     (value) => /^[0-9]{12}$/.test(String(value))
    //   )
    //   .required("Please enter Aadhaar No."),
    aadhaar: optionalAadhaarValidation,

    pan: Yup.string().test("is-valid-pan", "Enter Valid PAN", (value) => {
      if (value && value.trim() !== "") {
        return /[A-Z]{5}[0-9]{4}[A-Z]{1}/.test(String(value));
      }
      return true;
    }),

    nationality: Yup.object().required("Please select Nationality"),
    religion: Yup.object().required("Please select Religion"),
    // community: Yup.object().required("Please select Community"),
    // fatherName: nameValidation,
  });

  const OtherDetailsSchema = Yup.object().shape({
    college: collegeConfig.is_university
      ? Yup.object().required("Please select College")
      : Yup.mixed().notRequired(),
    course: Yup.object().required("Please select " + RENAME?.course),
    mediumofStudy: Yup.object().required("Please select Medium"),
    modeOfAdmission: Yup.object().required("Please select Mode of Admission"),
    transferYear: Yup.object().test(
      "isRequired",
      "Please select Transfer Year",
      isRequiredWhenTransfer
    ),
    admissionType: Yup.object().required("Please select Admission Type"),
  });

  const handleUnSavedChanges = (changed) => {
    if (changed == 1) {
      sessionStorage.setItem("unSavedChanges", true);
      setUnSavedChanges(true);
    } else {
      sessionStorage.setItem("unSavedChanges", false);
      setUnSavedChanges(false);
    }
  };
  //#endregion

  const handleTempCityByState = async (txt) => {
    console.log("state---", txt);
    if (txt.state != "Puducherry" && txt.state != "Tamil Nadu") {
      tempOtherCity = true;
    } else {
      tempOtherCity = false;
      const masterRes = await StudentApi.getCityMaster(3, txt.id);
      console.log("masterRes----", masterRes);
      if (!masterRes.data.message.success) {
        setModalMessage(masterRes.data.message.message);
        setModalErrorOpen(true);
        setModalTitle("Message");
        setLoad(false);
        return;
      }
      setTempCityList(masterRes.data.message.data.city_data);
    }
  };

  const handleCityByState = async (txt) => {
    console.log("state---", txt);
    if (txt.state != "Puducherry" && txt.state != "Tamil Nadu") {
      otherCity = true;
    } else {
      otherCity = false;
      const masterRes = await StudentApi.getCityMaster(3, txt.id);
      console.log("masterRes----", masterRes);
      if (!masterRes.data.message.success) {
        setModalMessage(masterRes.data.message.message);
        setModalErrorOpen(true);
        setModalTitle("Message");
        setLoad(false);
        return;
      }
      setCityList(masterRes.data.message.data.city_data);
    }
  };

  const handleConfirmSubmission = async () => {
    if (load) return;
    console.log("CollegeConfig---", collegeConfig);
    try {
      setLoad(true);
      if (studentId) {
        const studentRes = await StudentApi.editStudent(
          studentId,
          2,
          collegeConfig.institution_type
        );
        console.log("studentRes---", studentRes);
        if (studentRes.data.message.data.length == 0) {
          setModalMessage("Please add your Academic Details");
          setModalErrorOpen(true);
          setModalTitle("Message");
          handleTabChange("2");
          document.getElementById("college")?.focus();
          setLoad(false);
          return;
        }
        const studentAddrRes = await StudentApi.editStudent(
          studentId,
          3,
          collegeConfig.institution_type
        );
        console.log("studentAddrRes---", studentAddrRes);
        if (studentAddrRes.data.message.data.length == 0) {
          setModalMessage("Please add your Communication Details");
          setModalErrorOpen(true);
          setModalTitle("Message");
          handleTabChange("3");
          document.getElementById("fatherEmail")?.focus();
          setLoad(false);
          return;
        }
      }
      // if (qualificationArr.length === 0) {
      //   setModalMessage("Please add your Qualification History");
      //   setModalErrorOpen(true);
      //   setModalTitle("Message");
      //   setLoad(false);
      //   return;
      // }
      const studentConfirmAdmissionRes =
        await StudentApi.studentConfirmAdmission(
          studentId,
          collegeConfig.institution_type
        );
      console.log("studentConfirmAdmissionRes---", studentConfirmAdmissionRes);
      if (!studentConfirmAdmissionRes.data.message.success) {
        setModalMessage(studentConfirmAdmissionRes.data.message.message);
        setModalErrorOpen(true);
        setModalTitle("Message");
        setLoad(false);
        return;
      }
      setEnrollNumber(studentConfirmAdmissionRes.data.message.data.enrollNo);
      handleUnSavedChanges(0);
      setConfirmOpen(true);
      setLoad(false);
      return;
    } catch (error) {
      setLoad(false);
      console.log("Exception---", error);
    }
  };

  const handleClearAllForms = () => {
    formikRef.current.resetForm();
    academicRef.current.resetForm();
    addressRef.current.resetForm();
    qualificationRef.current.resetForm();
    otherCity = false;
    tempOtherCity = false;
    //clear location state
    location.state = null;

    setLoad(false);
    setStudentId();
    setDefaultActiveKey("1");
    setCommunicationID("");
    setStudentEmail("");
    setStudentNumber("");
    setLoginID("");
    setSkipQualification(false);
    setOldAddressArray("");
    setGenderList([]);
    setCommunityList([]);
    setReligionList([]);
    setNationalityList([]);
    setBloodGroupList([]);
    setCourseList([]);
    setScholarshipList([]);
    setAdmissionTypeList([]);
    setModeOfAdmissionList([]);
    setTransferYearList([]);
    setCityList([]);
    setTempCityList([]);
    setStateList([]);
    setCountryList([]);
    setQualifiedExamList([]);
    setYearSemSubjectList([]);
    setQualificationArr([]);
    setNewQualificationArr([]);
    setDisplayImage(blankProfile);

    setShowImg(false);
    setPhotoMessage("");
    setonChangeImage(false);
    setSrc(null);
    setFileType(null);
    setCropOpen(false);
    setOpenModal(false);
    setOldImageUrl("");
    setStatus(0);
    setModalErrorOpen(false);
    setModalMessage("");
    setModalTitle("");

    setCrop({
      unit: "px",
      width: 150,
      height: 150,
      minwidth: 150,
      minheight: 150,
      aspect: 1,
    });

    setImage(null);
    getList();
    handleTabChange("1");
    document.getElementById("studentName").focus();
  };

  const selectImage = (file) => {
    setShowImg(false);
    if (file.type !== "image/png" && file.type !== "image/jpeg") {
      setShowImg(true);
      setPhotoMessage("Please upload valid Image");
      return;
    }
    setSrc(URL.createObjectURL(file));
    setOpenModal(true);
    setFileType(file.name.split(".")[1]);
    console.log("file---", file, "--", URL.createObjectURL(file));
  };

  const cropImageNow = () => {
    if (crop.width === 0 || crop.height === 0) {
      setCropOpen(true);
      return;
    }
    const canvas = document.createElement("canvas");
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    canvas.width = crop.width;
    canvas.height = crop.height;
    const ctx = canvas.getContext("2d");

    const pixelRatio = window.devicePixelRatio;
    canvas.width = crop.width * pixelRatio;
    canvas.height = crop.height * pixelRatio;
    ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    ctx.imageSmoothingQuality = "high";

    ctx.drawImage(
      image,
      crop.x * scaleX,
      crop.y * scaleY,
      crop.width * scaleX,
      crop.height * scaleY,
      0,
      0,
      crop.width,
      crop.height
    );

    // Converting to base64
    const base64Image = canvas.toDataURL("image/jpeg");
    setDisplayImage(base64Image);
    setOpenModal(false);
    setonChangeImage(true);
    handleUnSavedChanges(1);
    setCrop({
      unit: "px",
      width: 150,
      height: 150,
      minwidth: 150,
      minheight: 150,
      aspect: 1,
    });
  };

  const setFieldValueFromOutside = async (values) => {
    console.log("values----", values);
    setStudentEmail("");
    if (formikRef.current) {
      setBatchID(values.batchID);
      formikRef.current.setFieldValue("studentName", values.name);
      formikRef.current.setFieldValue("fatherName", values.fatherName);
      if (values.DOB) {
        formikRef.current.setFieldValue("dateofBirth", new Date(values.DOB));
      }
      if (values?.enrollNo) {
        setStudentNumber(values?.enrollNo);
      }
      formikRef.current.setFieldValue("gender", {
        id: values.genderID,
        gender: values.gender,
      });
      values.studentMobile &&
        formikRef.current.setFieldValue("studentMobile", values.studentMobile);
      if (values.email && values.email != values.enrollNo + "@gmail.com") {
        formikRef.current.setFieldValue("studentEmail", values.email);
        setStudentEmail(values.email);
      }
      if (values.bloodGroup) {
        formikRef.current.setFieldValue("bloodGroup", {
          id: values.bloodGroupID,
          bloodGroup: values.bloodGroup,
        });
      }
      values.aadhaar &&
        formikRef.current.setFieldValue("aadhaar", values.aadhaar);
      formikRef.current.setFieldValue("pan", values.pan ?? "");
      formikRef.current.setFieldValue("nationality", {
        id: values.nationalityID,
        nationality: values.nationality,
      });
      formikRef.current.setFieldValue("religion", {
        id: values.religionID,
        religion: values.religion,
      });
      values.communityID &&
        formikRef.current.setFieldValue("community", {
          id: values.communityID,
          community: values.community,
        });
      formikRef.current.setFieldValue(
        "isHostel",
        values.isHostel == 1 ? true : false
      );
      formikRef.current.setFieldValue(
        "isTransport",
        values.isTransport == 1 ? true : false
      );

      formikRef.current.setFieldValue(
        "applicationNumber",
        values.applicationNo
      );
      formikRef.current.setFieldValue(
        "registrationNumber",
        values.registrationNo
      );
      formikRef.current.setFieldValue(
        "counselRefNumber",
        values.counsellingReferenceNo
      );
      formikRef.current.setFieldValue(
        "admissionTypeID",
        values.admissionTypeID
      );
      formikRef.current.setFieldValue("courseID", values.courseID);
      formikRef.current.setFieldValue("semester", values.semester);
      formikRef.current.setFieldValue("classID", values.classID);
      formikRef.current.setFieldValue("mediumID", values.mediumID);

      if (values.photo) {
        setOldImageUrl(values.photo);
        setDisplayImage(string.FILEURL + values.photo);
      }
    }
  };

  const setAcademicValueOutside = (values, course, college) => {
    console.log("Academic details---", course, values);

    if (values && academicRef.current) {
      college && academicRef.current.setFieldValue("college", college);
      course && academicRef.current.setFieldValue("course", course);
      values.mediumID &&
        academicRef.current.setFieldValue("mediumofStudy", {
          value: values.mediumID,
          label: values.medium,
        });
      // values.DOJ &&
      //   academicRef.current.setFieldValue(
      //     "dateofJoining",
      //     new Date(values.DOJ)
      //   );
      values.admissionModeID &&
        academicRef.current.setFieldValue("modeOfAdmission", {
          id: values.admissionModeID,
          admissionMode: values.admissionMode,
        });
      values.admissionMode == "Transfer" &&
        values.studyYear &&
        academicRef.current.setFieldValue("transferYear", {
          id: values.studyYear,
          transferYear: values.studyYear,
        });
      values.admissionModeID &&
        academicRef.current.setFieldValue("modeOfAdmission", {
          id: values.admissionModeID,
          admissionMode: values.admissionMode,
        });
      values.admissionTypeID &&
        academicRef.current.setFieldValue("admissionType", {
          id: values.admissionTypeID,
          admissionType: values.admissionType,
        });
      values.isFirstGraduate &&
        academicRef.current.setFieldValue(
          "isFirstGraduation",
          values.isFirstGraduate
        );
      values.scholarshipID &&
        academicRef.current.setFieldValue("scholarshipScheme", {
          id: values.scholarshipID,
          scholarshipScheme: values.scholarshipScheme,
        });
    }
  };

  const setAddressValueOutside = (dbValues) => {
    console.log("dbValues---", dbValues);
    setOldAddressArray(dbValues);
    if (dbValues && academicRef.current) {
      setCommunicationID(dbValues.id);
      dbValues.fatherEmail &&
        addressRef.current.setFieldValue("fatherEmail", dbValues.fatherEmail);
      dbValues.fatherMobile &&
        addressRef.current.setFieldValue("fatherMobile", dbValues.fatherMobile);
      dbValues.motherName &&
        addressRef.current.setFieldValue("motherName", dbValues.motherName);
      dbValues.motherEmail &&
        addressRef.current.setFieldValue("motherEmail", dbValues.motherEmail);
      dbValues.motherMobile &&
        addressRef.current.setFieldValue("motherMobile", dbValues.motherMobile);
      dbValues.guardianName &&
        addressRef.current.setFieldValue("isGuardian", true);
      dbValues.guardianName &&
        addressRef.current.setFieldValue("guardianName", dbValues.guardianName);
      dbValues.guardianEmail &&
        addressRef.current.setFieldValue(
          "guardianEmail",
          dbValues.guardianEmail
        );
      dbValues.guardianMobile &&
        addressRef.current.setFieldValue(
          "guardianMobile",
          dbValues.guardianMobile
        );
      dbValues.address1 &&
        addressRef.current.setFieldValue("addressline1", dbValues.address1);
      dbValues.address2 &&
        addressRef.current.setFieldValue("addressline2", dbValues.address2);
      dbValues.place &&
        addressRef.current.setFieldValue("place", dbValues.place);
      dbValues.pincode &&
        addressRef.current.setFieldValue("pinCode", dbValues.pincode);
      if (dbValues.state === "Tamil Nadu" || dbValues.state === "Puducherry") {
        addressRef.current.setFieldValue("city", {
          id: dbValues.cityID,
          city: dbValues.city,
        });
        otherCity = false;
        handleCityByState({
          state: dbValues.state,
          id: dbValues.stateID,
        });
      } else {
        addressRef.current.setFieldValue("otherCity", dbValues.city);
        otherCity = true;
      }
      dbValues.stateID &&
        addressRef.current.setFieldValue("state", {
          id: dbValues.stateID,
          state: dbValues.state,
        });
      if (dbValues.country) {
        addressRef.current.setFieldValue("country", {
          id: dbValues.countryID,
          country: dbValues.country,
        });
      } else if (nationalityList.length === 1) {
        addressRef.current.setFieldValue("country", nationalityList[0]);
        addressRef.current.setFieldValue("tempCountry", nationalityList[0]);
      }

      dbValues.taddress1 &&
        addressRef.current.setFieldValue(
          "tempAddressline1",
          dbValues.taddress1
        );
      dbValues.taddress2 &&
        addressRef.current.setFieldValue(
          "tempAddressline2",
          dbValues.taddress2
        );
      dbValues.tplace &&
        addressRef.current.setFieldValue("tempPlace", dbValues.tplace);
      dbValues.tpincode &&
        addressRef.current.setFieldValue("tempPinCode", dbValues.tpincode);
      if (
        dbValues.tstate === "Tamil Nadu" ||
        dbValues.tstate === "Puducherry"
      ) {
        addressRef?.current.setFieldValue("tempCity", {
          id: dbValues.tcityID,
          city: dbValues.tcity,
        });
        tempOtherCity = false;
        handleTempCityByState({
          state: dbValues.tstate,
          id: dbValues.tstateID,
        });
      } else {
        dbValues.tcity &&
          addressRef?.current.setFieldValue("tempOtherCity", dbValues.tcity);
        tempOtherCity = true;
      }
      dbValues.tstateID &&
        addressRef.current.setFieldValue("tempState", {
          id: dbValues.tstateID,
          state: dbValues.tstate,
        });
      dbValues.tcountry &&
        addressRef.current.setFieldValue("tempCountry", {
          id: dbValues.tcountryID,
          country: dbValues.country,
        });
    }
  };

  const getStudent = async (id) => {
    try {
      console.log("id", id);
      setLoad(true);
      const studentRes = await StudentApi.editStudent(
        id,
        1,
        collegeConfig.institution_type
      );
      console.log("Student Detail---", studentRes);
      if (!studentRes.data.message.success) {
        setModalMessage(studentRes.data.message.message);
        setModalErrorOpen(true);
        setModalTitle("Message");
        setLoad(false);
        return;
      }

      setFieldValueFromOutside(studentRes.data.message.data[0]);
      setStatus(studentRes.data.message.data[0].isActive);
      setLoad(false);
    } catch (error) {
      console.log("error", error);
    }
  };

  // getUserList();
  const checkUserList = async (email) => {
    console.log("Check email", email);
    const userList = await StudentApi.getUserList(email);
    console.log("userList", userList);
    if (userList.data.data.length > 0) {
      return false;
    }
    return true;
  };

  const handleSavePersonal = async (values, checkUser = 0) => {
    if (load) return;
    console.log("values----", loginID, values, checkUser, studentEmail);

    console.log("displayimage----", displayImage);
    if (values?.studentEmail && studentEmail != values.studentEmail) {
      if (checkUser == 0) {
        const checkUserRes = await checkUserList(values.studentEmail);
        console.log("checkUserRes---", checkUserRes);
        if (!checkUserRes) {
          setOpenConfirmEmailModel(true);
          return;
        }
      }
    }
    try {
      setLoad(true);
      let imageUrl = displayImage.includes(string.FILEURL)
        ? displayImage.replace(string.FILEURL, "")
        : null;
      // if (!imageUrl && !onChangeImage) {
      //   setPhotoMessage("Please upload Student Photo");
      //   var targetElement = document.getElementById("studPhoto");
      //   targetElement.scrollIntoView({ behavior: "smooth" });
      //   setShowImg(true);
      //   setLoad(false);
      //   return;
      // }
      if (onChangeImage) {
        const response = await StudentApi.uploadFile(
          "student_profile",
          fileType,
          displayImage.split(",")[1]
        );
        console.log("response--", response);
        if (!response.data.message.success) {
          setModalMessage(response.data.message.message);
          setModalErrorOpen(true);
          setModalTitle("Message");
          setLoad(false);
          return;
        }
        imageUrl = response.data.message.data.file_url;
        console.log(
          "fileName---",
          // fileName,
          displayImage.split(",")[0],
          fileType
        );

        setonChangeImage(false);
        setDisplayImage(string.FILEURL + response.data.message.data.file_url);
      }
      console.log("imageUrl-----", imageUrl);
      // return;
      const personalRes = await StudentApi.addStudentPersonal(
        studentId ?? null,
        studentNumber ?? null,
        values.studentName.replace(/\s\s+/g, " ").trim(),
        values.fatherName.replace(/\s\s+/g, " ").trim(),
        values.studentEmail ? values.studentEmail : null,
        imageUrl ?? null,
        values.studentEmail ? values.studentEmail : null,
        moment(values.dateofBirth).format("YYYY-MM-DD"),
        values.gender.id,
        values.gender.gender,
        values.studentMobile ? values.studentMobile : null,
        values.bloodGroup ? values.bloodGroup.id : null,
        values.bloodGroup ? values.bloodGroup.bloodGroup : null,
        values.community ? values.community.id : null,
        values.community ? values.community.community : null,
        values.religion.id,
        values.religion.religion,
        values.nationality.id,
        values.nationality.nationality,
        values.counselRefNumber
          ? values.counselRefNumber.replace(/\s\s+/g, " ").trim()
          : null,
        values.isTransport ? 1 : 0,
        values.isHostel ? 1 : 0,
        values.aadhaar ? values.aadhaar : null,
        values.pan ?? null,
        values.applicationNumber
          ? values.applicationNumber.replace(/\s\s+/g, " ").trim()
          : null,
        values.registrationNumber
          ? values.registrationNumber.replace(/\s\s+/g, " ").trim()
          : null,
        values.admissionTypeID ? values.admissionTypeID : null,
        values.courseID ? values.courseID : null,
        location?.state?.id ? batchID : null,
        values.classID ? values.classID : null,
        values.semester ? values.semester : null,
        values.mediumID ? values.mediumID : null
      );
      console.log("personalRes-----", personalRes);
      if (!personalRes.data.message.success) {
        setModalMessage(personalRes.data.message.message);
        setModalErrorOpen(true);
        setModalTitle("Message");
        setLoad(false);
        return;
      }
      setStudentId(personalRes.data.message.data.studentID);
      handleTabChange("2");
      handleUnSavedChanges(0);
      setLoad(false);
    } catch (error) {
      setLoad(false);
      console.log("catch---", error);
    }
  };

  const handleSaveAcademic = async (values) => {
    if (status) {
      handleTabChange("3");
      return;
    }
    if (load) return;
    console.log("Academic------", studentId, values);
    try {
      setLoad(true);
      const academicRes = await StudentApi.addStudentAcademic(
        studentId,
        values.course.id,
        values.mediumofStudy ? values.mediumofStudy.value : null,
        values.modeOfAdmission.id,
        values.modeOfAdmission.admissionMode,
        values.admissionType.id,
        values.scholarshipScheme ? values.scholarshipScheme.id : null,
        values.isFirstGraduation ? 1 : 0,
        values.transferYear ? values.transferYear.id : null,
        loggedEmail
      );
      console.log("editAcademic---", academicRes);
      if (!academicRes.data.message.success) {
        setModalMessage(academicRes.data.message.message);
        setModalErrorOpen(true);
        setModalTitle("Message");
        setLoad(false);
        return;
      }
      handleUnSavedChanges(0);
      handleTabChange("3");
      setLoad(false);
    } catch (error) {
      setLoad(false);
      console.log("catch----", error);
    }
  };

  const handleSaveCommunication = async (values) => {
    console.log("Communication------", values);
    console.log(
      "CommunicationID------",
      communicationId,
      "StudentID",
      studentId
    );
    console.log("AddressOldArray---", oldAddressArray);
    try {
      setLoad(true);
      const communicationRes = await StudentApi.addCommunication(
        communicationId ? communicationId : null,
        studentId,
        values.fatherMobile,
        values.fatherEmail != "" ? values.fatherEmail : null,
        null,
        null,
        null,
        values.motherName.replace(/\s\s+/g, " ").trim(),
        values.motherMobile != "" ? values.motherMobile : null,
        values.motherEmail != "" ? values.motherEmail : null,
        null,
        null,
        null,
        values.guardianName != ""
          ? values.guardianName.replace(/\s\s+/g, " ").trim()
          : null,
        values.guardianMobile != "" ? values.guardianMobile : null,
        values.guardianEmail != "" ? values.guardianEmail : null,
        null,
        null,
        null,
        values.addressline1.replace(/\s\s+/g, " ").trim(),
        values.addressline2 != ""
          ? values.addressline2.replace(/\s\s+/g, " ").trim()
          : null,
        values.place != "" ? values.place.replace(/\s\s+/g, " ").trim() : null,
        otherCity ? null : values.city.id,
        otherCity ? values.otherCity : values.city.city,
        values.state.id,
        values.state.state,
        values.country.id,
        values.country.country,
        values.pinCode,
        values.tempAddressline1.replace(/\s\s+/g, " ").trim(),
        values.tempAddressline2 != ""
          ? values.tempAddressline2.replace(/\s\s+/g, " ").trim()
          : null,
        values.tempPlace != ""
          ? values.tempPlace.replace(/\s\s+/g, " ").trim()
          : null,
        tempOtherCity ? null : values.tempCity.id,
        tempOtherCity ? values.tempOtherCity : values.tempCity.city,
        values.tempState.id,
        values.tempState.state,
        values.tempCountry.id,
        values.tempCountry.country,
        values.tempPinCode
      );
      console.log("communicationRes---", communicationRes);
      if (!communicationRes.data.message.success) {
        setModalMessage(communicationRes.data.message.message);
        setModalErrorOpen(true);
        setModalTitle("Message");
        setLoad(false);
        return;
      }
      setCommunicationID(communicationRes.data.message.id);
      // toast.success("Communication details updated successfully");
      handleUnSavedChanges(0);
      handleTabChange("4");
      setLoad(false);
    } catch (error) {
      setLoad(false);
      console.log("Exception---", error);
    }
  };

  const handleAddQualification = (values) => {
    console.log("values", values);
    console.log("qualificationArr----", qualificationArr);
    console.log("newQualificationArr----", newQualificationArr);
    for (let i = 0; i < newQualificationArr.length; i++) {
      if (
        newQualificationArr[i].qualifiedExam ==
          values.qualifiedExam.qualifiedExam &&
        newQualificationArr[i].yearSemSubject ==
          values.yearSemSubject.yearSemSubject
      ) {
        setModalMessage(
          `Qualification ${newQualificationArr[i].qualifiedExam} - ${newQualificationArr[i].yearSemSubject} already exists`
        );
        setModalErrorOpen(true);
        setModalTitle("Message");
        return;
      }
    }
    for (let i = 0; i < qualificationArr.length; i++) {
      if (
        qualificationArr[i].qualifiedExam ==
          values.qualifiedExam.qualifiedExam &&
        qualificationArr[i].yearSemSubject ==
          values.yearSemSubject.yearSemSubject
      ) {
        setModalMessage(
          `Qualification ${qualificationArr[i].qualifiedExam} - ${qualificationArr[i].yearSemSubject} already exists`
        );
        setModalErrorOpen(true);
        setModalTitle("Message");
        return;
      }
    }

    let markList = newQualificationArr;

    let obj = {
      qualifiedExamID: values.qualifiedExam.qualifiedExamID,
      qualifiedExam: values.qualifiedExam.qualifiedExam,
      schoolCollegeName: values.institution.replace(/\s\s+/g, " ").trim(),
      boardUniversity: values.boardUniversity.replace(/\s\s+/g, " ").trim(),
      yearSemSubjectID: values.yearSemSubject.id,
      yearSemSubject: values.yearSemSubject.yearSemSubject,
      maximumMark: values.maxMark,
      markObtained: values.markObtained,
      markPercentage: ((values.markObtained / values.maxMark) * 100).toFixed(2), //values.markPercentage,
      monthYear: moment(values.monthYear).format("MMM-yyyy"),
      icon: true,
    };
    console.log("obj", obj);

    markList.push(obj);
    setNewQualificationArr(markList);
    setSkipQualification(false);
    qualificationRef.current.setFieldValue("yearSemSubject", "");
    qualificationRef.current.setFieldValue("maxMark", "");
    qualificationRef.current.setFieldValue("markObtained", "");
    qualificationRef.current.setFieldValue("markPercentage", "");
    qualificationRef.current.setFieldValue("monthYear", "");
    qualificationRef.current.setFieldTouched("yearSemSubject", false);
    qualificationRef.current.setFieldTouched("maxMark", false);
    qualificationRef.current.setFieldTouched("markObtained", false);
    qualificationRef.current.setFieldTouched("markPercentage", false);
    qualificationRef.current.setFieldTouched("monthYear", false);
  };

  const handleDeleteQualification = async (item) => {
    console.log("item", item);
    const deleteArr = qualificationArr.filter((m) => m !== item);
    setQualificationArr(deleteArr);
    const deleteNewArr = newQualificationArr.filter((m) => m !== item);
    setNewQualificationArr(deleteNewArr);
    if (deleteNewArr.length == 0) {
      setSkipQualification(true);
    }
  };

  const handleSaveQualification = async () => {
    if (load) return;
    try {
      setLoad(true);
      let err = false;
      console.log("New Qualification Array", newQualificationArr);
      for (let i = 0; i < newQualificationArr.length; i++) {
        const saveQualificationRes = await StudentApi.addQualification(
          studentId,
          newQualificationArr[i].qualifiedExamID,
          newQualificationArr[i].schoolCollegeName,
          newQualificationArr[i].boardUniversity,
          newQualificationArr[i].yearSemSubjectID,
          newQualificationArr[i].maximumMark,
          newQualificationArr[i].markObtained,
          newQualificationArr[i].markPercentage,
          newQualificationArr[i].monthYear,
          loggedEmail
        );
        console.log("saveQualification", saveQualificationRes);
        if (!saveQualificationRes.data.message.success) {
          err = true;

          setModalMessage(
            `Qualification ${newQualificationArr[i].qualifiedExam} already exists`
          );
          setModalErrorOpen(true);
          setModalTitle("Message");
          setLoad(false);
          return;
        }
      }
      handleUnSavedChanges(0);
      setSkipQualification(true);
      setLoad(false);
      setNewQualificationArr([]);
      handleTabChange(4);
      if (err) {
        return false;
      }
      return true;
    } catch (error) {
      setLoad(false);
      console.log("Exception---", error);
    }
  };

  const setTemporaryAddress = (values) => {
    if (addressRef.current) {
      if (values.addressCopy) {
        addressRef.current.setFieldValue("tempAddressline1", "");
        addressRef.current.setFieldValue("tempAddressline2", "");
        addressRef.current.setFieldValue("tempPlace", "");
        addressRef.current.setFieldValue("tempCity", "");
        addressRef.current.setFieldValue("tempOtherCity", "");
        addressRef.current.setFieldValue("tempState", "");
        addressRef.current.setFieldValue("tempCountry", "");
        addressRef.current.setFieldValue("tempPinCode", "");
      } else {
        addressRef.current.setFieldValue(
          "tempAddressline1",
          values.addressline1
        );
        addressRef.current.setFieldValue(
          "tempAddressline2",
          values.addressline2
        );
        addressRef.current.setFieldValue("tempPlace", values.place);
        if (otherCity) {
          tempOtherCity = true;
          addressRef.current.setFieldValue("tempOtherCity", values.otherCity);
        } else {
          tempOtherCity = false;
          addressRef.current.setFieldValue("tempCity", values.city);
        }
        addressRef.current.setFieldValue("tempState", values.state);
        addressRef.current.setFieldValue("tempCountry", values.country);
        addressRef.current.setFieldValue("tempPinCode", values.pinCode);

        addressRef.current.setFieldTouched("tempAddressline1", false);
        addressRef.current.setFieldTouched("tempAddressline2", false);
        addressRef.current.setFieldTouched("tempPlace", false);
        addressRef.current.setFieldTouched("tempOtherCity", false);
        addressRef.current.setFieldTouched("tempCity", false);
        addressRef.current.setFieldTouched("tempState", false);
        addressRef.current.setFieldTouched("tempCountry", false);
        addressRef.current.setFieldTouched("tempPinCode", false);
      }
    }
  };

  const getList = async () => {
    try {
      const personalMasterRes = await StudentApi.getMaster(1);
      console.log("personalMasterRes----", personalMasterRes);
      if (!personalMasterRes.data.message.success) {
        setModalMessage(personalMasterRes.data.message.message);
        setModalErrorOpen(true);
        setModalTitle("Message");
        setLoad(false);
        return;
      }
      setGenderList(personalMasterRes.data.message.data.gender_data);
      setBloodGroupList(personalMasterRes.data.message.data.blood_data);
      setNationalityList(personalMasterRes.data.message.data.nationality_data);
      setReligionList(personalMasterRes.data.message.data.religion_data);
      setCommunityList(personalMasterRes.data.message.data.community_data);

      if (formikRef.current) {
        if (personalMasterRes.data.message.data.gender_data.length === 1) {
          formikRef.current.setFieldValue(
            "gender",
            personalMasterRes.data.message.data.gender_data[0]
          );
        }

        if (personalMasterRes.data.message.data.blood_data.length === 1) {
          formikRef.current.setFieldValue(
            "bloodGroup",
            personalMasterRes.data.message.data.blood_data[0]
          );
        }
        if (personalMasterRes.data.message.data.nationality_data.length === 1) {
          formikRef.current.setFieldValue(
            "nationality",
            personalMasterRes.data.message.data.nationality_data[0]
          );
        }
        if (personalMasterRes.data.message.data.religion_data.length === 1) {
          formikRef.current.setFieldValue(
            "religion",
            personalMasterRes.data.message.data.religion_data[0]
          );
        }
        if (personalMasterRes.data.message.data.community_data.length === 1) {
          formikRef.current.setFieldValue(
            "community",
            personalMasterRes.data.message.data.community_data[0]
          );
        }
      }
      setLoad(false);
    } catch (error) {
      console.log("Exception---", error);
    }
  };

  const handleTabChange = async (key, leavepage = true, text) => {
    setTabKey(key);
    if (leavepage != true && unSavedChanges) {
      setOpenLeavePageModel(true);
      console.log("leavepage---", leavepage);
      return;
    }
    setDefaultActiveKey(key);
    // if (!tabKeys.includes(key)) {
    // tabKeys.push(key);
    // console.log("tabkeys----", tabKeys);
    setLoad(true);
    if (studentId) {
      var studentRes = await StudentApi.editStudent(
        studentId,
        parseInt(key),
        collegeConfig.institution_type
      );
      console.log("studentres-----", studentRes);
      if (!studentRes.data.message.success) {
        setModalMessage(studentRes.data.message.message);
        setModalErrorOpen(true);
        setModalTitle("Message");
        setLoad(false);
        return;
      }
      // else if (key == "3") {
      //   document.getElementById("fatherEmail")?.focus();
      //   setAddressValueOutside(studentRes.data.message.data[0]);
      // } else {
      //   document.getElementById("qualifiedExam")?.focus();
      //   setQualificationArr(studentRes.data.message.data);
      // }
    }

    console.log("collegID---", text, collegeId);
    let colId = null;
    if (studentRes?.data?.message?.data[0]?.collegeID) {
      colId = studentRes?.data?.message?.data[0]?.collegeID;
    } else if (collegeConfig.institution_type != 4) {
      colId = collegeId;
    }

    if (key == "2" && !colId && !text) {
      setLoad(false);
      return;
    }

    var masterRes = await StudentApi.getMaster(
      parseInt(key),
      text ? text.collegeID : colId
    );

    console.log("masterRes----", masterRes);

    if (!masterRes.data.message.success) {
      setModalMessage(masterRes.data.message.message);
      setModalErrorOpen(true);
      setModalTitle("Message");
      setLoad(false);
      return;
    }
    console.log("studentId----", studentId);
    console.log("key----", key);

    if (key == "2") {
      document.getElementById("college")?.focus();
      setCourseList(masterRes.data.message.data.course_data);
      setModeOfAdmissionList(masterRes.data.message.data.admission_mode_data);
      setAdmissionTypeList(masterRes.data.message.data.admission_type_data);
      setScholarshipList(masterRes.data.message.data.scholarship_scheme_data);

      if (studentId) {
        console.log("collegeConfig-----", collegeConfig);
        document.getElementById("college")?.focus();

        if (studentRes.data.message.data[0]) {
          const matchingCourse = masterRes.data.message.data.course_data.find(
            (id) => id.id === studentRes.data.message.data[0].courseID
          );
          console.log("matchingCourse", matchingCourse);

          const matchingCollege = collegeConfig.collegeList.find(
            (id) => id.collegeID === studentRes.data.message.data[0].collegeID
          );
          console.log("matchingCollege", matchingCollege);

          setAcademicValueOutside(
            studentRes.data.message.data.length > 0
              ? studentRes.data.message.data[0]
              : null,
            matchingCourse,
            matchingCollege
          );
        }
      }
    } else if (key == "3") {
      document.getElementById("fatherEmail")?.focus();
      setCityList(masterRes.data.message.data.city_data);
      setTempCityList(masterRes.data.message.data.city_data);
      setStateList(masterRes.data.message.data.state_data);
      setCountryList(masterRes.data.message.data.country_data);

      for (let k = 0; k < masterRes.data.message.data.state_data.length; k++) {
        if (masterRes.data.message.data.state_data[k].state === "Tamil Nadu") {
          addressRef.current.setFieldValue(
            "state",
            masterRes.data.message.data.state_data[k]
          );
          addressRef.current.setFieldValue(
            "tempState",
            masterRes.data.message.data.state_data[k]
          );
        }
      }

      if (masterRes.data.message.data.country_data.length === 1) {
        addressRef.current.setFieldValue(
          "country",
          masterRes.data.message.data.country_data[0]
        );
        addressRef.current.setFieldValue(
          "tempCountry",
          masterRes.data.message.data.country_data[0]
        );
      }
      if (studentId) {
        setAddressValueOutside(studentRes.data.message.data[0]);
      }
    } else if (key == "4") {
      document.getElementById("qualifiedExam")?.focus();
      setQualifiedExamList(masterRes.data.message.data.qualified_exam_data);
      if (studentId) {
        setQualificationArr(studentRes.data.message.data);
        if (status && studentRes.data.message.data.length > 0) {
          setSkipQualification(true);
        }
      }
    }
    setLoad(false);
  };

  const getYearSemList = async (qualifiedExamID) => {
    const getYearSemListRes = await StudentApi.getYearSemList(qualifiedExamID);
    if (!getYearSemListRes.data.message.success) {
      setModalMessage(getYearSemListRes.data.message.message);
      setModalErrorOpen(true);
      setModalTitle("Message");
      setLoad(false);
      return;
    }
    setYearSemSubjectList(getYearSemListRes.data.message.data.subject_year_sem);
  };

  const handleTransferYear = async (course, modeOfAdmission) => {
    console.log("values---", course, modeOfAdmission);
    if (modeOfAdmission && modeOfAdmission.admissionMode == "Transfer") {
      let year = [];
      for (let i = 2; i <= course.duration; i++) {
        year.push({ id: i, transferYear: i });
      }
      setTransferYearList(year);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "F4") {
      e.preventDefault();
      console.log("F4 pressed", defaultActiveKey);
      if (defaultActiveKey == 1) {
        $("#personal:first").click(); // Trigger button click
      } else if (defaultActiveKey == 2) {
        $("#academic:first").click(); // Trigger button click
      } else if (defaultActiveKey == 3) {
        $("#communication:first").click(); // Trigger button click
      } else if (defaultActiveKey == 4) {
        $("#saveDraft:first").click(); // Trigger button click
      }
    }
  };

  const handleCollege = async (text) => {
    handleUnSavedChanges(1);
    // handleTabChange("2", true, text);
    setCourseList([]);
    academicRef.current.setFieldValue("course", "");
    academicRef.current.setFieldValue("mediumofStudy", mediumList[0]);
    academicRef.current.setFieldValue("modeOfAdmission", "");
    academicRef.current.setFieldValue("admissionType", "");
    academicRef.current.setFieldValue("scholarshipScheme", "");
    academicRef.current.setFieldValue("isFirstGraduation", "");
    academicRef.current.setFieldValue("transferYear", "");
    var masterRes = await StudentApi.getMaster(2, text.collegeID);

    console.log("masterRes----", masterRes);

    if (!masterRes.data.message.success) {
      setModalMessage(masterRes.data.message.message);
      setModalErrorOpen(true);
      setModalTitle("Message");
      setLoad(false);
      return;
    }
    document.getElementById("college")?.focus();
    setCourseList(masterRes.data.message.data.course_data);
    setModeOfAdmissionList(masterRes.data.message.data.admission_mode_data);
    setAdmissionTypeList(masterRes.data.message.data.admission_type_data);
    setScholarshipList(masterRes.data.message.data.scholarship_scheme_data);
  };

  useEffect(() => {
    setLoad(false);
    if (location?.state?.id) {
      console.log("location?.state?.id--", location?.state);
      setStudentId(location.state.id);
      if (location?.state?.tab) {
        handleTabChange(location?.state?.tab);
      } else {
        getStudent(location.state.id);
      }
    }
    getList();
  }, []);

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [defaultActiveKey]);

  return (
    <div className="content-area-report" onClick={preFunction.hideNavbar}>
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
      <div className="row no-gutters bg-white-report">
        <ScreenTitle titleClass={"page-heading-position"} />
        <div className="row no-gutters mt-3">
          <div className="col-lg-12">
            <Tabs
              activeKey={defaultActiveKey}
              id="uncontrolled-tab-example"
              fill
              onSelect={handleTabChange}
            >
              <Tab
                eventKey="1"
                title="General"
                disabled={location?.state?.id ? false : true}
              >
                <Formik
                  enableReinitialize={false}
                  autoComplete={"nope"}
                  innerRef={formikRef}
                  initialValues={{
                    studentName: "",
                    fatherName: "",
                    dateofBirth: "",
                    gender: "",
                    studentMobile: "",
                    studentEmail: "",
                    bloodGroup: "",
                    aadhaar: "",
                    pan: "",
                    nationality:
                      nationalityList.length === 1 ? nationalityList[0] : "",
                    religion: "",
                    community: "",
                    isTransport: 0,
                    isHostel: 0,
                    applicationNumber: "",
                    registrationNumber: "",
                    counselRefNumber: "",
                    admissionTypeID: "",
                    courseID: "",
                    semester: "",
                    classID: "",
                    mediumID: "",
                  }}
                  validationSchema={PersonalSchema}
                  onSubmit={(values) => {
                    handleSavePersonal(values, 0);
                  }}
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
                        <div className="row no-gutters p-3 ">
                          <div className="subhead-row mt-0">
                            <div className="subhead">Student Detail </div>
                            <div className="col line-div"></div>
                          </div>
                          <div className="row no-gutters">
                            <div className="col-lg-9 pe-2">
                              <TextFieldFormik
                                autoFocus
                                labelSize={5}
                                tabIndex={2}
                                id="studentName"
                                label="Student Name"
                                mandatory={1}
                                maxlength={45}
                                onChange={(e) => {
                                  handleUnSavedChanges(1);
                                  setFieldValue(
                                    "studentName",
                                    preFunction.capitalizeFirst(e.target.value)
                                  );
                                }}
                              />
                              <TextFieldFormik
                                labelSize={5}
                                id="fatherName"
                                tabIndex={3}
                                label="Father Name"
                                maxlength={45}
                                mandatory={1}
                                onChange={(e) => {
                                  handleUnSavedChanges(1);
                                  setFieldValue(
                                    "fatherName",
                                    preFunction.capitalizeFirst(e.target.value)
                                  );
                                }}
                              />
                              <DateFieldFormik
                                labelSize={5}
                                tabIndex={4}
                                label="Date of Birth"
                                id="dateofBirth"
                                maxDate={moment().subtract(14, "years")}
                                minDate={moment().subtract(70, "years")}
                                mandatory={1}
                                style={{ width: "40%" }}
                                onChange={(e) => {
                                  handleUnSavedChanges(1);
                                  setFieldValue("dateofBirth", e.target.value);
                                }}
                              />
                              <SelectFieldFormik
                                tabIndex={5}
                                labelSize={5}
                                id="gender"
                                label="Gender"
                                options={genderList}
                                matchFrom="start"
                                getOptionLabel={(option) => option.gender}
                                getOptionValue={(option) => option.id}
                                mandatory={1}
                                maxlength={15}
                                style={{ width: "40%" }}
                                onChange={(text) => {
                                  handleUnSavedChanges(1);
                                  setFieldValue("gender", text);
                                }}
                              />
                              {/* {status ? ( */}
                              {/* <>
                                <DisplayText
                                  label="Student Mobile No."
                                  labelSize={5}
                                  value={values.studentMobile}
                                />
                                <DisplayText
                                  label="Student Email ID"
                                  labelSize={5}
                                  value={values.studentEmail}
                                />
                              </> */}
                              {/* // ) : ( */}
                              <>
                                <TextFieldFormik
                                  tabIndex={6}
                                  labelSize={5}
                                  id="studentMobile"
                                  label="Student Mobile No."
                                  placeholder="Mobile"
                                  value={
                                    values.studentMobile > 0
                                      ? values.studentMobile
                                      : ""
                                  }
                                  onChange={(e) => {
                                    if (
                                      preFunction.amountValidation(
                                        e.target.value
                                      )
                                    )
                                      setFieldValue(
                                        "studentMobile",
                                        e.target.value
                                      );
                                    handleUnSavedChanges(1);
                                  }}
                                  maxlength={10}
                                  // mandatory={1}
                                  style={{ width: "40%" }}
                                />
                                <TextFieldFormik
                                  tabIndex={7}
                                  labelSize={5}
                                  id="studentEmail"
                                  label="Student Email ID"
                                  onChange={(e) => {
                                    setFieldValue(
                                      "studentEmail",
                                      e.target.value
                                    );
                                    handleUnSavedChanges(1);
                                  }}
                                  // mandatory={1}
                                  maxlength={45}
                                />
                              </>
                              {/* )} */}
                              <SelectFieldFormik
                                tabIndex={8}
                                labelSize={5}
                                id="bloodGroup"
                                label="Blood Group"
                                placeholder=" "
                                clear={true}
                                options={bloodGroupList}
                                getOptionLabel={(option) => option.bloodGroup}
                                getOptionValue={(option) => option.id}
                                style={{ width: "40%" }}
                                maxlength={4}
                                matchFrom="start"
                                onChange={(text) => {
                                  handleUnSavedChanges(1);
                                  setFieldValue("bloodGroup", text);
                                }}
                              />
                              <TextFieldFormik
                                tabIndex={9}
                                labelSize={5}
                                id="aadhaar"
                                label="Aadhaar No."
                                placeholder="Aadhaar"
                                value={values.aadhaar > 0 ? values.aadhaar : ""}
                                onChange={(e) => {
                                  if (
                                    preFunction.amountValidation(e.target.value)
                                  ) {
                                    handleUnSavedChanges(1);
                                    setFieldValue("aadhaar", e.target.value);
                                  }
                                }}
                                maxlength={12}
                                // mandatory={1}
                                style={{ width: "40%" }}
                              />

                              <TextFieldFormik
                                tabIndex={10}
                                labelSize={5}
                                id="pan"
                                label="PAN"
                                onChange={(e) => {
                                  setFieldValue(
                                    "pan",
                                    e.target.value.toUpperCase()
                                  );
                                  handleUnSavedChanges(1);
                                }}
                                maxlength={10}
                                style={{ width: "40%" }}
                              />
                              <SelectFieldFormik
                                tabIndex={11}
                                labelSize={5}
                                label="Nationality"
                                id="nationality"
                                matchFrom="start"
                                mandatory={1}
                                maxlength={15}
                                options={nationalityList}
                                getOptionLabel={(option) => option.nationality}
                                getOptionValue={(option) => option.id}
                                onChange={(text) => {
                                  setFieldValue("nationality", text);
                                  handleUnSavedChanges(1);
                                }}
                                style={{ width: "50%" }}
                              />
                              <SelectFieldFormik
                                tabIndex={12}
                                labelSize={5}
                                label="Religion"
                                id="religion"
                                matchFrom="start"
                                mandatory={1}
                                maxlength={15}
                                options={religionList}
                                getOptionLabel={(option) => option.religion}
                                getOptionValue={(option) => option.id}
                                onChange={(text) => {
                                  setFieldValue("religion", text);
                                  handleUnSavedChanges(1);
                                }}
                                style={{ width: "50%" }}
                              />
                              <SelectFieldFormik
                                tabIndex={13}
                                labelSize={5}
                                label="Community"
                                id="community"
                                // mandatory={1}
                                clear={true}
                                maxlength={15}
                                matchFrom="start"
                                options={communityList}
                                getOptionLabel={(option) => option.community}
                                getOptionValue={(option) => option.id}
                                onChange={(text) => {
                                  setFieldValue("community", text);
                                  handleUnSavedChanges(1);
                                }}
                                style={{ width: "50%" }}
                              />
                            </div>
                            <div className="col-lg-3 ps-2">
                              <div className="text-center" id="studPhoto">
                                <input
                                  type="file"
                                  accept="image/*"
                                  name="fileinput"
                                  id="fileinput"
                                  onChange={(e) => {
                                    selectImage(e.target.files[0]);
                                  }}
                                  onClick={(e) => {
                                    e.target.value = "";
                                  }}
                                  style={{ display: "none" }}
                                />
                                <img
                                  src={displayImage}
                                  alt=""
                                  id="img"
                                  className="text-center img-thumbnail image-upload"
                                  htmlFor="fileinput"
                                  width={150}
                                  height={150}
                                />
                                <label
                                  className="image-upload mt-30"
                                  htmlFor="fileinput"
                                >
                                  <img
                                    src={photo}
                                    alt=""
                                    height="35"
                                    style={{
                                      position: "absolute",
                                      marginTop: 55,
                                      marginLeft: -35,
                                      cursor: "pointer",
                                    }}
                                  />
                                </label>
                                <ErrorMessage
                                  Message={photoMessage}
                                  view={showImg}
                                />
                              </div>
                            </div>
                          </div>

                          <div className="row no-gutters ">
                            <div className="subhead-row">
                              <div className="subhead">Application Detail </div>
                              <div className="col line-div"></div>
                            </div>
                          </div>
                          <div className="row no-gutters">
                            <div className="col-lg-9 pe-2">
                              {status ? (
                                <>
                                  <DisplayText
                                    label="Application No."
                                    labelSize={5}
                                    value={values.applicationNumber}
                                  />
                                  <DisplayText
                                    label="Counselling Reference No."
                                    labelSize={5}
                                    value={values.counselRefNumber}
                                  />
                                </>
                              ) : (
                                <>
                                  <TextFieldFormik
                                    labelSize={5}
                                    tabIndex={14}
                                    id="applicationNumber"
                                    label="Application No."
                                    placeholder="Application No"
                                    maxlength={18}
                                    onChange={(e) => {
                                      setFieldValue(
                                        "applicationNumber",
                                        e.target.value
                                      );
                                      handleUnSavedChanges(1);
                                    }}
                                    style={{ width: "50%" }}
                                  />
                                  <TextFieldFormik
                                    labelSize={5}
                                    tabIndex={15}
                                    id="counselRefNumber"
                                    label="Counselling Ref. No."
                                    placeholder="Counselling No."
                                    maxlength={20}
                                    onChange={(e) => {
                                      setFieldValue(
                                        "counselRefNumber",
                                        e.target.value
                                      );
                                      handleUnSavedChanges(1);
                                    }}
                                    style={{ width: "50%" }}
                                  />
                                </>
                              )}
                            </div>
                          </div>

                          <Button
                            id="personal"
                            text="F4 - Next"
                            tabIndex={16}
                            onClick={(e) => {
                              preFunction.handleErrorFocus(errors);
                            }}
                          />
                        </div>
                      </form>
                    );
                  }}
                </Formik>
              </Tab>
              <Tab
                eventKey="2"
                title="Academic"
                disabled={location?.state?.id ? false : true}
              >
                <Formik
                  innerRef={academicRef}
                  enableReinitialize={true}
                  initialValues={{
                    college: "",
                    course: "",
                    modeOfAdmission: "",
                    transferYear: "",
                    admissionType: "",
                    // dateofJoining: "",
                    mediumofStudy: mediumList[0],
                    isFirstGraduation: false,
                    scholarshipScheme: "",
                    admissionFile: "",
                  }}
                  validationSchema={OtherDetailsSchema}
                  onSubmit={handleSaveAcademic}
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
                    resetForm,
                  }) => {
                    return (
                      <form onSubmit={handleSubmit} autoComplete="off">
                        <div className="row no-gutters p-3">
                          {status ? (
                            <>
                              <DisplayText
                                labelSize={4}
                                label="College"
                                value={values?.college?.collegeName}
                              />
                              <DisplayText
                                labelSize={4}
                                label={RENAME?.course}
                                value={values?.course?.courseName}
                              />

                              <DisplayText
                                labelSize={4}
                                label="Medium"
                                value={values?.mediumofStudy.label}
                              />

                              <DisplayText
                                labelSize={4}
                                label="Mode of Admission"
                                value={values?.modeOfAdmission?.admissionMode}
                              />
                              {values.modeOfAdmission &&
                              values.modeOfAdmission.admissionMode ==
                                "Transfer" ? (
                                <DisplayText
                                  labelSize={4}
                                  label="Year"
                                  value={values?.transferYear}
                                />
                              ) : null}
                              <DisplayText
                                labelSize={4}
                                label="Admission Type"
                                value={values.admissionType.admissionType}
                              />

                              <DisplayText
                                labelSize={4}
                                label="Scholorship Scheme"
                                value={
                                  values.scholarshipScheme.scholarshipScheme
                                }
                              />
                              <DisplayText
                                labelSize={4}
                                label="First Graduate"
                                value={values.isFirstGraduation ? "Yes" : "No"}
                              />
                            </>
                          ) : (
                            <>
                              {collegeConfig.is_university ? (
                                <SelectFieldFormik
                                  autoFocus
                                  tabIndex={17}
                                  labelSize={4}
                                  label="College"
                                  id="college"
                                  mandatory={1}
                                  options={collegeConfig.collegeList}
                                  getOptionLabel={(option) =>
                                    option.collegeName
                                  }
                                  getOptionValue={(option) => option.collegeID}
                                  searchIcon={false}
                                  clear={false}
                                  onChange={(text) => {
                                    setFieldValue("college", text);
                                    handleCollege(text);
                                    handleUnSavedChanges(1);
                                  }}
                                  style={{ width: "80%" }}
                                />
                              ) : null}
                              <div className="row no-gutters">
                                <SelectFieldFormik
                                  autoFocus={!collegeConfig.is_university}
                                  label={RENAME?.course}
                                  labelSize={4}
                                  tabIndex={18}
                                  id="course"
                                  matchFrom="start"
                                  clear={false}
                                  mandatory={1}
                                  maxlength={30}
                                  options={courseList}
                                  getOptionLabel={(option) => option.courseName}
                                  getOptionValue={(option) => option.id}
                                  style={{ width: "80%" }}
                                  onChange={(text) => {
                                    setFieldValue("course", text);
                                    handleTransferYear(
                                      text,
                                      values.modeOfAdmission
                                    );
                                    handleUnSavedChanges(1);
                                  }}
                                />

                                <SelectFieldFormik
                                  label="Medium"
                                  clear={false}
                                  labelSize={4}
                                  tabIndex={19}
                                  mandatory={1}
                                  maxlength={15}
                                  id="mediumofStudy"
                                  matchFrom="start"
                                  options={mediumList}
                                  value={values.mediumofStudy}
                                  style={{ width: "30%" }}
                                  onChange={(text) => {
                                    setFieldValue("mediumofStudy", text);
                                    handleUnSavedChanges(1);
                                  }}
                                />

                                <SelectFieldFormik
                                  label="Mode of Admission"
                                  placeholder="Mode"
                                  labelSize={4}
                                  tabIndex={20}
                                  id="modeOfAdmission"
                                  matchFrom="start"
                                  mandatory={1}
                                  maxlength={15}
                                  options={modeOfAdmissionList}
                                  getOptionLabel={(option) =>
                                    option.admissionMode
                                  }
                                  getOptionValue={(option) => option.id}
                                  style={{ width: "30%" }}
                                  onChange={(text) => {
                                    setFieldValue("modeOfAdmission", text);
                                    handleTransferYear(values.course, text);
                                    handleUnSavedChanges(1);
                                  }}
                                />
                                {values.modeOfAdmission &&
                                values.modeOfAdmission.admissionMode ==
                                  "Transfer" ? (
                                  <>
                                    <SelectFieldFormik
                                      label="Year"
                                      matchFrom="start"
                                      labelSize={4}
                                      tabIndex={
                                        values.modeOfAdmission &&
                                        values.modeOfAdmission.admissionMode ==
                                          "Transfer"
                                          ? 21
                                          : ""
                                      }
                                      id="transferYear"
                                      mandatory={1}
                                      maxlength={4}
                                      options={transferYearList}
                                      getOptionLabel={(option) =>
                                        option.transferYear
                                      }
                                      getOptionValue={(option) => option.id}
                                      style={{ width: "30%" }}
                                      onChange={(text) => {
                                        setFieldValue("transferYear", text);
                                        handleUnSavedChanges(1);
                                      }}
                                    />
                                  </>
                                ) : null}
                                <SelectFieldFormik
                                  label="Admission Type"
                                  placeholder="Type"
                                  labelSize={4}
                                  id="admissionType"
                                  matchFrom="start"
                                  tabIndex={
                                    values.modeOfAdmission &&
                                    values.modeOfAdmission.admissionMode ==
                                      "Transfer"
                                      ? 22
                                      : 21
                                  }
                                  mandatory={1}
                                  maxlength={15}
                                  options={admissionTypeList}
                                  getOptionLabel={(option) =>
                                    option.admissionType
                                  }
                                  getOptionValue={(option) => option.id}
                                  style={{ width: "30%" }}
                                  onChange={(text) => {
                                    setFieldValue("admissionType", text);
                                    handleUnSavedChanges(1);
                                  }}
                                />
                                <SelectFieldFormik
                                  label="Scholorship Scheme"
                                  matchFrom="start"
                                  labelSize={4}
                                  clear={true}
                                  tabIndex={
                                    values.modeOfAdmission &&
                                    values.modeOfAdmission.admissionMode ==
                                      "Transfer"
                                      ? 23
                                      : 22
                                  }
                                  maxlength={20}
                                  id="scholarshipScheme"
                                  options={scholarshipList}
                                  getOptionLabel={(option) =>
                                    option.scholarshipScheme
                                  }
                                  getOptionValue={(option) => option.id}
                                  style={{ width: "50%" }}
                                  onChange={(text) => {
                                    setFieldValue("scholarshipScheme", text);
                                    handleUnSavedChanges(1);
                                  }}
                                />

                                <SwitchField
                                  label="First Graduate"
                                  labelSize={4}
                                  tabIndex={
                                    values.modeOfAdmission &&
                                    values.modeOfAdmission.admissionMode ==
                                      "Transfer"
                                      ? 24
                                      : 23
                                  }
                                  checked={values.isFirstGraduation}
                                  onChange={(e) => {
                                    setFieldValue(
                                      "isFirstGraduation",
                                      !values.isFirstGraduation
                                    );
                                  }}
                                />
                              </div>
                            </>
                          )}
                          <Button
                            tabIndex={
                              values.modeOfAdmission &&
                              values.modeOfAdmission.admissionMode == "Transfer"
                                ? 25
                                : 24
                            }
                            onClick={(e) =>
                              preFunction.handleErrorFocus(errors)
                            }
                            text="F4 - Next"
                            id="academic"
                          />
                        </div>
                      </form>
                    );
                  }}
                </Formik>
              </Tab>
              <Tab
                eventKey="3"
                title="Communication"
                disabled={location?.state?.id ? false : true}
              >
                <Formik
                  innerRef={addressRef}
                  autoComplete={("nope", "off")}
                  enableReinitialize={true}
                  initialValues={{
                    fatherEmail: "",
                    fatherMobile: "",
                    motherName: "",
                    motherMobile: "",
                    motherEmail: "",
                    guardianName: "",
                    guardianMobile: "",
                    guardianEmail: "",
                    isGuardian: false,
                    addressline1: "",
                    addressline2: "",
                    place: "",
                    city: "",
                    otherCity: "",
                    state: "",
                    pinCode: "",
                    country: "",
                    tempAddressline1: "",
                    tempAddressline2: "",
                    tempPlace: "",
                    tempCity: "",
                    tempOtherCity: "",
                    tempState: "",
                    tempPinCode: "",
                    tempCountry: "",
                    addressCopy: false,
                  }}
                  validationSchema={AddressSchema}
                  onSubmit={handleSaveCommunication}
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
                    setErrors,
                  }) => {
                    return (
                      <form onSubmit={handleSubmit} autoComplete="off">
                        <div className="row no-gutters p-3">
                          <div className="row no-gutters">
                            <div className="subhead-row">
                              <div className="subhead">
                                Communication Detail
                              </div>
                              <div className="col line-div"></div>
                            </div>
                          </div>
                          <div className="row no-gutters">
                            <div className="col-lg-9 pe-2">
                              <TextFieldFormik
                                autoFocus
                                maxlength={40}
                                tabIndex={24}
                                id="fatherEmail"
                                label="Father Email ID"
                                labelSize={5}
                                onChange={handleChange}
                                style={{ width: "70%" }}
                              />
                              <TextFieldFormik
                                id="fatherMobile"
                                mandatory={values.isGuardian ? 0 : 1}
                                label="Father Mobile No."
                                labelSize={5}
                                placeholder="Mobile"
                                value={
                                  values.fatherMobile > 0
                                    ? values.fatherMobile
                                    : ""
                                }
                                onChange={(e) => {
                                  if (
                                    preFunction.amountValidation(e.target.value)
                                  ) {
                                    setFieldValue(
                                      "fatherMobile",
                                      e.target.value
                                    );
                                    handleUnSavedChanges(1);
                                  }
                                }}
                                maxlength={10}
                                tabIndex={25}
                                style={{ width: "40%" }}
                              />
                              <TextFieldFormik
                                id="motherName"
                                label="Mother Name"
                                labelSize={5}
                                maxlength={45}
                                mandatory={1}
                                tabIndex={26}
                                onChange={(e) => {
                                  setFieldValue(
                                    "motherName",
                                    preFunction.capitalizeFirst(e.target.value)
                                  );
                                  handleUnSavedChanges(1);
                                }}
                                style={{ width: "70%" }}
                              />
                              <TextFieldFormik
                                id="motherEmail"
                                maxlength={40}
                                tabIndex={27}
                                label="Mother Email ID"
                                labelSize={5}
                                onChange={handleChange}
                                style={{ width: "70%" }}
                              />
                              <TextFieldFormik
                                id="motherMobile"
                                placeholder="Mobile"
                                label="Mother Mobile No."
                                labelSize={5}
                                value={
                                  values.motherMobile > 0
                                    ? values.motherMobile
                                    : ""
                                }
                                onChange={(e) => {
                                  if (
                                    preFunction.amountValidation(e.target.value)
                                  ) {
                                    setFieldValue(
                                      "motherMobile",
                                      e.target.value
                                    );
                                    handleUnSavedChanges(1);
                                  }
                                }}
                                maxlength={10}
                                tabIndex={28}
                                style={{ width: "40%" }}
                              />
                              <SwitchField
                                label="Add Guardian Detail"
                                labelSize={5}
                                yesOption={"Yes"}
                                noOption={"No"}
                                checked={values.isGuardian}
                                value={values.isGuardian}
                                tabIndex={29}
                                onChange={(e) => {
                                  setFieldValue(
                                    "isGuardian",
                                    !values.isGuardian
                                  );
                                  handleUnSavedChanges(1);
                                  if (!values.isGuardian) {
                                    setFieldValue("guardianName", "");
                                    setFieldValue("guardianMobile", "");
                                    setFieldValue("guardianEmail", "");
                                  }
                                }}
                              />
                              {values.isGuardian && (
                                <>
                                  <TextFieldFormik
                                    id="guardianName"
                                    maxlength={45}
                                    mandatory={1}
                                    tabIndex={values.isGuardian ? 30 : ""}
                                    label="Guardian Name"
                                    labelSize={5}
                                    onChange={(e) => {
                                      setFieldValue(
                                        "guardianName",
                                        preFunction.capitalizeFirst(
                                          e.target.value
                                        )
                                      );
                                      handleUnSavedChanges(1);
                                    }}
                                    style={{ width: "70%" }}
                                  />
                                  <TextFieldFormik
                                    id="guardianEmail"
                                    maxlength={40}
                                    tabIndex={values.isGuardian ? 31 : ""}
                                    label="Guardian Email ID"
                                    labelSize={5}
                                    onChange={handleChange}
                                    style={{ width: "70%" }}
                                  />
                                  <TextFieldFormik
                                    id="guardianMobile"
                                    placeholder="Mobile"
                                    mandatory={1}
                                    tabIndex={values.isGuardian ? 32 : ""}
                                    label="Guardian Mobile No."
                                    labelSize={5}
                                    value={
                                      values.guardianMobile > 0
                                        ? values.guardianMobile
                                        : ""
                                    }
                                    onChange={(e) => {
                                      if (
                                        preFunction.amountValidation(
                                          e.target.value
                                        )
                                      ) {
                                        setFieldValue(
                                          "guardianMobile",
                                          e.target.value
                                        );
                                      }
                                      handleUnSavedChanges(1);
                                    }}
                                    maxlength={10}
                                    style={{ width: "40%" }}
                                  />
                                </>
                              )}
                            </div>
                          </div>
                          <div className="row no-gutters">
                            <div className="subhead-row">
                              <div className="subhead">Permanent Address</div>
                              <div className="col line-div"></div>
                            </div>
                          </div>
                          <div className="row no-gutters">
                            <div className="col-lg-9 pe-2">
                              <TextFieldFormik
                                id="addressline1"
                                label="Address Line 1"
                                labelSize={5}
                                maxlength={45}
                                tabIndex={values.isGuardian ? 33 : 30}
                                onChange={(e) => {
                                  setFieldValue("addressline1", e.target.value);
                                  handleUnSavedChanges(1);
                                }}
                                mandatory={1}
                              />

                              <TextFieldFormik
                                id="addressline2"
                                label="Address Line 2"
                                labelSize={5}
                                maxlength={45}
                                tabIndex={values.isGuardian ? 34 : 31}
                                onChange={(e) => {
                                  setFieldValue("addressline2", e.target.value);
                                  handleUnSavedChanges(1);
                                }}
                              />

                              <TextFieldFormik
                                label="Place"
                                labelSize={5}
                                id="place"
                                maxlength={45}
                                mandatory={1}
                                tabIndex={values.isGuardian ? 35 : 32}
                                onChange={(e) => {
                                  setFieldValue("place", e.target.value);
                                  handleUnSavedChanges(1);
                                }}
                              />
                              <SelectFieldFormik
                                label="State"
                                labelSize={5}
                                id="state"
                                options={stateList}
                                matchFrom="start"
                                clear={false}
                                getOptionLabel={(option) => option.state}
                                getOptionValue={(option) => option.id}
                                mandatory={1}
                                maxlength={25}
                                tabIndex={values.isGuardian ? 36 : 33}
                                onChange={(text) => {
                                  setFieldValue("state", text);
                                  setFieldValue("city", "");
                                  handleCityByState(text);
                                  handleUnSavedChanges(1);
                                }}
                              />
                              {otherCity ? (
                                <>
                                  <TextFieldFormik
                                    id="otherCity"
                                    label="City"
                                    labelSize={5}
                                    onChange={handleChange}
                                    maxlength={40}
                                    tabIndex={
                                      !otherCity
                                        ? ""
                                        : values.isGuardian
                                        ? 37
                                        : 34
                                    }
                                    mandatory={1}
                                  />
                                </>
                              ) : (
                                <>
                                  <SelectFieldFormik
                                    label="City/District"
                                    matchFrom="start"
                                    labelSize={5}
                                    id="city"
                                    options={cityList}
                                    tabIndex={
                                      otherCity
                                        ? ""
                                        : values.isGuardian
                                        ? 37
                                        : 34
                                    }
                                    getOptionLabel={(option) => option.city}
                                    getOptionValue={(option) => option.id}
                                    mandatory={1}
                                    maxlength={25}
                                    onChange={(text) => {
                                      setFieldValue("city", text);
                                      handleUnSavedChanges(1);
                                    }}
                                  />
                                </>
                              )}

                              <TextFieldFormik
                                id="pinCode"
                                label="Pincode"
                                placeholder={" "}
                                labelSize={5}
                                value={values.pinCode > 0 ? values.pinCode : ""}
                                onChange={(e) => {
                                  if (!isNaN(e.target.value))
                                    setFieldValue("pinCode", e.target.value);
                                  handleUnSavedChanges(1);
                                }}
                                style={{ width: "30%" }}
                                maxlength={6}
                                mandatory={1}
                                tabIndex={values.isGuardian ? 38 : 35}
                              />

                              <SelectFieldFormik
                                label="Country"
                                matchFrom="start"
                                labelSize={5}
                                id="country"
                                clear={false}
                                options={countryList}
                                getOptionLabel={(option) => option.country}
                                getOptionValue={(option) => option.id}
                                mandatory={1}
                                tabIndex={values.isGuardian ? 39 : 36}
                                maxlength={15}
                                onChange={(text) => {
                                  setFieldValue("country", text);
                                  handleUnSavedChanges(1);
                                }}
                              />
                            </div>
                          </div>
                          <div className="row no-gutters">
                            <div className="subhead-row">
                              <div className="subhead">Temporary Address </div>
                              <div className="col line-div"></div>
                            </div>
                          </div>
                          <div className="row no-gutters mb-3 ">
                            <div className="col-lg-3"></div>
                            <div className="col-lg-9">
                              <SwitchField
                                label=""
                                labelSize={4}
                                yesOption="Copied"
                                noOption="Copy from Permanent Address"
                                checked={values.addressCopy}
                                tabIndex={values.isGuardian ? 40 : 37}
                                onChange={(e) => {
                                  setFieldValue(
                                    "addressCopy",
                                    !values.addressCopy
                                  );
                                  setTemporaryAddress(values);
                                  handleUnSavedChanges(1);
                                }}
                              />
                            </div>
                          </div>
                          <div className="row no-gutters">
                            <div className="col-lg-9 pe-2">
                              <TextFieldFormik
                                id="tempAddressline1"
                                label="Address Line 1"
                                labelSize={5}
                                maxlength={45}
                                tabIndex={values.isGuardian ? 41 : 38}
                                onChange={(e) => {
                                  setFieldValue(
                                    "tempAddressline1",
                                    e.target.value
                                  );
                                  handleUnSavedChanges(1);
                                }}
                                mandatory={1}
                              />

                              <TextFieldFormik
                                id="tempAddressline2"
                                maxlength={45}
                                tabIndex={values.isGuardian ? 42 : 39}
                                label="Address Line 2"
                                labelSize={5}
                                onChange={handleChange}
                              />

                              <TextFieldFormik
                                label="Place"
                                labelSize={5}
                                maxlength={45}
                                id="tempPlace"
                                mandatory={1}
                                tabIndex={values.isGuardian ? 43 : 40}
                                onChange={(e) => {
                                  setFieldValue("tempPlace", e.target.value);
                                  handleUnSavedChanges(1);
                                }}
                              />
                              <SelectFieldFormik
                                label="State"
                                labelSize={5}
                                id="tempState"
                                matchFrom="start"
                                options={stateList}
                                clear={false}
                                getOptionLabel={(option) => option.state}
                                getOptionValue={(option) => option.id}
                                mandatory={1}
                                maxlength={25}
                                tabIndex={values.isGuardian ? 44 : 41}
                                onChange={(text) => {
                                  setFieldValue("tempState", text);
                                  setFieldValue("tempCity", "");
                                  handleTempCityByState(text);
                                  handleUnSavedChanges(1);
                                }}
                              />
                              {tempOtherCity ? (
                                <>
                                  <TextFieldFormik
                                    id="tempOtherCity"
                                    label="City"
                                    labelSize={5}
                                    onChange={handleChange}
                                    maxlength={40}
                                    mandatory={1}
                                    tabIndex={
                                      !tempOtherCity
                                        ? ""
                                        : values.isGuardian
                                        ? 45
                                        : 42
                                    }
                                  />
                                </>
                              ) : (
                                <>
                                  <SelectFieldFormik
                                    label="City/District"
                                    labelSize={5}
                                    id="tempCity"
                                    matchFrom="start"
                                    options={tempCityList}
                                    getOptionLabel={(option) => option.city}
                                    getOptionValue={(option) => option.id}
                                    mandatory={1}
                                    maxlength={25}
                                    tabIndex={
                                      tempOtherCity
                                        ? ""
                                        : values.isGuardian
                                        ? 45
                                        : 42
                                    }
                                    onChange={(text) => {
                                      setFieldValue("tempCity", text);
                                      handleUnSavedChanges(1);
                                    }}
                                  />
                                </>
                              )}

                              <TextFieldFormik
                                id="tempPinCode"
                                label="Pincode"
                                placeholder={" "}
                                labelSize={5}
                                value={
                                  values.tempPinCode > 0
                                    ? values.tempPinCode
                                    : ""
                                }
                                onChange={(e) => {
                                  if (!isNaN(e.target.value))
                                    setFieldValue(
                                      "tempPinCode",
                                      e.target.value
                                    );
                                  handleUnSavedChanges(1);
                                }}
                                style={{ width: "30%" }}
                                maxlength={6}
                                mandatory={1}
                                tabIndex={values.isGuardian ? 46 : 43}
                              />

                              <SelectFieldFormik
                                label="Country"
                                labelSize={5}
                                id="tempCountry"
                                matchFrom="start"
                                options={countryList}
                                clear={false}
                                getOptionLabel={(option) => option.country}
                                getOptionValue={(option) => option.id}
                                mandatory={1}
                                maxlength={15}
                                tabIndex={values.isGuardian ? 47 : 44}
                                onChange={(text) => {
                                  setFieldValue("tempCountry", text);
                                  handleUnSavedChanges(1);
                                }}
                              />
                            </div>
                          </div>

                          <Button
                            tabIndex={values.isGuardian ? 48 : 45}
                            onClick={(e) =>
                              preFunction.handleErrorFocus(errors)
                            }
                            text="F4 - Next"
                            id="communication"
                          />
                        </div>
                      </form>
                    );
                  }}
                </Formik>
              </Tab>
              <Tab
                eventKey="4"
                title="Qualification"
                disabled={location?.state?.id ? false : true}
              >
                <div className="row no-gutters p-3">
                  <div className="row no-gutters">
                    <div className="subhead-row">
                      <div className="subhead">Qualification Detail</div>
                      <div className="col line-div"></div>
                    </div>
                  </div>

                  <Formik
                    enableReinitialize={true}
                    innerRef={qualificationRef}
                    initialValues={{
                      qualifiedExam: "",
                      institution: "",
                      boardUniversity: "",
                      yearSemSubject: "",
                      maxMark: "",
                      markObtained: "",
                      // markPercentage: "",
                      monthYear: "",
                    }}
                    validationSchema={qualificationSchema}
                    onSubmit={handleAddQualification}
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
                          <div className="row col-lg-9 pe-2">
                            <SelectFieldFormik
                              id="qualifiedExam"
                              label="Qualified Exam"
                              matchFrom="start"
                              options={qualifiedExamList}
                              getOptionLabel={(option) => option.qualifiedExam}
                              getOptionValue={(option) =>
                                option.qualifiedExamID
                              }
                              mandatory={1}
                              maxlength={15}
                              tabIndex={49}
                              onChange={(text) => {
                                setFieldValue("qualifiedExam", text);
                                setFieldValue("yearSemSubject", "");
                                getYearSemList(text?.qualifiedExamID);
                                handleUnSavedChanges(1);
                                setSkipQualification(false);
                              }}
                            />

                            <TextFieldFormik
                              id="institution"
                              label="School/College Name"
                              mandatory={1}
                              tabIndex={50}
                              onChange={(e) => {
                                setFieldValue(
                                  "institution",
                                  preFunction.capitalizeFirst(e.target.value)
                                );
                                handleUnSavedChanges(1);
                                setSkipQualification(false);
                              }}
                            />

                            <TextFieldFormik
                              id="boardUniversity"
                              label="Board/University"
                              maxlength={40}
                              mandatory={1}
                              tabIndex={51}
                              onChange={(e) => {
                                setFieldValue(
                                  "boardUniversity",
                                  preFunction.capitalizeFirst(e.target.value)
                                );
                                handleUnSavedChanges(1);
                                setSkipQualification(false);
                              }}
                            />

                            <SelectFieldFormik
                              label="Year/Sem/Subject"
                              id="yearSemSubject"
                              matchFrom="start"
                              options={yearSemSubjectList}
                              getOptionLabel={(option) => option.yearSemSubject}
                              getOptionValue={(option) => option.id}
                              mandatory={1}
                              maxlength={10}
                              tabIndex={52}
                              onChange={(text) => {
                                setFieldValue("yearSemSubject", text);
                                handleUnSavedChanges(1);
                                setSkipQualification(false);
                              }}
                            />

                            <TextFieldFormik
                              id="maxMark"
                              label="Maximum Mark"
                              placeholder="Mark"
                              style={{ width: "20%" }}
                              value={values.maxMark > 0 ? values.maxMark : ""}
                              onChange={(e) => {
                                if (
                                  preFunction.amountValidation(e.target.value)
                                )
                                  setFieldValue("maxMark", e.target.value);
                                handleUnSavedChanges(1);
                                setSkipQualification(false);
                              }}
                              mandatory={1}
                              maxlength={4}
                              tabIndex={53}
                            />

                            <TextFieldFormik
                              id="markObtained"
                              label="Mark Obtained"
                              placeholder="Mark"
                              style={{ width: "20%" }}
                              value={
                                values.markObtained > 0
                                  ? values.markObtained
                                  : ""
                              }
                              onChange={(e) => {
                                if (!isNaN(e.target.value))
                                  setFieldValue("markObtained", e.target.value);
                                handleUnSavedChanges(1);
                                setSkipQualification(false);
                              }}
                              mandatory={1}
                              maxlength={4}
                              tabIndex={54}
                            />

                            <DateFieldFormik
                              type="month"
                              label="Year of Passing"
                              id="monthYear"
                              style={{ width: "50%" }}
                              minDate={moment().subtract(50, "years")}
                              maxDate={moment()}
                              mandatory={1}
                              onChange={(e) => {
                                setFieldValue("monthYear", e.target.value);
                                handleUnSavedChanges(1);
                                setSkipQualification(false);
                              }}
                              tabIndex={55}
                            />
                          </div>
                          <div className="p-3 text-center">
                            <Button
                              frmButton={false}
                              type="submit"
                              tabIndex={56}
                              text={"Add Qualification"}
                              onClick={() =>
                                preFunction.handleErrorFocus(errors)
                              }
                            />
                            &nbsp;&nbsp;
                            {qualificationArr.length == 0 &&
                              newQualificationArr.length == 0 &&
                              !skipQualification && (
                                <Button
                                  frmButton={false}
                                  type="button"
                                  tabIndex={66}
                                  text="Skip"
                                  onClick={() => {
                                    qualificationRef.current?.resetForm();
                                    handleUnSavedChanges(0);
                                    setSkipQualification(true);
                                    if (status) {
                                      navigate("/view-student", {
                                        state: { id: studentId },
                                      });
                                      return;
                                    }
                                  }}
                                />
                              )}
                          </div>
                          {qualificationArr.length > 0 ||
                          newQualificationArr.length > 0 ? (
                            <>
                              <div className="row no-gutters">
                                <div className="subhead-row">
                                  <div className="subhead">Qualification</div>
                                  <div className="col line-div"></div>
                                </div>
                              </div>
                              <div className="table-responsive">
                                <table className="table table-bordered ">
                                  <thead>
                                    <tr>
                                      <th>No.</th>
                                      <th>Qualified Exam</th>
                                      <th>School/College Name</th>
                                      <th>Board/University</th>
                                      <th>Year/Sem/Subject</th>
                                      <th>Maximum Mark</th>
                                      <th>Mark Obtained</th>
                                      <th>% of Marks</th>
                                      <th>Month/Year of Passing</th>
                                      <th>Delete</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {qualificationArr.map((item, index) => {
                                      return (
                                        <tr>
                                          <td>{index + 1}</td>
                                          <td>{item.qualifiedExam}</td>
                                          <td>{item.schoolCollegeName}</td>
                                          <td>{item.boardUniversity}</td>
                                          <td>{item.yearSemSubject}</td>
                                          <td>{item.maximumMark}</td>
                                          <td>{item.markObtained}</td>
                                          <td>{item.markPercentage}</td>
                                          <td>{item.monthYear}</td>
                                          <td align="center">
                                            {!item.icon ? (
                                              ""
                                            ) : (
                                              <img
                                                src={deleteIcon}
                                                className="delete-icon"
                                                onClick={(e) =>
                                                  handleDeleteQualification(
                                                    item
                                                  )
                                                }
                                              />
                                            )}
                                          </td>
                                        </tr>
                                      );
                                    })}
                                    {newQualificationArr.map((item, index) => {
                                      return (
                                        <tr>
                                          <td>{index + 1}</td>
                                          <td>{item.qualifiedExam}</td>
                                          <td>{item.schoolCollegeName}</td>
                                          <td>{item.boardUniversity}</td>
                                          <td>{item.yearSemSubject}</td>
                                          <td>{item.maximumMark}</td>
                                          <td>{item.markObtained}</td>
                                          <td>{item.markPercentage}</td>
                                          <td>{item.monthYear}</td>
                                          <td align="center">
                                            {!item.icon ? (
                                              ""
                                            ) : (
                                              <img
                                                src={deleteIcon}
                                                className="delete-icon"
                                                onClick={(e) =>
                                                  handleDeleteQualification(
                                                    item
                                                  )
                                                }
                                              />
                                            )}
                                          </td>
                                        </tr>
                                      );
                                    })}
                                  </tbody>
                                </table>
                              </div>
                              {newQualificationArr.length > 0 && (
                                <Button
                                  type="button"
                                  text="Save Qualification Detail"
                                  onClick={handleSaveQualification}
                                />
                              )}
                            </>
                          ) : null}
                          {skipQualification && (
                            <div className="row no-gutters">
                              {status ? (
                                <Button
                                  onClick={(e) => {
                                    handleUnSavedChanges(0);
                                    toast.success(
                                      "Student details saved successfully"
                                    );
                                    handleClearAllForms();
                                    navigate("/view-student", {
                                      state: { id: studentId },
                                    });
                                  }}
                                  type="button"
                                  text="F4 - Save"
                                  id="save"
                                />
                              ) : (
                                <div className="text-center mt-3">
                                  <Button
                                    frmButton={false}
                                    isTable={true}
                                    onClick={(e) => {
                                      handleUnSavedChanges(0);
                                      toast.success(
                                        "Student details saved successfully"
                                      );
                                      handleClearAllForms();
                                    }}
                                    type="button"
                                    text="F4 - Save As Draft"
                                    id="saveDraft"
                                  />
                                  &nbsp;&nbsp;
                                  <Button
                                    frmButton={false}
                                    isTable={true}
                                    className={"btn-green"}
                                    onClick={(e) => handleConfirmSubmission()}
                                    type="button"
                                    text="Confirm Admission"
                                  />
                                </div>
                              )}
                            </div>
                          )}
                        </form>
                      );
                    }}
                  </Formik>
                </div>
              </Tab>
            </Tabs>
          </div>
        </div>
      </div>
      <>
        <Modal
          className="modalwidth"
          show={openModel}
          onEscapeKeyDown={() => setOpenModal(false)}
        >
          <Modal.Body>
            <div>
              {src && (
                <div>
                  <ReactCrop
                    src={src}
                    onImageLoaded={setImage}
                    crop={crop}
                    onChange={setCrop}
                    minHeight={50}
                    minWidth={50}
                    // maxHeight={300}
                    // maxWidth={300}
                    keepSelection={true}
                    onComplete={(crop, pixel) => {
                      console.log(crop, pixel);
                    }}
                  />
                  <br />
                </div>
              )}
            </div>
            <ErrorMessage error={"Click on image to crop"} visible={CropOpen} />
          </Modal.Body>
          <Modal.Footer>
            <Button
              frmButton={false}
              onClick={cropImageNow}
              title="Crop"
              text="Crop"
            />
            <Button
              frmButton={false}
              onClick={() => setOpenModal(false)}
              text="Close"
            />
          </Modal.Footer>
        </Modal>

        <Modal
          show={confirmOpen}
          dialogClassName="my-modal"
          onEscapeKeyDown={() => {
            setConfirmOpen(false);
            handleClearAllForms();
          }}
        >
          <Modal.Header>
            <Modal.Title>Student No.</Modal.Title>
          </Modal.Header>

          <Modal.Body>
            <div className="row no-gutters">
              <div
                style={{
                  padding: "5px",
                }}
              >
                Admission Confirmed Successfully. <br />
                Student No. : {enrollNumber}
              </div>
            </div>
          </Modal.Body>

          <Modal.Footer>
            <Button
              autoFocus
              isTable={true}
              text={"Close"}
              onClick={() => {
                setConfirmOpen(false);
                handleClearAllForms();
              }}
            />
          </Modal.Footer>
        </Modal>

        <Modal
          show={openLeavePageModel}
          dialogClassName="my-modal"
          onEscapeKeyDown={(e) => setOpenLeavePageModel(false)}
        >
          <Modal.Header>
            <Modal.Title>Leave Page?</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <div className="">
              Changes you made may not be saved. Are you sure you want to change
              the tab?
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button
              text="Yes"
              frmButton={false}
              onClick={() => {
                setOpenLeavePageModel(false);
                handleUnSavedChanges(0);
                handleTabChange(tabKey, false);
                // to get the eventKey of the tab
              }}
            />
            &nbsp;&nbsp;
            <Button
              autoFocus
              text="No"
              frmButton={false}
              onClick={() => {
                setOpenLeavePageModel(false);
              }}
            />
          </Modal.Footer>
        </Modal>

        <Modal
          show={openConfirmEmailModel}
          dialogClassName="my-modal"
          onEscapeKeyDown={(e) => setOpenConfirmEmailModel(false)}
        >
          <Modal.Header>
            <Modal.Title>Confirm Message</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <div className="">
              The student has enrolled in an LMS course with an existing email
              ID.
              <br />
              Do you want to change the student's email ID?
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button
              text="Yes"
              frmButton={false}
              onClick={() => {
                setOpenConfirmEmailModel(false);
                handleSavePersonal(formikRef?.current?.values, 1);
                handleUnSavedChanges(0);
              }}
            />
            &nbsp;&nbsp;
            <Button
              autoFocus
              text="No"
              frmButton={false}
              onClick={() => {
                setOpenConfirmEmailModel(false);
              }}
            />
          </Modal.Footer>
        </Modal>
      </>
    </div>
  );
}

export default Student;
