import React, {
  useEffect,
  useState,
  useRef,
  useContext,
  createRef,
} from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Modal, Tab, Tabs } from "react-bootstrap";
import { Formik } from "formik";
import ReactCrop from "react-image-crop";
import moment from "moment";
import * as Yup from "yup";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import $ from "jquery";

import StudentApi from "../api/StudentApi";

import { allowedFileExtensions } from "../component/common/CommonArray";
import preFunction from "../component/common/CommonFunction";
import CustomActivityIndicator from "../component/common/CustomActivityIndicator";
import ErrorMessage from "../component/common/ErrorMessage";
import TextFieldFormik from "../component/FormField/TextFieldFormik";
import SelectFieldFormik from "../component/FormField/SelectFieldFormik";
import SwitchField from "../component/FormField/SwitchField";
import Button from "../component/FormField/Button";

import string from "../string";

import photo from "../assests/png/camera.png";
import blankProfile from "../assests/png/blank-profile-picture.png";
import ScreenTitle from "../component/common/ScreenTitle";
import ModalComponent from "../component/ModalComponent";
import AuthContext from "../auth/context";
import DisplayText from "../component/FormField/DisplayText";
import DateFieldFormik from "../component/FormField/DateFieldFormik";
import FileField from "../component/FormField/FileField";
import TextAreaFieldFormik from "../component/FormField/TextareaFieldFormik";

import "react-image-crop/dist/ReactCrop.css";

let otherCity = false;
let tempOtherCity = false;

const QualificationSchema = Yup.object().shape({
  previousSchoolName: Yup.string()
    .min(3, "Must be at least 3 characters long")
    .required("Please enter Previous School Name")
    .trim(),
  previousBoard: Yup.string()
    .min(3, "Must be at least 3 characters long")
    .required("Please enter Previous Board")
    .trim(),
});

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
  aadhaar: Yup.number()
    .test(
      "is-twelve-digits",
      "Aadhaar Number must be exactly 12 digits",
      (value) => /^[0-9]{12}$/.test(String(value))
    )
    .required("Please enter Aadhaar Number"),
  pan: Yup.string().test("is-valid-pan", "Enter Valid PAN Number", (value) => {
    if (value && value.trim() !== "") {
      return /[A-Z]{5}[0-9]{4}[A-Z]{1}/.test(String(value));
    }
    return true;
  }),
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
  motherMobile: mobileValidation,
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

