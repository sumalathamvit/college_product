import React, { useEffect, useState, useRef, useContext } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Modal, Tab, Tabs } from "react-bootstrap";
import { Formik } from "formik";
import ReactCrop from "react-image-crop";
import moment from "moment";
import * as Yup from "yup";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import $ from "jquery";

import StudentApi from "../../api/StudentApi";

import preFunction from "../../component/common/CommonFunction";
import CustomActivityIndicator from "../../component/common/CustomActivityIndicator";
import ErrorMessage from "../../component/common/ErrorMessage";
import TextFieldFormik from "../../component/FormField/TextFieldFormik";
import SelectFieldFormik from "../../component/FormField/SelectFieldFormik";
import DateFieldFormik from "../../component/FormField/DateFieldFormik";
import SwitchField from "../../component/FormField/SwitchField";
import Button from "../../component/FormField/Button";
import ScreenTitle from "../../component/common/ScreenTitle";
import ModalComponent from "../../component/ModalComponent";
import DisplayText from "../../component/FormField/DisplayText";
import {
  applicantStatusList,
  qualificationList,
  motherTongueList,
} from "../../component/common/CommonArray";

import photo from "../../assests/png/camera.png";
import blankProfile from "../../assests/png/blank-profile-picture.png";

import AuthContext from "../../auth/context";
import storage from "../../auth/storage";

import string from "../../string";

import "react-image-crop/dist/ReactCrop.css";

let otherCity = false;

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

const AddressSchema = Yup.object().shape({
  fatherMobile: Yup.number().when("isGuardian", (isGuardian, schema) => {
    if (!isGuardian[0]) {
      return mobileValidation;
    }
    return schema;
  }),
  fatherOccupation: Yup.string()
    .min(3, "Must be at least 3 characters long")
    .matches(/^[A-Za-z@. ]+$/, "Please enter valid Father Occupation")
    .required("Please enter Father Occupation")
    .trim(),

  motherName: Yup.string()
    .min(3, "Must be at least 3 characters long")
    .matches(/^[A-Za-z@. ]+$/, "Please Enter valid Mother Name")
    .required("Please enter Mother Name")
    .trim(),
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
  guardianMobile: Yup.number().when("isGuardian", (isGuardian, schema) => {
    if (isGuardian[0]) {
      return mobileValidation;
    }
    return schema;
  }),
  addressline1: Yup.string()
    .min(3, "Must be at least 3 characters long")
    .required("Please enter Address line 1")
    .trim(),
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
});

const QualificationSchema = Yup.object().shape({
  applicantStatus: Yup.object().required("Please select Applicant Status"),
  qualification: Yup.object().required("Please select Qualification"),
  subject: Yup.string()
    .min(3, "Must be at least 3 characters long")
    .required("Please enter Subject")
    .trim(),
});

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

