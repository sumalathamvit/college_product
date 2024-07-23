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
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import $ from "jquery";

import StudentApi from "../../api/StudentApi";

import CommonApi from "../../component/common/CommonApi";
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
import { allowedFileExtensions } from "../../component/common/CommonArray";
import TextAreaFieldFormik from "../../component/FormField/TextareaFieldFormik";
import FileField from "../../component/FormField/FileField";
import DisplayText from "../../component/FormField/DisplayText";

import photo from "../../assests/png/camera.png";
import blankProfile from "../../assests/png/blank-profile-picture.png";

import AuthContext from "../../auth/context";

import string from "../../string";

import "react-image-crop/dist/ReactCrop.css";

let otherCity = false;
let tempOtherCity = false;

function AddSchoolStudent() {
  //#region const
  const RENAME = useSelector((state) => state.web.rename);
  const navigate = useNavigate();
  const fileInputRef = createRef();
  const [load, setLoad] = useState(false);
  const [studentId, setStudentId] = useState();
  const location = useLocation();
  const [defaultActiveKey, setDefaultActiveKey] = useState("1");
  const [communicationId, setCommunicationID] = useState("");
  const [oldAddressArray, setOldAddressArray] = useState("");
  const [activeStatus, setActiveStatus] = useState(false);

  // Personal Data ----
  const [genderList, setGenderList] = useState([]);
  const [communityList, setCommunityList] = useState([]);
  const [classList, setClassList] = useState([]);
  const [religionList, setReligionList] = useState([]);
  const [nationalityList, setNationalityList] = useState([]);
  const [bloodGroupList, setBloodGroupList] = useState([]);

  const [boardList, setBoardList] = useState([]);
  const [admissionTypeList, setAdmissionTypeList] = useState([]);
  const [cityList, setCityList] = useState([]);
  const [tempCityList, setTempCityList] = useState([]);
  const [stateList, setStateList] = useState([]);
  const [countryList, setCountryList] = useState([]);
  const [displayImage, setDisplayImage] = useState(blankProfile);
  const [studentList, setStudentList] = useState([]);
  const [empCodeList, setEmpCodeList] = useState([]);

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
  const collegeConfig = useSelector((state) => state.web.college);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [studentNumber, setStudentNumber] = useState();
  const [confirmMessage, setConfirmMessage] = useState();
  const [saveDraftError, setSaveDraftError] = useState();
  const [saveDraftMessage, setSaveDraftMessage] = useState();
  const [siblingData, setSiblingData] = useState();
  const [staffData, setStaffData] = useState();

  const [documentProof, setDocumentProof] = useState();
  const [tcFileType, setTCFileType] = useState();
  const [onChangeTc, setOnChangeTc] = useState(false);
  const [uploadedTC, setUploadedTC] = useState();
  const [openConfirmEmailModel, setOpenConfirmEmailModel] = useState(false);
  const [studentEmail, setStudentEmail] = useState("");

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
    studentEmail: emailValidation,
    // aadhaar: Yup.number()
    //   .test(
    //     "is-twelve-digits",
    //     "Aadhaar Number must be exactly 12 digits",
    //     (value) => /^[0-9]{12}$/.test(String(value))
    //   )
    //   .required("Please enter Aadhaar Number"),
    aadhaar: optionalAadhaarValidation,
    nationality: Yup.object().required("Please select Nationality"),
    religion: Yup.object().required("Please select Religion"),
    // community: Yup.object().required("Please select Community"),
    // avoid Slash in medicalDetails:
    // medicalDetails: Yup.string()
    //   .matches(/^[A-Za-z0-9@. ]+$/, "Please enter valid Medical Details")
    //   .trim(),

    course: Yup.object().required("Please select " + RENAME?.course),
    class: Yup.object().required("Please select " + RENAME?.sem),
    admissionType: Yup.object().required("Please select Admission Type"),
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

  const QualificationSchema = Yup.object().shape({
    previousSchoolName: Yup.string()
      .min(3, "Must be at least 3 characters long")
      .required("Please enter Previous School Name")
      .trim(),
    previousBoard: Yup.string()
      .min(3, "Must be at least 3 characters long")
      .required("Please enter Previous " + RENAME?.course)
      .trim(),
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
      setLoad(false);

      return false;
    }
    if (!allowedFileExtensions.includes(e.target.files[0].name.split(".")[1])) {
      setModalErrorOpen(true);
      setModalMessage("Please upload pdf, jpeg, jpg, png file only");
      setModalTitle("File Type");
      setLoad(false);
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

  const searchStudent = async (value) => {
    setStudentList(await CommonApi.searchStudent(value));
  };

  const searchEmployee = async (text) => {
    setEmpCodeList(await CommonApi.searchEmployee(text));
  };

  const handleConfirmSubmission = async () => {
    if (load) return;
    if (studentId) {
      const studentAddrRes = await StudentApi.editStudent(
        studentId,
        3,
        collegeConfig.institution_type
      );
      console.log("studentAddrRes---", studentAddrRes);

      if (studentAddrRes.data.message.data.student_communication.length == 0) {
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
      setLoad(false);
      return;
    } catch (error) {
      setLoad(false);
      console.log("Exception---", error);
    }
  };

  const handleClearAllForms = () => {
    console.log("testing handleClear---");
    formikRef?.current?.resetForm();
    addressRef.current.resetForm();
    location.state = null;
    console.log("saveDraftMessage---", saveDraftMessage);

    handleUnSavedChanges(0);
    setLoad(false);
    setStudentId();
    setDefaultActiveKey("1");
    setCommunicationID("");
    setOldAddressArray("");
    setStudentEmail("");
    setStudentNumber("");
    setDisplayImage(blankProfile);
    setShowImg(false);
    setPhotoMessage("");
    setonChangeImage(false);
    setOnChangeTc(false);
    setSrc();
    setFileType();
    setTCFileType();
    setCropOpen(false);
    setOpenModal(false);
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
    setSaveDraftError(false);

    setSaveDraftMessage();
    setSiblingData();
    setStaffData();

    setDocumentProof();
    setTCFileType();
    setOnChangeTc(false);
    setUploadedTC();
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

  const setFieldValueFromOutside = async (
    dbValues,
    personalMasterRes = null
  ) => {
    console.log("dbValues----", dbValues);
    setStudentNumber(dbValues.enrollNo);
    if (formikRef.current) {
      formikRef?.current?.setFieldValue("studentName", dbValues.name);
      formikRef?.current?.setFieldValue("fatherName", dbValues.fatherName);
      if (dbValues.DOB) {
        formikRef?.current?.setFieldValue(
          "dateofBirth",
          new Date(dbValues.DOB)
        );
      }
      formikRef?.current?.setFieldValue("gender", {
        id: dbValues.genderID,
        gender: dbValues.gender,
      });
      if (
        dbValues.email &&
        dbValues.email != dbValues.enrollNo + "@gmail.com"
      ) {
        formikRef?.current?.setFieldValue("studentEmail", dbValues.email);
      }
      dbValues.studentMobile &&
        formikRef?.current?.setFieldValue(
          "studentMobile",
          dbValues.studentMobile
        );

      if (dbValues.bloodGroup) {
        formikRef?.current?.setFieldValue("bloodGroup", {
          id: dbValues.bloodGroupID,
          bloodGroup: dbValues.bloodGroup,
        });
      }
      dbValues.aadhaar &&
        formikRef?.current?.setFieldValue("aadhaar", dbValues.aadhaar);
      formikRef?.current?.setFieldValue("nationality", {
        id: dbValues.nationalityID,
        nationality: dbValues.nationality,
      });
      formikRef?.current?.setFieldValue("religion", {
        id: dbValues.religionID,
        religion: dbValues.religion,
      });
      dbValues.communityID &&
        formikRef?.current?.setFieldValue("community", {
          id: dbValues.communityID,
          community: dbValues.community,
        });
      if (dbValues.medicalHistory) {
        formikRef?.current?.setFieldValue(
          "medicalDetails",
          dbValues.medicalHistory
        );
      }
      formikRef?.current?.setFieldValue(
        "applicationNumber",
        dbValues.applicationNo
      );
      if (dbValues.previousSchoolName) {
        formikRef?.current?.setFieldValue(
          "previousSchoolName",
          dbValues.previousSchoolName
        );
      }
      if (dbValues.previousTCNo) {
        formikRef?.current?.setFieldValue("emisNumber", dbValues.previousTCNo);
      }

      let admTypList = [],
        crsLst = [],
        stdLst = [];
      console.log("personalMasterRes---", personalMasterRes);
      if (personalMasterRes) {
        admTypList = personalMasterRes.data.message.data.admission_type_data;
        crsLst = personalMasterRes.data.message.data.course_data;
        const masterRes = await StudentApi.getMaster(
          8,
          collegeId,
          dbValues.courseID
        );
        console.log("masterRes---", masterRes);
        stdLst = masterRes.data.message.data.semester_data;
      } else {
        admTypList = admissionTypeList;
        crsLst = boardList;
        stdLst = classList;
      }
      for (let i = 0; i < admTypList.length; i++) {
        if (admTypList[i].id === dbValues.admissionTypeID) {
          formikRef?.current?.setFieldValue("admissionType", admTypList[i]);
          break;
        }
      }

      for (let i = 0; i < crsLst.length; i++) {
        if (crsLst[i].id === dbValues.courseID) {
          formikRef?.current?.setFieldValue("course", crsLst[i]);
          getClassData(crsLst[i]);
          break;
        }
      }
      console.log("stdLst---", stdLst);
      for (let i = 0; i < stdLst.length; i++) {
        if (stdLst[i].semester === dbValues.semester) {
          formikRef?.current?.setFieldValue("class", stdLst[i]);
          break;
        }
      }
      if (dbValues.photo) {
        setDisplayImage(string.FILEURL + dbValues.photo);
      }
      if (dbValues.previousTCPath) {
        setUploadedTC(dbValues.previousTCPath);
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
    console.log("values----", values);
    setUnSavedChanges(false);

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
        studentNumber ?? null,
        values.studentName.replace(/\s\s+/g, " ").trim(),
        values.fatherName.replace(/\s\s+/g, " ").trim(),
        values.studentEmail != "" ? values.studentEmail : null,
        imageUrl ?? null,
        values.studentEmail != "" ? values.studentEmail : null,
        moment(values.dateofBirth).format("YYYY-MM-DD"),
        values.studentMobile ? values.studentMobile : null,
        values.gender.id,
        values.gender.gender,
        values.bloodGroup ? values.bloodGroup.id : null,
        values.bloodGroup ? values.bloodGroup.bloodGroup : null,
        values.community ? values.community.id : null,
        values.community ? values.community.community : null,
        values.religion.id,
        values.religion.religion,
        values.nationality.id,
        values.nationality.nationality,
        values.aadhaar ? values.aadhaar : null,
        values.medicalDetails != ""
          ? values.medicalDetails.replace(/\s\s+/g, " ").trim()
          : null,
        values.applicationNumber
          ? values.applicationNumber.replace(/\s\s+/g, " ").trim()
          : null,
        values.admissionType.id,
        values.course.id,
        values.class.semester,
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
      handleUnSavedChanges(0);
      setStudentId(personalRes.data.message.data.studentID);
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
        values.fatherEmail != "" ? values.fatherEmail : null,
        values.fatherOccupation != ""
          ? values.fatherOccupation.replace(/\s\s+/g, " ").trim()
          : null,
        values.fatherQualification != ""
          ? values.fatherQualification.replace(/\s\s+/g, " ").trim()
          : null,
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
      setSaveDraftMessage(communicationRes.data.message.message);
      setCommunicationID(communicationRes.data.message.id);
      handleUnSavedChanges(0);
      handleTabChange("3", true);
      setSaveDraftError(false);
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

  const setQualificationFieldValue = async (values) => {
    console.log("values----", values);
    setSaveDraftError(false);
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

  const handleSaveQualification = async (values) => {
    if (load) return;
    try {
      console.log("values---", values);
      setLoad(true);
      let tcUrl = null;
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
          tcUrl,
          values.academicDetails ? values.academicDetails : null
        );
      console.log("saveQualification", saveQualificationRes);
      if (!saveQualificationRes.data.message.success) {
        setModalMessage(saveQualificationRes.data.message.message);
        setModalErrorOpen(true);
        setModalTitle("Message");
        setLoad(false);
        return;
      }
      handleUnSavedChanges(0);
      if (activeStatus) {
        toast.success("Student details updated successfully");
        navigate("/view-school-student", { state: { id: studentId } });
        return;
      }
      setSaveDraftError(false);
      document.getElementById("saveDraft")?.focus();
      handleUnSavedChanges(0);
      setLoad(false);
    } catch (error) {
      setLoad(false);
      console.log("Exception---", error);
    }
  };

  const getClassData = async (course) => {
    console.log("course---", course);
    const personalMasterRes = await StudentApi.getMaster(
      8,
      collegeId,
      course.id
    );
    console.log("personalMasterRes----", personalMasterRes);
    setClassList(personalMasterRes.data.message.data.semester_data);
  };

  const handleTabChange = async (key, leavepage) => {
    console.log("Saving Draft---", key);
    setTabKey(key);
    if (leavepage != true && unSavedChanges) {
      setOpenLeavePageModel(true);
      console.log("leavepage---", leavepage);
      return;
    }
    setDefaultActiveKey(key);
    console.log("collegeConfig---", collegeConfig);
    if (key == "1") {
      setLoad(true);
      console.log("Saving Draft---");
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
      setCommunityList(personalMasterRes.data.message.data.community_data);
      setBoardList(personalMasterRes.data.message.data.course_data);
      if (personalMasterRes.data.message.data.course_data.length === 1) {
        formikRef?.current?.setFieldValue(
          "course",
          personalMasterRes.data.message.data.course_data[0]
        );
        getClassData(personalMasterRes.data.message.data.course_data[0]);
      }
      setAdmissionTypeList(
        personalMasterRes.data.message.data.admission_type_data
      );
      if (
        personalMasterRes.data.message.data.admission_type_data.length === 1
      ) {
        formikRef?.current?.setFieldValue(
          "admissionType",
          personalMasterRes.data.message.data.admission_type_data[0]
        );
      }
      if (location?.state?.id) {
        const studentRes = await StudentApi.editStudent(
          location?.state?.id,
          1,
          collegeConfig.institution_type
        );
        console.log("Student Detail---", studentRes);
        console.log("Status---", studentRes.data.message.data[0].isActive);
        setActiveStatus(studentRes.data.message.data[0].isActive);
        if (!studentRes.data.message.success) {
          setModalMessage(studentRes.data.message.message);
          setModalErrorOpen(true);
          setModalTitle("Message");
          setLoad(false);
          return;
        }

        setFieldValueFromOutside(
          studentRes.data.message.data[0],
          personalMasterRes
        );
      }
      setLoad(false);
    } else if (key == "2") {
      setLoad(true);
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
      setLoad(false);
    }

    if (studentId) {
      setLoad(true);
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
        if (studentRes.data.message.data.student_communication[0]) {
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
          // setSaveDraftError(true);
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
      setLoad(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e?.key === "F4") {
      e?.preventDefault();
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
                    nationality: "",
                    religion: "",
                    community: "",
                    medicalDetails: "",
                    applicationNumber: "",
                    course: "",
                    class: "",
                    admissionType: "",
                    previousSchoolName: "",
                    emisNumber: "",
                    attachTC: "",
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
                              <TextFieldFormik
                                tabIndex={6}
                                labelSize={4}
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
                                    preFunction.amountValidation(e.target.value)
                                  )
                                    setFieldValue(
                                      "studentMobile",
                                      e.target.value
                                    );
                                  handleUnSavedChanges(1);
                                }}
                                maxlength={10}
                                style={{ width: "40%" }}
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
                                label="Community"
                                id="community"
                                maxlength={15}
                                matchFrom="start"
                                clear={true}
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
                                tabIndex={11}
                                labelSize={4}
                                id="medicalDetails"
                                label="Medical Details"
                                placeholder="Medical Details"
                                maxlength={200}
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
                              {activeStatus ? (
                                <>
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
                                </>
                              ) : (
                                <>
                                  <TextFieldFormik
                                    labelSize={4}
                                    tabIndex={12}
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
                                  <SelectFieldFormik
                                    labelSize={4}
                                    tabIndex={13}
                                    mandatory={1}
                                    id="course"
                                    label={RENAME?.course}
                                    maxlength={20}
                                    options={boardList}
                                    getOptionLabel={(option) =>
                                      option.courseName
                                    }
                                    getOptionValue={(option) => option.id}
                                    onChange={(text) => {
                                      setFieldValue("course", text);
                                      setFieldValue("class", "");
                                      handleUnSavedChanges(1);
                                      getClassData(text);
                                    }}
                                  />
                                  <SelectFieldFormik
                                    labelSize={4}
                                    tabIndex={14}
                                    mandatory={1}
                                    id="class"
                                    label={RENAME?.sem}
                                    maxlength={20}
                                    options={classList}
                                    getOptionLabel={(option) =>
                                      option.className
                                    }
                                    getOptionValue={(option) => option.semester}
                                    onChange={(text) => {
                                      setFieldValue("class", text);
                                      handleUnSavedChanges(1);
                                    }}
                                    style={{ width: "50%" }}
                                  />

                                  <SelectFieldFormik
                                    label="Admission Type"
                                    placeholder="Type"
                                    labelSize={4}
                                    id="admissionType"
                                    matchFrom="start"
                                    tabIndex={15}
                                    mandatory={1}
                                    maxlength={15}
                                    options={admissionTypeList}
                                    getOptionLabel={(option) =>
                                      option.admissionType
                                    }
                                    getOptionValue={(option) => option.id}
                                    style={{ width: "50%" }}
                                    onChange={(text) => {
                                      setFieldValue("admissionType", text);
                                      handleUnSavedChanges(1);
                                    }}
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
                title="Communication"
                disabled={location?.state?.id ? false : true}
              >
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
                    motherEmail: "",
                    motherQualification: "",
                    motherOccupation: "",
                    motherIncome: "",
                    guardianName: "",
                    guardianMobile: "",
                    guardianEmail: "",
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
                          <div className="col-lg-9 pe-2">
                            {siblingData || staffData ? (
                              <>
                                <div className="subhead-row">
                                  <div className="subhead">
                                    Concession Detail
                                  </div>
                                  <div className="col line-div"></div>
                                </div>
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
                              </>
                            ) : activeStatus ? null : (
                              <>
                                <SwitchField
                                  label="Sibling Concession?"
                                  yesOption={"Yes"}
                                  noOption={"No"}
                                  checked={values.isSibling}
                                  value={values.isSibling}
                                  onChange={(val) => {
                                    setFieldValue(
                                      "isSibling",
                                      !values.isSibling
                                    );
                                    val &&
                                      setFieldValue("isChildOfStaff", false);
                                    handleUnSavedChanges(1);
                                    //setSaveDraftError(false);
                                    setFieldValue("sibling", "");
                                  }}
                                />
                                {values.isSibling && (
                                  <SelectFieldFormik
                                    autoFocus
                                    label="Sibling No. / Name"
                                    id="sibling"
                                    tabIndex="20"
                                    mandatory={1}
                                    maxlength={40}
                                    clear={false}
                                    searchIcon={true}
                                    options={studentList}
                                    getOptionLabel={(option) => option.name}
                                    getOptionValue={(option) => option.id}
                                    onInputChange={(inputValue) => {
                                      searchStudent(inputValue);
                                    }}
                                    onChange={(text) => {
                                      setFieldValue("sibling", text);
                                      handleUnSavedChanges(1);
                                      //setSaveDraftError(false);
                                      // handleGetCommunication(text);
                                    }}
                                  />
                                )}
                                <SwitchField
                                  label="Staff Concession?"
                                  yesOption={"Yes"}
                                  noOption={"No"}
                                  checked={values.isChildOfStaff}
                                  value={values.isChildOfStaff}
                                  onChange={(val) => {
                                    setFieldValue(
                                      "isChildOfStaff",
                                      !values.isChildOfStaff
                                    );
                                    val && setFieldValue("isSibling", false);
                                    handleUnSavedChanges(1);
                                    //setSaveDraftError(false);
                                    setFieldValue("staff", "");
                                    // handleGetCommunication(val);
                                  }}
                                />
                                {values.isChildOfStaff && (
                                  <SelectFieldFormik
                                    autoFocus
                                    label="Employee No. / Name"
                                    id="employeeCode"
                                    mandatory={1}
                                    options={empCodeList}
                                    tabIndex="20"
                                    searchIcon={true}
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
                                      setFieldValue("staff", text);
                                      handleUnSavedChanges(1);
                                      //setSaveDraftError(false);
                                    }}
                                  />
                                )}
                              </>
                            )}
                          </div>
                          <div className="subhead-row">
                            <div className="subhead">Communication Detail</div>
                            <div className="col line-div"></div>
                          </div>

                          <div className="row no-gutters">
                            <div className="col-lg-9 pe-2">
                              <TextFieldFormik
                                autoFocus
                                maxlength={40}
                                tabIndex={21}
                                id="fatherEmail"
                                label="Father Email ID"
                                placeholder="Father Email ID"
                                onChange={(e) => {
                                  setFieldValue("fatherEmail", e.target.value);
                                  handleUnSavedChanges(1);
                                  //setSaveDraftError(false);
                                }}
                                style={{ width: "70%" }}
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
                                  handleUnSavedChanges(1);
                                  //setSaveDraftError(false);
                                }}
                                maxlength={10}
                                tabIndex={22}
                                style={{ width: "40%" }}
                              />
                              <TextFieldFormik
                                id="fatherQualification"
                                label="Father Qualification"
                                maxlength={40}
                                tabIndex={23}
                                onChange={(e) => {
                                  setFieldValue(
                                    "fatherQualification",
                                    e.target.value
                                  );
                                  handleUnSavedChanges(1);
                                  //setSaveDraftError(false);
                                }}
                                style={{ width: "70%" }}
                              />
                              <TextFieldFormik
                                id="fatherOccupation"
                                label="Father Occupation"
                                maxlength={40}
                                tabIndex={24}
                                onChange={(e) => {
                                  setFieldValue(
                                    "fatherOccupation",
                                    e.target.value
                                  );
                                  handleUnSavedChanges(1);
                                  //setSaveDraftError(false);
                                }}
                                style={{ width: "70%" }}
                              />
                              <TextFieldFormik
                                id="fatherIncome"
                                label="Father Income"
                                maxlength={7}
                                tabIndex={25}
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
                                  //setSaveDraftError(false);
                                }}
                                style={{ width: "40%" }}
                              />
                              <TextFieldFormik
                                id="motherName"
                                label="Mother Name"
                                maxlength={45}
                                mandatory={1}
                                tabIndex={26}
                                onChange={(e) => {
                                  setFieldValue(
                                    "motherName",
                                    preFunction.capitalizeFirst(e.target.value)
                                  );
                                  handleUnSavedChanges(1);
                                  //setSaveDraftError(false);
                                }}
                                style={{ width: "70%" }}
                              />
                              <TextFieldFormik
                                id="motherEmail"
                                maxlength={40}
                                tabIndex={27}
                                label="Mother Email ID"
                                onChange={(e) => {
                                  setFieldValue("motherEmail", e.target.value);
                                  handleUnSavedChanges(1);
                                  //setSaveDraftError(false);
                                }}
                                style={{ width: "70%" }}
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
                                  }
                                  handleUnSavedChanges(1);
                                  //setSaveDraftError(false);
                                }}
                                maxlength={10}
                                tabIndex={28}
                                style={{ width: "40%" }}
                              />
                              <TextFieldFormik
                                id="motherQualification"
                                label="Mother Qualification"
                                maxlength={40}
                                tabIndex={29}
                                onChange={(e) => {
                                  setFieldValue(
                                    "motherQualification",
                                    e.target.value
                                  );
                                  handleUnSavedChanges(1);
                                  //setSaveDraftError(false);
                                }}
                                style={{ width: "70%" }}
                              />
                              <TextFieldFormik
                                id="motherOccupation"
                                label="Mother Occupation"
                                maxlength={40}
                                tabIndex={30}
                                onChange={(e) => {
                                  setFieldValue(
                                    "motherOccupation",
                                    e.target.value
                                  );
                                  handleUnSavedChanges(1);
                                  //setSaveDraftError(false);
                                }}
                                style={{ width: "70%" }}
                              />
                              <TextFieldFormik
                                id="motherIncome"
                                label="Mother Income"
                                maxlength={7}
                                tabIndex={31}
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
                                  //setSaveDraftError(false);
                                }}
                                style={{ width: "40%" }}
                              />
                              <SwitchField
                                label="Add Guardian Detail"
                                yesOption={"Yes"}
                                noOption={"No"}
                                checked={values.isGuardian}
                                value={values.isGuardian}
                                tabIndex={32}
                                onChange={(e) => {
                                  setFieldValue(
                                    "isGuardian",
                                    !values.isGuardian
                                  );
                                  handleUnSavedChanges(1);
                                  //setSaveDraftError(false);
                                  setFieldValue("guardianName", "");
                                  setFieldValue("guardianEmail", "");
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
                                    tabIndex={33}
                                    label="Guardian Name"
                                    onChange={(e) => {
                                      setFieldValue(
                                        "guardianName",
                                        preFunction.capitalizeFirst(
                                          e.target.value
                                        )
                                      );
                                      handleUnSavedChanges(1);
                                      //setSaveDraftError(false);
                                    }}
                                    style={{ width: "70%" }}
                                  />
                                  <TextFieldFormik
                                    id="guardianEmail"
                                    maxlength={40}
                                    tabIndex={34}
                                    label="Guardian Email ID"
                                    onChange={(e) => {
                                      setFieldValue(
                                        "guardianEmail",
                                        e.target.value
                                      );
                                      handleUnSavedChanges(1);
                                      //setSaveDraftError(false);
                                    }}
                                    style={{ width: "70%" }}
                                  />
                                  <TextFieldFormik
                                    id="guardianMobile"
                                    placeholder="Mobile"
                                    mandatory={1}
                                    tabIndex={35}
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
                                      //setSaveDraftError(false);
                                    }}
                                    maxlength={10}
                                    style={{ width: "40%" }}
                                  />
                                  <TextFieldFormik
                                    id="guardianQualification"
                                    label="Guardian Qualification"
                                    maxlength={40}
                                    tabIndex={36}
                                    onChange={(e) => {
                                      setFieldValue(
                                        "guardianQualification",
                                        e.target.value
                                      );
                                      handleUnSavedChanges(1);
                                      //setSaveDraftError(false);
                                    }}
                                    style={{ width: "70%" }}
                                  />
                                  <TextFieldFormik
                                    id="guardianOccupation"
                                    label="Guardian Occupation"
                                    maxlength={40}
                                    tabIndex={37}
                                    onChange={(e) => {
                                      setFieldValue(
                                        "guardianOccupation",
                                        e.target.value
                                      );
                                      handleUnSavedChanges(1);
                                      //setSaveDraftError(false);
                                    }}
                                    style={{ width: "70%" }}
                                  />
                                  <TextFieldFormik
                                    id="guardianIncome"
                                    label="Guardian Income"
                                    maxlength={7}
                                    tabIndex={38}
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
                                      //setSaveDraftError(false);
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
                                tabIndex={values.isGuardian ? 39 : 33}
                                onChange={(e) => {
                                  setFieldValue("addressline1", e.target.value);
                                  handleUnSavedChanges(1);
                                  //setSaveDraftError(false);
                                }}
                                mandatory={1}
                              />

                              <TextFieldFormik
                                id="addressline2"
                                label="Address Line 2"
                                maxlength={45}
                                tabIndex={values.isGuardian ? 40 : 34}
                                onChange={(e) => {
                                  setFieldValue("addressline2", e.target.value);
                                  handleUnSavedChanges(1);
                                  //setSaveDraftError(false);
                                }}
                              />

                              <TextFieldFormik
                                label="Place"
                                id="place"
                                maxlength={45}
                                mandatory={1}
                                tabIndex={values.isGuardian ? 41 : 35}
                                onChange={(e) => {
                                  setFieldValue("place", e.target.value);
                                  handleUnSavedChanges(1);
                                  //setSaveDraftError(false);
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
                                tabIndex={values.isGuardian ? 42 : 36}
                                onChange={(text) => {
                                  setFieldValue("state", text);
                                  setFieldValue("city", "");
                                  handleCityByState(text);
                                  handleUnSavedChanges(1);
                                  //setSaveDraftError(false);
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
                                      //setSaveDraftError(false);
                                    }}
                                    maxlength={40}
                                    tabIndex={values.isGuardian ? 43 : 37}
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
                                      values.isGuardian && !otherCity ? 43 : 37
                                    }
                                    // tabIndex={
                                    //   otherCity
                                    //     ? ""
                                    //     : values.isGuardian
                                    //     ? 41
                                    //     : 36
                                    // }
                                    getOptionLabel={(option) => option.city}
                                    getOptionValue={(option) => option.id}
                                    mandatory={1}
                                    maxlength={25}
                                    onChange={(text) => {
                                      setFieldValue("city", text);
                                      handleUnSavedChanges(1);
                                      //setSaveDraftError(false);
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
                                  //setSaveDraftError(false);
                                }}
                                style={{ width: "30%" }}
                                maxlength={6}
                                mandatory={1}
                                tabIndex={values.isGuardian ? 44 : 38}
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
                                tabIndex={values.isGuardian ? 45 : 39}
                                maxlength={15}
                                onChange={(text) => {
                                  setFieldValue("country", text);
                                  handleUnSavedChanges(1);
                                  //setSaveDraftError(false);
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
                                tabIndex={values.isGuardian ? 46 : 40}
                                onChange={(e) => {
                                  setFieldValue(
                                    "addressCopy",
                                    !values.addressCopy
                                  );
                                  setTemporaryAddress(values);
                                  handleUnSavedChanges(1);
                                  //setSaveDraftError(false);
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
                                tabIndex={values.isGuardian ? 47 : 41}
                                onChange={(e) => {
                                  setFieldValue(
                                    "tempAddressline1",
                                    e.target.value
                                  );
                                  handleUnSavedChanges(1);
                                  //setSaveDraftError(false);
                                }}
                                mandatory={1}
                              />

                              <TextFieldFormik
                                id="tempAddressline2"
                                maxlength={45}
                                tabIndex={values.isGuardian ? 48 : 42}
                                label="Address Line 2"
                                onChange={(e) => {
                                  setFieldValue(
                                    "tempAddressline2",
                                    e.target.value
                                  );
                                  handleUnSavedChanges(1);
                                  //setSaveDraftError(false);
                                }}
                              />

                              <TextFieldFormik
                                label="Place"
                                maxlength={45}
                                id="tempPlace"
                                mandatory={1}
                                tabIndex={values.isGuardian ? 49 : 43}
                                onChange={(e) => {
                                  setFieldValue("tempPlace", e.target.value);
                                  handleUnSavedChanges(1);
                                  //setSaveDraftError(false);
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
                                tabIndex={values.isGuardian ? 50 : 44}
                                onChange={(text) => {
                                  setFieldValue("tempState", text);
                                  setFieldValue("tempCity", "");
                                  handleTempCityByState(text);
                                  handleUnSavedChanges(1);
                                  //setSaveDraftError(false);
                                }}
                              />
                              {tempOtherCity ? (
                                <>
                                  <TextFieldFormik
                                    id="tempOtherCity"
                                    label="City"
                                    onChange={(e) => {
                                      setFieldValue(
                                        "tempOtherCity",
                                        e.target.value
                                      );
                                      handleUnSavedChanges(1);
                                      //setSaveDraftError(false);
                                    }}
                                    maxlength={40}
                                    mandatory={1}
                                    tabIndex={
                                      values.isGuardian && tempOtherCity
                                        ? 51
                                        : 45
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
                                      values.isGuardian && !tempOtherCity
                                        ? 51
                                        : 45
                                    }
                                    onChange={(text) => {
                                      setFieldValue("tempCity", text);
                                      handleUnSavedChanges(1);
                                      //setSaveDraftError(false);
                                    }}
                                  />
                                </>
                              )}

                              <TextFieldFormik
                                id="tempPinCode"
                                label="Pincode"
                                placeholder={" "}
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
                                  //setSaveDraftError(false);
                                }}
                                style={{ width: "30%" }}
                                maxlength={6}
                                mandatory={1}
                                tabIndex={values.isGuardian ? 52 : 46}
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
                                tabIndex={values.isGuardian ? 53 : 47}
                                onChange={(text) => {
                                  setFieldValue("tempCountry", text);
                                  handleUnSavedChanges(1);
                                  //setSaveDraftError(false);
                                }}
                              />
                            </div>
                          </div>
                          <Button
                            className={"btn me-2"}
                            tabIndex={values.isGuardian ? 54 : 48}
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
                title="Qualification"
                disabled={location?.state?.id ? false : true}
              >
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
                          <div className="row no-gutters">
                            <div className="col-lg-9 pe-2">
                              <TextFieldFormik
                                autoFocus
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
                                  setSaveDraftError(true);
                                }}
                              />
                              <TextFieldFormik
                                autoFocus
                                tabIndex={61}
                                id="previousBoard"
                                label={"Previous " + RENAME?.course}
                                maxlength={45}
                                mandatory={1}
                                onChange={(e) => {
                                  handleUnSavedChanges(1);
                                  setFieldValue(
                                    "previousBoard",
                                    preFunction.capitalizeFirst(e.target.value)
                                  );
                                  setUnSavedChanges(true);
                                  setSaveDraftError(true);
                                }}
                              />
                              <TextFieldFormik
                                tabIndex={62}
                                id="emisNumber"
                                label="EMIS / UDISE Number"
                                placeholder={"TC Number"}
                                onChange={(e) => {
                                  if (
                                    preFunction.amountValidation(e.target.value)
                                  ) {
                                    handleUnSavedChanges(1);
                                    setSaveDraftError(true);
                                    setFieldValue("emisNumber", e.target.value);
                                  }
                                }}
                                maxlength={7}
                                style={{ width: "50%" }}
                              />
                              <FileField
                                label="Attach TC"
                                type="file"
                                tabIndex={63}
                                ref={fileInputRef}
                                id="attachTC"
                                accept=".pdf, image/*"
                                onChange={(e) => {
                                  setFieldValue("attachTC", "");
                                  if (e.target.files[0]) {
                                    setFieldValue("attachTC", e.target.value);
                                    handleFileUpload(e);
                                    setSaveDraftError(true);
                                  }
                                }}
                                error={errors.attachTC}
                                touched={touched.attachTC}
                              />
                              {uploadedTC && (
                                <DisplayText
                                  label=" "
                                  style={{ marginTop: "-10px" }}
                                  value={
                                    <a
                                      href={string.FILEURL + uploadedTC}
                                      target="_blank"
                                    >
                                      View TC
                                    </a>
                                  }
                                />
                              )}
                              <TextAreaFieldFormik
                                tabIndex={64}
                                id="academicDetails"
                                label="Academic Details"
                                maxlength={200}
                                onChange={(e) => {
                                  setFieldValue(
                                    "academicDetails",
                                    e.target.value
                                  );
                                  setSaveDraftError(true);
                                  handleUnSavedChanges(1);
                                }}
                              />
                            </div>
                          </div>
                          {activeStatus || saveDraftError ? (
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
                                // id="qualification"
                                text="Skip"
                                onClick={() => {
                                  qualificationRef.current?.resetForm();
                                  setSaveDraftError(false);
                                  handleUnSavedChanges(0);
                                  if (activeStatus) {
                                    navigate("/view-school-student", {
                                      state: { id: studentId },
                                    });
                                    return;
                                  }
                                }}
                              />
                            </div>
                          ) : null}

                          {!saveDraftError && !activeStatus && (
                            <div className="row no-gutters text-center py-3">
                              <div>
                                <Button
                                  type="button"
                                  id="saveDraft"
                                  frmButton={false}
                                  isTable={true}
                                  className={"btn me-2"}
                                  tabIndex={65}
                                  onClick={(e) => {
                                    handleClearAllForms();
                                    toast.success(
                                      "Student saved as draft successfully"
                                    );
                                  }}
                                  text="Save As Draft"
                                />
                                {qualificationRef?.current ? (
                                  <Button
                                    frmButton={false}
                                    tabIndex={66}
                                    className={"btn-green ms-2"}
                                    onClick={(e) => {
                                      handleConfirmSubmission();
                                    }}
                                    type="button"
                                    text="Confirm Admission"
                                  />
                                ) : null}
                              </div>
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
              ID. <br />
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

export default AddSchoolStudent;