function EditSchoolStudent() {
  //#region const
  const RENAME = useSelector((state) => state.web.rename);
  const fileInputRef = createRef();
  const qualificationRef = useRef();

  const [load, setLoad] = useState(false);
  const [studentId, setStudentId] = useState();
  const navigate = useNavigate();
  const location = useLocation();
  const [defaultActiveKey, setDefaultActiveKey] = useState("1");
  const [communicationId, setCommunicationID] = useState("");
  const [oldAddressArray, setOldAddressArray] = useState("");

  // Personal Data ----
  const [communityList, setCommunityList] = useState([]);
  const [religionList, setReligionList] = useState([]);
  const [nationalityList, setNationalityList] = useState([]);
  const [cityList, setCityList] = useState([]);
  const [tempCityList, setTempCityList] = useState([]);
  const [stateList, setStateList] = useState([]);
  const [countryList, setCountryList] = useState([]);
  const [displayImage, setDisplayImage] = useState(blankProfile);
  const [genderList, setGenderList] = useState([]);
  const [bloodGroupList, setBloodGroupList] = useState([]);

  const [showImg, setShowImg] = useState(false);
  const [photoMessage, setPhotoMessage] = useState("");
  const [onChangeImage, setonChangeImage] = useState(false);
  const [src, setSrc] = useState(null);
  const [fileType, setFileType] = useState(null);
  const [CropOpen, setCropOpen] = useState(false);
  const [openModel, setOpenModal] = useState(false);

  const [documentProof, setDocumentProof] = useState();
  const [tcFileType, setTCFileType] = useState(null);
  const [onChangeTc, setOnChangeTc] = useState(false);
  const [uploadedTC, setUploadedTC] = useState(null);
  const [siblingData, setSiblingData] = useState();
  const [staffData, setStaffData] = useState();

  const [modalErrorOpen, setModalErrorOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [modalTitle, setModalTitle] = useState("");

  const [saveDraftMessage, setSaveDraftMessage] = useState();
  const [className, setClassName] = useState("");

  const collegeConfig = useSelector((state) => state.web.college);
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
  const addressRef = useRef();
  const [studentNumber, setStudentNumber] = useState();
  const { unSavedChanges, setUnSavedChanges } = useContext(AuthContext);
  const [openLeavePageModel, setOpenLeavePageModel] = useState(false);
  const [tabKey, setTabKey] = useState("1");
  //#endregion

  const handleUnSavedChanges = (changed) => {
    if (changed === 1) {
      sessionStorage.setItem("unSavedChanges", true);
      setUnSavedChanges(true);
    } else {
      sessionStorage.setItem("unSavedChanges", false);
      setUnSavedChanges(false);
    }
  };

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

  const handleFileUpload = (e) => {
    console.log(e.target.files[0]);
    setTCFileType();
    setDocumentProof();
    if (e.target.files[0].size > string.MAX_FILE_SIZE) {
      setModalErrorOpen(true);
      setModalMessage("Please choose file size less than 2MB");
      setModalTitle("File Size");
      fileInputRef.current.value = "";
      return false;
    }
    if (!allowedFileExtensions.includes(e.target.files[0].name.split(".")[1])) {
      setModalErrorOpen(true);
      setModalMessage("Please upload pdf, jpeg, jpg, png file only");
      setModalTitle("File Type");
      return false;
    }
    setTCFileType(e.target.files[0].name.split(".")[1]);
    const reader = new FileReader();
    reader.onload = () => {
      if (reader.readyState === 2) {
        setDocumentProof(reader.result);
        setOnChangeTc(true);
      }
    };
    reader.readAsDataURL(e.target.files[0]);
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
    setStudentNumber(values.enrollNo);
    setClassName(values.className);
    if (formikRef.current) {
      formikRef.current.setFieldValue("studentName", values.name);
      formikRef.current.setFieldValue("fatherName", values.fatherName);
      if (values.DOB) {
        formikRef.current.setFieldValue("dateofBirth", new Date(values.DOB));
      }
      formikRef.current.setFieldValue("gender", {
        id: values.genderID,
        gender: values.gender,
      });
      formikRef.current.setFieldValue("studentEmail", values.email);
      if (values.bloodGroup) {
        formikRef.current.setFieldValue("bloodGroup", {
          id: values.bloodGroupID,
          bloodGroup: values.bloodGroup,
        });
      }
      formikRef.current.setFieldValue("aadhaar", values.aadhaar);
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
      if (values.medicalHistory) {
        formikRef.current.setFieldValue(
          "medicalDetails",
          values.medicalHistory
        );
      }
      formikRef.current.setFieldValue(
        "applicationNumber",
        values.applicationNo
      );
      if (values.previousSchoolName) {
        formikRef.current.setFieldValue(
          "previousSchoolName",
          values.previousSchoolName
        );
      }
      if (values.previousTCNo) {
        formikRef.current.setFieldValue("emisNumber", values.previousTCNo);
      }
      if (values.previousTCPath) {
        setUploadedTC(values.previousTCPath);
      }
      formikRef.current.setFieldValue("course", {
        id: values.courseID,
        courseName: values.courseName,
      });
      formikRef.current.setFieldValue("class", {
        id: values.semester,
        className: values.className,
      });
      formikRef.current.setFieldValue("admissionType", {
        id: values.admissionTypeID,
        admissionType: values.admissionType,
      });
      if (values.photo) {
        setDisplayImage(string.FILEURL + values.photo);
      }
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
      dbValues.fatherQualification &&
        addressRef.current.setFieldValue(
          "fatherQualification",
          dbValues.fatherQualification
        );
      dbValues.fatherEmail &&
        addressRef.current.setFieldValue("fatherEmail", dbValues.fatherEmail);
      dbValues.fatherOccupation &&
        addressRef.current.setFieldValue(
          "fatherOccupation",
          dbValues.fatherOccupation
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
      dbValues.motherEmail &&
        addressRef.current.setFieldValue("motherEmail", dbValues.motherEmail);
      dbValues.motherOccupation &&
        addressRef.current.setFieldValue(
          "motherOccupation",
          dbValues.motherOccupation
        );
      dbValues.motherIncome &&
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
      dbValues.guardianQualification &&
        addressRef.current.setFieldValue(
          "guardianQualification",
          dbValues.guardianQualification
        );
      dbValues.guardianEmail &&
        addressRef.current.setFieldValue(
          "guardianEmail",
          dbValues.guardianEmail
        );
      dbValues.guardianOccupation &&
        addressRef.current.setFieldValue(
          "guardianOccupation",
          dbValues.guardianOccupation
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
    } catch (error) {
      console.log("error", error);
    }
  };

  const handleSavePersonal = async (values) => {
    if (load) return;
    console.log("values----", values);
    console.log("displayimage----", displayImage, studentNumber);
    // return;

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
        setonChangeImage(false);
        setDisplayImage(string.FILEURL + response.data.message.data.file_url);
      }
      console.log("imageUrl-----", imageUrl);

      let tcUrl = "";
      if (onChangeTc) {
        const responseTc = await StudentApi.uploadFile(
          "past_tc",
          tcFileType,
          documentProof.split(",")[1]
        );
        console.log("responseTC--", responseTc);
        if (!responseTc.data.message.success) {
          setModalErrorOpen(true);
          setModalMessage(responseTc.data.message.message);
          setModalTitle("Message");
          setLoad(false);
          return;
        }
        tcUrl = responseTc.data.message.data.file_url;
        console.log("proofUrl--------", tcUrl);
        setOnChangeTc(false);
      }

      const personalRes = await StudentApi.addSchoolStudent(
        studentId ?? null,
        studentNumber,
        values.studentName.replace(/\s\s+/g, " ").trim(),
        values.fatherName.replace(/\s\s+/g, " ").trim(),
        values.studentEmail != "" ? values.studentEmail : null,
        imageUrl ?? null,
        values.studentEmail != "" ? values.studentEmail : null,
        moment(values.dateofBirth).format("YYYY-MM-DD"),
        values.gender.id,
        values.gender.gender,
        values.bloodGroup ? values.bloodGroup.id : null,
        values.bloodGroup ? values.bloodGroup.bloodGroup : null,
        values.community.id,
        values.community.community,
        values.religion.id,
        values.religion.religion,
        values.nationality.id,
        values.nationality.nationality,
        values.aadhaar,
        values.medicalDetails != ""
          ? values.medicalDetails.replace(/\s\s+/g, " ").trim()
          : null,
        values.applicationNumber
          ? values.applicationNumber.replace(/\s\s+/g, " ").trim()
          : null,
        values.admissionType.id,
        values.course.id,
        values.class.id,
        collegeConfig.institution_type
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
      setClassName(values.class.className);
      handleTabChange("2", true);
      handleUnSavedChanges(0);
      setLoad(false);
    } catch (error) {
      setLoad(false);
      console.log("catch---", error);
    }
  };

  const handleSaveCommunication = async (values) => {
    if (load) return;
    console.log("Communication------", values);
    try {
      setLoad(true);
      const communicationRes = await StudentApi.addCommunication(
        communicationId ? communicationId : null,
        studentId,
        values.fatherMobile,
        values.fatherEmail != "" ? values.fatherEmail : null,
        values.fatherOccupation != ""
          ? values.fatherOccupation.replace(/\s\s+/g, " ").trim()
          : null,
        values.fatherQualification != "" ? values.fatherQualification : null,
        values.fatherIncome != "" ? values.fatherIncome : null,
        values.motherName.replace(/\s\s+/g, " ").trim(),
        values.motherMobile != "" ? values.motherMobile : null,
        values.motherEmail != "" ? values.motherEmail : null,
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
        values.guardianEmail != "" ? values.guardianEmail : null,
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
        values.tempPinCode,
        values.isSibling ? values.sibling.id : null,
        values.isChildOfStaff ? values.staff.custom_employeeid : null
      );
      console.log("communicationRes---", communicationRes);
      if (!communicationRes.data.message.success) {
        setModalMessage(communicationRes.data.message.message);
        setModalErrorOpen(true);
        setModalTitle("Message");
        setLoad(false);
        return;
      }
      handleUnSavedChanges(0);
      handleTabChange("3", true);
      setLoad(false);
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
      setNationalityList(personalMasterRes.data.message.data.nationality_data);
      setGenderList(personalMasterRes.data.message.data.gender_data);
      setBloodGroupList(personalMasterRes.data.message.data.blood_data);
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

  const handleSaveQualification = async (values) => {
    if (load) return;
    try {
      console.log("values---", values);
      let err = false;
      setLoad(true);
      let tcUrl = "";
      if (onChangeTc) {
        const responseTc = await StudentApi.uploadFile(
          "past_tc",
          tcFileType,
          documentProof.split(",")[1]
        );
        console.log("responseTC--", responseTc);
        if (!responseTc.data.message.success) {
          setModalErrorOpen(true);
          setModalMessage(responseTc.data.message.message);
          setModalTitle("Message");
          setLoad(false);
          return;
        }
        tcUrl = responseTc.data.message.data.file_url;
        console.log("proofUrl--------", tcUrl);
        setOnChangeTc(false);
      }
      console.log("values---", values, "tcUrl---", tcUrl, studentId);
      const saveQualificationRes =
        await StudentApi.addSchoolStudentQualification(
          studentId,
          values.previousSchoolName,
          values.previousBoard,
          values.emisNumber ? values.emisNumber : null,
          tcUrl ? tcUrl : null,
          values.academicDetails ? values.academicDetails : null
        );
      console.log("saveQualification", saveQualificationRes);
      if (!saveQualificationRes.data.message.success) {
        err = true;
        setModalMessage(saveQualificationRes.data.message.message);
        setModalErrorOpen(true);
        setModalTitle("Message");
        setLoad(false);
        return;
      }
      console.log("saveDraftMessage---", saveDraftMessage);
      // toast.success(saveDraftMessage);
      toast.success("Student Saved Successfully");
      handleUnSavedChanges(0);
      navigate("/view-school-student", {
        state: { enrollNumber: location?.state?.enrollNumber },
      });
      setLoad(false);
    } catch (error) {
      setLoad(false);
      console.log("Exception---", error);
    }
  };

  const setQualificationFieldValue = async (values) => {
    console.log("setQualificationFieldValue values----", values);
    if (qualificationRef.current) {
      qualificationRef.current.setFieldValue(
        "previousSchoolName",
        values.schoolCollegeName
      );
      qualificationRef.current.setFieldValue(
        "previousBoard",
        values.boardUniversity
      );
      if (values.tcNo) {
        qualificationRef.current.setFieldValue("emisNumber", values.tcNo);
      }
      if (values.academicNote && values.academicNote != null) {
        qualificationRef.current.setFieldValue(
          "academicDetails",
          values.academicNote
        );
      }
      if (values.tcPath && values.tcPath != null) {
        setUploadedTC(values.tcPath);
      }
    }
  };

  const handleTabChange = async (key, leavepage) => {
    setTabKey(key);
    if (leavepage != true && unSavedChanges) {
      setOpenLeavePageModel(true);
      console.log("leavepage---", leavepage);
      return;
    }
    setDefaultActiveKey(key);
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
    if (key == "2") {
      document.getElementById("fatherEmail")?.focus();
      setStateList(masterRes.data.message.data.state_data);
      setCountryList(masterRes.data.message.data.country_data);
    }
    if (studentId) {
      const studentRes = await StudentApi.editStudent(
        studentId,
        key == 2 ? 3 : 4,
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
        document.getElementById("fatherEmail")?.focus();
        setAddressValueOutside(
          studentRes.data.message.data.student_communication[0]
        );
        if (studentRes.data.message.data.sibling_data.length > 0) {
          setSiblingData(studentRes.data.message.data.sibling_data[0]);
          addressRef.current.setFieldValue("isSibling", true);
          addressRef.current.setFieldValue("sibling", {
            id: studentRes.data.message.data.sibling_data[0].studentID,
          });
        } else if (studentRes.data.message.data.staff_data.length > 0) {
          setStaffData(studentRes.data.message.data.staff_data[0]);
          addressRef.current.setFieldValue("isChildOfStaff", true);
          addressRef.current.setFieldValue("staff", {
            custom_employeeid:
              studentRes.data.message.data.staff_data[0].custom_employeeid,
          });
        }
      }
      if (key == "3") {
        if (studentRes.data.message.data.length > 0) {
          document.getElementById("previousSchoolName")?.focus();
          setQualificationFieldValue(studentRes.data.message.data[0]);
        } else {
          document.getElementById("previousSchoolName")?.focus();
        }
      }
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "F4") {
      e.preventDefault();
      console.log("F4 pressed", defaultActiveKey);
      if (defaultActiveKey == 1) {
        $("#personal:first").click(); // Trigger button click
      } else if (defaultActiveKey == 2) {
        $("#communication:first").click(); // Trigger button click
      }
    }
  };

  useEffect(() => {
    console.log("location?.state?.id", location?.state);
    if (!location?.state?.enrollNumber) {
      navigate("/student-list");
      return;
    }
    console.log("location?.state?.id--", location?.state?.enrollNumber);
    setStudentId(location?.state?.enrollNumber?.id);
    getStudent(location?.state?.enrollNumber?.id);

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
                  navigate("/view-school-student", {
                    state: { enrollNumber: location?.state?.enrollNumber },
                  });
                }
              }}
            />
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
                    course: "",
                    class: "",
                    admissionType: "",
                    medicalDetails: "",
                    previousSchoolName: "",
                    emisNumber: "",
                    attachTC: "",
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
                              <TextFieldFormik
                                autoFocus
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
                                minDate={moment().subtract(20, "years")}
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
                              <DisplayText
                                label="Student Email ID"
                                labelSize={4}
                                value={values.studentEmail}
                              />
                              <SelectFieldFormik
                                tabIndex={5}
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
                                tabIndex={6}
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
                                mandatory={1}
                                style={{ width: "50%" }}
                              />
                              <SelectFieldFormik
                                tabIndex={7}
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
                                tabIndex={8}
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
                                tabIndex={9}
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
                              <TextAreaFieldFormik
                                tabIndex={10}
                                labelSize={4}
                                id="medicalDetails"
                                label="Medical Details"
                                placeholder="Medical Details"
                                maxlength={500}
                                onChange={(e) => {
                                  setFieldValue(
                                    "medicalDetails",
                                    e.target.value
                                  );
                                  handleUnSavedChanges(1);
                                }}
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
                              {values.applicationNumber && (
                                <DisplayText
                                  label="Application No."
                                  labelSize={4}
                                  value={values.applicationNumber}
                                />
                              )}
                              <DisplayText
                                label={RENAME?.course}
                                labelSize={4}
                                value={values.course.courseName}
                              />
                              <DisplayText
                                label={RENAME?.sem}
                                labelSize={4}
                                value={values.class.className}
                              />
                              <DisplayText
                                label="Admission Type"
                                labelSize={4}
                                value={values.admissionType.admissionType}
                              />
                            </div>
                          </div>
                          <Button
                            id="personal"
                            text="F4 - Next"
                            tabIndex={11}
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
              <Tab eventKey="2" title="Communication">
                <Formik
                  innerRef={addressRef}
                  autoComplete={("nope", "off")}
                  enableReinitialize={true}
                  initialValues={{
                    isSibling: false,
                    sibling: "",
                    isChildOfStaff: false,
                    staff: "",
                    fatherEmail: "",
                    fatherMobile: "",
                    fatherQualification: "",
                    fatherOccupation: "",
                    fatherIncome: "",
                    motherName: "",
                    motherMobile: "",
                    motherQualification: "",
                    motherEmail: "",
                    motherOccupation: "",
                    motherIncome: "",
                    guardianName: "",
                    guardianMobile: "",
                    guardianQualification: "",
                    guardianEmail: "",
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
                          {siblingData || staffData ? (
                            <div className="col-lg-9 pe-2">
                              {siblingData && (
                                <>
                                  <DisplayText
                                    label="Sibling Concession?"
                                    value={"Yes"}
                                  />
                                  <DisplayText
                                    label="Sibling No. / Name"
                                    value={
                                      siblingData.enrollNo +
                                      " - " +
                                      siblingData.name
                                    }
                                  />
                                </>
                              )}
                              {staffData && (
                                <>
                                  <DisplayText
                                    label="Staff Concession?"
                                    value={"Yes"}
                                  />
                                  <DisplayText
                                    label="Employee No. / Name"
                                    value={
                                      staffData.custom_employeeid +
                                      " - " +
                                      staffData.employee_name
                                    }
                                  />
                                </>
                              )}
                            </div>
                          ) : null}
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
                                tabIndex={23}
                                id="fatherEmail"
                                label="Father Email ID"
                                onChange={(e) => {
                                  setFieldValue("fatherEmail", e.target.value);
                                  handleUnSavedChanges(1);
                                }}
                                style={{ width: "80%" }}
                              />
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
                                }}
                                maxlength={10}
                                tabIndex={24}
                                style={{ width: "40%" }}
                              />
                              <TextFieldFormik
                                id="fatherQualification"
                                label="Father Qualification"
                                maxlength={40}
                                tabIndex={25}
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
                                tabIndex={26}
                                onChange={(e) => {
                                  setFieldValue(
                                    "fatherOccupation",
                                    preFunction.capitalizeFirst(e.target.value)
                                  );
                                  handleUnSavedChanges(1);
                                }}
                                style={{ width: "80%" }}
                              />
                              <TextFieldFormik
                                id="fatherIncome"
                                label="Father Income"
                                maxlength={7}
                                tabIndex={27}
                                onChange={(e) => {
                                  if (
                                    preFunction.amountValidation(e.target.value)
                                  ) {
                                    setFieldValue(
                                      "fatherIncome",
                                      e.target.value
                                    );
                                    handleUnSavedChanges(1);
                                  }
                                }}
                                style={{ width: "40%" }}
                              />
                              <TextFieldFormik
                                id="motherName"
                                label="Mother Name"
                                maxlength={45}
                                mandatory={1}
                                tabIndex={28}
                                onChange={(e) => {
                                  setFieldValue(
                                    "motherName",
                                    preFunction.capitalizeFirst(e.target.value)
                                  );
                                  handleUnSavedChanges(1);
                                }}
                                style={{ width: "80%" }}
                              />
                              <TextFieldFormik
                                id="motherEmail"
                                maxlength={40}
                                tabIndex={29}
                                label="Mother Email ID"
                                onChange={(e) => {
                                  setFieldValue("motherEmail", e.target.value);
                                  handleUnSavedChanges(1);
                                }}
                                style={{ width: "80%" }}
                              />
                              <TextFieldFormik
                                id="motherMobile"
                                placeholder="Mobile"
                                label="Mother Mobile Number"
                                mandatory={1}
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
                                tabIndex={30}
                                style={{ width: "40%" }}
                              />
                              <TextFieldFormik
                                id="motherQualification"
                                label="Mother Qualification"
                                maxlength={40}
                                tabIndex={31}
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
                                tabIndex={32}
                                onChange={(e) => {
                                  setFieldValue(
                                    "motherOccupation",
                                    preFunction.capitalizeFirst(e.target.value)
                                  );
                                  handleUnSavedChanges(1);
                                }}
                                style={{ width: "80%" }}
                              />
                              <TextFieldFormik
                                id="motherIncome"
                                label="Mother Income"
                                maxlength={7}
                                tabIndex={33}
                                onChange={(e) => {
                                  if (
                                    preFunction.amountValidation(e.target.value)
                                  ) {
                                    setFieldValue(
                                      "motherIncome",
                                      e.target.value
                                    );
                                    handleUnSavedChanges(1);
                                  }
                                }}
                                style={{ width: "40%" }}
                              />
                              <SwitchField
                                label="Add Guardian Detail"
                                yesOption={"Yes"}
                                noOption={"No"}
                                checked={values.isGuardian}
                                value={values.isGuardian}
                                tabIndex={34}
                                onChange={(e) => {
                                  setFieldValue(
                                    "isGuardian",
                                    !values.isGuardian
                                  );
                                  if (!values.isGuardian) {
                                    setFieldValue("guardianName", "");
                                    setFieldValue("guardianEmail", "");
                                    setFieldValue("guardianMobile", "");
                                    setFieldValue("guardianOccupation", "");
                                    setFieldValue("guardianIncome", "");
                                    setFieldValue("guardianQualification", "");
                                  }
                                }}
                              />
                              {values.isGuardian && (
                                <>
                                  <TextFieldFormik
                                    id="guardianName"
                                    maxlength={45}
                                    mandatory={1}
                                    tabIndex={values.isGuardian ? 35 : ""}
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
                                    style={{ width: "80%" }}
                                  />
                                  <TextFieldFormik
                                    id="guardianEmail"
                                    maxlength={40}
                                    tabIndex={values.isGuardian ? 36 : ""}
                                    label="Guardian Email ID"
                                    onChange={(e) => {
                                      setFieldValue(
                                        "guardianEmail",
                                        e.target.value
                                      );
                                      handleUnSavedChanges(1);
                                    }}
                                    style={{ width: "80%" }}
                                  />
                                  <TextFieldFormik
                                    id="guardianMobile"
                                    placeholder="Mobile"
                                    mandatory={1}
                                    tabIndex={values.isGuardian ? 37 : ""}
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
                                        handleUnSavedChanges(1);
                                      }
                                    }}
                                    maxlength={10}
                                    style={{ width: "40%" }}
                                  />
                                  <TextFieldFormik
                                    id="guardianQualification"
                                    label="Guardian Qualification"
                                    maxlength={40}
                                    tabIndex={34}
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
                                    tabIndex={values.isGuardian ? 38 : ""}
                                    onChange={(e) => {
                                      setFieldValue(
                                        "guardianOccupation",
                                        preFunction.capitalizeFirst(
                                          e.target.value
                                        )
                                      );
                                      handleUnSavedChanges(1);
                                    }}
                                    style={{ width: "80%" }}
                                  />
                                  <TextFieldFormik
                                    id="guardianIncome"
                                    label="Guardian Income"
                                    maxlength={7}
                                    tabIndex={values.isGuardian ? 39 : ""}
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
                                        handleUnSavedChanges(1);
                                      }
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
                                tabIndex={values.isGuardian ? 40 : 35}
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
                                tabIndex={values.isGuardian ? 41 : 36}
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
                                tabIndex={values.isGuardian ? 42 : 37}
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
                                tabIndex={values.isGuardian ? 43 : 38}
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
                                    onChange={handleChange}
                                    maxlength={40}
                                    tabIndex={
                                      !otherCity
                                        ? ""
                                        : values.isGuardian
                                        ? 44
                                        : 39
                                    }
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
                                      otherCity
                                        ? ""
                                        : values.isGuardian
                                        ? 44
                                        : 39
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
                                value={values.pinCode > 0 ? values.pinCode : ""}
                                onChange={(e) => {
                                  if (!isNaN(e.target.value))
                                    setFieldValue("pinCode", e.target.value);
                                  handleUnSavedChanges(1);
                                }}
                                style={{ width: "30%" }}
                                maxlength={6}
                                mandatory={1}
                                tabIndex={values.isGuardian ? 45 : 40}
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
                                tabIndex={values.isGuardian ? 46 : 41}
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
                                yesOption="Copied"
                                noOption="Copy from Permanent Address"
                                checked={values.addressCopy}
                                tabIndex={values.isGuardian ? 47 : 42}
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
                                maxlength={45}
                                tabIndex={values.isGuardian ? 48 : 43}
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
                                tabIndex={values.isGuardian ? 49 : 44}
                                label="Address Line 2"
                                onChange={(e) => {
                                  setFieldValue(
                                    "tempAddressline2",
                                    e.target.value
                                  );
                                  handleUnSavedChanges(1);
                                }}
                              />
                              <TextFieldFormik
                                label="Place"
                                maxlength={45}
                                id="tempPlace"
                                mandatory={1}
                                tabIndex={values.isGuardian ? 50 : 45}
                                onChange={(e) => {
                                  setFieldValue("tempPlace", e.target.value);
                                  handleUnSavedChanges(1);
                                }}
                              />
                              <SelectFieldFormik
                                label="State"
                                id="tempState"
                                matchFrom="start"
                                options={stateList}
                                clear={false}
                                getOptionLabel={(option) => option.state}
                                getOptionValue={(option) => option.id}
                                mandatory={1}
                                maxlength={25}
                                tabIndex={values.isGuardian ? 51 : 46}
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
                                    onChange={handleChange}
                                    maxlength={40}
                                    mandatory={1}
                                    tabIndex={
                                      !tempOtherCity
                                        ? ""
                                        : values.isGuardian
                                        ? 52
                                        : 47
                                    }
                                  />
                                </>
                              ) : (
                                <>
                                  <SelectFieldFormik
                                    label="City/District"
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
                                        ? 52
                                        : 47
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
                                tabIndex={values.isGuardian ? 53 : 48}
                              />
                              <SelectFieldFormik
                                label="Country"
                                id="tempCountry"
                                matchFrom="start"
                                options={countryList}
                                clear={false}
                                getOptionLabel={(option) => option.country}
                                getOptionValue={(option) => option.id}
                                mandatory={1}
                                maxlength={15}
                                tabIndex={values.isGuardian ? 54 : 49}
                                onChange={(text) => {
                                  setFieldValue("tempCountry", text);
                                  handleUnSavedChanges(1);
                                }}
                              />
                            </div>
                          </div>
                          <Button
                            tabIndex={values.isGuardian ? 55 : 50}
                            onClick={(e) =>
                              preFunction.handleErrorFocus(errors)
                            }
                            id="communication"
                            text="F4 - Next"
                          />
                        </div>
                      </form>
                    );
                  }}
                </Formik>
              </Tab>
              <Tab eventKey="3" title="Qualification">
                <div className="row no-gutters px-3">
                  <div className="row no-gutters">
                    <div className="subhead-row">
                      <div className="subhead">
                        Previous Qualification Detail
                      </div>
                      <div className="col line-div"></div>
                    </div>
                  </div>

                  <Formik
                    enableReinitialize={true}
                    innerRef={qualificationRef}
                    initialValues={{
                      previousSchoolName: "",
                      previousBoard: "",
                      emisNumber: "",
                      attachTC: "",
                      academicDetails: "",
                    }}
                    validationSchema={QualificationSchema}
                    onSubmit={handleSaveQualification}
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
                          <div className="col-lg-9 pe-2">
                            <TextFieldFormik
                              autoFocus
                              labelSize={4}
                              tabIndex={60}
                              id="previousSchoolName"
                              label="Previous School Name"
                              maxlength={45}
                              mandatory={1}
                              onChange={(e) => {
                                handleUnSavedChanges(1);
                                setFieldValue(
                                  "previousSchoolName",
                                  preFunction.capitalizeFirst(e.target.value)
                                );
                                setUnSavedChanges(true);
                              }}
                            />
                            <TextFieldFormik
                              autoFocus
                              labelSize={4}
                              tabIndex={61}
                              id="previousBoard"
                              label="Previous Board"
                              maxlength={45}
                              mandatory={1}
                              onChange={(e) => {
                                handleUnSavedChanges(1);
                                setFieldValue(
                                  "previousBoard",
                                  preFunction.capitalizeFirst(e.target.value)
                                );
                                setUnSavedChanges(true);
                              }}
                            />
                            <TextFieldFormik
                              tabIndex={62}
                              labelSize={4}
                              id="emisNumber"
                              label="EMIS / UDISE Number"
                              placeholder={"TC Number"}
                              onChange={(e) => {
                                if (
                                  preFunction.amountValidation(e.target.value)
                                ) {
                                  handleUnSavedChanges(1);

                                  setFieldValue("emisNumber", e.target.value);
                                }
                              }}
                              maxlength={7}
                              style={{ width: "50%" }}
                            />
                            <FileField
                              label="Attach TC"
                              labelSize={4}
                              type="file"
                              tabIndex={63}
                              ref={fileInputRef}
                              id="attachTC"
                              accept=".pdf, image/*"
                              // style={{ width: "90%" }}
                              onChange={(e) => {
                                setFieldValue("attachTC", "");
                                if (e.target.files[0]) {
                                  setFieldValue("attachTC", e.target.value);
                                  handleFileUpload(e);
                                }
                              }}
                              error={errors.attachTC}
                              touched={touched.attachTC}
                            />
                            {uploadedTC && (
                              <div className="row col-12">
                                <div className="col-3"></div>
                                <div
                                  className="col-9 mt-2"
                                  style={{ paddingInlineStart: "53px" }}
                                >
                                  <a
                                    href="javascript:void(0)"
                                    onClick={(e) => {
                                      window.open(
                                        string.FILEURL + uploadedTC,
                                        "_blank"
                                      );
                                    }}
                                  >
                                    View TC
                                  </a>
                                </div>
                              </div>
                            )}
                            <TextAreaFieldFormik
                              tabIndex={64}
                              labelSize={4}
                              id="academicDetails"
                              label="Academic Details"
                              placeholder="Academic Details"
                              maxlength={200}
                              onChange={(e) => {
                                setFieldValue(
                                  "academicDetails",
                                  e.target.value
                                );

                                handleUnSavedChanges(1);
                              }}
                            />
                          </div>

                          <div className="p-3 text-center">
                            <Button
                              frmButton={false}
                              tabIndex={65}
                              id="qualification"
                              text="F4 - Save"
                              onClick={() =>
                                preFunction.handleErrorFocus(errors)
                              }
                            />
                            &nbsp;&nbsp;
                            <Button
                              frmButton={false}
                              type="button"
                              tabIndex={66}
                              id="qualification"
                              text="Skip"
                              onClick={() => {
                                navigate("/view-school-student", {
                                  state: {
                                    enrollNumber: location?.state?.enrollNumber,
                                  },
                                });
                              }}
                            />
                          </div>
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

export default EditSchoolStudent;
