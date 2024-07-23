import React, { useEffect, useState, useRef, useContext } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Modal, Tab, Tabs } from "react-bootstrap";
import { Formik } from "formik";
import ReactCrop from "react-image-crop";
import moment from "moment";
import * as Yup from "yup";
import { toast } from "react-toastify";
import "react-image-crop/dist/ReactCrop.css";
import { useSelector } from "react-redux";

import StudentApi from "../api/StudentApi";

import preFunction from "../component/common/CommonFunction";
import CustomActivityIndicator from "../component/common/CustomActivityIndicator";
import ErrorMessage from "../component/common/ErrorMessage";
import { mediumList } from "../component/common/CommonArray";
import TextFieldFormik from "../component/FormField/TextFieldFormik";
import SelectFieldFormik from "../component/FormField/SelectFieldFormik";
import DateFieldFormik from "../component/FormField/DateFieldFormik";
import SwitchField from "../component/FormField/SwitchField";
import Button from "../component/FormField/Button";

import string from "../string";

import photo from "../assests/png/camera.png";
import blankProfile from "../assests/png/blank-profile-picture.png";
import deleteIcon from "../assests/svg/delete-icon.svg";
import ScreenTitle from "../component/common/ScreenTitle";
import ModalComponent from "../component/ModalComponent";
import AuthContext from "../auth/context";
import DisplayText from "../component/FormField/DisplayText";

let otherCity = false;
let tempOtherCity = false;

