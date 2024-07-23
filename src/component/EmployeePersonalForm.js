import React, { useState, useContext, useEffect, useRef } from "react";
import moment from "moment";
import { useSelector } from "react-redux";
import * as Yup from "yup";

import DisplayText from "./FormField/DisplayText";

import blankProfile from "../assests/png/blank-profile-picture.png";
import SelectFieldFormik from "./FormField/SelectFieldFormik";
import AuthContext from "../auth/context";
import TextFieldFormik from "./FormField/TextFieldFormik";
import DateFieldFormik from "./FormField/DateFieldFormik";

import preFunction from "../component/common/CommonFunction";
import ErrorMessage from "../component/common/ErrorMessage";

import photo from "../assests/png/camera.png";
import Button from "./FormField/Button";
import EmployeeApi from "../api/EmployeeApi";
import string from "../string";

import { maritalStatusList } from "../component/common/CommonArray";
import { Formik } from "formik";

function EmployeePersonalForm({
  handleUnSavedChanges,
  handleTabChange,
  selectImage,
  showImg,
  // displayImage,
  emoployeeId,
  getDepartmentList,
  handlePersonalValidation,
  src,
  setSrc,
}) {
  const formikRef = useRef();
  const { unSavedChanges, setUnSavedChanges, collegeName, collegeId } =
    useContext(AuthContext);
  const collegeConfig = useSelector((state) => state.web.college);
  const [employeeDetail, setEmployeeDetail] = useState();
  const [displayImage, setDisplayImage] = useState(blankProfile);

  const [salutationList, setSalutationList] = useState([]);
  const [genderList, setGenderList] = useState([]);
  const [bloodGroupList, setBloodGroupList] = useState([]);
  const [communityList, setCommunityList] = useState([]);
  const [casteList, setCasteList] = useState([]);
  const [religionList, setReligionList] = useState([]);
  const [nationalityList, setNationalityList] = useState([]);
  const [motherTongueList, setMotherTongueList] = useState([]);

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
        moment().subtract(18, "years").toDate(),
        `The Date of Birth must be before ${moment()
          .subtract(18, "years")
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
    bloodGroup: Yup.object().required("Please select Blood Group"),
    community: Yup.object().required("Please select Community"),
    religion: Yup.object().required("Please select Religion"),
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
    }
  };

  const handleLoadMaster = async () => {
    let college_id = "";
    let getEmployeeByIdRes = "";
    if (!collegeConfig.is_university) {
      college_id = collegeId;
    }
    if (emoployeeId) {
      getEmployeeByIdRes = await EmployeeApi.getEmployeeById(emoployeeId);
      console.log("getEmployeeByIdRes---------------", getEmployeeByIdRes);
      setEmployeeDetail(getEmployeeByIdRes?.data?.data);
      if (getEmployeeByIdRes?.data?.data?.image != "") {
        setDisplayImage(
          string?.TESTBASEURL + getEmployeeByIdRes?.data?.data?.image
        );
        setSrc(string?.TESTBASEURL + getEmployeeByIdRes?.data?.data?.image);
      }
      college_id = getEmployeeByIdRes?.data?.data?.custom_college_id;
    }
    const masterRes = await EmployeeApi.getAllMasters(1, college_id);
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
    if (emoployeeId) {
      formikRef?.current?.resetForm();
      setFormFieldValues(getEmployeeByIdRes?.data?.data);
    }
  };

  useEffect(() => {
    handleLoadMaster();
  }, []);

  return (
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
                      handleTabChange(1, false, text);
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
                    autoFocus={collegeConfig?.is_university ? false : true}
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
                    mandatory={1}
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
                    mandatory={1}
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
                    mandatory={1}
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
                  {employeeDetail?.status === "Active" ? (
                    <DisplayText
                      label={"Mobile No. 1"}
                      value={employeeDetail?.cell_number}
                      labelSize={4}
                    />
                  ) : (
                    <TextFieldFormik
                      tabIndex={14}
                      id="mobileNo"
                      label="Mobile No. 1"
                      labelSize={4}
                      onChange={(e) => {
                        if (preFunction.amountValidation(e?.target?.value)) {
                          setFieldValue("mobileNo", e?.target?.value);
                          handleUnSavedChanges(1);
                        }
                      }}
                      style={{ width: "50%" }}
                      mandatory={1}
                      maxlength={10}
                    />
                  )}

                  <TextFieldFormik
                    tabIndex={15}
                    id="mobileNo2"
                    label="Mobile No. 2"
                    labelSize={4}
                    onChange={(e) => {
                      if (preFunction.amountValidation(e?.target?.value)) {
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
                      setFieldValue("languageKnown", e?.target?.value);
                      handleUnSavedChanges(1);
                    }}
                    style={{ width: "80%" }}
                    labelSize={4}
                  />
                </div>
                <div id="imgError" className="col-lg-3 text-center p-3">
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
                    <label className="image-upload mt-30" htmlFor="fileinput">
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
  );
}

export default EmployeePersonalForm;