function AddInstituteStudent() {
  //#region const
  const navigate = useNavigate();
  const location = useLocation();
  const collegeConfig = useSelector((state) => state.web.college);

  const [token, setToken] = useState();

  const [load, setLoad] = useState(false);
  const [studentStatus, setStudentStatus] = useState(0);
  const [studentId, setStudentId] = useState();
  const [defaultActiveKey, setDefaultActiveKey] = useState("1");
  const [communicationId, setCommunicationID] = useState("");
  const [oldAddressArray, setOldAddressArray] = useState("");

  // Personal Data ----
  const [genderList, setGenderList] = useState([]);
  const [religionList, setReligionList] = useState([]);
  const [nationalityList, setNationalityList] = useState([]);
  const [courseList, setCourseList] = useState([]);
  const [bloodGroupList, setBloodGroupList] = useState([]);

  const [cityList, setCityList] = useState([]);
  const [stateList, setStateList] = useState([]);
  const [countryList, setCountryList] = useState([]);
  const [displayImage, setDisplayImage] = useState(blankProfile);

  const [showImg, setShowImg] = useState(false);
  const [photoMessage, setPhotoMessage] = useState("");
  const [onChangeImage, setonChangeImage] = useState(false);
  const [src, setSrc] = useState();
  const [fileType, setFileType] = useState();
  const [CropOpen, setCropOpen] = useState(false);
  const [openModel, setOpenModal] = useState(false);
  const [openLeavePageModel, setOpenLeavePageModel] = useState(false);
  const [tabKey, setTabKey] = useState("1");

  const [modalErrorOpen, setModalErrorOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [modalTitle, setModalTitle] = useState("");

  const [showConfirm, setShowConfirm] = useState("");

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [studentNumber, setStudentNumber] = useState();
  const [confirmMessage, setConfirmMessage] = useState();
  const [saveDraftMessage, setSaveDraftMessage] = useState();

  const [crop, setCrop] = useState({
    unit: "px",
    width: 150,
    height: 150,
    minwidth: 150,
    minheight: 150,
    aspect: 1,
  });

  const [image, setImage] = useState();
  const formikRef = useRef();
  const addressRef = useRef();
  const qualificationRef = useRef();

  const { unSavedChanges, setUnSavedChanges, collegeId } =
    useContext(AuthContext);
  //#endregion

  const PersonalSchema = Yup.object().shape({
    studentMobile: mobileValidation,
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
    studentEmail: emailValidation,
    // aadhaar: Yup.number().test(
    //   "is-twelve-digits",
    //   "Aadhaar Number must be exactly 12 digits",
    //   (value) => /^[0-9]{12}$/.test(String(value))
    // )
    // .required("Please enter Aadhaar Number"),
    aadhaar: optionalAadhaarValidation,
    nationality: Yup.object().required("Please select Nationality"),
    religion: Yup.object().required("Please select Religion"),
    motherTongue: Yup.object().required("Please select Mother Tongue"),
    mode: token
      ? Yup.object().required("Please select Mode")
      : Yup.object().notRequired(),
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

  const handleConfirmSubmission = async () => {
    if (load) return;
    if (studentId) {
      const studentAddrRes = await StudentApi.trainingStudentEditDetail(
        studentId,
        2,
        collegeConfig.institution_type
      );
      console.log("studentAddrRes---", studentAddrRes);

      if (studentAddrRes.data.message.data.length == 0) {
        setModalMessage("Please add your Communication Details");
        setModalErrorOpen(true);
        setModalTitle("Message");
        handleTabChange("2");
        document.getElementById("fatherEmail")?.focus();
        return;
      }
    }
    try {
      setLoad(true);
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
      setStudentNumber(studentConfirmAdmissionRes.data.message.data.enrollNo);
      setConfirmMessage(studentConfirmAdmissionRes.data.message.message);
      setConfirmOpen(true);
      handleUnSavedChanges(0);
      setLoad(false);
      return;
    } catch (error) {
      setLoad(false);
      console.log("Exception---", error);
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
    console.log("testing handleClear---");
    formikRef.current.resetForm();
    addressRef.current.resetForm();
    //clear location state
    location.state = null;
    console.log("saveDraftMessage---", saveDraftMessage);

    handleUnSavedChanges(0);
    setLoad(false);
    setStudentId();
    setDefaultActiveKey("1");
    setCommunicationID("");
    setOldAddressArray("");
    setDisplayImage(blankProfile);
    setShowImg(false);
    setPhotoMessage("");
    setonChangeImage(false);
    setSrc();
    setFileType();
    setCropOpen(false);
    setOpenModal(false);
    setStudentNumber("");
    setConfirmMessage("");
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
    setImage();
    setSaveDraftMessage();
    qualificationRef.current.resetForm();
    document.getElementById("studentName").focus();
    handleTabChange("1");
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

  const handleSavePersonal = async (values) => {
    if (load) return;
    console.log("values----", values);

    setUnSavedChanges(false);
    try {
      setLoad(true);
      let imageUrl = displayImage.includes(string.FILEURL)
        ? displayImage.replace(string.FILEURL, "")
        : null;
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
        console.log("fileName---", displayImage.split(",")[0], fileType);

        setonChangeImage(false);
        setDisplayImage(string.FILEURL + response.data.message.data.file_url);
      }
      console.log("imageUrl-----", imageUrl);

      const addIntituteStudentRes = await StudentApi.addIntituteStudent(
        studentId ?? null,
        values.studentName.replace(/\s\s+/g, " ").trim(),
        values.studentMobile,
        values.fatherName.replace(/\s\s+/g, " ").trim(),
        moment(values.dateofBirth).format("YYYY-MM-DD"),
        values.gender.id,
        values.gender.gender,
        values.religion.id,
        values.religion.religion,
        values.nationality.id,
        values.nationality.nationality,
        values.aadhaar != "" ? values.aadhaar : null,
        values.motherTongue.value,
        values.studentEmail != "" ? values.studentEmail : null,
        imageUrl ?? null,
        values.bloodGroup ? values.bloodGroup.id : null,
        values.bloodGroup ? values.bloodGroup.bloodGroup : null,
        token ? values.mode.id : null
      );
      console.log("addIntituteStudentRes-----", addIntituteStudentRes);
      if (!addIntituteStudentRes.data.message.success) {
        setModalMessage(addIntituteStudentRes.data.message.message);
        setModalErrorOpen(true);
        setModalTitle("Message");
        setLoad(false);
        return;
      }
      handleUnSavedChanges(0);
      setStudentId(addIntituteStudentRes.data.message.data.studentID);
      setUnSavedChanges(false);
      handleTabChange("2", true);
      setLoad(false);
    } catch (error) {
      setLoad(false);
      console.log("catch---", error);
    }
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
        null,
        values.fatherOccupation != ""
          ? values.fatherOccupation.replace(/\s\s+/g, " ").trim()
          : null,
        values.fatherQualification != ""
          ? values.fatherQualification.replace(/\s\s+/g, " ").trim()
          : null,
        values.fatherIncome != "" ? values.fatherIncome : null,
        values.motherName.replace(/\s\s+/g, " ").trim(),
        null,
        null,
        values.motherQualification != ""
          ? values.motherQualification.replace(/\s\s+/g, " ").trim()
          : null,
        values.motherOccupation != ""
          ? values.motherOccupation.replace(/\s\s+/g, " ").trim()
          : null,
        values.motherIncome != "" ? values.motherIncome : null,
        values.guardianName != ""
          ? values.guardianName.replace(/\s\s+/g, " ").trim()
          : null,
        values.guardianMobile != "" ? values.guardianMobile : null,
        null,
        values.guardianQualification != ""
          ? values.guardianQualification.replace(/\s\s+/g, " ").trim()
          : null,
        values.guardianOccupation != ""
          ? values.guardianOccupation.replace(/\s\s+/g, " ").trim()
          : null,
        values.guardianIncome != "" ? values.guardianIncome : null,
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
        null,
        null
      );
      console.log("communicationRes---", communicationRes);
      if (!communicationRes.data.message.success) {
        setModalMessage(communicationRes.data.message.message);
        setModalErrorOpen(true);
        setModalTitle("Message");
        setLoad(false);
        return;
      }
      setSaveDraftMessage(communicationRes.data.message.message);
      setCommunicationID(communicationRes.data.message.id);
      handleUnSavedChanges(0);
      handleTabChange("3", true);
      setLoad(false);
    } catch (error) {
      setLoad(false);
      console.log("Exception---", error);
    }
  };

  const setFieldValueFromOutside = async (dbValues) => {
    console.log("values----", dbValues);
    setStudentNumber(dbValues.enrollNo);
    if (formikRef.current) {
      formikRef.current.setFieldValue("studentName", dbValues.name);
      formikRef.current.setFieldValue("fatherName", dbValues.fatherName);
      if (dbValues.DOB) {
        formikRef.current.setFieldValue("dateofBirth", new Date(dbValues.DOB));
      }
      formikRef.current.setFieldValue("gender", {
        id: dbValues.genderID,
        gender: dbValues.gender,
      });
      if (
        dbValues.email &&
        dbValues.email != dbValues.enrollNo + "@gmail.com"
      ) {
        formikRef.current.setFieldValue("studentEmail", dbValues.email);
      }
      if (dbValues.bloodGroup) {
        formikRef.current.setFieldValue("bloodGroup", {
          id: dbValues.bloodGroupID,
          bloodGroup: dbValues.bloodGroup,
        });
      }
      dbValues.aadhaar &&
        formikRef.current.setFieldValue("aadhaar", dbValues.aadhaar);
      formikRef.current.setFieldValue("nationality", {
        id: dbValues.nationalityID,
        nationality: dbValues.nationality,
      });
      formikRef.current.setFieldValue("religion", {
        id: dbValues.religionID,
        religion: dbValues.religion,
      });
      formikRef.current.setFieldValue("motherTongue", {
        label: dbValues.motherTongue,
        value: dbValues.motherTongue,
      });
      formikRef.current.setFieldValue("studentMobile", dbValues.studentMobile);

      if (dbValues.photo) {
        setDisplayImage(string.FILEURL + dbValues.photo);
      }
    }
  };

  const handleSaveQualification = async (values, confirm) => {
    if (load) return false;
    try {
      console.log("values---", values);
      let err = false;
      setLoad(true);
      console.log("values---", values, studentId);
      const saveQualificationRes = await StudentApi.addInstituteQualification(
        studentId,
        values.subject,
        values.applicantStatus.value,
        values.qualification.value
      );
      console.log("saveQualification", saveQualificationRes);
      if (!saveQualificationRes.data.message.success) {
        err = true;
        setModalMessage(saveQualificationRes.data.message.message);
        setModalErrorOpen(true);
        setModalTitle("Message");
        setLoad(false);
        return false;
      }
      handleUnSavedChanges(0);
      setLoad(false);
      if (token) {
        if (showConfirm && confirm === 0) {
          handleClearAllForms();
          toast.success("Student Updated Successfully");
        }
        if (studentStatus) {
          navigate("/view-student", {
            state: { id: studentId },
          });
          return;
        } else {
          setShowConfirm(true);
          return;
        }
      }
      navigate("/institute-confirmation");

      handleUnSavedChanges(0);
      setLoad(false);
    } catch (error) {
      setLoad(false);
      console.log("Exception---", error);
    }
  };

  const setAddressValueOutside = (dbValues) => {
    console.log("dbValues---", dbValues);
    setOldAddressArray(dbValues);
    if (dbValues && addressRef.current) {
      setCommunicationID(dbValues.id);
      dbValues.fatherEmail &&
        addressRef.current.setFieldValue("fatherEmail", dbValues.fatherEmail);
      dbValues.fatherMobile &&
        addressRef.current.setFieldValue("fatherMobile", dbValues.fatherMobile);
      dbValues.fatherOccupation &&
        addressRef.current.setFieldValue(
          "fatherOccupation",
          dbValues.fatherOccupation
        );
      dbValues.fatherQualification &&
        addressRef.current.setFieldValue(
          "fatherQualification",
          dbValues.fatherQualification
        );
      dbValues.fatherIncome &&
        addressRef.current.setFieldValue("fatherIncome", dbValues.fatherIncome);
      dbValues.motherName &&
        addressRef.current.setFieldValue("motherName", dbValues.motherName);
      dbValues.motherEmail &&
        addressRef.current.setFieldValue("motherEmail", dbValues.motherEmail);
      dbValues.motherMobile &&
        addressRef.current.setFieldValue("motherMobile", dbValues.motherMobile);
      dbValues.motherQualification &&
        addressRef.current.setFieldValue(
          "motherQualification",
          dbValues.motherQualification
        );
      dbValues.motherOccupation &&
        addressRef.current.setFieldValue(
          "motherOccupation",
          dbValues.motherOccupation
        );
      // dbValues.motherIncome &&
      addressRef.current.setFieldValue("motherIncome", dbValues.motherIncome);
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
      dbValues.guardianOccupation &&
        addressRef.current.setFieldValue(
          "guardianOccupation",
          dbValues.guardianOccupation
        );
      dbValues.guardianQualification &&
        addressRef.current.setFieldValue(
          "guardianQualification",
          dbValues.guardianQualification
        );
      dbValues.guardianIncome &&
        addressRef.current.setFieldValue(
          "guardianIncome",
          dbValues.guardianIncome
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
        handleCityByState({ state: dbValues.state, id: dbValues.stateID });
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
      }
    }
  };

  const handleTabChange = async (key, leavepage) => {
    setLoad(true);
    console.log("Saving Draft---", key);
    setTabKey(key);
    if (leavepage != true && unSavedChanges) {
      setOpenLeavePageModel(true);
      console.log("leavepage---", leavepage);
      setLoad(false);
      return;
    }
    setDefaultActiveKey(key);
    console.log("collegeConfig---", collegeConfig);
    if (key == "1") {
      document.getElementById("studentName").focus();

      const personalMasterRes = await StudentApi.getMaster(8, collegeId);
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
      setCourseList(personalMasterRes.data.message.data.course_data);
      console.log(
        "national",
        personalMasterRes.data.message.data.nationality_data.length
      );
      if (personalMasterRes.data.message.data.nationality_data.length === 1) {
        console.log("Saving nationality Draft---");
        formikRef?.current?.setFieldValue(
          "nationality",
          personalMasterRes.data.message.data.nationality_data[0]
        );
      }
      setReligionList(personalMasterRes.data.message.data.religion_data);
      if (location?.state?.id) {
        const studentRes = await StudentApi.trainingStudentEditDetail(
          location?.state?.id,
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

        setStudentStatus(studentRes.data.message.data[0].isActive);
        setFieldValueFromOutside(studentRes.data.message.data[0]);

        for (
          let i = 0;
          i < personalMasterRes.data.message.data.course_data.length;
          i++
        ) {
          if (
            personalMasterRes.data.message.data.course_data[i].id ==
            studentRes.data.message.data[0].courseID
          ) {
            formikRef.current.setFieldValue(
              "mode",
              personalMasterRes.data.message.data.course_data[i]
            );
            break;
          }
        }
      }
    } else if (key == "2") {
      const masterRes = await StudentApi.getMaster(3);
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

      document.getElementById("fatherMobile")?.focus();
      setCityList(masterRes.data.message.data.city_data);
      setStateList(masterRes.data.message.data.state_data);
      setCountryList(masterRes.data.message.data.country_data);

      for (let k = 0; k < masterRes.data.message.data.state_data.length; k++) {
        if (masterRes.data.message.data.state_data[k].state === "Tamil Nadu") {
          addressRef.current.setFieldValue(
            "state",
            masterRes.data.message.data.state_data[k]
          );
        }
      }

      if (masterRes.data.message.data.country_data.length === 1) {
        addressRef.current.setFieldValue(
          "country",
          masterRes.data.message.data.country_data[0]
        );
      }
    }
    if (studentId) {
      const studentRes = await StudentApi.trainingStudentEditDetail(
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
        if (studentRes.data.message.data[0]) {
          document.getElementById("fatherEmail")?.focus();
          setAddressValueOutside(studentRes.data.message.data[0]);
        }
      }
      if (key == "3") {
        if (studentRes.data.message.data.length > 0) {
          setQualificationFieldValue(studentRes.data.message.data[0]);
        }
      }
    }
    setLoad(false);
  };

  const setQualificationFieldValue = async (dbValues) => {
    console.log("values----", dbValues);

    if (qualificationRef.current) {
      qualificationRef.current.setFieldValue("applicantStatus", {
        label: dbValues.employmentStatus,
        value: dbValues.employmentStatus,
      });
      qualificationRef.current.setFieldValue(
        "subject",
        dbValues.qualificationSubject
      );
      qualificationRef.current.setFieldValue("qualification", {
        label: dbValues.qualification,
        value: dbValues.qualification,
      });

      if (
        dbValues.employmentStatus &&
        dbValues.qualification &&
        dbValues.qualificationSubject
      ) {
        setShowConfirm(true);
      }
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "F4") {
      e.preventDefault();
      console.log("F4 pressed", defaultActiveKey);
      if (defaultActiveKey == 1) {
        $("#personal:first").click();
      } else if (defaultActiveKey == 2) {
        $("#communication:first").click();
      } else if (defaultActiveKey == 3) {
        $("#qualification:first").click();
      }
    }
  };

  const setAdminToken = async () => {
    const token = storage.getToken();
    console.log("setAdminToken token---", token);
    setToken(token);
    if (!token && !location?.state?.mobileNo) {
      navigate("/institutereg");
      return;
    }
  };

  useEffect(() => {
    setLoad(false);
    if (location?.state?.id) {
      console.log("location?.state?.id--", location?.state?.id);
      setStudentId(location.state.id);
    }
    handleTabChange("1");
  }, [collegeConfig.is_university]);

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [defaultActiveKey]);

  useEffect(() => {
    setAdminToken();
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
        <ScreenTitle
          titleClass="page-heading-position"
          customTitle="Student Registration"
        />
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
                    studentMobile: location?.state?.mobileNo
                      ? location?.state?.mobileNo
                      : "",
                    studentName: "",
                    fatherName: "",
                    dateofBirth: "",
                    gender: "",
                    studentEmail: "",
                    bloodGroup: "",
                    aadhaar: "",
                    nationality: "",
                    religion: "",
                    motherTongue: "",
                    mode: "",
                  }}
                  validationSchema={PersonalSchema}
                  onSubmit={handleSavePersonal}
                >
                  {({
                    errors,
                    values,
                    touched,
                    handleSubmit,
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
                              {!token ? (
                                <DisplayText
                                  labelSize={4}
                                  label="Mobile No."
                                  value={values.studentMobile}
                                />
                              ) : (
                                <TextFieldFormik
                                  autoFocus
                                  tabIndex={0}
                                  labelSize={4}
                                  id="studentMobile"
                                  label="Student Mobile No."
                                  placeholder="Mobile"
                                  value={values.studentMobile}
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
                                  mandatory={1}
                                  style={{ width: "40%" }}
                                />
                              )}
                              <TextFieldFormik
                                autoFocus={token ? true : false}
                                labelSize={4}
                                tabIndex={1}
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
                                  setUnSavedChanges(true);
                                }}
                              />
                              <TextFieldFormik
                                labelSize={4}
                                id="fatherName"
                                tabIndex={2}
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
                                labelSize={4}
                                tabIndex={3}
                                label="Date of Birth"
                                id="dateofBirth"
                                maxDate={moment().subtract(1, "years")}
                                minDate={moment().subtract(80, "years")}
                                mandatory={1}
                                style={{ width: "45%" }}
                                onChange={(e) => {
                                  handleUnSavedChanges(1);
                                  setFieldValue("dateofBirth", e.target.value);
                                }}
                              />
                              <SelectFieldFormik
                                tabIndex={4}
                                labelSize={4}
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
                              <TextFieldFormik
                                tabIndex={5}
                                labelSize={4}
                                id="studentEmail"
                                label="Student Email ID"
                                onChange={(e) => {
                                  setFieldValue("studentEmail", e.target.value);
                                  handleUnSavedChanges(1);
                                }}
                                maxlength={45}
                              />
                              <SelectFieldFormik
                                tabIndex={6}
                                labelSize={4}
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
                                tabIndex={7}
                                labelSize={4}
                                id="aadhaar"
                                label="Aadhaar Number"
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
                                style={{ width: "50%" }}
                              />

                              <SelectFieldFormik
                                tabIndex={8}
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
                                tabIndex={9}
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
                                tabIndex={10}
                                labelSize={4}
                                label="Mother Tongue"
                                id="motherTongue"
                                mandatory={1}
                                maxlength={15}
                                matchFrom="start"
                                options={motherTongueList}
                                getOptionLabel={(option) => option.label}
                                getOptionValue={(option) => option.value}
                                onChange={(text) => {
                                  setFieldValue("motherTongue", text);
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
                          {token && (
                            <>
                              <div className="subhead-row mt-0">
                                <div className="subhead">Course Detail</div>
                                <div className="col line-div"></div>
                              </div>
                              <div className="col-lg-9 pe-2">
                                <SelectFieldFormik
                                  tabIndex={11}
                                  labelSize={4}
                                  label="Mode"
                                  id="mode"
                                  mandatory={1}
                                  maxlength={15}
                                  matchFrom="start"
                                  options={courseList}
                                  getOptionLabel={(option) => option.courseName}
                                  getOptionValue={(option) => option.id}
                                  onChange={(text) => {
                                    setFieldValue("mode", text);
                                    handleUnSavedChanges(1);
                                  }}
                                  style={{ width: "70%" }}
                                />
                              </div>
                            </>
                          )}
                          <Button
                            id="personal"
                            text="F4 - Next"
                            tabIndex={token ? 12 : 11}
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
                title="Communication"
                disabled={location?.state?.id ? false : true}
              >
                <Formik
                  innerRef={addressRef}
                  autoComplete={("nope", "off")}
                  enableReinitialize={true}
                  initialValues={{
                    fatherMobile: "",
                    fatherQualification: "",
                    fatherOccupation: "",
                    fatherIncome: "",
                    motherName: "",
                    motherQualification: "",
                    motherOccupation: "",
                    motherIncome: "",
                    guardianName: "",
                    guardianMobile: "",
                    guardianQualification: "",
                    guardianOccupation: "",
                    guardianIncome: "",
                    isGuardian: false,
                    addressline1: "",
                    addressline2: "",
                    place: "",
                    city: "",
                    otherCity: "",
                    state: "",
                    pinCode: "",
                    country: "",
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
                          <div className="col-lg-9 pe-2"></div>
                          <div className="subhead-row">
                            <div className="subhead">Communication Detail</div>
                            <div className="col line-div"></div>
                          </div>

                          <div className="row no-gutters">
                            <div className="col-lg-9 pe-2">
                              <TextFieldFormik
                                id="fatherMobile"
                                mandatory={values.isGuardian ? 0 : 1}
                                label="Father Mobile Number"
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
                                  }
                                  handleUnSavedChanges(1);
                                }}
                                maxlength={10}
                                tabIndex={15}
                                style={{ width: "40%" }}
                              />
                              <TextFieldFormik
                                id="fatherQualification"
                                label="Father Qualification"
                                maxlength={40}
                                tabIndex={16}
                                onChange={(e) => {
                                  setFieldValue(
                                    "fatherQualification",
                                    e.target.value
                                  );
                                  handleUnSavedChanges(1);
                                }}
                                style={{ width: "70%" }}
                              />
                              <TextFieldFormik
                                id="fatherOccupation"
                                label="Father Occupation"
                                maxlength={40}
                                tabIndex={17}
                                mandatory={1}
                                onChange={(e) => {
                                  setFieldValue(
                                    "fatherOccupation",
                                    e.target.value
                                  );
                                  handleUnSavedChanges(1);
                                }}
                                style={{ width: "70%" }}
                              />
                              <TextFieldFormik
                                id="fatherIncome"
                                label="Father Income"
                                maxlength={7}
                                tabIndex={18}
                                onChange={(e) => {
                                  if (
                                    preFunction.amountValidation(e.target.value)
                                  ) {
                                    setFieldValue(
                                      "fatherIncome",
                                      e.target.value
                                    );
                                  }
                                  handleUnSavedChanges(1);
                                }}
                                style={{ width: "40%" }}
                              />
                              <TextFieldFormik
                                id="motherName"
                                label="Mother Name"
                                maxlength={45}
                                mandatory={1}
                                tabIndex={19}
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
                                id="motherQualification"
                                label="Mother Qualification"
                                maxlength={40}
                                tabIndex={20}
                                onChange={(e) => {
                                  setFieldValue(
                                    "motherQualification",
                                    e.target.value
                                  );
                                  handleUnSavedChanges(1);
                                }}
                                style={{ width: "70%" }}
                              />
                              <TextFieldFormik
                                id="motherOccupation"
                                label="Mother Occupation"
                                maxlength={40}
                                tabIndex={21}
                                onChange={(e) => {
                                  setFieldValue(
                                    "motherOccupation",
                                    e.target.value
                                  );
                                  handleUnSavedChanges(1);
                                }}
                                style={{ width: "70%" }}
                              />
                              <TextFieldFormik
                                id="motherIncome"
                                label="Mother Income"
                                maxlength={7}
                                tabIndex={22}
                                onChange={(e) => {
                                  if (
                                    preFunction.amountValidation(e.target.value)
                                  ) {
                                    setFieldValue(
                                      "motherIncome",
                                      e.target.value
                                    );
                                  }
                                  handleUnSavedChanges(1);
                                }}
                                style={{ width: "40%" }}
                              />
                              <SwitchField
                                label="Add Guardian Detail"
                                yesOption={"Yes"}
                                noOption={"No"}
                                checked={values.isGuardian}
                                value={values.isGuardian}
                                tabIndex={23}
                                onChange={(e) => {
                                  setFieldValue(
                                    "isGuardian",
                                    !values.isGuardian
                                  );
                                  handleUnSavedChanges(1);
                                  setFieldValue("guardianName", "");
                                  setFieldValue("guardianMobile", "");
                                  setFieldValue("guardianOccupation", "");
                                  setFieldValue("guardianQualification", "");
                                  setFieldValue("guardianIncome", "");
                                }}
                              />
                              {values.isGuardian && (
                                <>
                                  <TextFieldFormik
                                    id="guardianName"
                                    maxlength={45}
                                    mandatory={1}
                                    tabIndex={24}
                                    label="Guardian Name"
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
                                    id="guardianMobile"
                                    placeholder="Mobile"
                                    mandatory={1}
                                    tabIndex={25}
                                    label="Guardian Mobile Number"
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
                                  <TextFieldFormik
                                    id="guardianQualification"
                                    label="Guardian Qualification"
                                    maxlength={40}
                                    tabIndex={26}
                                    onChange={(e) => {
                                      setFieldValue(
                                        "guardianQualification",
                                        e.target.value
                                      );
                                      handleUnSavedChanges(1);
                                    }}
                                    style={{ width: "70%" }}
                                  />
                                  <TextFieldFormik
                                    id="guardianOccupation"
                                    label="Guardian Occupation"
                                    maxlength={40}
                                    tabIndex={27}
                                    onChange={(e) => {
                                      setFieldValue(
                                        "guardianOccupation",
                                        e.target.value
                                      );
                                      handleUnSavedChanges(1);
                                    }}
                                    style={{ width: "70%" }}
                                  />
                                  <TextFieldFormik
                                    id="guardianIncome"
                                    label="Guardian Income"
                                    maxlength={7}
                                    tabIndex={28}
                                    onChange={(e) => {
                                      if (
                                        preFunction.amountValidation(
                                          e.target.value
                                        )
                                      ) {
                                        setFieldValue(
                                          "guardianIncome",
                                          e.target.value
                                        );
                                      }
                                      handleUnSavedChanges(1);
                                    }}
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
                                maxlength={45}
                                tabIndex={values.isGuardian ? 29 : 24}
                                onChange={(e) => {
                                  setFieldValue("addressline1", e.target.value);
                                  handleUnSavedChanges(1);
                                }}
                                mandatory={1}
                              />

                              <TextFieldFormik
                                id="addressline2"
                                label="Address Line 2"
                                maxlength={45}
                                tabIndex={values.isGuardian ? 30 : 25}
                                onChange={(e) => {
                                  setFieldValue("addressline2", e.target.value);
                                  handleUnSavedChanges(1);
                                }}
                              />

                              <TextFieldFormik
                                label="Place"
                                id="place"
                                maxlength={45}
                                mandatory={1}
                                tabIndex={values.isGuardian ? 31 : 26}
                                onChange={(e) => {
                                  setFieldValue("place", e.target.value);
                                  handleUnSavedChanges(1);
                                }}
                              />
                              <SelectFieldFormik
                                label="State"
                                id="state"
                                options={stateList}
                                matchFrom="start"
                                clear={false}
                                getOptionLabel={(option) => option.state}
                                getOptionValue={(option) => option.id}
                                mandatory={1}
                                maxlength={25}
                                tabIndex={values.isGuardian ? 32 : 27}
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
                                    onChange={(e) => {
                                      setFieldValue(
                                        "otherCity",
                                        e.target.value
                                      );
                                      handleUnSavedChanges(1);
                                    }}
                                    maxlength={40}
                                    tabIndex={values.isGuardian ? 33 : 28}
                                    mandatory={1}
                                  />
                                </>
                              ) : (
                                <>
                                  <SelectFieldFormik
                                    label="City/District"
                                    matchFrom="start"
                                    id="city"
                                    options={cityList}
                                    tabIndex={
                                      values.isGuardian && !otherCity ? 33 : 28
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
                                value={values.pinCode > 0 ? values.pinCode : ""}
                                onChange={(e) => {
                                  if (!isNaN(e.target.value))
                                    setFieldValue("pinCode", e.target.value);
                                  handleUnSavedChanges(1);
                                }}
                                style={{ width: "30%" }}
                                maxlength={6}
                                mandatory={1}
                                tabIndex={values.isGuardian ? 34 : 29}
                              />

                              <SelectFieldFormik
                                label="Country"
                                matchFrom="start"
                                id="country"
                                clear={false}
                                options={countryList}
                                getOptionLabel={(option) => option.country}
                                getOptionValue={(option) => option.id}
                                mandatory={1}
                                tabIndex={values.isGuardian ? 35 : 30}
                                maxlength={15}
                                onChange={(text) => {
                                  setFieldValue("country", text);
                                  handleUnSavedChanges(1);
                                }}
                              />
                            </div>
                          </div>

                          <Button
                            className={"btn me-2"}
                            tabIndex={values.isGuardian ? 36 : 31}
                            onClick={(e) => {
                              preFunction.handleErrorFocus(errors);
                            }}
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
                eventKey="3"
                title="Graduation"
                disabled={location?.state?.id ? false : true}
              >
                <div className="row no-gutters px-3">
                  <div className="row no-gutters">
                    <div className="subhead-row">
                      <div className="subhead">Graduation Detail</div>
                      <div className="col line-div"></div>
                    </div>
                  </div>

                  <Formik
                    enableReinitialize={true}
                    innerRef={qualificationRef}
                    initialValues={{
                      applicantStatus: "",
                      subject: "",
                      qualification: "",
                    }}
                    validationSchema={QualificationSchema}
                    onSubmit={(values) => handleSaveQualification(values, 0)}
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
                          <div className="row no-gutters">
                            <div className="col-lg-9 pe-2">
                              <SelectFieldFormik
                                autoFocus
                                tabIndex={40}
                                label="Applicant Status"
                                matchFrom="start"
                                id="applicantStatus"
                                options={applicantStatusList}
                                getOptionLabel={(option) => option.label}
                                getOptionValue={(option) => option.value}
                                mandatory={1}
                                maxlength={25}
                                onChange={(text) => {
                                  setFieldValue("applicantStatus", text);
                                  handleUnSavedChanges(1);
                                  setUnSavedChanges(true);
                                  setShowConfirm(false);
                                }}
                                style={{ width: "80%" }}
                              />
                              <SelectFieldFormik
                                tabIndex={41}
                                label="Qualification"
                                // matchFrom="start"
                                id="qualification"
                                options={qualificationList}
                                getOptionLabel={(option) => option.label}
                                getOptionValue={(option) => option.value}
                                mandatory={1}
                                maxlength={25}
                                onChange={(text) => {
                                  setFieldValue("qualification", text);
                                  handleUnSavedChanges(1);
                                  setUnSavedChanges(true);
                                  setShowConfirm(false);
                                }}
                                style={{ width: "80%" }}
                              />

                              <TextFieldFormik
                                tabIndex={42}
                                id="subject"
                                label="Subject"
                                maxlength={45}
                                mandatory={1}
                                onChange={(e) => {
                                  handleUnSavedChanges(1);
                                  setFieldValue(
                                    "subject",
                                    preFunction.capitalizeFirst(e.target.value)
                                  );
                                  setUnSavedChanges(true);
                                  setShowConfirm(false);
                                }}
                              />
                            </div>
                          </div>
                          {token ? (
                            <div className="text-center mb-3">
                              {studentStatus ? (
                                <Button
                                  tabIndex={43}
                                  frmButton={false}
                                  onClick={(e) => {
                                    preFunction.handleErrorFocus(errors);
                                  }}
                                  text="F4 - Save"
                                  id="save"
                                />
                              ) : (
                                <>
                                  {showConfirm ? (
                                    <>
                                      <Button
                                        tabIndex={43}
                                        frmButton={false}
                                        isTable={showConfirm ? true : false}
                                        onClick={(e) => {
                                          preFunction.handleErrorFocus(errors);
                                        }}
                                        text="F4 - Save As Draft"
                                        id="save"
                                      />
                                      &nbsp;&nbsp;
                                      <Button
                                        frmButton={false}
                                        tabIndex={44}
                                        className={"btn-green"}
                                        onClick={(e) => {
                                          if (
                                            handleSaveQualification(values, 1)
                                          )
                                            handleConfirmSubmission();
                                        }}
                                        type="button"
                                        text="Confirm Admission"
                                      />
                                    </>
                                  ) : (
                                    <Button
                                      tabIndex={43}
                                      frmButton={false}
                                      onClick={(e) => {
                                        preFunction.handleErrorFocus(errors);
                                      }}
                                      text="F4 - Save"
                                      id="save"
                                    />
                                  )}
                                </>
                              )}
                            </div>
                          ) : (
                            <Button
                              className={"btn me-2 mb-3"}
                              tabIndex={43}
                              onClick={(e) => {
                                preFunction.handleErrorFocus(errors);
                              }}
                              text="F4 - Save"
                              id="save"
                            />
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
                {confirmMessage} <br />
                Student No. : {studentNumber}
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
      </>
    </div>
  );
}

export default AddInstituteStudent;