function EditStudent() {
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
  const [batchID, setBatchID] = useState();

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
  const [openLeavePageModel, setOpenLeavePageModel] = useState(false);
  const [tabKey, setTabKey] = useState("1");

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
    "Please enter valid Mobile Number",
    function (value) {
      if (value && value.trim() !== "") {
        return Yup.number()
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
          .isValidSync(value);
      }
      return true;
    }
  );

  const mobileValidation = Yup.number()
    .test("is-ten-digits", "Mobile number must be exactly 10 digits", (value) =>
      /^[0-9]{10}$/.test(String(value))
    )
    .test(
      "is-valid-starting-digit",
      "Mobile number must start with 6, 7, 8, or 9",
      (value) => /^[6-9][0-9]{9}$/.test(String(value))
    )
    .required("Please enter Mobile Number");

  const PersonalSchema = Yup.object().shape({
    pan: Yup.string().test(
      "is-valid-pan",
      "Enter Valid PAN Number",
      (value) => {
        if (value && value.trim() !== "") {
          return /[A-Z]{5}[0-9]{4}[A-Z]{1}/.test(String(value));
        }
        return true;
      }
    ),

    nationality: Yup.object().required("Please select Nationality"),
    religion: Yup.object().required("Please select Religion"),
    community: Yup.object().required("Please select Community"),
  });

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

  const OtherDetailsSchema = Yup.object().shape({
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

  const handleClearAllForms = () => {
    navigate("/view-student", {
      state: { enrollNumber: location?.state?.enrollNumber },
    });
    return;
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
  };

  const setFieldValueFromOutside = async (values) => {
    console.log("values----", values);
    if (formikRef.current) {
      setBatchID(values.batchID);
      formikRef.current.setFieldValue("studentName", values.name);
      formikRef.current.setFieldValue("fatherName", values.fatherName);
      if (values.DOB) {
        formikRef.current.setFieldValue("dateofBirth", new Date(values.DOB));
      }
      formikRef.current.setFieldValue("gender", {
        id: values.genderID,
        gender: values.gender,
      });
      formikRef.current.setFieldValue("studentMobile", values.studentMobile);
      formikRef.current.setFieldValue("studentEmail", values.email);
      if (values.bloodGroup) {
        formikRef.current.setFieldValue("bloodGroup", {
          id: values.bloodGroupID,
          bloodGroup: values.bloodGroup,
        });
      }
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
      console.log("course--", course);
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
        handleCityByState({
          state: dbValues.state,
          id: dbValues.stateID,
        });
        otherCity = false;
      } else {
        addressRef.current.setFieldValue("otherCity", dbValues.city);
        otherCity = true;
      }
      dbValues.stateID &&
        addressRef.current.setFieldValue("state", {
          id: dbValues.stateID,
          state: dbValues.state,
        });

      console.log("nationalityList====", nationalityList, dbValues);
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
        handleTempCityByState({
          state: dbValues.tstate,
          id: dbValues.tstateID,
        });
        tempOtherCity = false;
      } else {
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
    } catch (error) {
      console.log("error", error);
    }
  };

  const handleSavePersonal = async (values) => {
    if (load) return;
    console.log("values----", loginID, values);
    console.log("displayimage----", displayImage);

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

      const personalRes = await StudentApi.addStudentPersonal(
        studentId ?? null,
        values.studentName.replace(/\s\s+/g, " ").trim(),
        values.fatherName.replace(/\s\s+/g, " ").trim(),
        values.studentEmail,
        imageUrl ?? null,
        values.studentEmail,
        moment(values.dateofBirth).format("YYYY-MM-DD"),
        values.gender.id,
        values.gender.gender,
        values.studentMobile,
        values.bloodGroup ? values.bloodGroup.id : null,
        values.bloodGroup ? values.bloodGroup.bloodGroup : null,
        values.community.id,
        values.community.community,
        values.religion.id,
        values.religion.religion,
        values.nationality.id,
        values.nationality.nationality,
        values.counselRefNumber
          ? values.counselRefNumber.replace(/\s\s+/g, " ").trim()
          : null,
        values.isTransport ? 1 : 0,
        values.isHostel ? 1 : 0,
        values.aadhaar,
        values.pan ?? null,
        values.applicationNumber
          ? values.applicationNumber.replace(/\s\s+/g, " ").trim()
          : null,
        values.registrationNumber
          ? values.registrationNumber.replace(/\s\s+/g, " ").trim()
          : null,
        values.admissionTypeID ? values.admissionTypeID : null,
        values.courseID ? values.courseID : null,
        batchID,
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
      handleUnSavedChanges(0);
      handleTabChange("2");
      setLoad(false);
    } catch (error) {
      setLoad(false);
      console.log("catch---", error);
    }
  };

  const handleSaveAcademic = async (values) => {
    handleTabChange("3");
  };

  const handleSaveCommunication = async (values) => {
    if (load) return;

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
      markPercentage: (values.markObtained / values.maxMark) * 100, //values.markPercentage,
      monthYear: moment(values.monthYear).format("MMM-yyyy"),
      icon: true,
    };
    console.log("obj", obj);

    markList.push(obj);
    setNewQualificationArr(markList);
    qualificationRef.current.setFieldValue("yearSemSubject", "");
    qualificationRef.current.setFieldValue("maxMark", "");
    qualificationRef.current.setFieldValue("markObtained", "");
    qualificationRef.current.setFieldValue("markPercentage", "");
    qualificationRef.current.setFieldValue("monthYear", "");
  };

  const handleDeleteQualification = async (item) => {
    console.log("item", item);
    const deleteArr = qualificationArr.filter((m) => m !== item);
    setQualificationArr(deleteArr);
    const deleteNewArr = newQualificationArr.filter((m) => m !== item);
    setNewQualificationArr(deleteNewArr);
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
      setLoad(false);
      setNewQualificationArr([]);
      handleUnSavedChanges(0);
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

  const handleTabChange = async (key, leavepage = true) => {
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
    const masterRes = await StudentApi.getMaster(parseInt(key));
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
      document.getElementById("course")?.focus();
    } else if (key == "3") {
      document.getElementById("fatherEmail")?.focus();
      setCityList(masterRes.data.message.data.city_data);
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
    } else if (key == "4") {
      document.getElementById("qualifiedExam")?.focus();
      setQualifiedExamList(masterRes.data.message.data.qualified_exam_data);
    }
    if (studentId) {
      const studentRes = await StudentApi.editStudent(
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
      if (key == "2") {
        document.getElementById("course")?.focus();
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
      } else if (key == "3") {
        document.getElementById("fatherEmail")?.focus();
        setAddressValueOutside(studentRes.data.message.data[0]);
      } else {
        document.getElementById("qualifiedExam")?.focus();
        setQualificationArr(studentRes.data.message.data);
      }
    }
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

  useEffect(() => {
    console.log("location?.state?.id", location?.state);
    if (!location?.state?.enrollNumber?.id) {
      navigate("/student-list");
      return;
    }
    console.log("location?.state?.id--", location?.state?.enrollNumber?.id);
    setStudentId(location?.state?.enrollNumber?.id);
    getStudent(location?.state?.enrollNumber?.id);

    getList();
  }, []);

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
        <div className="col-lg-2">
          <div>
            <Button
              isTable={true}
              text={"Back"}
              frmButton={false}
              className="btn-3"
              onClick={() => {
                if (unSavedChanges) {
                  setOpenLeavePageModel(true);
                  return;
                } else {
                  navigate("/view-student", {
                    state: { enrollNumber: location?.state?.enrollNumber },
                  });
                }
              }}
            />
            {/*  */}
          </div>
        </div>
        <div className="row no-gutters mt-3">
          <div className="col-lg-12">
            <Tabs
              activeKey={defaultActiveKey}
              id="uncontrolled-tab-example"
              fill
              onSelect={handleTabChange}
            >
              <Tab eventKey="1" title="General">
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
                  onSubmit={handleSavePersonal}
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
                        <div className="row no-gutters p-3">
                          <div className="subhead-row">
                            <div className="subhead">Student Detail </div>
                            <div className="col line-div"></div>
                          </div>
                          <div className="row no-gutters">
                            <div className="col-lg-9 pe-2">
                              <DisplayText
                                label="Student No."
                                labelSize={4}
                                value={location?.state?.enrollNumber?.enrollNo}
                              />
                              <DisplayText
                                label="Student Name"
                                labelSize={4}
                                value={values.studentName}
                              />
                              <DisplayText
                                label="Father Name"
                                labelSize={4}
                                value={values.fatherName}
                              />
                              <DisplayText
                                label="Date of Birth"
                                labelSize={4}
                                value={moment(values.dateofBirth).format(
                                  "DD-MM-yyyy"
                                )}
                              />
                              <DisplayText
                                label="Gender"
                                labelSize={4}
                                value={values.gender.gender}
                              />
                              <DisplayText
                                label="Student Mobile Number"
                                labelSize={4}
                                value={values.studentMobile}
                              />
                              <DisplayText
                                label="Student Email ID"
                                labelSize={4}
                                value={values.studentEmail}
                              />
                              <DisplayText
                                label="Blood Group"
                                labelSize={4}
                                value={values?.bloodGroup?.bloodGroup}
                              />
                              <DisplayText
                                label="Aadhaar Number"
                                labelSize={4}
                                value={values.aadhaar}
                              />
                              <TextFieldFormik
                                autoFocus
                                tabIndex={9}
                                labelSize={4}
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
                                tabIndex={10}
                                labelSize={4}
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
                                tabIndex={11}
                                labelSize={4}
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
                                tabIndex={12}
                                labelSize={4}
                                label="Community"
                                id="community"
                                mandatory={1}
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
                              {/* <SwitchField
                                label="Hostel Required"
                                labelSize={4}
                                tabIndex={13}
                                yesOption={"Yes"}
                                noOption={"No"}
                                checked={values.isHostel}
                                value={values.isHostel}
                                onChange={(e) => {
                                  setFieldValue("isHostel", !values.isHostel);
                                }}
                              /> */}
                              {/* <SwitchField
                                label="Transport Required"
                                yesOption={"Yes"}
                                labelSize={4}
                                tabIndex={14}
                                noOption={"No"}
                                checked={values.isTransport}
                                onChange={(e) => {
                                  setFieldValue(
                                    "isTransport",
                                    !values.isTransport
                                  );
                                }}
                              /> */}
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
                              <DisplayText
                                label="Application Number"
                                labelSize={4}
                                value={values.applicationNumber}
                              />
                              <DisplayText
                                label="Counselling Reference No."
                                labelSize={4}
                                value={values.counselRefNumber}
                              />
                            </div>
                          </div>

                          <Button
                            text="F4 - Next"
                            tabIndex={17}
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
              <Tab eventKey="2" title="Academic">
                <Formik
                  innerRef={academicRef}
                  enableReinitialize={true}
                  initialValues={{
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
                  }) => {
                    return (
                      <form onSubmit={handleSubmit} autoComplete="off">
                        <div className="row no-gutters p-3">
                          <div className="row no-gutters mt-1">
                            <DisplayText
                              labelSize={3}
                              label="College"
                              value={values?.college?.collegeName}
                            />
                            <DisplayText
                              labelSize={3}
                              label={RENAME?.course}
                              value={values?.course?.courseName}
                            />

                            <DisplayText
                              labelSize={3}
                              label="Medium"
                              value={values?.mediumofStudy.label}
                            />

                            <DisplayText
                              labelSize={3}
                              label="Mode of Admission"
                              value={values?.modeOfAdmission?.admissionMode}
                            />
                            {values?.modeOfAdmission &&
                            values?.admissionModeID?.id == 2 ? (
                              <DisplayText
                                labelSize={3}
                                label="Year"
                                value={values?.transferYear}
                              />
                            ) : null}
                            <DisplayText
                              labelSize={3}
                              label="Admission Type"
                              value={values.admissionType.admissionType}
                            />

                            <DisplayText
                              labelSize={3}
                              label="Scholorship Scheme"
                              value={values.scholarshipScheme.scholarshipScheme}
                            />
                            <DisplayText
                              labelSize={3}
                              label="First Graduate"
                              value={values.isFirstGraduation ? "Yes" : "No"}
                            />
                          </div>
                          <Button
                            tabIndex={
                              values.modeOfAdmission &&
                              values.modeOfAdmission.admissionMode == "Transfer"
                                ? 23
                                : 22
                            }
                            onClick={(e) =>
                              preFunction.handleErrorFocus(errors)
                            }
                            text="F4 - Next"
                          />
                        </div>
                      </form>
                    );
                  }}
                </Formik>
              </Tab>
              <Tab eventKey="3" title="Communication">
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
                  onSubmit={(values) => {
                    console.log(values);
                    handleSaveCommunication(values);
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
                                maxlength={45}
                                tabIndex={23}
                                id="fatherEmail"
                                label="Father Email ID"
                                labelSize={4}
                                onChange={(e) => {
                                  setFieldValue("fatherEmail", e.target.value);
                                  handleUnSavedChanges(1);
                                }}
                                style={{ width: "70%" }}
                              />
                              <TextFieldFormik
                                id="fatherMobile"
                                mandatory={values.isGuardian ? 0 : 1}
                                label="Father Mobile Number"
                                labelSize={4}
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
                                tabIndex={24}
                                style={{ width: "40%" }}
                              />
                              <TextFieldFormik
                                id="motherName"
                                label="Mother Name"
                                labelSize={4}
                                maxlength={45}
                                mandatory={1}
                                tabIndex={25}
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
                                maxlength={45}
                                tabIndex={26}
                                label="Mother Email ID"
                                labelSize={4}
                                onChange={(e) => {
                                  setFieldValue("motherEmail", e.target.value);
                                  handleUnSavedChanges(1);
                                }}
                                style={{ width: "70%" }}
                              />
                              <TextFieldFormik
                                id="motherMobile"
                                placeholder="Mobile"
                                label="Mother Mobile Number"
                                labelSize={4}
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
                                tabIndex={27}
                                style={{ width: "40%" }}
                              />
                              <SwitchField
                                label="Add Guardian Detail"
                                labelSize={4}
                                yesOption={"Yes"}
                                noOption={"No"}
                                checked={values.isGuardian}
                                value={values.isGuardian}
                                tabIndex={28}
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
                                    tabIndex={values.isGuardian ? 29 : ""}
                                    label="Guardian Name"
                                    labelSize={4}
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
                                    maxlength={45}
                                    tabIndex={values.isGuardian ? 30 : ""}
                                    label="Guardian Email ID"
                                    labelSize={4}
                                    onChange={(e) => {
                                      setFieldValue(
                                        "guardianEmail",
                                        e.target.value
                                      );
                                      handleUnSavedChanges(1);
                                    }}
                                    style={{ width: "70%" }}
                                  />
                                  <TextFieldFormik
                                    id="guardianMobile"
                                    placeholder="Mobile"
                                    mandatory={1}
                                    tabIndex={values.isGuardian ? 31 : ""}
                                    label="Guardian Mobile Number"
                                    labelSize={4}
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
                                        handleUnSavedChanges(1);
                                      }
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
                                labelSize={4}
                                maxlength={45}
                                tabIndex={values.isGuardian ? 32 : 29}
                                onChange={(e) => {
                                  setFieldValue(
                                    "addressline1",
                                    preFunction.capitalizeFirst(e.target.value)
                                  );
                                  handleUnSavedChanges(1);
                                }}
                                mandatory={1}
                              />

                              <TextFieldFormik
                                id="addressline2"
                                label="Address Line 2"
                                labelSize={4}
                                maxlength={45}
                                tabIndex={values.isGuardian ? 33 : 30}
                                onChange={(e) => {
                                  setFieldValue(
                                    "addressline2",
                                    preFunction.capitalizeFirst(e.target.value)
                                  );
                                  handleUnSavedChanges(1);
                                }}
                              />

                              <TextFieldFormik
                                label="Place"
                                labelSize={4}
                                id="place"
                                maxlength={45}
                                mandatory={1}
                                tabIndex={values.isGuardian ? 34 : 31}
                                onChange={(e) => {
                                  setFieldValue(
                                    "place",
                                    preFunction.capitalizeFirst(e.target.value)
                                  );
                                  handleUnSavedChanges(1);
                                }}
                              />
                              <SelectFieldFormik
                                label="State"
                                labelSize={4}
                                id="state"
                                options={stateList}
                                matchFrom="start"
                                clear={false}
                                getOptionLabel={(option) => option.state}
                                getOptionValue={(option) => option.id}
                                mandatory={1}
                                maxlength={25}
                                tabIndex={values.isGuardian ? 35 : 32}
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
                                    labelSize={4}
                                    onChange={handleChange}
                                    maxlength={40}
                                    tabIndex={
                                      !otherCity
                                        ? ""
                                        : values.isGuardian
                                        ? 36
                                        : 33
                                    }
                                    mandatory={1}
                                  />
                                </>
                              ) : (
                                <>
                                  <SelectFieldFormik
                                    label="City/District"
                                    matchFrom="start"
                                    labelSize={4}
                                    id="city"
                                    options={cityList}
                                    tabIndex={
                                      otherCity
                                        ? ""
                                        : values.isGuardian
                                        ? 36
                                        : 33
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
                                labelSize={4}
                                value={values.pinCode > 0 ? values.pinCode : ""}
                                onChange={(e) => {
                                  if (!isNaN(e.target.value))
                                    setFieldValue("pinCode", e.target.value);
                                  handleUnSavedChanges(1);
                                }}
                                style={{ width: "30%" }}
                                maxlength={6}
                                mandatory={1}
                                tabIndex={values.isGuardian ? 37 : 34}
                              />

                              <SelectFieldFormik
                                label="Country"
                                matchFrom="start"
                                labelSize={4}
                                id="country"
                                clear={false}
                                options={countryList}
                                getOptionLabel={(option) => option.country}
                                getOptionValue={(option) => option.id}
                                mandatory={1}
                                tabIndex={values.isGuardian ? 38 : 35}
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
                                tabIndex={values.isGuardian ? 39 : 36}
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
                                labelSize={4}
                                maxlength={45}
                                tabIndex={values.isGuardian ? 40 : 37}
                                onChange={(e) => {
                                  setFieldValue(
                                    "tempAddressline1",
                                    preFunction.capitalizeFirst(e.target.value)
                                  );
                                  handleUnSavedChanges(1);
                                }}
                                mandatory={1}
                              />

                              <TextFieldFormik
                                id="tempAddressline2"
                                maxlength={45}
                                tabIndex={values.isGuardian ? 41 : 38}
                                label="Address Line 2"
                                labelSize={4}
                                onChange={(e) => {
                                  setFieldValue(
                                    "tempAddressline2",
                                    preFunction.capitalizeFirst(e.target.value)
                                  );
                                  handleUnSavedChanges(1);
                                }}
                              />

                              <TextFieldFormik
                                label="Place"
                                labelSize={4}
                                maxlength={45}
                                id="tempPlace"
                                mandatory={1}
                                tabIndex={values.isGuardian ? 42 : 39}
                                onChange={(e) => {
                                  setFieldValue(
                                    "tempPlace",
                                    preFunction.capitalizeFirst(e.target.value)
                                  );
                                  handleUnSavedChanges(1);
                                }}
                              />
                              <SelectFieldFormik
                                label="State"
                                labelSize={4}
                                id="tempState"
                                matchFrom="start"
                                options={stateList}
                                clear={false}
                                getOptionLabel={(option) => option.state}
                                getOptionValue={(option) => option.id}
                                mandatory={1}
                                maxlength={25}
                                tabIndex={values.isGuardian ? 43 : 40}
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
                                    labelSize={4}
                                    onChange={handleChange}
                                    maxlength={40}
                                    mandatory={1}
                                    tabIndex={
                                      !tempOtherCity
                                        ? ""
                                        : values.isGuardian
                                        ? 44
                                        : 41
                                    }
                                  />
                                </>
                              ) : (
                                <>
                                  <SelectFieldFormik
                                    label="City/District"
                                    labelSize={4}
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
                                        ? 44
                                        : 41
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
                                labelSize={4}
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
                                tabIndex={values.isGuardian ? 45 : 42}
                              />

                              <SelectFieldFormik
                                label="Country"
                                labelSize={4}
                                id="tempCountry"
                                matchFrom="start"
                                options={countryList}
                                clear={false}
                                getOptionLabel={(option) => option.country}
                                getOptionValue={(option) => option.id}
                                mandatory={1}
                                maxlength={15}
                                tabIndex={values.isGuardian ? 46 : 43}
                                onChange={(text) => {
                                  setFieldValue("tempCountry", text);
                                  handleUnSavedChanges(1);
                                }}
                              />
                            </div>
                          </div>

                          <Button
                            tabIndex={values.isGuardian ? 47 : 44}
                            onClick={(e) =>
                              preFunction.handleErrorFocus(errors)
                            }
                            text="F4 - Next"
                          />
                        </div>
                      </form>
                    );
                  }}
                </Formik>
              </Tab>
              <Tab eventKey="4" title="Qualification">
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
                              tabIndex={48}
                              onChange={(text) => {
                                setFieldValue("qualifiedExam", text);
                                setFieldValue("yearSemSubject", "");
                                getYearSemList(text?.qualifiedExamID);
                                handleUnSavedChanges(1);
                              }}
                            />

                            <TextFieldFormik
                              id="institution"
                              label="School/College Name"
                              mandatory={1}
                              tabIndex={49}
                              onChange={(e) => {
                                setFieldValue(
                                  "institution",
                                  preFunction.capitalizeFirst(e.target.value)
                                );
                                handleUnSavedChanges(1);
                              }}
                            />

                            <TextFieldFormik
                              id="boardUniversity"
                              label="Board/University"
                              mandatory={1}
                              tabIndex={50}
                              onChange={(e) => {
                                setFieldValue(
                                  "boardUniversity",
                                  preFunction.capitalizeFirst(e.target.value)
                                );
                                handleUnSavedChanges(1);
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
                              tabIndex={51}
                              onChange={(text) => {
                                setFieldValue("yearSemSubject", text);
                                handleUnSavedChanges(1);
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
                              }}
                              mandatory={1}
                              maxlength={4}
                              tabIndex={52}
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
                              }}
                              mandatory={1}
                              maxlength={4}
                              tabIndex={53}
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
                              }}
                              tabIndex={54}
                            />
                          </div>
                          <Button
                            type="submit"
                            tabIndex={55}
                            text={"Add Qualification"}
                            onClick={() => preFunction.handleErrorFocus(errors)}
                          />

                          {qualificationArr.length > 0 ||
                          newQualificationArr.length > 0 ? (
                            <>
                              <div className="row no-gutters">
                                <div className="subhead-row">
                                  <div className="subhead">Qualification</div>
                                  <div className="col line-div"></div>
                                </div>
                              </div>
                              <div className="row no-gutters mb-5">
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
                                      {newQualificationArr.map(
                                        (item, index) => {
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
                                        }
                                      )}
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
                              </div>
                              {qualificationArr.length > 0 && (
                                <Button
                                  onClick={(e) => {
                                    handleUnSavedChanges(0);
                                    toast.success(
                                      "Student details saved successfully"
                                    );
                                    handleClearAllForms();
                                  }}
                                  type="button"
                                  text="F4 - Save"
                                  id="save"
                                />
                              )}
                            </>
                          ) : null}
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
      </>
    </div>
  );
}

export default EditStudent;
