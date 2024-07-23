import React, { useEffect, useState, useRef, useContext } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import moment from "moment";
import { Tab, Tabs } from "react-bootstrap";
import { toast } from "react-toastify";
import * as Yup from "yup";
import { Formik } from "formik";
import ReactCrop from "react-image-crop";
import { Modal } from "react-bootstrap";
import { useSelector } from "react-redux";
import $ from "jquery";

import empApi from "../../api/EmployeeApi";
import studentApi from "../../api/StudentApi";

import string from "../../string";

import AuthContext from "../../auth/context";

import preFunction from "../../component/common/CommonFunction";
import CustomActivityIndicator from "../../component/common/CustomActivityIndicator";
import ErrorMessage from "../../component/common/ErrorMessage";
import SwitchField from "../../component/FormField/SwitchField";
import SelectFieldFormik from "../../component/FormField/SelectFieldFormik";
import Button from "../../component/FormField/Button";
import FileField from "../../component/FormField/FileField";
import TextFieldFormik from "../../component/FormField/TextFieldFormik";
import DateFieldFormik from "../../component/FormField/DateFieldFormik";
import ScreenTitle from "../../component/common/ScreenTitle";
import ModalComponent from "../../component/ModalComponent";
import DisplayText from "../../component/FormField/DisplayText";
import {
  maritalStatusList,
  relationList,
  allowedFileExtensions,
} from "../../component/common/CommonArray";

import photo from "../../assests/png/camera.png";
import blankProfile from "../../assests/png/blank-profile-picture.png";

let otherCity = false;
let tempOtherCity = false;

const deductionSchema = Yup.object().shape({
  deduction: Yup.object().required("Please select Deduction"),
  deductionAmount: Yup.number()
    .min(1, "Please enter valid Amount")
    .required("Please enter valid Amount"),
});

const allowanceSchema = Yup.object().shape({
  allowance: Yup.object().required("Please select Allowance"),
  allowanceAmount: Yup.number()
    .min(1, "Please enter valid Amount")
    .required("Please enter valid Amount"),
});

const qualificationSchema = Yup.object().shape({
  certQualification: Yup.object().required("Please select Qualification"),
  institution: Yup.string()
    .min(3, "Must be at least 3 characters long")
    .matches(/^[A-Za-z@. ]+$/, "Please enter Institution Name")
    .trim(),
  regNo: Yup.string()
    .min(6, "Must be at least 6 characters long")
    .matches(/^[0-9]+$/, "Please enter valid Registration No."),
  certFile: Yup.mixed()
    .required("Please select File")
    .test("fileType", "Please upload JPG, PNG or pdf files only", (value) => {
      if (!value) return true;
      const fileNameParts = value?.name?.split(".");
      const fileExtension =
        fileNameParts[fileNameParts?.length - 1]?.toLowerCase();

      return allowedFileExtensions?.includes(fileExtension);
    })
    .test("fileSize", "File is too large", (value) => {
      if (!value) return true;
      const maxSize = 5 * 1024 * 1024;
      return value?.size <= maxSize;
    }),
});

const experienceSchema = Yup.object().shape({
  expOrganisationName: Yup.string()
    .min(3, "Must be at least 3 characters long")
    .required("Please enter Organization Name")
    .trim(),
  expLocation: Yup.string()
    .min(3, "Must be at least 3 characters long")
    .required("Please enter Location")
    .trim(),
  expDesignation: Yup.object().required("Please select Designation"),
  expFromDate: Yup.date()
    .min(
      moment().subtract(60, "years").toDate(),
      `From Date must be after ${moment()
        .subtract(50, "years")
        .format("DD-MM-YYYY")}`
    )
    .max(
      moment().toDate(),
      `From Date must be before ${moment().format("DD-MM-YYYY")}`
    )
    .required("Please select From Date"),
  expToDate: Yup.date()
    .min(
      moment().subtract(60, "years").toDate(),
      `To Date must be after ${moment()
        .subtract(50, "years")
        .format("DD-MM-YYYY")}`
    )
    .max(
      moment().toDate(),
      `To Date must be before ${moment().format("DD-MM-YYYY")}`
    )
    .required("Please select To Date"),
  expSalary: Yup.number().required("Please enter Salary"),
});

const isRequiredWhenNotCash = function (value) {
  const salaryMode = this?.parent?.salaryMode;
  return !(salaryMode && salaryMode?.salary_mode !== "Cash") || !!value;
};

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

function AddEmployee() {
  //#region const
  const navigate = useNavigate();
  const { unSavedChanges, setUnSavedChanges, collegeName, collegeId } =
    useContext(AuthContext);
  const collegeConfig = useSelector((state) => state.web.college);
  const formikRef = useRef();
  const salaryRef = useRef();
  const salDeductionRef = useRef();
  const workRef = useRef();
  const experienceRef = useRef();
  const qualificationRef = useRef();
  const location = useLocation();

  const [employeeId, setEmployeeId] = useState();
  const [employeeNumber, setEmployeeNumber] = useState();
  const [load, setLoad] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [allowanceError, setAllowanceError] = useState(false);
  const [deductionError, setDeductionError] = useState(false);
  const [deductionErrorMessage, setDeductionErrorMessage] = useState("");
  const [activeKey, setActiveKey] = useState(1);
  const [doj, setDoj] = useState("");
  const [employmentTypeList, setEmploymentTypeList] = useState([]);
  const [salaryModeList, setSalaryModeList] = useState([]);
  const [cityArrayList, setCityArrayList] = useState([]);
  const [tempCityList, setTempCityList] = useState([]);
  const [stateArrayList, setStateArrayList] = useState([]);
  const [countryList, setCountryList] = useState([]);
  const [experienceArr, setExperienceArr] = useState([]);
  const [newExperienceArr, setNewExperienceArr] = useState([]);
  const [expData, setExpData] = useState([]);
  const [qualData, setQualData] = useState([]);
  const [image, setImage] = useState();

  const currentYear = new Date().getFullYear();
  const yearofpassingList = [];
  for (let year = currentYear; year >= currentYear - 50; year--) {
    yearofpassingList.push({ value: year, label: year.toString() });
  }
  const [qualificationList, setQualificationList] = useState([]);
  const [employeeDetail, setEmployeeDetail] = useState();
  const [certificateArr, setCertificateArr] = useState([]);
  const [allowanceList, setAllowanceList] = useState([]);
  const [deductionList, setDeductionList] = useState([]);
  const [allowanceArr, setAllowanceArr] = useState([]);
  const [deductionArr, setDeductionArr] = useState([]);
  const [oldSalary, setOldSalary] = useState();

  const [genderList, setGenderList] = useState([]);
  const [placeofIssueList, setPlaceofIssueList] = useState([]);
  const [nationalityList, setNationalityList] = useState([]);
  const [bankList, setBankList] = useState([]);
  const [motherTongueList, setMotherTongueList] = useState([]);
  const [salutationList, setSalutationList] = useState([]);
  const [bloodGroupList, setBloodGroupList] = useState([]);
  const [staffDeptList, setStaffDeptList] = useState([]);
  const [communityList, setCommunityList] = useState([]);
  const [casteList, setCasteList] = useState([]);
  const [religionList, setReligionList] = useState([]);
  const [designationList, setDesignationList] = useState([]);
  const [designationCategoryList, setDesignationCategoryList] = useState([]);
  const [reportToList, setReportToList] = useState([]);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [displayImage, setDisplayImage] = useState(blankProfile);
  const [showImg, setShowImg] = useState(false);
  const [onChangeImage, setonChangeImage] = useState(false);
  const [src, setSrc] = useState(null);
  const [fileType, setFileType] = useState(null);
  const [CropOpen, setCropOpen] = useState(false);
  const [openModel, setOpenModal] = useState(false);

  const [crop, setCrop] = useState({
    unit: "px",
    width: 150,
    height: 150,
    minwidth: 150,
    minheight: 150,
    aspect: 1,
  });

  const [modalErrorOpen, setModalErrorOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [modalTitle, setModalTitle] = useState("");

  const [openLeavePageModel, setOpenLeavePageModel] = useState(false);
  const [tabKey, setTabKey] = useState();
  const [passKey, setPasskey] = useState();
  const [allowanceTotal, setAllowanceTotal] = useState(0);
  const [deductionTotal, setDeductionTotal] = useState(0);
  //#endregion

  const FormSchema = Yup.object().shape({
    college: collegeConfig?.is_university
      ? Yup.object().required("Please select College")
      : Yup.mixed().notRequired(),
    salutation: Yup.object().required("Please select Salutation"),
    employeeName: Yup.string()
      .min(3, "Must be at least 3 characters long")
      .matches(/^[A-Za-z@. ]+$/, "Please enter valid Employee Name")
      .required("Please enter Employee Name")
      .trim(),
    fatherName: Yup.string()
      .min(3, "Must be at least 3 characters long")
      .matches(/^[A-Za-z@. ]+$/, "Please enter valid Father Name")
      .required("Please enter Father Name")
      .trim(),
    // dob: Yup.date().required("Please select Date of Birth"), check like doj
    dob: Yup.date()
      .max(
        moment().subtract(1, "months").toDate(),
        `The Date of Birth must be before ${moment()
          .subtract(1, "months")
          .format("DD-MM-YYYY")}`
      )
      .min(
        moment().subtract(70, "years").toDate(),
        `The Date of Birth must be after ${moment()
          .subtract(70, "years")
          .format("DD-MM-YYYY")}`
      )
      .required("Please select Date of Birth"),

    gender: Yup.object().required("Please select Gender"),
    motherName: Yup.string()
      .min(3, "Must be at least 3 characters long")
      .matches(/^[A-Za-z@. ]+$/, "Please enter valid Mother Name")
      .trim(),
    maritalStatus: Yup.object().required("Please select Marital Status"),
    spouseName: Yup.string()
      .min(3, "Must be at least 3 characters long")
      .matches(/^[A-Za-z@. ]+$/, "Please enter valid Spouse Name")
      .trim(),
    // bloodGroup: Yup.object().required("Please select Blood Group"),
    // community: Yup.object().required("Please select Community"),
    // religion: Yup.object().required("Please select Religion"),
    nationality: Yup.object().required("Please select Nationality"),
    mobileNo: Yup.string()
      .matches(/^[0-9]{10}$/, "Mobile No. must be exactly 10 digits")
      .matches(/^[6-9][0-9]{9}$/, "Mobile No. must start with 6, 7, 8, or 9")
      .required("Please enter Mobile No.")
      .trim(),
    mobileNo2: Yup.string()
      .matches(/^[0-9]{10}$/, "Mobile No. must be exactly 10 digits")
      .matches(/^[6-9][0-9]{9}$/, "Mobile No. must start with 6, 7, 8, or 9")
      .trim(),
    email: Yup.string()
      .matches(
        /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/,
        "Please enter valid Employee Email ID"
      )
      .required("Please enter Employee Email ID"),
    languageKnown: Yup.string().min(3, "Must be at least 3 characters long"),
  });

  const OtherFormSchema = Yup.object().shape({
    employmentType: Yup.object().required("Please select Employment Type"),
    doj: Yup.date()
      .min(
        moment().subtract(10, "years").toDate(),
        `The Date of Joining must be after ${moment()
          .subtract(10, "years")
          .format("DD-MM-YYYY")}`
      )
      .max(
        moment().toDate(),
        `The Date of Joining must be before ${moment().format("DD-MM-YYYY")}`
      )
      .required("Please select Date of Joining"),
    designationCategory: Yup.object().required(
      "Please select Designation Category"
    ),
    designation: Yup.object().required("Please select Designation"),
    department: Yup.object().required("Please select Department"),
    passport: Yup.string()
      .min(5, "Must be at least 5 characters long")
      .matches(/^[a-zA-Z0-9]+$/, "Please enter valid Passport No."),

    issueDate: Yup.date()
      .max(
        moment().toDate(),
        `The Date of Issue must be before ${moment().format("DD-MM-YYYY")}`
      )
      .min(
        moment().subtract(10, "years").toDate(),
        `The Date of Issue must be after ${moment()
          .subtract(10, "years")
          .format("DD-MM-YYYY")}`
      ),

    expiryDate: Yup.date()
      .max(
        moment().add(10, "years").toDate(),
        `The Date of Expiry must be before ${moment().format("DD-MM-YYYY")}`
      )
      .min(
        moment().toDate(),
        `The Date of Expiry must be after ${moment().format("DD-MM-YYYY")}`
      ),

    // aadhaarNo: Yup.number()
    //   .test(
    //     "is-twelve-digits",
    //     "Aadhaar No. must be exactly 12 digits",
    //     (value) => /^[0-9]{12}$/.test(String(value))
    //   )
    //   .required("Please enter Aadhaar No."),
    aadhaar: optionalAadhaarValidation,
    panNo: Yup.string().matches(
      /^[A-Za-z]{5}[0-9]{4}[A-Za-z]$/,
      "Please enter a valid PAN"
    ),

    pfNo: Yup.string().matches(/^[a-zA-Z0-9]+$/, "Please enter valid PF No."),
    salaryMode: Yup.object().required("Please select Salary Mode"),
    bankName: Yup.object().test(
      "isRequired",
      "Please select bank name",
      isRequiredWhenNotCash
    ),
    accountNo: Yup.string().test(
      "isRequired",
      "Please enter account No.",
      isRequiredWhenNotCash
    ),
    ifscCode: Yup.string().test(
      "isRequired",
      "Please enter IFSC Data",
      isRequiredWhenNotCash
    ),
    branchName: Yup.string().test(
      "isRequired",
      "Please enter branch name",
      isRequiredWhenNotCash
    ),
    contactName1: Yup.string()
      .min(3, "Must be at least 3 characters long")
      .matches(/^[A-Za-z@. ]+$/, "Please enter valid name")
      // .required("Please enter Emergency contact name")
      .trim(),
    // relation1: Yup.object().required("Please select relationship"),
    contactNo1: Yup.string().matches(
      /^[0-9]{10}$/,
      "Mobile No. must be exactly 10 digits"
    ),
    // .required("Please enter Emergency contact No."),
    contactName2: Yup.string()
      .min(3, "Must be at least 3 characters long")
      .matches(/^[A-Za-z@. ]+$/, "Please enter valid name")
      .trim(),
    contactNo2: Yup.string().matches(
      /^[0-9]{10}$/,
      "Mobile No. must be exactly 10 digits"
    ),
    streetLandMark: Yup.string()
      .min(3, "Must be at least 3 characters long")
      .required("Please enter Street/LandMark")
      .trim(),
    permanentArea: Yup.string()
      .min(3, "Must be at least 3 characters long")
      .required("Please enter Area/Place")
      .trim(),
    // permanentCity: Yup.object().required("Please select City/District"),
    permanentCity: Yup.object().when("permanentState", (state, schema) => {
      if (state[0]?.state == "Tamil Nadu" || state[0]?.state == "Puducherry") {
        return Yup.object().required("Please select City/District");
      }
      return schema;
    }),
    otherCity: Yup.string().when("permanentState", (state, schema) => {
      if (state[0]?.state != "Tamil Nadu" && state[0]?.state != "Puducherry") {
        return Yup.string().required("Please enter City/District");
      }
      return schema;
    }),
    permanentState: Yup.object().required("Please select State"),
    permanentCountry: Yup.object().required("Please select Country"),
    permanentPincode: Yup.number()
      .test("is-six-digits", "Pincode must be exactly 6 digits", (value) =>
        /^[0-9]{6}$/.test(String(value))
      )
      .required("Please enter valid Pincode"),

    tempStreetLandMark: Yup.string()
      .min(3, "Must be at least 3 characters long")
      .required("Please enter Street/LandMark")
      .trim(),
    tempArea: Yup.string()
      .min(3, "Must be at least 3 characters long")
      .required("Please enter Area/Place")
      .trim(),

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
    tempState: Yup.object().required("Please select State"),
    tempCountry: Yup.object().required("Please select Country"),
    tempPincode: Yup.number()
      .test("is-six-digits", "Pincode must be exactly 6 digits", (value) =>
        /^[0-9]{6}$/.test(String(value))
      )
      .required("Please enter valid Pincode"),
  });

  const handleUnSavedChanges = (changed) => {
    if (changed == 1) {
      sessionStorage?.setItem("unSavedChanges", true);
      setUnSavedChanges(true);
    } else {
      sessionStorage?.setItem("unSavedChanges", false);
      setUnSavedChanges(false);
    }
  };

  const selectImage = (file) => {
    const fileType = file?.name?.split(".")[1];
    if (!allowedFileExtensions.includes(fileType)) {
      setModalErrorOpen(true);
      setModalMessage("Please upload jpeg, jpg, png file only");
      setModalTitle("Message");
      setShowImg(true);
      preFunction.slideToTarget(document?.getElementById("imgError"));
      return;
    }
    setShowImg(false);
    setSrc(URL?.createObjectURL(file));
    setOpenModal(true);
    setFileType(fileType);
  };

  const cropImageNow = () => {
    if (crop?.width === 0 || crop?.height === 0) {
      setCropOpen(true);
      return;
    }
    const canvas = document?.createElement("canvas");
    const scaleX = image?.naturalWidth / image?.width;
    const scaleY = image?.naturalHeight / image?.height;
    canvas.width = crop?.width;
    canvas.height = crop?.height;
    const ctx = canvas?.getContext("2d");

    const pixelRatio = window?.devicePixelRatio;
    canvas.width = crop?.width * pixelRatio;
    canvas.height = crop?.height * pixelRatio;
    ctx?.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    ctx.imageSmoothingQuality = "high";

    ctx?.drawImage(
      image,
      crop?.x * scaleX,
      crop?.y * scaleY,
      crop?.width * scaleX,
      crop?.height * scaleY,
      0,
      0,
      crop?.width,
      crop?.height
    );

    // Converting to base64
    const base64Image = canvas?.toDataURL("image/jpeg");
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

  const handleCityByState = async (txt) => {
    console.log("handleCityByState----", txt);
    if (txt.state != "Puducherry" && txt.state != "Tamil Nadu") {
      otherCity = true;
    } else {
      otherCity = false;
      const masterRes = await studentApi?.getCityMaster(3, txt?.id);
      console.log("masterRes----", masterRes);
      setCityArrayList(masterRes?.data?.message?.data?.city_data);
    }
  };

  const handleTempCityByState = async (txt, set) => {
    console.log("handleTempCityByState----", txt);
    if (txt.state != "Puducherry" && txt.state != "Tamil Nadu") {
      tempOtherCity = true;
    } else {
      tempOtherCity = false;
      const masterRes = await studentApi.getCityMaster(3, txt.id);
      console.log("masterRes----", masterRes);
      setTempCityList(masterRes?.data?.message?.data?.city_data);
    }
  };

  const handleSaveAsDraft = () => {
    handleUnSavedChanges(0);
    formikRef?.current?.resetForm();
    workRef?.current?.resetForm();
    salaryRef?.current?.resetForm();
    salDeductionRef?.current?.resetForm();

    location.state = null;
    setEmployeeId();
    setEmployeeNumber();
    setLoad(false);
    setShowConfirm(false);
    setAllowanceError(false);
    setDeductionError(false);
    setActiveKey(1);
    setDoj("");
    setExperienceArr([]);
    setNewExperienceArr([]);
    setImage();
    setEmployeeDetail();
    setCertificateArr([]);
    setAllowanceArr([]);
    setAllowanceTotal(0);
    setDeductionArr([]);
    setDeductionTotal(0);
    setOldSalary();
    setDisplayImage(blankProfile);
    setShowImg(false);
    setonChangeImage(false);
    setSrc();
    setFileType();
    setCropOpen(false);
    setOpenModal(false);
    setCrop({
      unit: "px",
      width: 150,
      height: 150,
      minwidth: 150,
      minheight: 150,
      aspect: 1,
    });
    setModalErrorOpen(false);
    setModalMessage("");
    setModalTitle("");
    handleTabChange(1, false);
  };

  const handleConfirmEmployee = async () => {
    if (load) return;
    try {
      setLoad(true);
      console.log("employeeDetail---", employeeDetail);

      if (!employeeDetail) {
        setModalErrorOpen(true);
        setModalMessage("Please fill all the mandatory details");
        setModalTitle("Message");

        handleTabChange(1, false);
        return;
      }
      const getEmployeeByIdRes = await empApi.getEmployeeById(
        employeeDetail?.name
      );
      console.log("getEmployeeByIdRes---------------", getEmployeeByIdRes);
      let empTempDetail = getEmployeeByIdRes?.data?.data;
      if (
        !empTempDetail.salutation ||
        !empTempDetail.first_name ||
        !empTempDetail.custom_father_name ||
        !empTempDetail.date_of_birth ||
        !empTempDetail.gender ||
        !empTempDetail.marital_status ||
        // !empTempDetail.blood_group ||
        // !empTempDetail.custom_community ||
        // !empTempDetail.custom_religion ||
        !empTempDetail.custom_nationality ||
        !empTempDetail.cell_number ||
        !empTempDetail.personal_email ||
        !empTempDetail.image ||
        !empTempDetail.custom_college_id
      ) {
        handleTabChange(1, false);
        setModalErrorOpen(true);
        setModalMessage("Please fill all the mandatory details");
        setModalTitle("Message");
        setLoad(false);
        return;
      } else if (
        !empTempDetail.employment_type ||
        !empTempDetail.date_of_joining ||
        !empTempDetail.custom_designation_category ||
        !empTempDetail.designation ||
        !empTempDetail.department ||
        // !empTempDetail.custom_aadhaar_card ||
        !empTempDetail.salary_mode ||
        // !empTempDetail.person_to_be_contacted ||
        // // !empTempDetail.relation ||
        // !empTempDetail.emergency_phone_number ||
        !empTempDetail.current_address ||
        !empTempDetail.custom_current_place ||
        !empTempDetail.custom_current_city ||
        !empTempDetail.custom_current_state ||
        !empTempDetail.custom_current_country ||
        !empTempDetail.custom_current_pincode ||
        !empTempDetail.permanent_address ||
        !empTempDetail.custom_permanent_place ||
        !empTempDetail.custom_permanent_city ||
        !empTempDetail.custom_permanent_state ||
        !empTempDetail.custom_permanent_country ||
        !empTempDetail.custom_permanent__pincode
      ) {
        handleTabChange(2, false);
        setModalErrorOpen(true);
        setModalMessage("Please fill all the mandatory details");
        setModalTitle("Message");
        setLoad(false);
        return;
      }
      // else if (empTempDetail?.education?.length == 0) {
      //   handleTabChange(4, false);
      //   setModalErrorOpen(true);
      //   setModalMessage("Please fill the qualification details");
      //   setModalTitle("Message");
      //   setLoad(false);
      //   return;
      // }

      console.log("employeeId----", empTempDetail);
      const confirmEmployeeRes = await empApi.confirmEmployee(
        employeeId,
        empTempDetail?.personal_email,
        empTempDetail?.cell_number?.toString()
      );
      console.log("confirmEmployeeRes---", confirmEmployeeRes);
      if (!confirmEmployeeRes?.data?.message?.success) {
        setModalMessage(confirmEmployeeRes?.data?.message?.message);
        setModalTitle("Message");
        setModalErrorOpen(true);
        setLoad(false);
        return;
      }
      setEmployeeNumber(confirmEmployeeRes?.data?.message?.data?.employeeID);

      handleUnSavedChanges(0);
      setConfirmOpen(true);
      setLoad(false);
    } catch (error) {
      setLoad(false);
      console.log("Exception--", error);
    }
  };

  const handleDeductionAdd = async (values) => {
    deductionArr?.push({
      id: deductionArr?.length + 1,
      salary_component: values?.deduction?.name,
      amount: values?.deductionAmount,
      salary_component_abbr: values?.deduction?.salary_component_abbr,
      statistical_component: values?.deduction?.statistical_component,
      depends_on_payment_days: values?.deduction?.depends_on_payment_days,
      is_tax_applicable: values?.deduction?.is_tax_applicable,
    });
    setDeductionArr([...deductionArr]);
    let tot = 0;
    for (let i = 0; i < deductionArr?.length; i++) {
      tot += parseInt(deductionArr[i]?.amount);
    }
    setDeductionTotal(tot);
    let arr = deductionList?.filter((e) => e?.name != values?.deduction?.name);
    setDeductionList(arr);
    salDeductionRef?.current?.resetForm();
    document?.getElementById("deduction")?.focus();
  };

  const handleDeleteDeduction = (item) => {
    setDeductionError(false);
    setShowConfirm(false);
    const deleteDeduction = deductionArr?.filter((m) => m !== item);
    setDeductionArr(deleteDeduction);
    let tot = 0;
    for (let i = 0; i < deleteDeduction?.length; i++) {
      tot += parseInt(deleteDeduction[i]?.amount);
    }
    setDeductionTotal(tot);
    let arr = deductionList;

    arr?.push({
      name: item?.salary_component,
    });
    setDeductionList(arr);
  };

  const handleAllowanceAdd = async (values) => {
    allowanceArr?.push({
      id: allowanceArr?.length + 1,
      salary_component: values?.allowance?.name,
      amount: values?.allowanceAmount,
      salary_component_abbr: values?.allowance?.salary_component_abbr,
      statistical_component: values?.allowance?.statistical_component,
      depends_on_payment_days: values?.allowance?.depends_on_payment_days,
      is_tax_applicable: values?.allowance?.is_tax_applicable,
    });
    setAllowanceArr([...allowanceArr]);

    let tot = 0;
    for (let i = 0; i < allowanceArr?.length; i++) {
      tot += parseInt(allowanceArr[i]?.amount);
    }
    setAllowanceTotal(tot);

    let arr = allowanceList?.filter((e) => e?.name != values?.allowance?.name);
    setAllowanceList(arr);
    salaryRef?.current?.resetForm();
    document?.getElementById("allowance")?.focus();
  };

  const handleDeleteAllowance = (item) => {
    setShowConfirm(false);
    const deleteAllowance = allowanceArr?.filter((m) => m !== item);
    setAllowanceArr(deleteAllowance);
    let tot = 0;
    for (let i = 0; i < deleteAllowance?.length; i++) {
      tot += parseInt(deleteAllowance[i]?.amount);
    }
    setAllowanceTotal(tot);
    let arr = allowanceList;
    arr?.push({
      name: item?.salary_component,
    });
    setAllowanceList(arr);
  };

  const handleImage = (e) => {
    if (e.target.files.length === 0) {
      document.getElementById("certFile").value = null;
      return;
    }

    if (!allowedFileExtensions.includes(e.target.files[0].name.split(".")[1])) {
      document.getElementById("certFile").value = null;
      setModalMessage("Please upload pdf, jpeg, jpg, png file only");
      setModalTitle("Message");
      setModalErrorOpen(true);
      setLoad(false);
      return;
    }
    if (e.target.files[0].size > string.MAX_FILE_SIZE) {
      document.getElementById("certFile").value = null;

      setModalMessage("Please choose file size less than 2MB");
      setModalTitle("Message");
      setModalErrorOpen(true);
      setLoad(false);
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (reader.readyState === 2) {
        setImage(reader.result);
      }
    };
    reader.readAsDataURL(e.target.files[0]);

    setFileType(e.target.files[0].name.split(".")[1]);
  };

  const handleSkipQualification = async () => {
    if (load) return;
    qualificationRef.current.resetForm();
    document.getElementById("certFile").value = null;
    handleUnSavedChanges(0);
    handleTabChange(5, false);
  };

  const handleSaveQualification = async () => {
    if (load) return;
    console.log(
      "qualificationRef.current.values",
      qualificationRef.current.values
    );

    if (
      qualificationRef.current.values?.certQualification &&
      qualificationRef.current.values?.certFile
    ) {
      const { resetForm } = qualificationRef.current;
      var returnedQualDetails = await handleQualification(
        qualificationRef.current.values,
        { resetForm }
      );
    }
    console.log("returnedQualDetails", returnedQualDetails);
    console.log("certificateArr", certificateArr);

    try {
      setLoad(true);
      const editEmployeeQualificationRes =
        await empApi.editEmployeeQualification(
          employeeId,
          returnedQualDetails ? returnedQualDetails : certificateArr
        );
      console.log(
        "editEmployeeQualificationRes---",
        editEmployeeQualificationRes
      );
      if (!editEmployeeQualificationRes?.ok) {
        setModalMessage(editEmployeeQualificationRes?.data?.exception);
        setModalTitle("Message");
        setModalErrorOpen(true);
        setLoad(false);
        return;
      }
      setQualData([]);
      setLoad(false);
      handleUnSavedChanges(0);

      // if (employeeDetail?.status === "Active") {
      //   toast.success("Employee Updated Successfully");
      //   navigate("/view-employee", {
      //     state: { id: employeeDetail?.custom_employeeid },
      //   });
      //   return;
      // }
      handleTabChange(5, false);
    } catch (error) {
      setLoad(false);
      console.log("Exception--", error);
    }
  };

  const handleQualification = async (values, { resetForm }) => {
    if (load) return;
    let certDetails = certificateArr;
    try {
      const fileResponse = await empApi.uploadFile(
        "employee_qualification",
        fileType,
        image?.split(",")[1]
      );
      console.log("fileResponse---", fileResponse);
      if (!fileResponse.data.message.success) {
        setModalMessage(fileResponse.data.message.message);
        setModalTitle("Message");
        setModalErrorOpen(true);
        setLoad(false);
        return;
      }
      let qulaData = [];
      let object = {
        id: certificateArr.length + 1,
        qualification: values.certQualification.name,
        school_univ: values.institution,
        custom_reg_no: values.regNo,
        year_of_passing: values.yearofPassing ? values.yearofPassing.value : "",
        custom_file: fileResponse?.data?.message?.data?.file_url,
        image: image,
      };

      certDetails.push(object);
      setCertificateArr(certDetails);
      qulaData.push(object);
      setQualData((prevData) => [...prevData, ...qulaData]);
      console.log(certDetails, "certDetails");

      document.getElementById("certFile").value = null;
      qualificationRef.current.setFieldValue("certFile", null);
      qualificationRef.current.resetForm();
      handleUnSavedChanges(1);
      return certDetails;
    } catch (error) {
      setLoad(false);
      console.log("Exception--", error);
    }
  };

  const handleDeleteQualification = (item) => {
    const deleteQualification = certificateArr?.filter((m) => m !== item);
    setCertificateArr(deleteQualification);

    const deleteQualData = qualData?.filter((m) => m !== item);
    setQualData(deleteQualData);
  };

  const handleSaveExperience = async () => {
    if (load) return;
    console.log("experienceRef.current.values", experienceRef.current.values);

    if (
      experienceRef.current.values?.expOrganisationName &&
      experienceRef.current.values?.expLocation &&
      experienceRef.current.values?.expDesignation &&
      experienceRef.current.values?.expFromDate &&
      experienceRef.current.values?.expToDate &&
      experienceRef.current.values?.expSalary
    ) {
      const { resetForm } = experienceRef.current;

      var returnedExpDetails = handleExperienceValidate(
        experienceRef.current.values,
        { resetForm }
      );
    }
    console.log("returnedExpDetails", returnedExpDetails);
    console.log("newExperienceArr", newExperienceArr);

    try {
      setLoad(true);
      if (returnedExpDetails?.length > 0 || newExperienceArr?.length > 0) {
        const saveExperienceRes = await empApi.editEmployeeExperience(
          employeeId,
          returnedExpDetails ? returnedExpDetails : newExperienceArr
        );
        console.log("SaveExperience", saveExperienceRes);
        if (!saveExperienceRes?.ok) {
          setModalMessage(saveExperienceRes?.data?.exception);
          setModalTitle("Message");
          setModalErrorOpen(true);
          setLoad(false);
          return;
        }
        setEmployeeDetail(saveExperienceRes?.data?.data);
      }
      handleUnSavedChanges(0);
      setExpData([]);

      setLoad(false);
      handleTabChange(4, false);
    } catch (error) {
      setLoad(false);
      console.log("Exception---", error);
    }
  };

  const handleExperienceValidate = (values, { resetForm }) => {
    if (values?.expFromDate > values?.expToDate) {
      setModalMessage("From Date should be less than To Date");
      setModalTitle("Message");
      setModalErrorOpen(true);
      return;
    } else if (values?.expFromDate == values?.expToDate) {
      setModalMessage("From Date and To Date should not be same");
      setModalTitle("Message");
      setModalErrorOpen(true);
      return;
    }

    let expDetails = experienceArr;
    let expListNew = [];
    let obj = {
      id: experienceArr?.length + 1,
      company_name: values?.expOrganisationName,
      custom_location: values?.expLocation,
      designation: values?.expDesignation?.designation,
      custom_from_date: moment(values?.expFromDate)?.format("YYYY-MM-DD"),
      custom_to_date: moment(values?.expToDate)?.format("YYYY-MM-DD"),
      salary: values?.expSalary,
      custom_remarks: values?.expRemarks,
    };
    expListNew?.push(obj);
    setExperienceArr((prevData) => [...prevData, ...expListNew]);
    expDetails?.push(obj);
    setExpData((prevData) => [...prevData, ...expListNew]);
    setNewExperienceArr(expDetails);
    resetForm();
    return expDetails;
  };

  const handleDeleteExperienceValidate = (item) => {
    const deleteExp = experienceArr?.filter((m) => m !== item);
    setExperienceArr(deleteExp);

    const deleteNewExp = newExperienceArr?.filter((m) => m !== item);
    setNewExperienceArr(deleteNewExp);

    const deleteExpData = expData?.filter((m) => m !== item);
    setExpData(deleteExpData);
  };

  const handleWorkDetail = async (values) => {
    if (load) return;
    console.log("values----", values);
    if (values.issuDate || values.expiryDate || values.placeOfIssue) {
      if (!values.passport) {
        setModalMessage("Please enter Passport No.");
        setModalTitle("Message");
        setModalErrorOpen(true);
        return;
      }
      if (!values.issueDate || !values.expiryDate) {
        setModalMessage("Please Select Passport Issue Date and Expiry Date");
        setModalTitle("Message");
        setModalErrorOpen(true);
        return;
      } else if (values.issueDate > values.expiryDate) {
        setModalMessage("Passport Issue Date should be less than Expiry Date");
        setModalTitle("Message");
        setModalErrorOpen(true);
        return;
      }
    }
    try {
      setLoad(true);
      setDoj(moment(values?.doj)?.format("YYYY-MM-DD"));
      const incDate = moment(values?.doj)?.add(1, "years");
      const editEmployeeWorkDetailRes = await empApi.editEmployeeWorkDetail(
        employeeId,
        values?.employmentType?.employmentType,
        moment(values?.doj)?.format("YYYY-MM-DD"),
        moment(incDate)?.format("YYYY-MM-DD"),
        values?.designationCategory?.designationCategory,
        values?.designation?.designation,
        values?.designation?.custom_isteaching,
        values?.department?.department_id,
        values?.reportTo?.name,
        values?.passport,
        values?.placeofIssue ? values?.placeofIssue?.placeOfIssue : "",
        values?.issueDate
          ? moment(values?.issueDate)?.format("yyyy-MM-DD")
          : "",
        values?.expiryDate
          ? moment(values?.expiryDate)?.format("yyyy-MM-DD")
          : "",
        values?.aadhaarNo ? values.aadhaarNo : null,
        values?.salaryMode?.salary_mode,
        values?.bankName?.bank,
        values?.accountNo,
        values?.ifscCode,
        values?.branchName,
        values?.panNo ? values.panNo.toUpperCase() : null,
        values?.pfNo,
        values?.contactName1,
        values?.relation1?.value ?? "",
        values?.contactNo1?.toString(),
        values?.contactName2,
        values?.relation2?.value ?? "",
        values?.contactNo2?.toString(),
        values?.tempStreetLandMark,
        values?.tempArea,
        tempOtherCity ? values?.tempOtherCity : values?.tempCity?.city,
        values?.tempState?.state,
        values?.tempCountry?.country,
        values?.tempPincode,
        values?.streetLandMark,
        values?.permanentArea,
        otherCity ? values?.otherCity : values?.permanentCity?.city,
        values?.permanentState?.state,
        values?.permanentCountry?.country,
        values?.permanentPincode
      );
      console.log("editEmployeeWorkDetailRes", editEmployeeWorkDetailRes);
      if (!editEmployeeWorkDetailRes?.ok) {
        setModalMessage(editEmployeeWorkDetailRes?.data?.exception);
        setModalTitle("Message");
        setModalErrorOpen(true);
        setLoad(false);
        return;
      }
      setEmployeeDetail(editEmployeeWorkDetailRes?.data?.data);

      setLoad(false);
      handleUnSavedChanges(0);
      handleTabChange(3, false);
      return;
    } catch (error) {
      setLoad(false);
      console.log("exception", error);
    }
  };

  const handlePersonalValidation = async (values) => {
    if (load) return;
    if (!src) {
      setShowImg(true);
      preFunction.slideToTarget(document?.getElementById("imgError"));
      return;
    }
    try {
      setLoad(true);
      console.log("values----", values, "employeeId--", employeeId);
      console.log("onChangeImage----", onChangeImage);
      let imageUrl = displayImage.includes(string?.TESTBASEURL)
        ? displayImage?.split(string?.TESTBASEURL)[1]
        : displayImage;
      if (onChangeImage) {
        const response = await empApi.uploadFile(
          "staff_profile",
          fileType,
          displayImage?.split(",")[1]
        );
        console.log("response--", response);
        if (!response?.data?.message?.success) {
          setModalMessage(response?.data?.message?.message);
          setModalTitle("Message");
          setModalErrorOpen(true);
          setLoad(false);
          return;
        }
        imageUrl = response?.data?.message?.data?.file_url;
        setonChangeImage(false);
        setDisplayImage(
          string?.TESTBASEURL + response?.data?.message?.data?.file_url
        );
      }

      const checkEmployeeRes = await empApi.checkEmployeePersonal(
        values?.email,
        values?.mobileNo.toString(),
        employeeId ?? ""
      );
      console.log("checkEmployeeRes---", checkEmployeeRes);
      if (checkEmployeeRes?.data?.data?.length > 0) {
        setModalMessage(
          "Employee already exists with same Email or Mobile No."
        );
        setModalTitle("Message");
        setModalErrorOpen(true);
        setLoad(false);
        return;
      }

      if (employeeId) {
        const editEmployeeRes = await empApi.editEmployeePersonal(
          employeeId,
          values?.salutation?.salutation,
          values?.employeeName,
          values?.fatherName,
          moment(values?.dob)?.format("YYYY-MM-DD"),
          values?.gender?.gender,
          values?.maritalStatus?.value,
          values?.motherName,
          values?.spouseName,
          values?.bloodGroup ? values?.bloodGroup?.bloodGroup : "",
          values?.community ? values?.community?.community : "",
          values?.caste ? values?.caste?.caste : "",
          values?.religion ? values?.religion?.religion : "",
          values?.nationality?.nationality,
          values?.motherTongue ? values?.motherTongue?.motherTongue : "",
          values?.languageKnown,
          values?.mobileNo.toString(),
          values?.mobileNo2?.toString(),
          values?.email,
          onChangeImage ? imageUrl : null,
          collegeConfig?.is_university
            ? values?.college?.collegeName
            : collegeName,
          collegeConfig?.is_university ? values?.college?.collegeID : collegeId
        );
        console.log("editEmployeeRes", editEmployeeRes);
        if (!editEmployeeRes?.ok) {
          setModalMessage(editEmployeeRes?.data?.exception);
          setModalTitle("Message");
          setModalErrorOpen(true);
          setLoad(false);
          return;
        }
        setEmployeeDetail(editEmployeeRes?.data?.data);
        handleUnSavedChanges(0);
      } else {
        const addEmployeeRes = await empApi.addEmployeePersonal(
          values?.salutation?.salutation,
          values?.employeeName,
          values?.fatherName,
          moment(values?.dob)?.format("YYYY-MM-DD"),
          values?.gender?.gender,
          values?.maritalStatus?.value,
          values?.motherName,
          values?.spouseName,
          values?.bloodGroup ? values?.bloodGroup?.bloodGroup : "",
          values?.community ? values?.community?.community : "",
          values?.caste ? values?.caste?.caste : "",
          values?.religion ? values?.religion?.religion : "",
          values?.nationality?.nationality,
          values?.motherTongue ? values?.motherTongue?.motherTongue : "",
          values?.languageKnown,
          values?.mobileNo.toString(),
          values?.mobileNo2?.toString(),
          values?.email,
          imageUrl ?? "",
          moment()?.format("YYYY-MM-DD"),
          collegeConfig?.is_university
            ? values?.college?.collegeName
            : collegeName,
          collegeConfig?.is_university ? values?.college?.collegeID : collegeId
        );
        console.log("addEmployeeRes", addEmployeeRes);
        if (!addEmployeeRes?.ok) {
          setModalMessage(addEmployeeRes?.data?.exception);
          setModalTitle("Message");
          setModalErrorOpen(true);
          setLoad(false);
          return;
        }
        setEmployeeId(addEmployeeRes?.data?.data?.name);
        handleUnSavedChanges(0);
        setEmployeeDetail(addEmployeeRes?.data?.data);
      }
      setLoad(false);
    } catch (error) {
      setLoad(false);
      console.log("Exception---", error);
    }
    document?.getElementById("employmentType")?.focus();
    handleTabChange(2, false);
    return;
  };

  const handleSalary = async () => {
    if (load) return;
    setDeductionError(false);
    salaryRef.current.setErrors({});
    salDeductionRef.current.setErrors({});
    salaryRef?.current?.setFieldTouched("allowance", false);
    salaryRef?.current?.setFieldTouched("allowanceAmount", false);
    salDeductionRef?.current?.setFieldTouched("deduction", false);
    salDeductionRef?.current?.setFieldTouched("deductionAmount", false);
    if (
      !oldSalary &&
      allowanceArr.length === 0 &&
      deductionArr.length === 0 &&
      salaryRef?.current?.values?.allowanceAmount === "" &&
      salaryRef?.current?.values?.allowance === "" &&
      salDeductionRef?.current?.values?.deductionAmount === "" &&
      salDeductionRef?.current?.values?.deduction === ""
    ) {
      setDeductionError(true);
      setDeductionErrorMessage("Please add Allowances and Deductions");
      return;
    }
    if (
      salaryRef?.current?.values?.allowanceAmount &&
      salaryRef?.current?.values?.allowance
    ) {
      handleAllowanceAdd(salaryRef?.current?.values);
      setAllowanceArr([...allowanceArr]);
    }
    if (
      salDeductionRef?.current?.values?.deductionAmount &&
      salDeductionRef?.current?.values?.deduction
    ) {
      handleDeductionAdd(salDeductionRef?.current?.values);
      setDeductionArr([...deductionArr]);
    }
    console.log("allowanceArr---", allowanceArr);
    console.log("deductionArr---", deductionArr);
    let found = false;
    for (let i = 0; i < allowanceArr.length; i++) {
      if (allowanceArr[i]?.salary_component === "Basic") {
        found = true;
      }
    }
    if (!found) {
      setModalErrorOpen(true);
      setModalMessage("Please add Basic Salary");
      setModalTitle("Message");
      setLoad(false);
      return;
    }
    let totalAllowance = 0;
    for (let i = 0; i < allowanceArr.length; i++) {
      totalAllowance += parseInt(allowanceArr[i]?.amount);
    }
    let totalDeduction = 0;
    for (let i = 0; i < deductionArr.length; i++) {
      totalDeduction += parseInt(deductionArr[i]?.amount);
    }
    if (totalAllowance < totalDeduction) {
      setDeductionError(true);
      setDeductionErrorMessage("Deduction should be less than Allowances");
      return;
    }

    try {
      let salchanged = 0;
      if (location?.state?.id) {
        const viewSalaryRes = await empApi.viewSalary(location?.state?.id);
        console.log("viewSalaryRes---", viewSalaryRes);

        if (viewSalaryRes?.data?.data) {
          console.log("here---");
          if (
            allowanceArr.length !=
              viewSalaryRes?.data?.data?.earnings?.length ||
            deductionArr.length != viewSalaryRes?.data?.data?.deductions?.length
          ) {
            salchanged = 1;
          } else {
            for (
              let i = 0;
              i < viewSalaryRes?.data?.data?.earnings?.length;
              i++
            ) {
              let parList = allowanceArr?.filter(
                (e) =>
                  e?.salary_component ===
                    viewSalaryRes?.data?.data?.earnings[i]?.salary_component &&
                  parseInt(viewSalaryRes?.data?.data?.earnings[i]?.amount) ===
                    parseInt(e?.amount)
              );
              console.log("parList---", parList);
              if (parList?.length === 0) {
                salchanged = 1;
                break;
              }
            }
            if (salchanged === 0) {
              if (
                viewSalaryRes?.data?.data?.deductions?.length === 0 &&
                deductionArr?.length > 0
              ) {
                salchanged = 1;
              } else {
                for (
                  let i = 0;
                  i < viewSalaryRes?.data?.data?.deductions?.length;
                  i++
                ) {
                  let parList = deductionArr?.filter(
                    (e) =>
                      e?.salary_component ===
                        viewSalaryRes?.data?.data?.deductions[i]
                          ?.salary_component &&
                      parseInt(
                        viewSalaryRes?.data?.data?.deductions[i]?.amount
                      ) === parseInt(e?.amount)
                  );
                  if (parList?.length === 0) {
                    salchanged = 1;
                    break;
                  }
                }
              }
            }
          }

          console.log("salchanged---", salchanged);
          if (salchanged === 0) {
            salaryRef?.current?.setFieldValue("allowance", "");
            salaryRef?.current?.setFieldValue("allowanceAmount", "");
            salaryRef?.current?.setFieldValue("deduction", "");
            salaryRef?.current?.setFieldValue("deductionAmount", "");
            if (employeeDetail?.status === "Active") {
              toast.success("Employee Updated Successfully");
              navigate("/view-employee", {
                state: { id: employeeDetail?.custom_employeeid },
              });
              return;
            }
            setShowConfirm(true);
            return;
          }
          let allowanceArrToPass = [];
          let deductionArrToPass = [];
          for (let i = 0; i < allowanceArr?.length; i++) {
            allowanceArrToPass?.push({
              id: allowanceArr[i]?.id,
              salary_component: allowanceArr[i]?.salary_component,
              amount: allowanceArr[i]?.amount,
            });
          }
          for (let i = 0; i < deductionArr?.length; i++) {
            deductionArrToPass?.push({
              id: deductionArr[i]?.id,
              salary_component: deductionArr[i]?.salary_component,
              amount: deductionArr[i]?.amount,
            });
          }
          console.log("allowanceArrToPass---", allowanceArrToPass);
          console.log("deductionArrToPass---", deductionArrToPass);

          setLoad(true);
          const getSalaryStructureAssignmentRes =
            await empApi.getSalaryStructureAssignment(location?.state?.id);
          console.log(
            "getSalaryStructureAssignmentRes---",
            getSalaryStructureAssignmentRes
          );
          if (getSalaryStructureAssignmentRes?.data?.data.length > 0) {
            const cancelDoctypeRes = await empApi.cancelDoctype(
              "Salary Structure Assignment",
              getSalaryStructureAssignmentRes?.data?.data[0]?.name
            );
            console.log("cancelDoctypeRes---", cancelDoctypeRes);
            if (!cancelDoctypeRes.ok) {
              setModalErrorOpen(true);
              setModalMessage(
                JSON.parse(
                  JSON.parse(cancelDoctypeRes.data._server_messages)[0]
                ).message.split("<Br>")[0]
              );
              setModalTitle("Message");
              setLoad(false);
              return;
            }
          }
          //rename salary structure
          const renameSalaryStructureRes = await empApi.renameSalaryStructure(
            "Salary Structure",
            location?.state?.id,
            location?.state?.id + "_" + moment().format("YYYY-MM-DD HH:mm:ss")
          );
          console.log("renameSalaryStructureRes---", renameSalaryStructureRes);
          if (!renameSalaryStructureRes.ok) {
            setModalErrorOpen(true);
            setModalMessage(
              JSON.parse(
                JSON.parse(renameSalaryStructureRes.data._server_messages)[0]
              ).message.split("<Br>")[0]
            );
            setModalTitle("Message");
            setLoad(false);
            return;
          }

          const addEmployeeSalaryDetailRes =
            await empApi.addEmployeeSalaryDetail(
              employeeId,
              doj,
              collegeConfig?.is_university
                ? formikRef?.current?.values?.college?.collegeName
                : collegeName,
              allowanceArr,
              deductionArr
            );
          console.log(
            "addEmployeeSalaryDetailRes---",
            addEmployeeSalaryDetailRes
          );
          if (!addEmployeeSalaryDetailRes?.data?.message?.success) {
            setModalErrorOpen(true);
            setModalMessage(addEmployeeSalaryDetailRes?.data?.message?.message);
            setModalTitle("Message");
            setLoad(false);
            return;
          }

          // const salaryStructureCancelReassign =
          //   await empApi.salaryStructureCancelReassign(
          //     employeeId,
          //     allowanceArrToPass,
          //     deductionArrToPass,
          //     collegeConfig?.is_university
          //       ? formikRef?.current?.values?.college?.collegeName
          //       : collegeName,
          //     doj
          //   );
          // console.log(
          //   "salaryStructureCancelReassign---",
          //   salaryStructureCancelReassign
          // );
          // if (!salaryStructureCancelReassign?.data?.message?.success) {
          //   setModalErrorOpen(true);
          //   setModalMessage(
          //     salaryStructureCancelReassign?.data?.message?.message
          //   );
          //   setModalTitle("Message");
          //   setLoad(false);
          //   return;
          // }
          // //create salary structure assignment
          // const insertSalaryStructureAssignmentRes =
          //   await empApi.insertSalaryStructureAssignment(
          //     employeeId,
          //     allowanceArrToPass,
          //     deductionArrToPass,
          //     collegeConfig?.is_university
          //       ? formikRef?.current?.values?.college?.collegeName
          //       : collegeName,
          //     doj
          //   );
          // console.log(
          //   "insertSalaryStructureAssignmentRes---",
          //   insertSalaryStructureAssignmentRes
          // );
          // if (!insertSalaryStructureAssignmentRes?.data?.message?.success) {
          //   setModalErrorOpen(true);
          //   setModalMessage(
          //     insertSalaryStructureAssignmentRes?.data?.message?.message
          //   );
          //   setModalTitle("Message");
          //   setLoad(false);
          //   return;
          // }
          handleUnSavedChanges(0);
          setShowConfirm(true);
          setLoad(false);
          return;
        } else {
          setLoad(true);
          console.log("employeeDetail---", employeeDetail);
          const addEmployeeSalaryDetailRes =
            await empApi.addEmployeeSalaryDetail(
              employeeId,
              doj,
              collegeConfig?.is_university
                ? formikRef?.current?.values?.college?.collegeName
                : collegeName,
              allowanceArr,
              deductionArr
            );
          console.log(
            "addEmployeeSalaryDetailRes---",
            addEmployeeSalaryDetailRes
          );
          if (!addEmployeeSalaryDetailRes?.data?.message?.success) {
            setModalErrorOpen(true);
            setModalMessage(addEmployeeSalaryDetailRes?.data?.message?.message);
            setModalTitle("Message");
            setLoad(false);
            return;
          }
          handleTabChange(5, false);
          handleUnSavedChanges(0);
          setShowConfirm(true);
          setLoad(false);
        }
        return;
      }
      setLoad(true);
      console.log("employeeDetail---", employeeDetail);
      const addEmployeeSalaryDetailRes = await empApi.addEmployeeSalaryDetail(
        employeeId,
        doj,
        collegeConfig?.is_university
          ? formikRef?.current?.values?.college?.collegeName
          : collegeName,
        allowanceArr,
        deductionArr
      );
      console.log("addEmployeeSalaryDetailRes---", addEmployeeSalaryDetailRes);
      if (!addEmployeeSalaryDetailRes?.data?.message?.success) {
        setModalErrorOpen(true);
        setModalMessage(addEmployeeSalaryDetailRes?.data?.message?.message);
        setModalTitle("Message");
        setLoad(false);
        return;
      }
      handleTabChange(5, false);
      handleUnSavedChanges(0);
      setShowConfirm(true);
      setLoad(false);
    } catch (error) {
      setLoad(false);
      console.log("Exception--", error);
    }
  };

  // const handleStateID = async (values) => {
  //   console.log("cityValuessss---", values);

  //   console.log("stateArrayList---", stateArrayList);

  //   if (values) {
  //     let data = {};
  //     stateArrayList?.map((item) => {
  //       if (item?.state === values) {
  //         data = {
  //           state: item?.state,
  //           id: item?.id,
  //         };
  //       }
  //     });
  //     console.log("data---", data);
  //     handleTempCityByState(data, 1);
  //   }
  // };

  const setFormFieldValues = async (empRes, stateData) => {
    console.log("stateData---", stateData);
    console.log("empRes---", empRes);
    if (formikRef?.current) {
      if (collegeConfig?.is_university) {
        for (let i = 0; i < collegeConfig?.collegeList?.length; i++) {
          if (collegeConfig?.collegeList[i]?.collegeName == empRes?.company) {
            formikRef?.current?.setFieldValue(
              "college",
              collegeConfig?.collegeList[i]
            );
            getDepartmentList({
              collegeID: collegeConfig?.collegeList[i]?.collegeID,
              department: empRes?.department,
            });
            break;
          }
        }
      } else {
        getDepartmentList({
          collegeID: collegeId,
          department: empRes?.department,
        });
      }
      empRes?.salutation &&
        formikRef?.current?.setFieldValue("salutation", {
          id: empRes?.salutation,
          salutation: empRes?.salutation,
        });
      empRes?.first_name &&
        formikRef?.current?.setFieldValue("employeeName", empRes?.first_name);
      empRes?.custom_father_name &&
        formikRef?.current?.setFieldValue(
          "fatherName",
          empRes?.custom_father_name
        );
      empRes?.date_of_birth &&
        formikRef?.current?.setFieldValue(
          "dob",
          new Date(empRes?.date_of_birth)
        );

      empRes?.gender &&
        formikRef?.current?.setFieldValue("gender", {
          id: empRes?.gender,
          gender: empRes?.gender,
        });
      empRes?.marital_status &&
        formikRef?.current?.setFieldValue("maritalStatus", {
          label: empRes?.marital_status,
          value: empRes?.marital_status,
        });
      empRes?.custom_mother_name &&
        formikRef?.current?.setFieldValue(
          "motherName",
          empRes?.custom_mother_name
        );
      empRes?.custom_spouse_name &&
        formikRef?.current?.setFieldValue(
          "spouseName",
          empRes?.custom_spouse_name
        );

      empRes?.blood_group &&
        formikRef?.current?.setFieldValue("bloodGroup", {
          id: empRes?.blood_group,
          bloodGroup: empRes?.blood_group,
        });

      empRes?.custom_community &&
        formikRef?.current?.setFieldValue("community", {
          id: empRes?.custom_community,
          community: empRes?.custom_community,
        });
      empRes?.custom_caste &&
        formikRef?.current?.setFieldValue("caste", {
          id: empRes?.custom_caste,
          caste: empRes?.custom_caste,
        });
      empRes?.custom_religion &&
        formikRef?.current?.setFieldValue("religion", {
          id: empRes?.custom_religion,
          religion: empRes?.custom_religion,
        });
      empRes?.custom_nationality &&
        formikRef?.current?.setFieldValue("nationality", {
          id: empRes?.custom_nationality,
          nationality: empRes?.custom_nationality,
        });
      empRes?.custom_mother_tongue &&
        formikRef?.current?.setFieldValue("motherTongue", {
          id: empRes?.custom_mother_tongue,
          motherTongue: empRes?.custom_mother_tongue,
        });
      empRes?.custom_language_known &&
        formikRef?.current?.setFieldValue(
          "languageKnown",
          empRes?.custom_language_known
        );
      empRes?.cell_number &&
        formikRef?.current?.setFieldValue("mobileNo", empRes?.cell_number);

      empRes?.custom_mobile_2 &&
        formikRef?.current?.setFieldValue("mobileNo2", empRes?.custom_mobile_2);
      empRes?.personal_email &&
        formikRef?.current?.setFieldValue("email", empRes?.personal_email);
      setEmployeeNumber(empRes?.custom_employeeid);
    }

    if (workRef?.current) {
      empRes?.employment_type &&
        workRef?.current?.setFieldValue("employmentType", {
          id: empRes?.employment_type,
          employmentType: empRes?.employment_type,
        });

      if (empRes?.date_of_joining) {
        workRef?.current?.setFieldValue("doj", moment(empRes?.date_of_joining));
        setDoj(empRes?.date_of_joining);
      }

      if (empRes?.custom_designation_category) {
        workRef?.current?.setFieldValue("designationCategory", {
          id: empRes?.custom_designation_category,
          designationCategory: empRes?.custom_designation_category,
        });
        await handleGetMasterDesignation(
          {
            id: empRes?.custom_designation_category,
            designationCategory: empRes?.custom_designation_category,
          },
          empRes?.designation
        );
      }
      // empRes?.designation &&
      //   workRef?.current?.setFieldValue("designation", {
      //     id: empRes?.designation,
      //     designation: empRes?.designation,
      //   });

      // if (empRes?.department) {
      //   for (let i = 0; i < staffDeptList?.length; i++) {
      //     if (staffDeptList[i]?.department_id == empRes?.department) {
      //       workRef?.current?.setFieldValue("department", staffDeptList[i]);
      //       break;
      //     }
      //   }
      // }

      empRes?.passport_number &&
        workRef?.current?.setFieldValue("passport", empRes?.passport_number);
      empRes?.place_of_issue &&
        workRef?.current?.setFieldValue("placeofIssue", {
          id: empRes?.place_of_issue,
          placeOfIssue: empRes?.place_of_issue,
        });
      empRes?.date_of_issue &&
        workRef?.current?.setFieldValue(
          "issueDate",
          new Date(empRes?.date_of_issue)
        );
      empRes?.valid_upto &&
        workRef?.current?.setFieldValue(
          "expiryDate",
          new Date(empRes?.valid_upto)
        );
      empRes?.custom_aadhaar_card &&
        workRef?.current?.setFieldValue(
          "aadhaarNo",
          empRes?.custom_aadhaar_card
        );
      empRes?.pan_number &&
        workRef?.current?.setFieldValue("panNo", empRes?.pan_number);
      empRes?.provident_fund_account &&
        workRef?.current?.setFieldValue("pfNo", empRes?.provident_fund_account);
      empRes?.salary_mode &&
        workRef?.current?.setFieldValue("salaryMode", {
          id: empRes?.salary_mode,
          salary_mode: empRes?.salary_mode,
        });
      empRes?.bank_name &&
        workRef?.current?.setFieldValue("bankName", {
          id: empRes?.bank_name,
          bank: empRes?.bank_name,
        });
      empRes?.bank_ac_no &&
        workRef?.current?.setFieldValue("accountNo", empRes?.bank_ac_no);
      empRes?.ifsc_code &&
        workRef?.current?.setFieldValue("ifscCode", empRes?.ifsc_code);
      empRes?.custom_bank_branch_name &&
        workRef?.current?.setFieldValue(
          "branchName",
          empRes?.custom_bank_branch_name
        );
      empRes?.person_to_be_contacted &&
        workRef?.current?.setFieldValue(
          "contactName1",
          empRes?.person_to_be_contacted
        );
      empRes?.relation &&
        workRef?.current?.setFieldValue("relation1", {
          value: empRes?.relation,
          label: empRes?.relation,
        });
      empRes?.emergency_phone_number &&
        workRef?.current?.setFieldValue(
          "contactNo1",
          empRes?.emergency_phone_number
        );

      empRes?.custom_emergency_contact_name_2 &&
        workRef?.current?.setFieldValue(
          "contactName2",
          empRes?.custom_emergency_contact_name_2
        );
      empRes?.custom_relation_2 &&
        workRef?.current?.setFieldValue("relation2", {
          value: empRes?.custom_relation_2,
          label: empRes?.custom_relation_2,
        });
      empRes?.custom_emergency_phone_2 &&
        workRef?.current?.setFieldValue(
          "contactNo2",
          empRes?.custom_emergency_phone_2
        );

      empRes?.current_address &&
        workRef?.current?.setFieldValue(
          "tempStreetLandMark",
          empRes?.current_address
        );
      empRes?.custom_current_place &&
        workRef?.current?.setFieldValue(
          "tempArea",
          empRes?.custom_current_place
        );
      if (empRes?.custom_current_state) {
        workRef?.current?.setFieldValue("tempState", {
          id: empRes?.custom_current_state,
          state: empRes?.custom_current_state,
        });
        if (
          empRes?.custom_current_state == "Puducherry" ||
          empRes?.custom_current_state == "Tamil Nadu"
        ) {
          tempOtherCity = false;
          empRes?.custom_current_city &&
            workRef?.current?.setFieldValue("tempCity", {
              id: empRes?.custom_current_city,
              city: empRes?.custom_current_city,
            });
          if (stateData) {
            let data = stateData?.filter(
              (item) => item?.state === empRes?.custom_current_state
            );

            handleCityByState(data[0]);
          }
        } else {
          tempOtherCity = true;
          empRes?.custom_current_city &&
            workRef?.current?.setFieldValue(
              "tempOtherCity",
              empRes?.custom_current_city
            );
        }
      }

      empRes?.custom_current_country &&
        workRef?.current?.setFieldValue("tempCountry", {
          id: empRes?.custom_current_country,
          country: empRes?.custom_current_country,
        });
      empRes?.custom_current_pincode &&
        workRef?.current?.setFieldValue(
          "tempPincode",
          empRes?.custom_current_pincode
        );

      empRes?.permanent_address &&
        workRef?.current?.setFieldValue(
          "streetLandMark",
          empRes?.permanent_address
        );
      empRes?.custom_permanent_place &&
        workRef?.current?.setFieldValue(
          "permanentArea",
          empRes?.custom_permanent_place
        );

      if (empRes?.custom_permanent_state) {
        console.log("empRes?.custom_permanent_state---");
        workRef?.current?.setFieldValue("permanentState", {
          id: empRes?.custom_permanent_state,
          state: empRes?.custom_permanent_state,
        });
        if (
          empRes?.custom_permanent_state == "Puducherry" ||
          empRes?.custom_permanent_state == "Tamil Nadu"
        ) {
          otherCity = false;
          empRes?.custom_permanent_city &&
            workRef?.current?.setFieldValue("permanentCity", {
              id: empRes?.custom_permanent_city,
              city: empRes?.custom_permanent_city,
            });

          if (stateData) {
            let data = stateData?.filter(
              (item) => item?.state === empRes?.custom_permanent_state
            );

            handleCityByState(data[0]);
          }
        } else {
          otherCity = true;
          empRes?.custom_permanent_city &&
            workRef?.current?.setFieldValue(
              "otherCity",
              empRes?.custom_permanent_city
            );
        }
      }

      empRes?.custom_permanent_country &&
        workRef?.current?.setFieldValue("permanentCountry", {
          id: empRes?.custom_permanent_country,
          country: empRes?.custom_permanent_country,
        });
      empRes?.custom_permanent__pincode &&
        workRef?.current?.setFieldValue(
          "permanentPincode",
          empRes?.custom_permanent__pincode
        );
    }
  };

  const getDepartmentList = async (college) => {
    console.log("college---", college);
    const getDepartmentListRes = await empApi.getAllMasters(
      2,
      college?.collegeID
    );
    console.log("getDepartmentListRes---", getDepartmentListRes);
    setStaffDeptList(getDepartmentListRes?.data?.message?.data?.department);

    if (college?.department) {
      for (
        let i = 0;
        i < getDepartmentListRes?.data?.message?.data?.department?.length;
        i++
      ) {
        if (
          getDepartmentListRes?.data?.message?.data?.department[i]
            ?.department_id == college.department
        ) {
          workRef?.current?.setFieldValue(
            "department",
            getDepartmentListRes?.data?.message?.data?.department[i]
          );
          break;
        }
      }
    }
  };

  const handleCollegeChange = async (college_id) => {
    console.log("college_id---", college_id);
    if (bloodGroupList?.length === 0) {
      const masterRes = await empApi.getAllMasters(1, college_id);
      console.log("masterRes---", masterRes);
      setBloodGroupList(masterRes?.data?.message?.data?.bloodGroup);
      setSalutationList(masterRes?.data?.message?.data?.salutation);
      setGenderList(masterRes?.data?.message?.data?.gender);
      setCommunityList(masterRes?.data?.message?.data?.community);
      setCasteList(masterRes?.data?.message?.data?.caste);
      setReligionList(masterRes?.data?.message?.data?.religion);
      setNationalityList(masterRes?.data?.message?.data?.nationality);
      setMotherTongueList(masterRes?.data?.message?.data?.motherTongue);

      if (masterRes?.data?.message?.data?.nationality?.length === 1) {
        formikRef?.current?.setFieldValue(
          "nationality",
          masterRes?.data?.message?.data?.nationality[0]
        );
      }
    }
  };

  const handleGetMasterDesignation = async (
    designationCategory,
    designation = null
  ) => {
    console.log("designationCategory---", designationCategory);
    try {
      const getDesignationRes = await empApi.getDesignation(
        designationCategory.designationCategory
      );
      console.log("getDesignationRes---", getDesignationRes);
      setDesignationList(getDesignationRes?.data?.data);
      if (designation) {
        for (let i = 0; i < getDesignationRes?.data?.data?.length; i++) {
          if (getDesignationRes?.data?.data[i]?.designation == designation) {
            workRef?.current?.setFieldValue(
              "designation",
              getDesignationRes?.data?.data[i]
            );
            break;
          }
        }
      }
    } catch (error) {
      console.log("Exception---", error);
    }
  };

  const handleTabChange = async (key1, change) => {
    qualificationRef?.current?.resetForm();
    console.log("key1---", key1);
    console.log("tabKey---", tabKey);
    if (key1 == tabKey) return;
    const key = parseInt(key1);
    setDeductionError(false);
    if (change && unSavedChanges) {
      setOpenLeavePageModel(true);
      return;
    }
    setActiveKey(key);
    setTabKey(key);
    setLoad(true);

    console.log("collegeConfig---", collegeConfig);
    if (key == 1) {
      let collegeID = collegeConfig.is_university ? "" : collegeId;
      if (location?.state?.id) {
        formikRef?.current?.resetForm();
        const getEmployeeByIdRes = await empApi.getEmployeeById(
          location?.state?.id
        );
        console.log("getEmployeeByIdRes---------------", getEmployeeByIdRes);
        setEmployeeDetail(getEmployeeByIdRes?.data?.data);
        collegeID = getEmployeeByIdRes?.data?.data?.custom_college_id;
        if (
          getEmployeeByIdRes?.data?.data?.image &&
          getEmployeeByIdRes?.data?.data?.image != ""
        ) {
          setDisplayImage(
            string?.TESTBASEURL + getEmployeeByIdRes?.data?.data?.image
          );
          setSrc(string?.TESTBASEURL + getEmployeeByIdRes?.data?.data?.image);
        }
        setFormFieldValues(getEmployeeByIdRes?.data?.data);
      }
      const masterRes = await empApi.getAllMasters(1, collegeID);
      console.log("masterRes---", masterRes);
      setBloodGroupList(masterRes?.data?.message?.data?.bloodGroup);
      setSalutationList(masterRes?.data?.message?.data?.salutation);
      setGenderList(masterRes?.data?.message?.data?.gender);
      setCommunityList(masterRes?.data?.message?.data?.community);
      setCasteList(masterRes?.data?.message?.data?.caste);
      setReligionList(masterRes?.data?.message?.data?.religion);
      setNationalityList(masterRes?.data?.message?.data?.nationality);
      setMotherTongueList(masterRes?.data?.message?.data?.motherTongue);

      if (masterRes?.data?.message?.data?.nationality?.length === 1) {
        formikRef?.current?.setFieldValue(
          "nationality",
          masterRes?.data?.message?.data?.nationality[0]
        );
      }
    } else if (key == 2) {
      const stateMasterRes = await studentApi?.getMaster(3);
      console.log("stateMasterRes---", stateMasterRes);

      const masterRes = await empApi.getAllMasters(
        2,
        collegeConfig.is_university
          ? formikRef.current.values.college.collegeID
          : collegeId
      );
      console.log("masterRes---", masterRes);
      setDesignationCategoryList(
        masterRes?.data?.message?.data?.designationCategory
      );
      if (masterRes?.data?.message?.data?.designationCategory?.length === 1) {
        await handleGetMasterDesignation(
          masterRes?.data?.message?.data?.designationCategory[0]
        );
      }
      setStaffDeptList(masterRes?.data?.message?.data?.department);
      setPlaceofIssueList(masterRes?.data?.message?.data?.placeOfIssue);
      setSalaryModeList(masterRes?.data?.message?.data?.salaryMode);
      setBankList(masterRes?.data?.message?.data?.bank);
      setCountryList(masterRes?.data?.message?.data?.country);
      setEmploymentTypeList(masterRes?.data?.message?.data?.employmentType);
      // setReportToList(masterRes?.data?.message?.data?.reportTo);

      setStateArrayList(stateMasterRes?.data?.message?.data?.state_data);
      setCityArrayList(stateMasterRes?.data?.message?.data?.city_data);
      setTempCityList(stateMasterRes?.data?.message?.data?.city_data);

      if (location?.state?.id) {
        workRef?.current?.resetForm();
      }
      if (masterRes?.data?.message?.data?.country?.length === 1) {
        workRef?.current?.setFieldValue(
          "permanentCountry",
          masterRes?.data?.message?.data?.country[0]
        );
        workRef?.current?.setFieldValue(
          "tempCountry",
          masterRes?.data?.message?.data?.country[0]
        );
      }
      for (
        let k = 0;
        k < stateMasterRes?.data?.message?.data?.state_data?.length;
        k++
      ) {
        if (
          stateMasterRes?.data?.message?.data?.state_data[k]?.state ===
          "Tamil Nadu"
        ) {
          otherCity = false;
          workRef?.current?.setFieldValue(
            "permanentState",
            stateMasterRes?.data?.message?.data?.state_data[k]
          );
          workRef?.current?.setFieldValue(
            "tempState",
            stateMasterRes?.data?.message?.data?.state_data[k]
          );
        }
      }

      if (location?.state?.id) {
        const getEmployeeByIdRes = await empApi.getEmployeeById(
          location?.state?.id
        );
        console.log("getEmployeeByIdRes---------------", getEmployeeByIdRes);
        setEmployeeDetail(getEmployeeByIdRes?.data?.data);

        setFormFieldValues(
          getEmployeeByIdRes?.data?.data,
          stateMasterRes?.data?.message?.data?.state_data
        );
        if (getEmployeeByIdRes?.data?.data?.reports_to) {
          const empNameRes = await empApi.getEmployeeID(
            getEmployeeByIdRes.data.data.reports_to
          );
          console.log("empNameRes---", empNameRes);
          workRef?.current?.setFieldValue("reportTo", {
            name: getEmployeeByIdRes.data.data.reports_to,
            custom_employeeid: empNameRes?.data?.data[0]?.custom_employeeid,
            employee_name: empNameRes?.data?.data[0]?.employee_name,
          });
        }
      }
      document?.getElementById("employmentType")?.focus();
    } else if (key === 3) {
      if (location?.state?.id) {
        setExperienceArr([]);
        const getEmployeeByIdRes = await empApi.getEmployeeById(
          location?.state?.id
        );
        console.log("getEmployeeByIdRes---------------", getEmployeeByIdRes);
        setExperienceArr(getEmployeeByIdRes?.data?.data?.external_work_history);
      }

      document?.getElementById("expOrganisationName")?.focus();
    } else if (key == 4) {
      if (qualificationList?.length === 0) {
        const getQualRes = await empApi.getQualificationList();
        console.log("getQualRes--", getQualRes);
        setQualificationList(getQualRes?.data?.data);
      }
      if (location?.state?.id) {
        setCertificateArr([]);
        const getEmployeeByIdRes = await empApi.getEmployeeById(
          location?.state?.id
        );
        console.log("getEmployeeByIdRes---------------", getEmployeeByIdRes);
        setCertificateArr(getEmployeeByIdRes?.data?.data?.education);
      }
    } else if (key == 5) {
      const getAllowanceListRes = await empApi.getAllowanceList(1);
      console.log("getAllowanceListRes--", getAllowanceListRes);
      let allowanceComponentList = [];
      let deductionComponentList = [];

      if (location?.state?.id) {
        setDeductionArr([]);
        setAllowanceArr([]);
        salaryRef?.current?.resetForm();
        salDeductionRef?.current?.resetForm();
        setDeductionTotal(0);
        setAllowanceTotal(0);
        const viewSalaryRes = await empApi.viewSalary(location?.state?.id);
        console.log("viewSalaryRes---", viewSalaryRes);
        setOldSalary(viewSalaryRes?.data?.data);
        if (viewSalaryRes?.ok) {
          setAllowanceArr(viewSalaryRes?.data?.data?.earnings);
          let tot = 0;
          for (
            let i = 0;
            i < viewSalaryRes?.data?.data?.earnings?.length;
            i++
          ) {
            tot += parseInt(viewSalaryRes?.data?.data?.earnings[i]?.amount);
          }
          setAllowanceTotal(tot);

          setDeductionArr(viewSalaryRes?.data?.data?.deductions);
          tot = 0;
          for (
            let i = 0;
            i < viewSalaryRes?.data?.data?.deductions?.length;
            i++
          ) {
            tot += parseInt(viewSalaryRes?.data?.data?.deductions[i]?.amount);
          }
          setDeductionTotal(tot);
          setShowConfirm(true);

          for (let i = 0; i < getAllowanceListRes?.data?.data?.length; i++) {
            if (getAllowanceListRes?.data?.data[i]?.type == "Earning") {
              let parList = viewSalaryRes?.data?.data?.earnings?.filter(
                (e) =>
                  e?.salary_component ===
                  getAllowanceListRes?.data?.data[i]?.salary_component
              );
              if (parList?.length === 0)
                allowanceComponentList?.push(
                  getAllowanceListRes?.data?.data[i]
                );
            } else if (
              getAllowanceListRes?.data?.data[i]?.type == "Deduction"
            ) {
              let parList = viewSalaryRes?.data?.data?.deductions?.filter(
                (e) =>
                  e?.salary_component ===
                  getAllowanceListRes?.data?.data[i]?.salary_component
              );
              if (parList?.length === 0)
                deductionComponentList?.push(
                  getAllowanceListRes?.data?.data[i]
                );
            }
          }
        } else {
          for (let i = 0; i < getAllowanceListRes?.data?.data?.length; i++) {
            if (getAllowanceListRes?.data?.data[i]?.type == "Earning") {
              allowanceComponentList?.push(getAllowanceListRes?.data?.data[i]);
            } else if (
              getAllowanceListRes?.data?.data[i]?.type == "Deduction"
            ) {
              deductionComponentList?.push(getAllowanceListRes?.data?.data[i]);
            }
          }
        }
      } else {
        for (let i = 0; i < getAllowanceListRes?.data?.data?.length; i++) {
          if (getAllowanceListRes?.data?.data[i]?.type == "Earning") {
            allowanceComponentList?.push(getAllowanceListRes?.data?.data[i]);
          } else if (getAllowanceListRes?.data?.data[i]?.type == "Deduction") {
            deductionComponentList?.push(getAllowanceListRes?.data?.data[i]);
          }
        }
      }
      setAllowanceList(allowanceComponentList);
      setDeductionList(deductionComponentList);
    }
    setLoad(false);
  };

  const setTemporaryAddress = (values) => {
    if (workRef?.current) {
      if (values?.sameAsPermanentAddress) {
        workRef?.current?.setFieldValue("tempArea", "");
        workRef?.current?.setFieldValue("tempCity", "");
        workRef.current.setFieldValue("tempOtherCity", "");
        workRef?.current?.setFieldValue("tempCountry", "");
        workRef?.current?.setFieldValue("tempPincode", "");
        workRef?.current?.setFieldValue("tempState", "");
        workRef?.current?.setFieldValue("tempStreetLandMark", "");
      } else {
        workRef?.current?.setFieldValue("tempArea", values?.permanentArea);
        if (otherCity) {
          tempOtherCity = true;
          workRef.current.setFieldValue("tempOtherCity", values.otherCity);
        } else {
          tempOtherCity = false;
          workRef.current.setFieldValue("tempCity", values.permanentCity);
        }
        workRef?.current?.setFieldValue(
          "tempCountry",
          values?.permanentCountry
        );
        workRef?.current?.setFieldValue(
          "tempPincode",
          values?.permanentPincode
        );
        workRef?.current?.setFieldValue("tempState", values?.permanentState);
        workRef?.current?.setFieldValue(
          "tempStreetLandMark",
          values?.streetLandMark
        );

        workRef?.current?.setFieldTouched("tempArea", false);
        workRef?.current?.setFieldTouched("tempCity", false);
        workRef?.current?.setFieldTouched("tempCountry", false);
        workRef?.current?.setFieldTouched("tempPincode", false);
        workRef?.current?.setFieldTouched("tempState", false);
        workRef?.current?.setFieldTouched("tempStreetLandMark", false);
      }
    }
  };

  const openLink = (item) => {
    window?.open(string?.FILEURL + item);
  };

  const employeeSearch = async (value) => {
    setReportToList([]);
    try {
      if (value.length > 2) {
        const employeeRes = await empApi.employeeSearch(value);
        console.log("employeeRes", employeeRes);
        setReportToList(employeeRes.data.message.employee_data);
      }
    } catch (error) {
      console.log("error----", error);
    }
  };

  const handleKeyDown = (e) => {
    if (e?.key === "F4") {
      e?.preventDefault();
      console.log("F4 pressed", activeKey);
      if (activeKey == 1) {
        $("#personal:first").click(); // Trigger button click
      } else if (activeKey == 2) {
        $("#work:first").click(); // Trigger button click
      } else if (activeKey == 3) {
        $("#experience:first").click(); // Trigger button click
      } else if (activeKey == 4) {
        $("#qualification:first").click(); // Trigger button click
      } else if (activeKey == 5) {
        $("#salary:first").click(); // Trigger button click
      }
    }
  };

  useEffect(() => {
    if (location?.state?.id) {
      setEmployeeId(location?.state?.id);
      handleTabChange(1, false);
    }
  }, []);

  useEffect(() => {
    if (!collegeConfig.is_university) {
      handleTabChange(1, false);
    }
  }, [collegeConfig.is_university]);

  useEffect(() => {
    document?.addEventListener("keydown", handleKeyDown);
    return () => {
      document?.removeEventListener("keydown", handleKeyDown);
    };
  }, [activeKey]);

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
        {employeeDetail?.status === "Active" ? (
          <>
            <ScreenTitle
              customTitle="Update Employee"
              titleClass="page-heading-position-report"
            />
            <div>
              <Button
                text={"Back"}
                frmButton={false}
                className={"btn-3"}
                type="button"
                onClick={(e) =>
                  navigate("/view-employee", {
                    state: { id: employeeDetail?.custom_employeeid },
                  })
                }
              />
            </div>
          </>
        ) : (
          <ScreenTitle titleClass="page-heading-position-report" />
        )}
        <div className="row no-gutters mt-3">
          <Tabs
            activeKey={activeKey}
            id="uncontrolled-tab-example"
            className="text-center"
            fill
            onSelect={(e) => {
              handleTabChange(e, true);
              setPasskey(e);
            }}
          >
            <Tab
              eventKey={1}
              title="Personal"
              // disabled
              disabled={location?.state?.id ? false : true}
            >
              {/* <EmployeePersonalForm
                handleUnSavedChanges={handleUnSavedChanges}
                handleTabChange={handleTabChange}
                selectImage={selectImage}
                showImg={showImg}
                displayImage={displayImage}
                emoployeeId={location?.state?.id}
                getDepartmentList={getDepartmentList}
                handlePersonalValidation={handlePersonalValidation}
                src={src}
                setSrc={setSrc}
              /> */}
              <Formik
                innerRef={formikRef}
                enableReinitialize={false}
                initialValues={{
                  college: "",
                  salutation: "",
                  employeeName: "",
                  fatherName: "",
                  dob: "",
                  gender: "",
                  maritalStatus: "",
                  motherName: "",
                  spouseName: "",
                  bloodGroup: "",
                  community: "",
                  caste: "",
                  religion: "",
                  nationality: "",
                  motherTongue: "",
                  languageKnown: "",
                  mobileNo: "",
                  mobileNo2: "",
                  email: "",
                }}
                validationSchema={FormSchema}
                onSubmit={handlePersonalValidation}
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
                        {collegeConfig.is_university && (
                          <>
                            <SelectFieldFormik
                              autoFocus
                              tabIndex={0}
                              label="College"
                              id="college"
                              mandatory={1}
                              labelSize={3}
                              matchFrom="start"
                              options={collegeConfig?.collegeList}
                              getOptionLabel={(option) => option?.collegeName}
                              getOptionValue={(option) => option?.collegeID}
                              searchIcon={false}
                              clear={false}
                              style={{ width: "80%" }}
                              onChange={(text) => {
                                setFieldValue("college", text);
                                handleUnSavedChanges(1);
                                handleCollegeChange(text?.collegeID);
                              }}
                            />

                            <div className="subhead-row">
                              <div className="subhead">Personal Detail </div>
                              <div className="col line-div"></div>
                            </div>
                          </>
                        )}
                        <div className="row no-gutters">
                          <div className="col-lg-9">
                            <SelectFieldFormik
                              autoFocus={
                                collegeConfig?.is_university ? false : true
                              }
                              tabIndex={1}
                              id="salutation"
                              label="Salutation"
                              matchFrom="start"
                              placeholder=" "
                              labelSize={4}
                              options={salutationList}
                              getOptionLabel={(option) => option?.salutation}
                              getOptionValue={(option) => option?.salutation}
                              mandatory={1}
                              maxlength={5}
                              style={{ width: "30%" }}
                              onChange={(text) => {
                                setFieldValue("salutation", text);
                                handleUnSavedChanges(1);
                              }}
                            />
                            <TextFieldFormik
                              tabIndex={2}
                              id="employeeName"
                              maxlength={45}
                              label="Employee Name"
                              labelSize={4}
                              mandatory={1}
                              onChange={(e) => {
                                setFieldValue(
                                  "employeeName",
                                  preFunction.capitalizeFirst(e?.target?.value)
                                );
                                handleUnSavedChanges(1);
                              }}
                            />
                            <TextFieldFormik
                              tabIndex={3}
                              id="fatherName"
                              label="Father Name"
                              maxlength={45}
                              mandatory={1}
                              labelSize={4}
                              onChange={(e) => {
                                setFieldValue(
                                  "fatherName",
                                  preFunction.capitalizeFirst(e?.target?.value)
                                );
                                handleUnSavedChanges(1);
                              }}
                            />
                            <DateFieldFormik
                              tabIndex={4}
                              label="Date of Birth"
                              id="dob"
                              // maxDate={moment().subtract(18, "years")}
                              // minDate={moment().subtract(70, "years")}
                              minDate={null}
                              maxDate={null}
                              mandatory={1}
                              labelSize={4}
                              style={{ width: "40%" }}
                              onChange={(e) => {
                                setFieldValue("dob", e?.target?.value);
                                handleUnSavedChanges(1);
                              }}
                            />
                            <SelectFieldFormik
                              tabIndex={5}
                              label="Gender"
                              id="gender"
                              mandatory={1}
                              maxlength={7}
                              labelSize={4}
                              matchFrom="start"
                              getOptionLabel={(option) => option?.gender}
                              getOptionValue={(option) => option?.gender}
                              options={genderList}
                              style={{ width: "60%" }}
                              onChange={(text) => {
                                setFieldValue("gender", text);
                                handleUnSavedChanges(1);
                              }}
                            />

                            <TextFieldFormik
                              tabIndex={6}
                              id="motherName"
                              label="Mother Name"
                              labelSize={4}
                              onChange={(e) => {
                                setFieldValue(
                                  "motherName",
                                  preFunction.capitalizeFirst(e?.target?.value)
                                );
                                handleUnSavedChanges(1);
                              }}
                            />
                            <SelectFieldFormik
                              tabIndex={7}
                              label="Marital Status"
                              id="maritalStatus"
                              mandatory={1}
                              matchFrom="start"
                              options={maritalStatusList}
                              maxlength={7}
                              labelSize={4}
                              style={{ width: "50%" }}
                              onChange={(text) => {
                                setFieldValue("maritalStatus", text);
                                handleUnSavedChanges(1);
                              }}
                            />
                            <TextFieldFormik
                              tabIndex={8}
                              id="spouseName"
                              label="Spouse Name"
                              style={{ width: "80%" }}
                              labelSize={4}
                              onChange={(e) => {
                                setFieldValue(
                                  "spouseName",
                                  preFunction.capitalizeFirst(e?.target?.value)
                                );
                                handleUnSavedChanges(1);
                              }}
                            />
                            <SelectFieldFormik
                              tabIndex={9}
                              label="Blood Group"
                              placeholder="Group"
                              id="bloodGroup"
                              matchFrom="start"
                              // mandatory={1}
                              clear={true}
                              labelSize={4}
                              getOptionLabel={(option) => option?.bloodGroup}
                              getOptionValue={(option) => option?.bloodGroup}
                              options={bloodGroupList}
                              maxlength={4}
                              style={{ width: "40%" }}
                              onChange={(text) => {
                                setFieldValue("bloodGroup", text);
                                handleUnSavedChanges(1);
                              }}
                            />
                            <SelectFieldFormik
                              tabIndex={10}
                              label="Community"
                              id="community"
                              // mandatory={1}
                              clear={true}
                              labelSize={4}
                              matchFrom="start"
                              getOptionLabel={(option) => option?.community}
                              getOptionValue={(option) => option?.community}
                              options={communityList}
                              maxlength={13}
                              style={{ width: "50%" }}
                              onChange={(text) => {
                                setFieldValue("community", text);
                                handleUnSavedChanges(1);
                              }}
                            />
                            <SelectFieldFormik
                              tabIndex={11}
                              label="Caste"
                              id="caste"
                              matchFrom="start"
                              clear={true}
                              getOptionLabel={(option) => option?.caste}
                              getOptionValue={(option) => option?.caste}
                              options={casteList}
                              labelSize={4}
                              maxlength={15}
                              onChange={(text) => {
                                setFieldValue("caste", text);
                                handleUnSavedChanges(1);
                              }}
                            />
                            <SelectFieldFormik
                              tabIndex={12}
                              label="Religion"
                              id="religion"
                              // mandatory={1}
                              clear={true}
                              labelSize={4}
                              matchFrom="start"
                              getOptionLabel={(option) => option?.religion}
                              getOptionValue={(option) => option?.religion}
                              options={religionList}
                              maxlength={13}
                              style={{ width: "50%" }}
                              onChange={(text) => {
                                setFieldValue("religion", text);
                                handleUnSavedChanges(1);
                              }}
                            />
                            <SelectFieldFormik
                              tabIndex={13}
                              label="Nationality"
                              id="nationality"
                              mandatory={1}
                              labelSize={4}
                              matchFrom="start"
                              getOptionLabel={(option) => option?.nationality}
                              getOptionValue={(option) => option?.nationality}
                              options={nationalityList}
                              maxlength={10}
                              style={{ width: "50%" }}
                              onChange={(text) => {
                                setFieldValue("nationality", text);
                                handleUnSavedChanges(1);
                              }}
                            />
                            {/* {employeeDetail?.status === "Active" ? (
                              <DisplayText
                                label={"Mobile No. 1"}
                                value={employeeDetail?.cell_number}
                                labelSize={4}
                              />
                            ) : ( */}
                            <TextFieldFormik
                              tabIndex={14}
                              id="mobileNo"
                              label="Mobile No. 1"
                              labelSize={4}
                              onChange={(e) => {
                                if (
                                  preFunction.amountValidation(e?.target?.value)
                                ) {
                                  setFieldValue("mobileNo", e?.target?.value);
                                  handleUnSavedChanges(1);
                                }
                              }}
                              style={{ width: "50%" }}
                              mandatory={1}
                              maxlength={10}
                            />
                            {/* )} */}

                            <TextFieldFormik
                              tabIndex={15}
                              id="mobileNo2"
                              label="Mobile No. 2"
                              labelSize={4}
                              onChange={(e) => {
                                if (
                                  preFunction.amountValidation(e?.target?.value)
                                ) {
                                  setFieldValue("mobileNo2", e?.target?.value);
                                  handleUnSavedChanges(1);
                                }
                              }}
                              style={{ width: "50%" }}
                              maxlength={10}
                            />
                            {employeeDetail?.status === "Active" ? (
                              <DisplayText
                                label={"Employee Email ID"}
                                value={employeeDetail?.personal_email}
                                labelSize={4}
                              />
                            ) : (
                              <TextFieldFormik
                                tabIndex={16}
                                id="email"
                                label="Employee Email ID"
                                labelSize={4}
                                onChange={(e) => {
                                  setFieldValue("email", e?.target?.value);
                                  handleUnSavedChanges(1);
                                }}
                                style={{ width: "80%" }}
                                mandatory={1}
                                maxlength={140}
                              />
                            )}
                            <SelectFieldFormik
                              tabIndex={17}
                              label="Mother Tongue"
                              placeholder={" "}
                              id="motherTongue"
                              labelSize={4}
                              matchFrom="start"
                              clear={true}
                              getOptionLabel={(option) => option?.motherTongue}
                              getOptionValue={(option) => option?.motherTongue}
                              options={motherTongueList}
                              style={{ width: "50%" }}
                              maxlength={7}
                              onChange={(text) => {
                                setFieldValue("motherTongue", text);
                                handleUnSavedChanges(1);
                              }}
                            />
                            <TextFieldFormik
                              tabIndex={18}
                              id="languageKnown"
                              name="languageKnown"
                              label="Language Known"
                              onChange={(e) => {
                                setFieldValue(
                                  "languageKnown",
                                  e?.target?.value
                                );
                                handleUnSavedChanges(1);
                              }}
                              style={{ width: "80%" }}
                              labelSize={4}
                            />
                          </div>
                          <div
                            id="imgError"
                            className="col-lg-3 text-center p-3"
                          >
                            <div className="label">
                              <input
                                type="file"
                                accept="image/*"
                                name="fileinput"
                                id="fileinput"
                                onChange={(e) => {
                                  selectImage(e?.target?.files[0]);
                                  handleUnSavedChanges(1);
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
                                    marginTop: 50,
                                    marginLeft: -30,
                                    cursor: "pointer",
                                  }}
                                />
                              </label>
                              <ErrorMessage
                                Message={"Please upload employee photo"}
                                view={showImg}
                              />
                            </div>
                          </div>
                        </div>
                        <Button
                          tabIndex={19}
                          type="submit"
                          id="personal"
                          text="F4 - Next"
                          onClick={(e) => preFunction.handleErrorFocus(errors)}
                        />
                      </div>
                    </form>
                  );
                }}
              </Formik>
            </Tab>
            <Tab
              eventKey={2}
              title="Work"
              // disabled
              disabled={location?.state?.id ? false : true}
            >
              <Formik
                innerRef={workRef}
                enableReinitialize={false}
                initialValues={{
                  pfNo: "",
                  employmentType: "",
                  doj: "",
                  designationCategory: "",
                  designation: "",
                  department: "",
                  reportTo: "",
                  passport: "",
                  placeofIssue: "",
                  issueDate: "",
                  expiryDate: "",
                  aadhaarNo: "",
                  panNo: "",
                  salaryMode: "",
                  bankName: "",
                  accountNo: "",
                  ifscCode: "",
                  branchName: "",
                  contactName1: "",
                  relation1: "",
                  contactNo1: "",
                  contactName2: "",
                  relation2: "",
                  contactNo2: "",
                  tempStreetLandMark: "",
                  tempArea: "",
                  tempOtherCity: "",
                  tempCity: "",
                  tempState: "",
                  tempCountry: "",
                  tempPincode: "",
                  streetLandMark: "",
                  permanentArea: "",
                  otherCity: "",
                  permanentCity: "",
                  permanentState: "",
                  permanentCountry: "",
                  permanentPincode: "",
                  sameAsPermanentAddress: false,
                }}
                validationSchema={OtherFormSchema}
                onSubmit={handleWorkDetail}
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
                          <div className="subhead">Employment Detail </div>
                          <div className="col line-div"></div>
                        </div>
                        <div className="col-lg-12">
                          <SelectFieldFormik
                            autoFocus
                            label="Employment Type"
                            id="employmentType"
                            mandatory={1}
                            getOptionLabel={(option) => option?.employmentType}
                            getOptionValue={(option) => option?.employmentType}
                            labelSize={3}
                            tabIndex={20}
                            matchFrom="start"
                            options={employmentTypeList}
                            maxlength={10}
                            style={{ width: "40%" }}
                            onChange={(text) => {
                              setFieldValue("employmentType", text);
                              handleUnSavedChanges(1);
                            }}
                          />
                          {employeeDetail?.status === "Active" ? (
                            <DisplayText
                              label={"Date of Joining"}
                              value={moment(
                                employeeDetail?.date_of_joining
                              ).format("DD-MM-YYYY")}
                              labelSize={3}
                            />
                          ) : (
                            <DateFieldFormik
                              label="Date of Joining"
                              id="doj"
                              style={{ width: "30%" }}
                              maxDate={null}
                              minDate={null}
                              labelSize={3}
                              tabIndex={21}
                              mandatory={1}
                              onChange={(e) => {
                                setFieldValue("doj", e?.target?.value);
                                handleUnSavedChanges(1);
                              }}
                            />
                          )}
                          <SelectFieldFormik
                            label="Designation Category"
                            id="designationCategory"
                            mandatory={1}
                            maxlength={20}
                            tabIndex={22}
                            matchFrom="start"
                            getOptionLabel={(option) =>
                              option?.designationCategory
                            }
                            getOptionValue={(option) =>
                              option?.designationCategory
                            }
                            options={designationCategoryList}
                            style={{ width: "70%" }}
                            labelSize={3}
                            onChange={(text) => {
                              setFieldValue("designationCategory", text);
                              setFieldValue("designation", "");
                              handleGetMasterDesignation(text);
                              handleUnSavedChanges(1);
                            }}
                          />
                          <SelectFieldFormik
                            label="Designation"
                            id="designation"
                            mandatory={1}
                            maxlength={20}
                            tabIndex={23}
                            matchFrom="start"
                            getOptionLabel={(option) => option?.designation}
                            getOptionValue={(option) => option?.designation}
                            options={designationList}
                            style={{ width: "70%" }}
                            labelSize={3}
                            onChange={(text) => {
                              setFieldValue("designation", text);
                              handleUnSavedChanges(1);
                            }}
                          />
                          <SelectFieldFormik
                            label="Department"
                            id="department"
                            mandatory={1}
                            maxlength={30}
                            tabIndex={24}
                            options={staffDeptList}
                            labelSize={3}
                            matchFrom="start"
                            getOptionLabel={(option) => option?.department}
                            getOptionValue={(option) => option?.department_id}
                            onChange={(text) => {
                              setFieldValue("department", text);
                              handleUnSavedChanges(1);
                            }}
                          />

                          <SelectFieldFormik
                            label="Report To"
                            id="reportTo"
                            maxlength={20}
                            tabIndex={25}
                            labelSize={3}
                            matchFrom="start"
                            clear={true}
                            getOptionLabel={(option) =>
                              option?.custom_employeeid +
                              " - " +
                              option?.employee_name
                            }
                            searchIcon={true}
                            getOptionValue={(option) => option?.name}
                            options={reportToList}
                            onInputChange={(e) => {
                              employeeSearch(e);
                            }}
                            style={{ width: "70%" }}
                            onChange={(text) => {
                              setFieldValue("reportTo", text);
                              handleUnSavedChanges(1);
                            }}
                          />
                        </div>
                        <div className="subhead-row">
                          <div className="subhead">Passport Detail </div>
                          <div className="col line-div"></div>
                        </div>
                        <div className="row no-gutters">
                          <TextFieldFormik
                            id="passport"
                            label="Passport No."
                            tabIndex={26}
                            labelSize={3}
                            onChange={(e) => {
                              setFieldValue("passport", e?.target?.value);
                              handleUnSavedChanges(1);
                            }}
                            style={{ width: "60%" }}
                            maxlength={18}
                          />
                          <SelectFieldFormik
                            label="Place of Issue"
                            id="placeofIssue"
                            tabIndex={27}
                            labelSize={3}
                            matchFrom="start"
                            getOptionLabel={(option) => option?.placeOfIssue}
                            getOptionValue={(option) => option?.placeOfIssue}
                            options={placeofIssueList}
                            maxlength={15}
                            clear={true}
                            style={{ width: "70%" }}
                            onChange={(text) => {
                              setFieldValue("placeofIssue", text);
                              handleUnSavedChanges(1);
                            }}
                          />
                          <DateFieldFormik
                            label="Issue Date"
                            id="issueDate"
                            tabIndex={28}
                            labelSize={3}
                            minDate={null}
                            maxDate={null}
                            style={{ width: "40%" }}
                            onChange={(e) => {
                              setFieldValue("issueDate", e?.target?.value);
                              handleUnSavedChanges(1);
                            }}
                          />
                          <DateFieldFormik
                            label="Expiry Date"
                            id="expiryDate"
                            tabIndex={29}
                            labelSize={3}
                            style={{ width: "40%" }}
                            minDate={null}
                            maxDate={null}
                            onChange={(e) => {
                              setFieldValue("expiryDate", e?.target?.value);
                              handleUnSavedChanges(1);
                            }}
                          />
                        </div>
                        <div className="subhead-row">
                          <div className="subhead">Bank Detail </div>
                          <div className="col line-div"></div>
                        </div>
                        <div className="row no-gutters">
                          <TextFieldFormik
                            id="aadhaarNo"
                            label="Aadhaar No."
                            labelSize={3}
                            tabIndex={30}
                            onChange={(e) => {
                              if (
                                preFunction.amountValidation(e?.target?.value)
                              ) {
                                setFieldValue("aadhaarNo", e?.target?.value);
                                handleUnSavedChanges(1);
                              }
                            }}
                            style={{ width: "50%" }}
                            maxlength={12}
                            // mandatory={1}
                          />
                          <SelectFieldFormik
                            label="Salary Mode"
                            id="salaryMode"
                            mandatory={1}
                            labelSize={3}
                            tabIndex={31}
                            matchFrom="start"
                            getOptionLabel={(option) => option?.salary_mode}
                            getOptionValue={(option) => option?.salary_mode}
                            options={salaryModeList}
                            style={{ width: "50%" }}
                            onChange={(text) => {
                              setFieldValue("salaryMode", text);
                              handleUnSavedChanges(1);
                            }}
                          />
                          {values?.salaryMode &&
                          values?.salaryMode?.salary_mode !== "Cash" ? (
                            <>
                              <SelectFieldFormik
                                label="Bank Name"
                                id="bankName"
                                labelSize={3}
                                tabIndex={32}
                                matchFrom="start"
                                getOptionLabel={(option) => option?.bank}
                                getOptionValue={(option) => option?.bank}
                                options={bankList}
                                // style={{ width: "80%" }}
                                mandatory={1}
                                onChange={(text) => {
                                  setFieldValue("bankName", text);
                                  handleUnSavedChanges(1);
                                }}
                              />
                              <TextFieldFormik
                                id="accountNo"
                                labelSize={3}
                                tabIndex={33}
                                label="Bank Account No."
                                onChange={(e) => {
                                  if (
                                    preFunction.amountValidation(
                                      e?.target?.value
                                    )
                                  ) {
                                    setFieldValue(
                                      "accountNo",
                                      e?.target?.value
                                    );
                                    handleUnSavedChanges(1);
                                  }
                                }}
                                style={{ width: "50%" }}
                                maxlength={18}
                                mandatory={1}
                              />
                              <TextFieldFormik
                                id="ifscCode"
                                label="IFSC"
                                labelSize={3}
                                tabIndex={34}
                                onChange={(e) => {
                                  setFieldValue("ifscCode", e?.target?.value);
                                  handleUnSavedChanges(1);
                                }}
                                style={{ width: "50%" }}
                                maxlength={15}
                                mandatory={1}
                              />
                              <TextFieldFormik
                                id="branchName"
                                label="Branch Name"
                                labelSize={3}
                                tabIndex={35}
                                onChange={(e) => {
                                  setFieldValue("branchName", e?.target?.value);
                                  handleUnSavedChanges(1);
                                }}
                                style={{ width: "80%" }}
                                maxlength={25}
                                mandatory={1}
                              />
                            </>
                          ) : null}
                          <TextFieldFormik
                            id="panNo"
                            label="PAN"
                            labelSize={3}
                            tabIndex={
                              !values?.salaryMode?.salary_mode ||
                              values?.salaryMode?.salary_mode === "Cash"
                                ? 32
                                : 36
                            }
                            onChange={(e) => {
                              setFieldValue("panNo", e?.target?.value);
                              handleUnSavedChanges(1);
                            }}
                            style={{ width: "50%" }}
                            maxlength={10}
                          />
                          <TextFieldFormik
                            id="pfNo"
                            name="pfNo"
                            labelSize={3}
                            maxlength={40}
                            tabIndex={
                              !values?.salaryMode?.salary_mode ||
                              values?.salaryMode?.salary_mode === "Cash"
                                ? 33
                                : 37
                            }
                            label="PF No."
                            onChange={(e) => {
                              setFieldValue("pfNo", e?.target?.value);
                              handleUnSavedChanges(1);
                            }}
                            style={{ width: "80%" }}
                          />
                        </div>
                        <div className="subhead-row">
                          <div className="subhead">
                            Emergency Contact Detail
                          </div>
                          <div className="col line-div"></div>
                        </div>
                        <div className="row no-gutters">
                          <TextFieldFormik
                            id="contactName1"
                            label="Contact Name1"
                            labelSize={3}
                            onChange={(e) => {
                              setFieldValue("contactName1", e?.target?.value);
                              handleUnSavedChanges(1);
                            }}
                            tabIndex={
                              !values?.salaryMode?.salary_mode ||
                              values?.salaryMode?.salary_mode === "Cash"
                                ? 34
                                : 38
                            }
                            style={{ width: "80%" }}
                            maxlength={25}
                            // mandatory={1}
                          />
                          <SelectFieldFormik
                            label="Relation 1"
                            id="relation1"
                            labelSize={3}
                            clear={true}
                            options={relationList}
                            matchFrom="start"
                            style={{ width: "50%" }}
                            // mandatory={1}
                            maxlength={6}
                            tabIndex={
                              !values?.salaryMode?.salary_mode ||
                              values?.salaryMode?.salary_mode === "Cash"
                                ? 35
                                : 39
                            }
                            onChange={(text) => {
                              setFieldValue("relation1", text);
                              handleUnSavedChanges(1);
                            }}
                          />
                          <TextFieldFormik
                            id="contactNo1"
                            labelSize={3}
                            label="Contact No.1"
                            onChange={(e) => {
                              if (
                                preFunction.amountValidation(e?.target?.value)
                              ) {
                                setFieldValue("contactNo1", e?.target?.value);
                                handleUnSavedChanges(1);
                              }
                            }}
                            tabIndex={
                              !values?.salaryMode?.salary_mode ||
                              values?.salaryMode?.salary_mode === "Cash"
                                ? 36
                                : 40
                            }
                            style={{ width: "50%" }}
                            maxlength={10}
                            // mandatory={1}
                          />
                          <TextFieldFormik
                            id="contactName2"
                            label="Contact Name 2"
                            labelSize={3}
                            onChange={(e) => {
                              setFieldValue("contactName2", e?.target?.value);
                              handleUnSavedChanges(1);
                            }}
                            tabIndex={
                              !values?.salaryMode?.salary_mode ||
                              values?.salaryMode?.salary_mode === "Cash"
                                ? 37
                                : 41
                            }
                            style={{ width: "80%" }}
                            maxlength={25}
                          />
                          <SelectFieldFormik
                            label="Relation 2"
                            id="relation2"
                            labelSize={3}
                            options={relationList}
                            maxlength={6}
                            clear={true}
                            style={{ width: "50%" }}
                            matchFrom="start"
                            tabIndex={
                              !values?.salaryMode?.salary_mode ||
                              values?.salaryMode?.salary_mode === "Cash"
                                ? 38
                                : 42
                            }
                            onChange={(text) => {
                              setFieldValue("relation2", text);
                              handleUnSavedChanges(1);
                            }}
                          />
                          <TextFieldFormik
                            id="contactNo2"
                            label="Contact No. 2"
                            labelSize={3}
                            onChange={(e) => {
                              if (
                                preFunction.amountValidation(e?.target?.value)
                              ) {
                                setFieldValue("contactNo2", e?.target?.value);
                                handleUnSavedChanges(1);
                              }
                            }}
                            tabIndex={
                              !values?.salaryMode?.salary_mode ||
                              values?.salaryMode?.salary_mode === "Cash"
                                ? 39
                                : 43
                            }
                            style={{ width: "50%" }}
                            maxlength={10}
                          />
                        </div>
                        <div className="subhead-row">
                          <div className="subhead">
                            Permanent Address Detail
                          </div>
                          <div className="col line-div"></div>
                        </div>
                        <div className="row no-gutters">
                          <TextFieldFormik
                            id="streetLandMark"
                            label="Street/Land Mark"
                            labelSize={3}
                            onChange={(e) => {
                              setFieldValue("streetLandMark", e?.target?.value);
                              handleUnSavedChanges(1);
                            }}
                            style={{ width: "80%" }}
                            tabIndex={
                              !values?.salaryMode?.salary_mode ||
                              values?.salaryMode?.salary_mode === "Cash"
                                ? 40
                                : 44
                            }
                            maxlength={140}
                            mandatory={1}
                          />
                          <TextFieldFormik
                            label="Area/Place"
                            id="permanentArea"
                            labelSize={3}
                            style={{ width: "80%" }}
                            mandatory={1}
                            tabIndex={
                              !values?.salaryMode?.salary_mode ||
                              values?.salaryMode?.salary_mode === "Cash"
                                ? 41
                                : 45
                            }
                            onChange={(e) => {
                              setFieldValue("permanentArea", e?.target?.value);
                              handleUnSavedChanges(1);
                            }}
                          />
                          <SelectFieldFormik
                            label="State"
                            id="permanentState"
                            labelSize={3}
                            getOptionLabel={(option) => option?.state}
                            getOptionValue={(option) => option?.id}
                            options={stateArrayList}
                            matchFrom="start"
                            style={{ width: "80%" }}
                            mandatory={1}
                            maxlength={20}
                            tabIndex={
                              !values?.salaryMode?.salary_mode ||
                              values?.salaryMode?.salary_mode === "Cash"
                                ? 42
                                : 46
                            }
                            onChange={(text) => {
                              setFieldValue("permanentState", text);
                              setFieldValue("permanentCity", "");
                              handleCityByState(text);
                              handleUnSavedChanges(1);
                            }}
                          />
                          {otherCity ? (
                            <TextFieldFormik
                              id="otherCity"
                              label="City/District"
                              onChange={(e) => {
                                setFieldValue("otherCity", e?.target?.value);
                                handleUnSavedChanges(1);
                              }}
                              labelSize={3}
                              tabIndex={
                                !values?.salaryMode?.salary_mode ||
                                values?.salaryMode?.salary_mode === "Cash"
                                  ? 43
                                  : 47
                              }
                              style={{ width: "80%" }}
                              maxlength={40}
                              mandatory={1}
                            />
                          ) : (
                            <SelectFieldFormik
                              label="City/District"
                              id="permanentCity"
                              labelSize={3}
                              getOptionLabel={(option) => option?.city}
                              getOptionValue={(option) => option?.city}
                              options={cityArrayList}
                              matchFrom="start"
                              style={{ width: "80%" }}
                              mandatory={1}
                              maxlength={20}
                              tabIndex={
                                !values?.salaryMode?.salary_mode ||
                                values?.salaryMode?.salary_mode === "Cash"
                                  ? 43
                                  : 47
                              }
                              onChange={(text) => {
                                setFieldValue("permanentCity", text);
                                handleUnSavedChanges(1);
                              }}
                            />
                          )}
                          <SelectFieldFormik
                            label="Country"
                            id="permanentCountry"
                            labelSize={3}
                            getOptionLabel={(option) => option?.country}
                            getOptionValue={(option) => option?.country}
                            options={countryList}
                            matchFrom="start"
                            style={{ width: "80%" }}
                            tabIndex={
                              !values?.salaryMode?.salary_mode ||
                              values?.salaryMode?.salary_mode === "Cash"
                                ? 44
                                : 48
                            }
                            mandatory={1}
                            maxlength={10}
                            onChange={(text) => {
                              setFieldValue("permanentCountry", text);
                              handleUnSavedChanges(1);
                            }}
                          />
                          <TextFieldFormik
                            id="permanentPincode"
                            label="Pincode"
                            labelSize={3}
                            onChange={(e) => {
                              if (
                                preFunction.amountValidation(e?.target?.value)
                              ) {
                                setFieldValue(
                                  "permanentPincode",
                                  e?.target?.value
                                );
                                handleUnSavedChanges(1);
                              }
                            }}
                            tabIndex={
                              !values?.salaryMode?.salary_mode ||
                              values?.salaryMode?.salary_mode === "Cash"
                                ? 45
                                : 49
                            }
                            style={{ width: "30%" }}
                            maxlength={6}
                            mandatory={1}
                          />
                        </div>
                        <div className="subhead-row">
                          <div className="subhead">
                            Temporary Address Detail
                          </div>
                          <div className="col line-div"></div>
                        </div>
                        <div className="row no-gutters">
                          <div className="mb-3">
                            <SwitchField
                              label=" "
                              labelSize={3}
                              yesOption="Copied"
                              noOption="Copy from Permanent Address"
                              checked={values?.sameAsPermanentAddress}
                              tabIndex={
                                !values?.salaryMode?.salary_mode ||
                                values?.salaryMode?.salary_mode === "Cash"
                                  ? 46
                                  : 50
                              }
                              onChange={(e) => {
                                setFieldValue(
                                  "sameAsPermanentAddress",
                                  !values?.sameAsPermanentAddress
                                );
                                setTemporaryAddress(values);
                                handleUnSavedChanges(1);
                              }}
                            />
                          </div>
                          <TextFieldFormik
                            id="tempStreetLandMark"
                            label="Street/Land Mark"
                            labelSize={3}
                            onChange={(e) => {
                              setFieldValue(
                                "tempStreetLandMark",
                                e?.target?.value
                              );
                              handleUnSavedChanges(1);
                            }}
                            tabIndex={
                              !values?.salaryMode?.salary_mode ||
                              values?.salaryMode?.salary_mode === "Cash"
                                ? 47
                                : 51
                            }
                            style={{ width: "80%" }}
                            maxlength={140}
                            mandatory={1}
                          />
                          <TextFieldFormik
                            label="Area/Place"
                            id="tempArea"
                            labelSize={3}
                            style={{ width: "80%" }}
                            tabIndex={
                              !values?.salaryMode?.salary_mode ||
                              values?.salaryMode?.salary_mode === "Cash"
                                ? 48
                                : 52
                            }
                            mandatory={1}
                            onChange={(e) => {
                              setFieldValue("tempArea", e?.target?.value);
                              handleUnSavedChanges(1);
                            }}
                          />
                          <SelectFieldFormik
                            label="State"
                            id="tempState"
                            labelSize={3}
                            getOptionLabel={(option) => option?.state}
                            getOptionValue={(option) => option?.state}
                            options={stateArrayList}
                            matchFrom="start"
                            style={{ width: "80%" }}
                            tabIndex={
                              !values?.salaryMode?.salary_mode ||
                              values?.salaryMode?.salary_mode === "Cash"
                                ? 49
                                : 53
                            }
                            mandatory={1}
                            maxlength={20}
                            onChange={(text) => {
                              setFieldValue("tempState", text);
                              setFieldValue("tempCity", "");
                              handleTempCityByState(text);
                              handleUnSavedChanges(1);
                            }}
                          />
                          {tempOtherCity ? (
                            <TextFieldFormik
                              id="tempOtherCity"
                              label="City/District"
                              labelSize={3}
                              tabIndex={
                                !values?.salaryMode?.salary_mode ||
                                values?.salaryMode?.salary_mode === "Cash"
                                  ? 50
                                  : 54
                              }
                              onChange={(e) => {
                                setFieldValue(
                                  "tempOtherCity",
                                  e?.target?.value
                                );
                                handleUnSavedChanges(1);
                              }}
                              style={{ width: "80%" }}
                              maxlength={40}
                              mandatory={1}
                            />
                          ) : (
                            <SelectFieldFormik
                              label="City/District"
                              id="tempCity"
                              labelSize={3}
                              getOptionLabel={(option) => option?.city}
                              getOptionValue={(option) => option?.city}
                              matchFrom="start"
                              options={tempCityList}
                              tabIndex={
                                !values?.salaryMode?.salary_mode ||
                                values?.salaryMode?.salary_mode === "Cash"
                                  ? 50
                                  : 54
                              }
                              style={{ width: "80%" }}
                              mandatory={1}
                              maxlength={20}
                              onChange={(text) => {
                                setFieldValue("tempCity", text);
                                handleUnSavedChanges(1);
                              }}
                            />
                          )}
                          <SelectFieldFormik
                            label="Country"
                            id="tempCountry"
                            labelSize={3}
                            matchFrom="start"
                            getOptionLabel={(option) => option?.country}
                            getOptionValue={(option) => option?.country}
                            options={countryList}
                            style={{ width: "80%" }}
                            tabIndex={
                              !values?.salaryMode?.salary_mode ||
                              values?.salaryMode?.salary_mode === "Cash"
                                ? 51
                                : 55
                            }
                            maxlength={10}
                            mandatory={1}
                            onChange={(text) => {
                              setFieldValue("tempCountry", text);
                              handleUnSavedChanges(1);
                            }}
                          />
                          <TextFieldFormik
                            id="tempPincode"
                            label="Pincode"
                            labelSize={3}
                            tabIndex={
                              !values?.salaryMode?.salary_mode ||
                              values?.salaryMode?.salary_mode === "Cash"
                                ? 52
                                : 56
                            }
                            onChange={(e) => {
                              if (
                                preFunction.amountValidation(e?.target?.value)
                              ) {
                                setFieldValue("tempPincode", e?.target?.value);
                                handleUnSavedChanges(1);
                              }
                            }}
                            style={{ width: "30%" }}
                            maxlength={6}
                            mandatory={1}
                          />
                        </div>
                        <Button
                          tabIndex={
                            !values?.salaryMode?.salary_mode ||
                            values?.salaryMode?.salary_mode === "Cash"
                              ? 53
                              : 57
                          }
                          id="work"
                          text="F4 - Next"
                          type="submit"
                          onClick={(e) => preFunction.handleErrorFocus(errors)}
                        />
                      </div>
                    </form>
                  );
                }}
              </Formik>
            </Tab>
            <Tab
              eventKey={3}
              title="Experience"
              // disabled
              disabled={location?.state?.id ? false : true}
            >
              <div className="row px-3">
                <Formik
                  innerRef={experienceRef}
                  enableReinitialize={false}
                  initialValues={{
                    expOrganisationName: "",
                    expLocation: "",
                    expDesignation: "",
                    expFromDate: "",
                    expToDate: "",
                    expSalary: "",
                    expRemarks: "",
                  }}
                  validationSchema={experienceSchema}
                  onSubmit={handleExperienceValidate}
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
                        <div className="subhead-row">
                          <div className="subhead">Experience Detail</div>
                          <div className="col line-div"></div>
                        </div>
                        <div className="col-lg-10">
                          <TextFieldFormik
                            autoFocus
                            id="expOrganisationName"
                            label="Organization"
                            mandatory={1}
                            labelSize={4}
                            onChange={(e) => {
                              setFieldValue(
                                "expOrganisationName",
                                e?.target?.value
                              );
                              handleUnSavedChanges(1);
                            }}
                            tabIndex={61}
                            style={{ width: "80%" }}
                          />
                          <TextFieldFormik
                            id="expLocation"
                            label="Location"
                            mandatory={1}
                            tabIndex={62}
                            labelSize={4}
                            onChange={(e) => {
                              setFieldValue("expLocation", e?.target?.value);
                              handleUnSavedChanges(1);
                            }}
                            style={{ width: "80%" }}
                          />
                          <SelectFieldFormik
                            label="Designation"
                            id="expDesignation"
                            tabIndex={63}
                            labelSize={4}
                            matchFrom="start"
                            getOptionLabel={(option) => option?.designation}
                            getOptionValue={(option) => option?.designation}
                            options={designationList}
                            style={{ width: "80%" }}
                            mandatory={1}
                            maxlength={20}
                            onChange={(text) => {
                              setFieldValue("expDesignation", text);
                              handleUnSavedChanges(1);
                            }}
                          />
                          <DateFieldFormik
                            label="From Date"
                            id="expFromDate"
                            style={{ width: "45%" }}
                            tabIndex={64}
                            labelSize={4}
                            maxDate={null}
                            minDate={null}
                            mandatory={1}
                            onChange={(e) => {
                              setFieldValue("expFromDate", e?.target?.value);
                              handleUnSavedChanges(1);
                            }}
                          />
                          <DateFieldFormik
                            label="To Date"
                            id="expToDate"
                            tabIndex={65}
                            labelSize={4}
                            maxDate={null}
                            minDate={null}
                            style={{ width: "45%" }}
                            mandatory={1}
                            onChange={(e) => {
                              setFieldValue("expToDate", e?.target?.value);
                              handleUnSavedChanges(1);
                            }}
                          />
                          <TextFieldFormik
                            id="expSalary"
                            label="Salary"
                            tabIndex={66}
                            labelSize={4}
                            mandatory={1}
                            onChange={(e) => {
                              if (
                                preFunction.amountValidation(e?.target?.value)
                              ) {
                                setFieldValue("expSalary", e?.target?.value);
                                handleUnSavedChanges(1);
                              }
                            }}
                            maxlength={7}
                            style={{ width: "40%" }}
                          />
                          <TextFieldFormik
                            id="expRemarks"
                            label="Remarks"
                            labelSize={4}
                            tabIndex={67}
                            onChange={(e) => {
                              setFieldValue("expRemarks", e?.target?.value);
                              handleUnSavedChanges(1);
                            }}
                            style={{ width: "80%" }}
                          />
                        </div>
                        <Button
                          tabIndex={68}
                          text="Add Experience"
                          onClick={(e) => {
                            preFunction.handleErrorFocus(errors);
                          }}
                        />
                        {experienceArr?.length > 0 ? (
                          <>
                            <div className="row no-gutters">
                              <div className="subhead-row">
                                <div className="subhead">
                                  Experience History
                                </div>
                                <div className="col line-div"></div>
                              </div>
                            </div>
                            <div className="row no-gutters">
                              <div className="table-responsive">
                                <table className="table table-bordered table-hover report-table">
                                  <thead>
                                    <tr>
                                      <th width="1%">No.</th>
                                      <th>Organization Name</th>
                                      <th width="10%">Location</th>
                                      <th width="20%">Designation</th>
                                      <th width="15%">From Date</th>
                                      <th width="15%">To Date</th>
                                      <th width="5%">Salary</th>
                                      <th width="30%">Remarks</th>
                                      {expData.length > 0 && (
                                        <th width="1%"></th>
                                      )}
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {experienceArr?.map((item, index) => {
                                      return (
                                        <tr>
                                          <td>{index + 1}</td>
                                          <td>{item?.company_name}</td>
                                          <td>{item?.custom_location}</td>
                                          <td>{item?.designation}</td>
                                          <td>
                                            {moment(
                                              item?.custom_from_date
                                            )?.format("DD-MM-YYYY")}
                                          </td>
                                          <td>
                                            {moment(
                                              item?.custom_to_date
                                            )?.format("DD-MM-YYYY")}
                                          </td>
                                          <td>{item?.salary}</td>
                                          <td>{item?.custom_remarks}</td>
                                          {expData.length > 0 && (
                                            <td>
                                              {!item?.name && (
                                                <Button
                                                  isTable={true}
                                                  className="plus-button"
                                                  text="-"
                                                  onClick={() => {
                                                    handleUnSavedChanges(1);
                                                    handleDeleteExperienceValidate(
                                                      item
                                                    );
                                                  }}
                                                />
                                              )}
                                            </td>
                                          )}
                                        </tr>
                                      );
                                    })}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          </>
                        ) : null}
                        <div className="row no-gutters py-3">
                          <Button
                            type="button"
                            id="experience"
                            text="F4 - Next"
                            onClick={() => {
                              handleUnSavedChanges(1);
                              handleSaveExperience();
                            }}
                          />
                        </div>
                      </form>
                    );
                  }}
                </Formik>
              </div>
            </Tab>
            <Tab
              eventKey={4}
              title="Qualification"
              // disabled
              disabled={location?.state?.id ? false : true}
            >
              <div className="row px-3 p-3">
                <div className="subhead-row">
                  <div className="subhead">Qualification Detail </div>
                  <div className="col line-div"></div>
                </div>
                <Formik
                  enableReinitialize={true}
                  innerRef={qualificationRef}
                  initialValues={{
                    certQualification: "",
                    institution: "",
                    regNo: "",
                    yearofPassing: "",
                    certFile: null,
                  }}
                  validationSchema={qualificationSchema}
                  onSubmit={handleQualification}
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
                        <div className="col-lg-10">
                          <SelectFieldFormik
                            label="Qualification"
                            id="certQualification"
                            labelSize={4}
                            matchFrom="start"
                            getOptionLabel={(option) => option?.name}
                            getOptionValue={(option) => option?.name}
                            options={qualificationList}
                            style={{ width: "50%" }}
                            mandatory={1}
                            maxlength={10}
                            tabIndex={69}
                            onChange={(text) => {
                              setFieldValue("certQualification", text);
                              handleUnSavedChanges(1);
                            }}
                          />
                          <TextFieldFormik
                            id="institution"
                            label="Institution"
                            labelSize={4}
                            style={{ width: "80%" }}
                            tabIndex={70}
                            onChange={(e) => {
                              setFieldValue("institution", e?.target?.value);
                              handleUnSavedChanges(1);
                            }}
                          />
                          <TextFieldFormik
                            id="regNo"
                            style={{ width: "80%" }}
                            maxlength={14}
                            tabIndex={71}
                            labelSize={4}
                            label="Registration No."
                            onChange={(e) => {
                              setFieldValue("regNo", e?.target?.value);
                              handleUnSavedChanges(1);
                            }}
                          />
                          <SelectFieldFormik
                            label="Year of Passing"
                            placeholder="Year"
                            id="yearofPassing"
                            tabIndex={72}
                            matchFrom="start"
                            options={yearofpassingList}
                            style={{ width: "50%" }}
                            maxlength={4}
                            labelSize={4}
                            onChange={(text) => {
                              setFieldValue("yearofPassing", text);
                              handleUnSavedChanges(1);
                            }}
                          />
                          <FileField
                            label="Certificate"
                            id="certFile"
                            mandatory={1}
                            tabIndex={73}
                            error={errors.certFile}
                            touched={touched?.certFile}
                            style={{ width: "80%" }}
                            labelSize={4}
                            onChange={(e) => {
                              setFieldValue("certFile", e.target.files[0]);
                              handleImage(e);
                              handleUnSavedChanges(1);
                            }}
                            accept=".pdf, image/*"
                          />
                        </div>
                        <div className="p-3 text-center">
                          <Button
                            frmButton={false}
                            text="Add Qualification"
                            tabIndex={74}
                            type="submit"
                            onClick={(e) =>
                              preFunction.handleErrorFocus(errors)
                            }
                          />
                          &nbsp;&nbsp;
                          {certificateArr.length == 0 && (
                            <Button
                              frmButton={false}
                              type="button"
                              tabIndex={66}
                              text="Skip"
                              onClick={() => {
                                handleSkipQualification();
                              }}
                            />
                          )}
                        </div>
                        {certificateArr?.length > 0 ? (
                          <>
                            <div className="subhead-row">
                              <div className="subhead">
                                Qualification History{" "}
                              </div>
                              <div className="col line-div"></div>
                            </div>
                            <table className="table table-bordered mt-3">
                              <thead>
                                <tr>
                                  <th width="1%">No.</th>
                                  <th width="25%">Qualification</th>
                                  <th>Institution Name</th>
                                  <th width="10%">Register No.</th>
                                  <th width="10%">Year</th>
                                  <th width="10%">Certificate</th>
                                  {qualData.length > 0 && <th width="1%"></th>}
                                </tr>
                              </thead>
                              <tbody>
                                {certificateArr?.map((item, index) => {
                                  return (
                                    <tr>
                                      <td>{index + 1}</td>
                                      <td>{item?.qualification}</td>
                                      <td>{item?.school_univ}</td>
                                      <td>{item?.custom_reg_no}</td>
                                      <td>
                                        {item?.year_of_passing > 0
                                          ? item.year_of_passing
                                          : ""}
                                      </td>
                                      <td>
                                        <Button
                                          text="View"
                                          isTable={true}
                                          className={"btn-3"}
                                          onClick={() => {
                                            openLink(item?.custom_file);
                                          }}
                                        />
                                      </td>
                                      {qualData.length > 0 && (
                                        <td>
                                          {!item?.name && (
                                            <Button
                                              isTable={true}
                                              className="plus-button"
                                              text="-"
                                              onClick={() => {
                                                handleUnSavedChanges(1);
                                                handleDeleteQualification(item);
                                              }}
                                            />
                                          )}
                                        </td>
                                      )}
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                            <Button
                              type="button"
                              id="qualification"
                              text={"F4 - Next"}
                              onClick={(e) => {
                                handleSaveQualification();
                              }}
                            />
                          </>
                        ) : null}
                      </form>
                    );
                  }}
                </Formik>
              </div>
            </Tab>
            {/* {employeeDetail?.status !== "Active" && ( */}
            <Tab
              eventKey={5}
              title="Pay"
              // disabled
              disabled={location?.state?.id ? false : true}
            >
              <div className="row px-3">
                <div className="row pt-5 p-3">
                  <div className="col-lg-12">
                    <Formik
                      enableReinitialize={false}
                      innerRef={salaryRef}
                      initialValues={{
                        allowance: "",
                        allowanceAmount: "",
                      }}
                      validationSchema={allowanceSchema}
                      onSubmit={handleAllowanceAdd}
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
                            <table className="table table-bordered">
                              <thead>
                                <tr>
                                  <th width="1%">No.</th>
                                  <th>Allowance</th>
                                  <th width="15%">Amount(र)</th>
                                  <th width="10%"></th>
                                </tr>
                              </thead>
                              <tbody>
                                {allowanceArr?.map((item, index) => {
                                  return (
                                    <tr>
                                      <td>{index + 1}</td>
                                      <td>{item?.salary_component}</td>
                                      <td align="right">{item?.amount}</td>
                                      <td>
                                        {!location?.state?.id ||
                                        (location?.state?.id &&
                                          employeeDetail &&
                                          employeeDetail?.status ==
                                            "Inactive") ? (
                                          <Button
                                            isTable={true}
                                            className="plus-button"
                                            text="-"
                                            onClick={() => {
                                              handleUnSavedChanges(1);
                                              handleDeleteAllowance(item);
                                            }}
                                          />
                                        ) : null}
                                      </td>
                                    </tr>
                                  );
                                })}
                                {allowanceList.length > 0 && (
                                  <tr>
                                    <td>{allowanceArr.length + 1}</td>
                                    <td>
                                      <SelectFieldFormik
                                        autoFocus
                                        id="allowance"
                                        mandatory={1}
                                        isTable={true}
                                        placeholder="Allowance"
                                        tabIndex={75}
                                        matchFrom="start"
                                        clear={true}
                                        getOptionLabel={(option) => option.name}
                                        getOptionValue={(option) => option.name}
                                        options={allowanceList}
                                        maxlength={25}
                                        onChange={(text) => {
                                          setFieldValue("allowance", text);
                                          handleUnSavedChanges(1);
                                          setAllowanceError(false);
                                          setShowConfirm(false);
                                          setDeductionError(false);
                                        }}
                                      />
                                    </td>
                                    <td align="right">
                                      <TextFieldFormik
                                        id="allowanceAmount"
                                        isTable={true}
                                        tabIndex={76}
                                        placeholder=" "
                                        mandatory={1}
                                        onChange={(e) => {
                                          if (
                                            preFunction.amountValidation(
                                              e.target.value
                                            )
                                          ) {
                                            setFieldValue(
                                              "allowanceAmount",
                                              e.target.value
                                            );
                                            setAllowanceError(false);
                                            setShowConfirm(false);
                                            handleUnSavedChanges(1);
                                          }
                                          setDeductionError(false);
                                        }}
                                        maxlength={7}
                                        isAmount={true}
                                      />
                                    </td>
                                    <td>
                                      <Button
                                        isTable={true}
                                        text="+"
                                        tabIndex={77}
                                        className="plus-button"
                                        onClick={(e) =>
                                          preFunction.handleErrorFocus(errors)
                                        }
                                      />
                                    </td>
                                  </tr>
                                )}
                                <tr>
                                  <td
                                    colSpan={2}
                                    className="student-text"
                                    align="right"
                                  >
                                    Total
                                  </td>
                                  <td align="right" className="student-text">
                                    {allowanceTotal}
                                  </td>
                                  <td></td>
                                </tr>
                              </tbody>
                            </table>
                            <ErrorMessage
                              Message={"Please select at least one Allowance"}
                              view={allowanceError}
                            />
                          </form>
                        );
                      }}
                    </Formik>
                  </div>
                </div>
                <div className="row pt-5 p-3">
                  <div className="col-lg-12">
                    <Formik
                      enableReinitialize={false}
                      innerRef={salDeductionRef}
                      initialValues={{
                        deduction: "",
                        deductionAmount: "",
                      }}
                      validationSchema={deductionSchema}
                      onSubmit={handleDeductionAdd}
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
                            <table className="table table-bordered fieldTable">
                              <thead>
                                <tr>
                                  <th width="1%">No.</th>
                                  <th>Deduction</th>
                                  <th width="15%">Amount(र)</th>
                                  <th width="10%"></th>
                                </tr>
                              </thead>
                              <tbody>
                                {deductionArr?.map((item, index) => {
                                  return (
                                    <tr>
                                      <td>{index + 1}</td>
                                      <td>{item?.salary_component}</td>
                                      <td align="right">{item?.amount}</td>
                                      {!location?.state?.id ||
                                      (location?.state?.id &&
                                        employeeDetail &&
                                        employeeDetail?.status ==
                                          "Inactive") ? (
                                        <td>
                                          <Button
                                            isTable={true}
                                            className="plus-button"
                                            text="-"
                                            onClick={() => {
                                              handleUnSavedChanges(1);
                                              handleDeleteDeduction(item);
                                            }}
                                          />
                                        </td>
                                      ) : null}
                                    </tr>
                                  );
                                })}
                                {deductionList?.length > 0 && (
                                  <tr>
                                    <td>{deductionArr?.length + 1}</td>
                                    <td>
                                      <SelectFieldFormik
                                        id="deduction"
                                        isTable={true}
                                        mandatory={1}
                                        placeholder="Deduction"
                                        tabIndex={78}
                                        matchFrom="start"
                                        clear={true}
                                        getOptionLabel={(option) =>
                                          option?.name
                                        }
                                        getOptionValue={(option) =>
                                          option?.name
                                        }
                                        options={deductionList}
                                        maxlength={20}
                                        onChange={(text) => {
                                          setFieldValue("deduction", text);
                                          handleUnSavedChanges(1);
                                          setDeductionError(false);
                                          setShowConfirm(false);
                                          setDeductionError(false);
                                        }}
                                      />
                                    </td>
                                    <td align="right">
                                      <TextFieldFormik
                                        tabIndex={79}
                                        isTable={true}
                                        id="deductionAmount"
                                        placeholder=" "
                                        mandatory={1}
                                        onChange={(e) => {
                                          if (
                                            preFunction.amountValidation(
                                              e.target.value
                                            )
                                          ) {
                                            setFieldValue(
                                              "deductionAmount",
                                              e.target.value
                                            );
                                            setDeductionError(false);
                                            setShowConfirm(false);
                                            handleUnSavedChanges(1);
                                            setDeductionError(false);
                                          }
                                        }}
                                        maxlength={7}
                                        isAmount={true}
                                      />
                                    </td>
                                    <td>
                                      <Button
                                        text="+"
                                        tabIndex={80}
                                        isTable={true}
                                        className="plus-button"
                                        onClick={(e) =>
                                          preFunction.handleErrorFocus(errors)
                                        }
                                      />
                                    </td>
                                  </tr>
                                )}
                                <tr>
                                  <td
                                    colSpan={2}
                                    className="student-text"
                                    align="right"
                                  >
                                    Total
                                  </td>
                                  <td align="right" className="student-text">
                                    {deductionTotal}
                                  </td>
                                  <td></td>
                                </tr>
                              </tbody>
                            </table>
                            <ErrorMessage
                              Message={deductionErrorMessage}
                              view={deductionError}
                            />
                          </form>
                        );
                      }}
                    </Formik>
                  </div>

                  {employeeDetail?.status !== "Active" && showConfirm ? (
                    <div className="col-lg-12 text-center">
                      <Button
                        tabIndex={81}
                        isTable={true}
                        frmButton={false}
                        text="F4 - Save As Draft"
                        className={"btn me-2"}
                        id="salary"
                        onClick={(e) => {
                          toast.success("Employee saved as draft successfully");
                          handleSaveAsDraft();
                        }}
                      />
                      <Button
                        className={"btn-green ms-2"}
                        frmButton={false}
                        type="button"
                        text="Activate Employee"
                        onClick={(e) => {
                          handleConfirmEmployee();
                        }}
                      />
                    </div>
                  ) : (
                    <Button
                      tabIndex={81}
                      text="F4 - Save"
                      id="salary"
                      onClick={(e) => {
                        handleSalary();
                      }}
                    />
                  )}
                </div>
              </div>
            </Tab>
            {/* )} */}
          </Tabs>
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
              <ErrorMessage
                Message={"Click on image to crop"}
                view={CropOpen}
              />
            </Modal.Body>
            <Modal.Footer>
              <Button
                type="button"
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
                Changes you made may not be saved?. Are you sure you want to
                change the tab?
              </div>
            </Modal.Body>
            <Modal.Footer>
              <Button
                text="Yes"
                frmButton={false}
                onClick={(e) => {
                  console.log("passKey=--------", passKey);
                  setOpenLeavePageModel(false);
                  handleUnSavedChanges(0);
                  handleTabChange(passKey, false);
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
            show={confirmOpen}
            dialogClassName="my-modal"
            onEscapeKeyDown={() => {
              setConfirmOpen(false);
              handleSaveAsDraft();
            }}
          >
            <Modal.Header>
              <Modal.Title>Employee No.</Modal.Title>
            </Modal.Header>

            <Modal.Body>
              <div className="row no-gutters">
                <div
                  style={{
                    padding: "5px",
                  }}
                >
                  Employee Confirmed Successfully. <br />
                  Employee No. : {employeeNumber}
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
                  handleSaveAsDraft();
                }}
              />
            </Modal.Footer>
          </Modal>
        </div>
      </div>
    </div>
  );
}

export default AddEmployee;
