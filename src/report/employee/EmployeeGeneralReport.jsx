import React, { useEffect, useState, useContext } from "react";
import { Formik } from "formik";
import { Modal } from "react-bootstrap";
import moment from "moment";
import { useSelector } from "react-redux";

import empApi from "../../api/EmployeeApi";

import AuthContext from "../../auth/context";

import string from "../../string";

import Button from "../../component/FormField/Button";
import DateFieldFormik from "../../component/FormField/DateFieldFormik";
import SelectFieldFormik from "../../component/FormField/SelectFieldFormik";
import preFunction from "../../component/common/CommonFunction";
import CustomActivityIndicator from "../../component/common/CustomActivityIndicator";
import CheckboxField from "../../component/FormField/CheckboxField";
import { employeeStatus } from "../../component/common/CommonArray";
import ScreenTitle from "../../component/common/ScreenTitle";

function EmployeeGeneralReport() {
  const [load, setLoad] = useState(false);
  const [empCodeList, setEmpCodeList] = useState([]);
  const [designationList, setDesignationList] = useState([]);
  const [departmentList, setDepartmentList] = useState([]);
  const [genderList, setGenderList] = useState([]);
  const [paymentModeList, setPaymentModeList] = useState([]);
  const [bankNameList, setBankNameList] = useState([]);

  const [showRes, setShowRes] = useState(false);
  const [employeeList, setEmployeeList] = useState([]);

  const [openModel, setOpenModal] = useState(false);
  const [fatherName, setFatherName] = useState(true);
  const [dateofBirth, setDateofBirth] = useState(true);
  const [gender, setGender] = useState(true);
  const [maritalStatus, setMaritalStatus] = useState(true);
  const [motherName, setMotherName] = useState(false);
  const [spouseName, setSpouseName] = useState(false);
  const [bloodGroup, setBloodGroup] = useState(false);
  const [community, setCommunity] = useState(false);
  const [caste, setCaste] = useState(false);
  const [religion, setReligion] = useState(false);
  const [nationality, setNationality] = useState(false);
  const [mobileNo1, setMobileNo1] = useState(true);
  const [mobileNo2, setMobileNo2] = useState(false);
  const [motherTongue, setMotherTongue] = useState(false);
  const [email, setEmail] = useState(true);

  const [languageKnown, setLanguageKnown] = useState(false);
  const [employeeType, setEmployeeType] = useState(false);
  const [dateofJoin, setDateofJoin] = useState(true);
  const [designation, setDesignation] = useState(true);
  const [teachingStaff, setTeachingStaff] = useState(false);
  const [department, setDepartment] = useState(true);
  const [reportTo, setReportTo] = useState(false);
  const [passportNo, setPassportNo] = useState(false);
  const [placeofIssue, setPlaceofIssue] = useState(false);
  const [issueDate, setIssueDate] = useState(false);
  const [expiryDate, setExpiryDate] = useState(false);
  const [aadhaarNo, setAadhaarNo] = useState(true);
  const [salaryMode, setSalaryMode] = useState(true);
  const [bankName, setBankName] = useState(false);
  const [accountNo, setAccountNo] = useState(false);

  const [iFSCCode, setIFSCCode] = useState(false);
  const [branchName, setBranchName] = useState(false);
  const [panNo, setPanNo] = useState(true);
  const [emergencyCantactName1, setEmergencyCantactName1] = useState(false);
  const [relation1, setRelation1] = useState(false);
  const [emergencyCantactNo1, setEmergencyCantactNo1] = useState(false);
  const [emergencyCantactName2, setEmergencyCantactName2] = useState(false);
  const [relation2, setRelation2] = useState(false);
  const [emergencyCantactNo2, setEmergencyCantactNo2] = useState(false);
  const [tempAddr, setTempAddr] = useState(false);

  const [permanentAddr, setPermanentAddr] = useState(false);
  const [resignationLetterDate, setResignationLetterDate] = useState(false);
  const [relieveDate, setRelieveDate] = useState(false);
  const [reason, setReason] = useState(false);
  const [incrementDate, setIncrementDate] = useState(false);
  const [collegeError, setCollegeError] = useState(false);
  const [status, setStatus] = useState(false);
  const [value, setValue] = useState([]);
  const [showLoadMore, setShowLoadMore] = useState(false);
  const [dateError, setDateError] = useState(false);
  const [dateValidationError, setDateValidationError] = useState(false);

  const collegeConfig = useSelector((state) => state.web.college);
  const { collegeId } = useContext(AuthContext);

  const handleOpenModal = async (values) => {
    console.log("values", values);
    setValue(values);
    setOpenModal(true);
  };

  const handleCheckAll = (e) => {
    console.log("e", e.target.checked);
    const checkboxes = document.querySelectorAll('input[type="checkbox"]');
    if (document.getElementById("checkAll").checked) {
      checkboxes.forEach((checkbox) => {
        checkbox.checked = true;
        setFatherName(true);
        setDateofBirth(true);
        setGender(true);
        setMaritalStatus(true);
        setMotherName(true);
        setSpouseName(true);
        setBloodGroup(true);
        setCommunity(true);
        setCaste(true);
        setReligion(true);
        setNationality(true);
        setMobileNo1(true);
        setMobileNo2(true);
        setEmail(true);
        setMotherTongue(true);
        setLanguageKnown(true);
        setEmployeeType(true);
        setDateofJoin(true);
        setDesignation(true);
        setTeachingStaff(true);
        setDepartment(true);
        setReportTo(true);
        setPassportNo(true);
        setPlaceofIssue(true);
        setIssueDate(true);
        setExpiryDate(true);
        setAadhaarNo(true);
        setSalaryMode(true);
        setBankName(true);
        setAccountNo(true);
        setIFSCCode(true);
        setBranchName(true);
        setPanNo(true);
        setEmergencyCantactName1(true);
        setRelation1(true);
        setEmergencyCantactNo1(true);
        setEmergencyCantactName2(true);
        setRelation2(true);
        setEmergencyCantactNo2(true);
        setTempAddr(true);
        setPermanentAddr(true);
        setResignationLetterDate(true);
        setRelieveDate(true);
        setReason(true);
        setIncrementDate(true);
        setStatus(true);
      });
    } else {
      checkboxes.forEach((checkbox) => {
        checkbox.checked = false;
        setFatherName(false);
        setDateofBirth(false);
        setGender(false);
        setMaritalStatus(false);
        setMotherName(false);
        setSpouseName(false);
        setBloodGroup(false);
        setCommunity(false);
        setCaste(false);
        setReligion(false);
        setNationality(false);
        setMobileNo1(false);
        setMobileNo2(false);
        setEmail(false);
        setMotherTongue(false);
        setLanguageKnown(false);
        setEmployeeType(false);
        setDateofJoin(false);
        setDesignation(false);
        setTeachingStaff(false);
        setDepartment(false);
        setReportTo(false);
        setPassportNo(false);
        setPlaceofIssue(false);
        setIssueDate(false);
        setExpiryDate(false);
        setAadhaarNo(false);
        setSalaryMode(false);
        setBankName(false);
        setAccountNo(false);
        setIFSCCode(false);
        setBranchName(false);
        setPanNo(false);
        setEmergencyCantactName1(false);
        setRelation1(false);
        setEmergencyCantactNo1(false);
        setEmergencyCantactName2(false);
        setRelation2(false);
        setEmergencyCantactNo2(false);
        setTempAddr(false);
        setPermanentAddr(false);
        setResignationLetterDate(false);
        setRelieveDate(false);
        setReason(false);
        setIncrementDate(false);
        setStatus(false);
      });
    }
  };

  const handleCSVData = async (values, type) => {
    console.log("values-----", values);

    try {
      setLoad(true);
      let csvDatas = [];
      csvDatas[0] = ["No"];
      var columnWidths = [];
      columnWidths.push(3);
      csvDatas[0].push("Employee No.");
      columnWidths.push(7);
      csvDatas[0].push("Name");
      columnWidths.push(10);
      if (fatherName) {
        csvDatas[0].push("Father Name");
        columnWidths.push(10);
      }
      if (dateofBirth) {
        csvDatas[0].push("Date of Birth");
        columnWidths.push(7);
      }
      if (gender) {
        csvDatas[0].push("Gender");
        columnWidths.push(5);
      }
      if (maritalStatus) {
        csvDatas[0].push("Marital Status");
        columnWidths.push(7);
      }
      if (motherName) {
        csvDatas[0].push("Mother Name");
        columnWidths.push(7);
      }
      if (spouseName) {
        csvDatas[0].push("Spouse Name");
        columnWidths.push(7);
      }
      if (bloodGroup) {
        csvDatas[0].push("Blood Group");
        columnWidths.push(7);
      }
      if (community) {
        csvDatas[0].push("Community");
        columnWidths.push(5);
      }
      if (caste) {
        csvDatas[0].push("Caste");
        columnWidths.push(5);
      }
      if (religion) {
        csvDatas[0].push("Religion");
        columnWidths.push(7);
      }
      if (nationality) {
        csvDatas[0].push("Nationality");
        columnWidths.push(7);
      }
      if (mobileNo1) {
        csvDatas[0].push("Mobile No 1");
        columnWidths.push(7);
      }
      if (mobileNo2) {
        csvDatas[0].push("Mobile No 2");
        columnWidths.push(7);
      }
      if (email) {
        csvDatas[0].push("Email");
        columnWidths.push(10);
      }
      if (motherTongue) {
        csvDatas[0].push("Mother Tongue");
        columnWidths.push(7);
      }

      if (languageKnown) {
        csvDatas[0].push("Language Known");
        columnWidths.push(10);
      }
      if (employeeType) {
        csvDatas[0].push("Employment Type");
        columnWidths.push(7);
      }
      if (dateofJoin) {
        csvDatas[0].push("Date of Joining");
        columnWidths.push(7);
      }
      if (designation) {
        csvDatas[0].push("Designation");
        columnWidths.push(10);
      }
      if (teachingStaff) {
        csvDatas[0].push("Teaching Staff");
        columnWidths.push(7);
      }
      if (department) {
        csvDatas[0].push("Department");
        columnWidths.push(15);
      }
      if (reportTo) {
        csvDatas[0].push("Reports To");
        columnWidths.push(7);
      }
      if (passportNo) {
        csvDatas[0].push("Passport No");
        columnWidths.push(7);
      }
      if (placeofIssue) {
        csvDatas[0].push("Place of Issue");
        columnWidths.push(7);
      }
      if (issueDate) {
        csvDatas[0].push("Issue Date");
        columnWidths.push(7);
      }
      if (expiryDate) {
        csvDatas[0].push("Expiry Date");
        columnWidths.push(7);
      }
      if (aadhaarNo) {
        csvDatas[0].push("Aadhaar No.");
        columnWidths.push(10);
      }
      if (salaryMode) {
        csvDatas[0].push("Salary Mode");
        columnWidths.push(7);
      }
      if (bankName) {
        csvDatas[0].push("Bank Name");
        columnWidths.push(10);
      }
      if (accountNo) {
        csvDatas[0].push("Bank Account No");
        columnWidths.push(10);
      }
      if (iFSCCode) {
        csvDatas[0].push("IFSC code");
        columnWidths.push(5);
      }

      if (branchName) {
        csvDatas[0].push("Bank Branch Name");
        columnWidths.push(10);
      }
      if (panNo) {
        csvDatas[0].push("PAN No.");
        columnWidths.push(7);
      }
      if (emergencyCantactName1) {
        csvDatas[0].push("Emergency Contact Name 1");
        columnWidths.push(10);
      }
      if (relation1) {
        csvDatas[0].push("Relation 1");
        columnWidths.push(7);
      }
      if (emergencyCantactNo1) {
        csvDatas[0].push("Emergency Contact No 1");
        columnWidths.push(7);
      }
      if (emergencyCantactName2) {
        csvDatas[0].push("Emergency Contact Name 2");
        columnWidths.push(10);
      }
      if (relation2) {
        csvDatas[0].push("Relation 2");
        columnWidths.push(7);
      }
      if (emergencyCantactNo2) {
        csvDatas[0].push("Emergency Contact No 2");
        columnWidths.push(7);
      }
      if (tempAddr) {
        csvDatas[0].push("Temporary Address");
        columnWidths.push(25);
      }
      if (permanentAddr) {
        csvDatas[0].push("Permanant Address");
        columnWidths.push(25);
      }
      if (resignationLetterDate) {
        csvDatas[0].push("Resignation Letter Date");
        columnWidths.push(7);
      }
      if (relieveDate) {
        csvDatas[0].push("Relieving Date");
        columnWidths.push(7);
      }
      if (reason) {
        csvDatas[0].push("Reason for Leaving");
        columnWidths.push(10);
      }
      if (incrementDate) {
        csvDatas[0].push("Increment Date");
        columnWidths.push(7);
      }
      if (status) {
        csvDatas[0].push("Status");
        columnWidths.push(5);
      }

      console.log("csvData---", csvDatas);
      values.map((item, index) => {
        csvDatas[index + 1] = [];
        csvDatas[index + 1].push(index + 1);
        csvDatas[index + 1].push(item.custom_employeeid);
        csvDatas[index + 1].push(item.employee_name);
        if (fatherName) csvDatas[index + 1].push(item.custom_father_name);
        if (dateofBirth)
          csvDatas[index + 1].push(
            item.date_of_birth
              ? moment(item.date_of_birth).format("DD-MM-YYYY")
              : item.date_of_birth
          );
        if (gender) csvDatas[index + 1].push(item.gender);
        if (maritalStatus) csvDatas[index + 1].push(item.marital_status);
        if (motherName) csvDatas[index + 1].push(item.custom_mother_name);
        if (spouseName) csvDatas[index + 1].push(item.custom_spouse_name);
        if (bloodGroup) csvDatas[index + 1].push(item.blood_group);
        if (community) csvDatas[index + 1].push(item.custom_community);
        if (caste) csvDatas[index + 1].push(item.custom_caste);
        if (religion) csvDatas[index + 1].push(item.custom_religion);
        if (nationality) csvDatas[index + 1].push(item.custom_nationality);
        if (mobileNo1) csvDatas[index + 1].push(item.cell_number);
        if (mobileNo2) csvDatas[index + 1].push(item.custom_mobile_2);
        if (email) csvDatas[index + 1].push(item.personal_email);
        if (motherTongue) csvDatas[index + 1].push(item.custom_mother_tongue);

        if (languageKnown) {
          const modifiedLanguage = item?.custom_language_known?.replace(
            ",",
            " / "
          );
          csvDatas[index + 1].push(modifiedLanguage);
        }

        if (employeeType) csvDatas[index + 1].push(item.employment_type);
        if (dateofJoin)
          csvDatas[index + 1].push(
            item.date_of_joining
              ? moment(item.date_of_joining).format("DD-MM-YYYY")
              : item.date_of_joining
          );
        if (designation) csvDatas[index + 1].push(item.designation);
        if (teachingStaff) csvDatas[index + 1].push(item.custom_is_teaching);
        if (department) csvDatas[index + 1].push(item.department);
        if (reportTo) csvDatas[index + 1].push(item.reports_to);
        if (passportNo) csvDatas[index + 1].push(item.passport_number);
        if (placeofIssue) csvDatas[index + 1].push(item.place_of_issue);
        if (issueDate)
          csvDatas[index + 1].push(
            item.date_of_issue
              ? moment(item.date_of_issue).format("DD-MM-YYYY")
              : item.date_of_issue
          );
        if (expiryDate)
          csvDatas[index + 1].push(
            item.valid_upto
              ? moment(item.valid_upto).format("DD-MM-YYYY")
              : item.valid_upto
          );
        if (aadhaarNo) csvDatas[index + 1].push(item.custom_aadhaar_card);
        if (salaryMode) csvDatas[index + 1].push(item.salary_mode);
        if (bankName) csvDatas[index + 1].push(item.bank_name);
        if (accountNo) csvDatas[index + 1].push(item.bank_ac_no);
        if (iFSCCode) csvDatas[index + 1].push(item.ifsc_code);

        if (branchName) csvDatas[index + 1].push(item.custom_bank_branch_name);
        if (panNo) csvDatas[index + 1].push(item.pan_number);
        if (emergencyCantactName1)
          csvDatas[index + 1].push(item.person_to_be_contacted);
        if (relation1) csvDatas[index + 1].push(item.relation);
        if (emergencyCantactNo1)
          csvDatas[index + 1].push(item.emergency_phone_number);
        if (emergencyCantactName2)
          csvDatas[index + 1].push(item.custom_emergency_contact_name_2);
        if (relation2) csvDatas[index + 1].push(item.custom_relation_2);
        if (emergencyCantactNo2)
          csvDatas[index + 1].push(item.custom_emergency_phone_2);
        if (tempAddr) {
          if (type == 1) {
            csvDatas[index + 1].push(
              `${item.current_address} / ${item.custom_current_place} / ${item.custom_current_city} / ${item.custom_current_state} / ${item.custom_current_country} / ${item.custom_current_pincode}`
            );
          } else {
            csvDatas[index + 1].push(
              `${item?.current_address?.replace(",", " / ")} / ${
                item?.custom_current_place
              } / ${item?.custom_current_city} / ${
                item?.custom_current_state
              } / ${item?.custom_current_country} / ${
                item?.custom_current_pincode
              }`
            );
          }
        }

        if (permanentAddr) {
          if (type == 1) {
            csvDatas[index + 1].push(
              `${item.permanent_address} / ${item.custom_permanent_place} / ${item.custom_permanent_city} / ${item.custom_permanent_state} / ${item.custom_permanent_country} / ${item.custom_permanent__pincode}`
            );
          } else {
            csvDatas[index + 1].push(
              `${item?.permanent_address?.replace(",", " / ")} / ${
                item?.custom_permanent_place
              } / ${item?.custom_permanent_city} / ${
                item?.custom_permanent_state
              } / ${item?.custom_permanent_country} / ${
                item?.custom_permanent__pincode
              }`
            );
          }
        }

        if (resignationLetterDate)
          csvDatas[index + 1].push(item.resignation_letter_date);
        if (relieveDate)
          csvDatas[index + 1].push(
            item.relieving_date
              ? moment(item.relieving_date).format("DD-MM-YYYY")
              : item.relieving_date
          );
        if (reason) csvDatas[index + 1].push(item.reason_for_leaving);
        if (incrementDate)
          csvDatas[index + 1].push(
            item.custom_increment_date
              ? moment(item.custom_increment_date).format("DD-MM-YYYY")
              : item.custom_increment_date
          );
        if (status) csvDatas[index + 1].push(item.status);
      });
      console.log("csvDatas---", csvDatas);
      preFunction.downloadCSV(csvDatas, "Employee General Report.csv");
      setLoad(false);
    } catch (error) {
      console.log(error);
      setLoad(false);
    }
  };

  const handleShow = async (values, showAll = 0, report = 0) => {
    if (load) return;
    console.log("values---", values);

    setOpenModal(false);
    setCollegeError(false);
    setDateError(false);
    setDateValidationError(false);
    if (
      (values.fromDate != "" && values.fromDate != null) ||
      (values.toDate != "" && values.toDate != null)
    ) {
      console.log("from to-------------");
      if (
        values.fromDate == "" ||
        values.fromDate == null ||
        values.toDate == "" ||
        values.toDate == null
      ) {
        setDateError(true);
        document.getElementById("fromDate").focus();
        return;
      }
    }

    if (values.fromDate && values.toDate && values.fromDate > values.toDate) {
      setDateValidationError(true);
      document.getElementById("fromDate").focus();
      return;
    }

    if (collegeConfig.is_university && values.college == "") {
      document.getElementById("college").focus();
      setCollegeError(true);
      setLoad(false);
      return;
    }
    setLoad(true);
    setShowRes(true);
    let searchStringArr = [];
    searchStringArr.push(
      `["custom_college_id","=","${
        collegeConfig.is_university ? values.college.collegeID : collegeId
      }"]`
    );
    if (values.fromDate && values.fromDate != "") {
      searchStringArr.push(
        `["date_of_joining",">=","${moment(values.fromDate).format(
          "YYYY-MM-DD"
        )}"]`
      );
    }
    if (values.toDate && values.toDate != "") {
      searchStringArr.push(
        `["date_of_joining","<=","${moment(values.toDate).format(
          "YYYY-MM-DD"
        )}"]`
      );
    }
    if (
      values.department &&
      values.department != "" &&
      values.department.department != "All"
    ) {
      searchStringArr.push(
        `["department","=","${values.department.department_id}"]`
      );
    }
    if (values.employeeCode && values.employeeCode != "") {
      searchStringArr.push(`["employee","=","${values.employeeCode.name}"]`);
    }
    if (
      values.bankName &&
      values.bankName != "" &&
      values.bankName.bank != "All"
    ) {
      searchStringArr.push(`["bank_name","=","${values.bankName.bank}"]`);
    }
    if (
      values.paymentMode &&
      values.paymentMode != "" &&
      values.paymentMode.salary_mode != "All"
    ) {
      searchStringArr.push(
        `["salary_mode","=","${values.paymentMode.salary_mode}"]`
      );
    }
    if (values.status && values.status != "" && values.status.value != "All") {
      searchStringArr.push(`["status","=","${values.status.value}"]`);
    }
    if (values.gender && values.gender != "" && values.gender.gender != "All") {
      searchStringArr.push(`["gender","=","${values.gender.gender}"]`);
    }

    const searchstr = searchStringArr.join(",");
    console.log(searchstr, "string");

    let designationArr = [];
    if (
      values.designation &&
      values.designation != "" &&
      values.designation.designation != "All"
    ) {
      designationArr.push(
        `["designation","=","${values.designation.designation}"]`
      );
    }
    const search = designationArr.join(",");
    console.log(search, "search");

    let fieldArray = [];
    fieldArray.push("custom_employeeid");
    fieldArray.push("employee_name");
    if (fatherName) fieldArray.push("custom_father_name");
    if (dateofBirth) fieldArray.push("date_of_birth");
    if (gender) fieldArray.push("gender");
    if (maritalStatus) fieldArray.push("marital_status");
    if (motherName) fieldArray.push("custom_mother_name");
    if (spouseName) fieldArray.push("custom_spouse_name");
    if (bloodGroup) fieldArray.push("blood_group");
    if (community) fieldArray.push("custom_community");
    if (caste) fieldArray.push("custom_caste");
    if (religion) fieldArray.push("custom_religion");
    if (nationality) fieldArray.push("custom_nationality");
    if (mobileNo1) fieldArray.push("cell_number");
    if (mobileNo2) fieldArray.push("custom_mobile_2");
    if (email) fieldArray.push("personal_email");
    if (motherTongue) fieldArray.push("custom_mother_tongue");

    if (languageKnown) fieldArray.push("custom_language_known");
    if (employeeType) fieldArray.push("employment_type");
    if (dateofJoin) fieldArray.push("date_of_joining");
    if (designation) fieldArray.push("designation");
    if (teachingStaff) fieldArray.push("custom_is_teaching");
    if (department) fieldArray.push("department");
    if (reportTo) fieldArray.push("reports_to");
    if (passportNo) fieldArray.push("passport_number");
    if (placeofIssue) fieldArray.push("place_of_issue");
    if (issueDate) fieldArray.push("date_of_issue");
    if (expiryDate) fieldArray.push("valid_upto");
    if (aadhaarNo) fieldArray.push("custom_aadhaar_card");
    if (salaryMode) fieldArray.push("salary_mode");
    if (bankName) fieldArray.push("bank_name");
    if (accountNo) fieldArray.push("bank_ac_no");
    if (iFSCCode) fieldArray.push("ifsc_code");

    if (branchName) fieldArray.push("custom_bank_branch_name");
    if (panNo) fieldArray.push("pan_number");
    if (emergencyCantactName1) fieldArray.push("person_to_be_contacted");
    if (relation1) fieldArray.push("relation");
    if (emergencyCantactNo1) fieldArray.push("emergency_phone_number");
    if (emergencyCantactName2)
      fieldArray.push("custom_emergency_contact_name_2");
    if (relation2) fieldArray.push("custom_relation_2");
    if (emergencyCantactNo2) fieldArray.push("custom_emergency_phone_2");
    if (tempAddr) {
      fieldArray.push("current_address");
      fieldArray.push("custom_current_place");
      fieldArray.push("custom_current_city");
      fieldArray.push("custom_current_state");
      fieldArray.push("custom_current_country");
      fieldArray.push("custom_current_pincode");
    }
    if (permanentAddr) {
      fieldArray.push("permanent_address");
      fieldArray.push("custom_permanent_place");
      fieldArray.push("custom_permanent_city");
      fieldArray.push("custom_permanent_state");
      fieldArray.push("custom_permanent_country");
      fieldArray.push("custom_permanent__pincode");
    }
    if (resignationLetterDate) fieldArray.push("resignation_letter_date");
    if (relieveDate) fieldArray.push("relieving_date");
    if (reason) fieldArray.push("reason_for_leaving");
    if (incrementDate) fieldArray.push("custom_increment_date");
    if (status) fieldArray.push("status");

    console.log("Required Fields---", fieldArray);
    let selectedField = fieldArray.map((field) => `"${field}"`).join(",");
    console.log("selectedField", selectedField);
    try {
      const employeeDetail = await empApi.filterEmployeeDetail(
        selectedField,
        searchstr,
        search ? `&or_filters=[${search}]` : "",
        showAll ? "none" : string.PAGE_LIMIT
      );
      console.log("employeeDetail", employeeDetail);
      if (report) {
        handleCSVData(employeeDetail.data.data, report);
      } else {
        setEmployeeList(employeeDetail.data.data);

        setShowLoadMore(false);
        if (employeeDetail.data.data.length === string.PAGE_LIMIT) {
          setShowLoadMore(true);
        }
      }
      setEmployeeList(employeeDetail.data.data);
      setLoad(false);
    } catch (error) {
      setLoad(false);
      console.log("error", error);
    }
  };

  const getAllList = async (collegeId) => {
    console.log("collegeName", collegeId);
    try {
      const masterRes = await empApi.getAllMasters(2, collegeId);
      console.log("masterRes---", masterRes);
      setDesignationList(masterRes.data.message.data.designation);
      setDepartmentList(masterRes.data.message.data.department);
      setPaymentModeList(masterRes.data.message.data.salaryMode);
      setBankNameList(masterRes.data.message.data.bank);
      const masterRes1 = await empApi.getAllMasters(1, collegeId);
      console.log("masterRes1---", masterRes1);
      setGenderList(masterRes1.data.message.data.gender);
    } catch (error) {
      console.log("error----", error);
    }
  };

  const employeeSearch = async (value) => {
    setEmpCodeList([]);
    try {
      if (value.length > 2) {
        const employeeRes = await empApi.employeeSearch(value);
        console.log("employeeRes", employeeRes.data.message.employee_data);
        setEmpCodeList(employeeRes.data.message.employee_data);
      }
    } catch (error) {
      console.log("error----", error);
    }
  };

  useEffect(() => {
    if (!collegeConfig.is_university) {
      getAllList(collegeId);
    }
  }, [collegeConfig.is_university]);

  return (
    <div className="content-area-report" onClick={preFunction.hideNavbar}>
      <CustomActivityIndicator
        style={{ height: 100, alignSelf: "center" }}
        visible={load}
      />
      <div className="row no-gutters bg-white-report">
        <ScreenTitle titleClass="page-heading-position-report" />
        <div className="row no-gutters mt-1">
          <Formik
            enableReinitialize={false}
            initialValues={{
              fromDate: "",
              toDate: "",
              department: "",
              designation: "",
              bankName: "",
              paymentMode: "",
              gender: "",
              status: "",
              employeeCode: "",
              college: "",
            }}
            onSubmit={(values) => {
              handleOpenModal(values);
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
                  <div className="col-lg-10">
                    {collegeConfig.is_university && (
                      <SelectFieldFormik
                        autoFocus
                        tabIndex={1}
                        label="College"
                        id="college"
                        mandatory={1}
                        options={collegeConfig.collegeList}
                        getOptionLabel={(option) => option.collegeName}
                        getOptionValue={(option) => option.collegeID}
                        searchIcon={false}
                        clear={false}
                        customErrorMessage={
                          collegeError ? "Please select College" : ""
                        }
                        style={{ width: "70%" }}
                        onChange={(text) => {
                          setFieldValue("college", text);
                          console.log("text", text);
                          setShowRes(false);
                          getAllList(text?.collegeID);
                          setCollegeError(false);
                        }}
                      />
                    )}
                    <SelectFieldFormik
                      autoFocus={!collegeConfig.is_university}
                      tabIndex={2}
                      label="Department"
                      id="department"
                      style={{ width: "70%" }}
                      options={departmentList}
                      clear={true}
                      getOptionLabel={(option) => option.department}
                      getOptionValue={(option) => option.department}
                      onChange={(text) => {
                        setFieldValue("department", text);
                        setShowRes(false);
                      }}
                    />
                    <SelectFieldFormik
                      tabIndex={3}
                      label="Designation"
                      id="designation"
                      style={{ width: "50%" }}
                      options={designationList}
                      clear={true}
                      getOptionLabel={(option) => option.designation}
                      getOptionValue={(option) => option.designation}
                      onChange={(text) => {
                        setFieldValue("designation", text);
                        setShowRes(false);
                      }}
                    />
                    <SelectFieldFormik
                      tabIndex={4}
                      label="Status"
                      id="status"
                      style={{ width: "50%" }}
                      options={employeeStatus}
                      clear={true}
                      getOptionLabel={(option) => option.value}
                      getOptionValue={(option) => option.value}
                      onChange={(text) => {
                        setFieldValue("status", text);
                        setShowRes(false);
                      }}
                    />
                    <SelectFieldFormik
                      label="Employee No / Name"
                      id="employeeNumber"
                      tabIndex={5}
                      clear={true}
                      searchIcon={true}
                      style={{ width: "70%" }}
                      options={empCodeList}
                      getOptionLabel={(option) =>
                        option.custom_employeeid + " - " + option.employee_name
                      }
                      getOptionValue={(option) => option.name}
                      onInputChange={(inputValue) => {
                        employeeSearch(inputValue);
                      }}
                      onChange={(text) => {
                        setFieldValue("employeeCode", text);
                        console.log("text--", text);
                        setShowRes(false);
                      }}
                    />
                    <SelectFieldFormik
                      tabIndex={6}
                      label="Bank Name"
                      id="bankName"
                      style={{ width: "50%" }}
                      options={bankNameList}
                      clear={true}
                      getOptionLabel={(option) => option.bank}
                      getOptionValue={(option) => option.bank}
                      onChange={(text) => {
                        setFieldValue("bankName", text);
                        setShowRes(false);
                      }}
                    />
                    <SelectFieldFormik
                      tabIndex={7}
                      label="Payment Mode"
                      id="paymentMode"
                      style={{ width: "50%" }}
                      options={paymentModeList}
                      clear={true}
                      getOptionLabel={(option) => option.salary_mode}
                      getOptionValue={(option) => option.salary_mode}
                      onChange={(text) => {
                        setFieldValue("paymentMode", text);
                        setShowRes(false);
                      }}
                    />
                    <SelectFieldFormik
                      tabIndex={8}
                      label="Gender"
                      id="gender"
                      style={{ width: "50%" }}
                      options={genderList}
                      clear={true}
                      getOptionLabel={(option) => option.gender}
                      getOptionValue={(option) => option.gender}
                      onChange={(text) => {
                        setFieldValue("gender", text);
                        setShowRes(false);
                      }}
                    />
                    <div className="row no-gutters">
                      <div className="col-3"></div>
                      <div className="col-5" style={{ marginLeft: "-5px" }}>
                        <DateFieldFormik
                          tabIndex={9}
                          label="Date of Joining From"
                          id="fromDate"
                          style={{ width: "70%" }}
                          maxDate={new Date()}
                          minDate={new Date(moment().subtract(10, "years"))}
                          onChange={(e) => {
                            setFieldValue("fromDate", e.target.value);
                            setShowRes(false);
                            setDateError(false);
                            setDateValidationError(false);
                          }}
                        />
                      </div>
                      <div className="col-4" style={{ marginLeft: "-45px" }}>
                        <DateFieldFormik
                          label="To"
                          id="toDate"
                          tabIndex={10}
                          labelSize={1}
                          style={{ width: "60%" }}
                          maxDate={new Date()}
                          minDate={new Date(values.fromDate)}
                          error={
                            dateError
                              ? "Choose both From & To Date"
                              : dateValidationError
                              ? "To Date should be greater than From Date"
                              : ""
                          }
                          onChange={(e) => {
                            setFieldValue("toDate", e.target.value);
                            setDateError(false);
                            setDateValidationError(false);
                            setShowRes(false);
                          }}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="row no-gutters me-5">
                    <div className="col-lg-4"></div>
                    <div className="col-lg-2">
                      <Button
                        text="Choose Fields"
                        onClick={(e) => {
                          setShowRes(false);
                        }}
                      />
                    </div>
                    <div className="col-lg-1">
                      <Button
                        tabIndex={11}
                        type="button"
                        text="Show"
                        onClick={(e) => handleShow(values)}
                      />
                    </div>
                  </div>
                  {showRes ? (
                    <div className="row border mt-4 p-3">
                      {employeeList.length > 0 && (
                        <div className="row p-0">
                          <div className="col-lg-6"></div>
                          <div className="col-lg-6 p-0">
                            <div className="text-right">
                              <button
                                type="button"
                                className="btn"
                                onClick={(e) => handleShow(values, 1, 2)}
                              >
                                Export Excel
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                      <div className="row mt-3 p-0">
                        <div className="table-responsive">
                          <table className="table table-bordered report-table table-bordered">
                            <thead>
                              <tr>
                                <th>No.</th>
                                <th>Employee No.</th>
                                <th>Name</th>
                                {fatherName && <th>Father Name</th>}
                                {dateofBirth && <th>Date of Birth</th>}
                                {gender && <th>Gender</th>}
                                {maritalStatus && <th>Marital Status</th>}
                                {motherName && <th>Mother Name</th>}
                                {spouseName && <th>Spouse Name</th>}
                                {bloodGroup && <th>Blood Group</th>}
                                {community && <th>Community</th>}
                                {caste && <th>Caste</th>}
                                {religion && <th>Religion</th>}
                                {nationality && <th>Nationality</th>}
                                {mobileNo1 && <th>Mobile No 1</th>}
                                {mobileNo2 && <th>Mobile No 2</th>}
                                {email && <th>Email</th>}
                                {motherTongue && <th>Mother Tongue</th>}
                                {languageKnown && <th>Language Known</th>}
                                {employeeType && <th>Employee Type</th>}
                                {dateofJoin && <th> Date of Join</th>}
                                {designation && <th>Designation</th>}
                                {teachingStaff && <th>Teaching Staff</th>}
                                {department && <th>Department</th>}
                                {reportTo && <th>Report To</th>}
                                {passportNo && <th>Passport No.</th>}
                                {placeofIssue && <th>Place of Issue</th>}
                                {issueDate && <th>Issue Date</th>}
                                {expiryDate && <th>Expiry Date</th>}
                                {aadhaarNo && <th>Aadhaar No.</th>}
                                {salaryMode && <th>Salary Mode</th>}
                                {bankName && <th>Bank Name</th>}
                                {accountNo && <th>Account No.</th>}
                                {iFSCCode && <th>IFSC Code</th>}
                                {branchName && <th>Branch Name</th>}
                                {panNo && <th>Pan No.</th>}
                                {emergencyCantactName1 && (
                                  <th>Emergency Contact Name 1</th>
                                )}
                                {relation1 && <th>Relation 1</th>}
                                {emergencyCantactNo1 && (
                                  <th>Emergency Contact No1 </th>
                                )}
                                {emergencyCantactName2 && (
                                  <th>Emergency Contact Name 2</th>
                                )}
                                {relation2 && <th>Relation 2</th>}
                                {emergencyCantactNo2 && (
                                  <th>Emergency Contact No 2</th>
                                )}
                                {tempAddr && <th>Temporary Address</th>}
                                {permanentAddr && <th>Permanent Address</th>}
                                {resignationLetterDate && (
                                  <th>Resignation Letter Date</th>
                                )}
                                {relieveDate && <th>Relieve Date</th>}
                                {reason && <th>Reason for Leave</th>}
                                {incrementDate && <th>Increment Date</th>}
                                {status && <th>Status</th>}
                              </tr>
                            </thead>
                            <tbody>
                              {employeeList.length === 0 ? (
                                <tr>
                                  <td colspan={20} align="center">
                                    No data found
                                  </td>
                                </tr>
                              ) : (
                                employeeList.map((item, index) => {
                                  return (
                                    <tr key={index}>
                                      <td>{index + 1}</td>
                                      <td>{item.custom_employeeid}</td>
                                      <td>{item.employee_name}</td>
                                      {fatherName && (
                                        <td>{item.custom_father_name}</td>
                                      )}
                                      {dateofBirth && (
                                        <td>
                                          {" "}
                                          {moment(item.date_of_birth).format(
                                            "DD-MM-yyyy"
                                          )}
                                        </td>
                                      )}
                                      {gender && <td>{item.gender}</td>}
                                      {maritalStatus && (
                                        <td>{item.marital_status}</td>
                                      )}
                                      {motherName && (
                                        <td>{item.custom_mother_name}</td>
                                      )}
                                      {spouseName && (
                                        <td>{item.custom_spouse_name}</td>
                                      )}
                                      {bloodGroup && (
                                        <td>{item.blood_group}</td>
                                      )}
                                      {community && (
                                        <td>{item.custom_community}</td>
                                      )}
                                      {caste && <td>{item.custom_caste}</td>}
                                      {religion && (
                                        <td>{item.custom_religion}</td>
                                      )}
                                      {nationality && (
                                        <td>{item.custom_nationality}</td>
                                      )}
                                      {mobileNo1 && <td>{item.cell_number}</td>}
                                      {mobileNo2 && (
                                        <td>{item.custom_mobile_2}</td>
                                      )}
                                      {email && <td>{item.personal_email}</td>}
                                      {motherTongue && (
                                        <td>{item.custom_mother_tongue}</td>
                                      )}

                                      {languageKnown && (
                                        <td>{item.custom_language_known}</td>
                                      )}
                                      {employeeType && (
                                        <td>{item.employment_type}</td>
                                      )}
                                      {dateofJoin && (
                                        <td>
                                          {item.date_of_joining
                                            ? moment(
                                                item.date_of_joining
                                              ).format("DD-MM-yyyy")
                                            : ""}
                                        </td>
                                      )}
                                      {designation && (
                                        <td>{item.designation}</td>
                                      )}
                                      {teachingStaff && (
                                        <td>{item.custom_is_teaching}</td>
                                      )}

                                      {department && <td>{item.department}</td>}
                                      {reportTo && <td>{item.reports_to}</td>}
                                      {passportNo && (
                                        <td>{item.passport_number}</td>
                                      )}
                                      {placeofIssue && (
                                        <td>{item.place_of_issue}</td>
                                      )}
                                      {issueDate && (
                                        <td>
                                          {" "}
                                          {item.date_of_issue
                                            ? moment(item.date_of_issue).format(
                                                "DD-MM-yyyy"
                                              )
                                            : ""}
                                        </td>
                                      )}
                                      {expiryDate && (
                                        <td>
                                          {" "}
                                          {item.valid_upto
                                            ? moment(item.valid_upto).format(
                                                "DD-MM-yyyy"
                                              )
                                            : ""}
                                        </td>
                                      )}
                                      {aadhaarNo && (
                                        <td>{item.custom_aadhaar_card}</td>
                                      )}
                                      {salaryMode && (
                                        <td>{item.salary_mode}</td>
                                      )}
                                      {bankName && <td>{item.bank_name}</td>}
                                      {accountNo && <td>{item.bank_ac_no}</td>}
                                      {iFSCCode && <td>{item.ifsc_code}</td>}
                                      {branchName && (
                                        <td>{item.custom_bank_branch_name}</td>
                                      )}
                                      {panNo && <td>{item.pan_number}</td>}
                                      {emergencyCantactName1 && (
                                        <td>{item.person_to_be_contacted}</td>
                                      )}
                                      {relation1 && <td>{item.relation}</td>}
                                      {emergencyCantactNo1 && (
                                        <td>{item.emergency_phone_number}</td>
                                      )}
                                      {emergencyCantactName2 && (
                                        <td>
                                          {item.custom_emergency_contact_name_2}
                                        </td>
                                      )}
                                      {relation2 && (
                                        <td>{item.custom_relation_2}</td>
                                      )}
                                      {emergencyCantactNo2 && (
                                        <td>{item.custom_emergency_phone_2}</td>
                                      )}
                                      {tempAddr && (
                                        <td>
                                          {item.current_address
                                            ? item.current_address +
                                              " , " +
                                              item.custom_current_place +
                                              " , " +
                                              item.custom_current_city +
                                              " , " +
                                              item.custom_current_state +
                                              " , " +
                                              item.custom_current_country +
                                              " , " +
                                              item.custom_current_pincode
                                            : ""}
                                        </td>
                                      )}
                                      {permanentAddr && (
                                        <td>
                                          {item.permanent_address
                                            ? item.permanent_address +
                                              " , " +
                                              item.custom_permanent_place +
                                              " , " +
                                              item.custom_permanent_city +
                                              " , " +
                                              item.custom_permanent_state +
                                              " , " +
                                              item.custom_permanent_country +
                                              " , " +
                                              item.custom_permanent__pincode
                                            : ""}
                                        </td>
                                      )}
                                      {resignationLetterDate && (
                                        <td>
                                          {item.resignation_letter_date
                                            ? moment(
                                                item.resignation_letter_date
                                              ).format("DD-MM-yyyy")
                                            : ""}
                                        </td>
                                      )}
                                      {relieveDate && (
                                        <td>
                                          {item.relieving_date
                                            ? moment(
                                                item.relieving_date
                                              ).format("DD-MM-yyyy")
                                            : ""}
                                        </td>
                                      )}
                                      {reason && (
                                        <td>{item.reason_for_leaving}</td>
                                      )}
                                      {incrementDate && (
                                        <td>
                                          {item.custom_increment_date
                                            ? moment(
                                                item.custom_increment_date
                                              ).format("DD-MM-yyyy")
                                            : ""}
                                        </td>
                                      )}
                                      {status && <td>{item.status}</td>}
                                    </tr>
                                  );
                                })
                              )}
                            </tbody>
                          </table>
                        </div>
                        {showLoadMore && (
                          <Button
                            text="Show All"
                            className={"btn mt-3"}
                            isTable={true}
                            type="button"
                            onClick={(e) => {
                              handleShow(values, 1, 0);
                            }}
                          />
                        )}
                      </div>
                    </div>
                  ) : null}
                </form>
              );
            }}
          </Formik>
          <Modal
            show={openModel}
            dialogClassName="my-modal"
            onEscapeKeyDown={() => {
              setOpenModal(false);
            }}
          >
            <Modal.Header>
              <Modal.Title>Choose Export Fields</Modal.Title>
            </Modal.Header>
            <Modal.Body style={{ maxHeight: "500px", overflowY: "auto" }}>
              <div className="row">
                <div className="text-right">
                  <CheckboxField
                    id="checkAll"
                    label="Select All"
                    onChange={(e) => handleCheckAll(e)}
                    onClick={(e) => handleCheckAll(e)}
                  />
                </div>
                <div className="col-lg-6">
                  {/* <CheckboxField
                    label="Employee No."
                    checked={employeeID}
                    onChange={() => setEmployeeID(!employeeID)}
                  />
                  <CheckboxField
                    label="Employee Name"
                    checked={employeeName}
                    onChange={() => setEmployeeName(!employeeName)}
                  /> */}

                  <CheckboxField
                    label="Father Name"
                    checked={fatherName}
                    onChange={() => {
                      setFatherName(!fatherName);
                    }}
                  />
                  <CheckboxField
                    label="Date of Birth"
                    checked={dateofBirth}
                    onChange={() => setDateofBirth(!dateofBirth)}
                  />
                  <CheckboxField
                    label="Gender"
                    checked={gender}
                    onChange={() => setGender(!gender)}
                  />
                  <CheckboxField
                    label="Marital Status"
                    checked={maritalStatus}
                    onChange={() => setMaritalStatus(!maritalStatus)}
                  />
                  <CheckboxField
                    label="Mother Name"
                    checked={motherName}
                    onChange={() => setMotherName(!motherName)}
                  />
                  <CheckboxField
                    label="Spouse Name"
                    checked={spouseName}
                    onChange={() => setSpouseName(!spouseName)}
                  />
                  <CheckboxField
                    label="Blood Group"
                    checked={bloodGroup}
                    onChange={() => setBloodGroup(!bloodGroup)}
                  />
                  <CheckboxField
                    label="Community"
                    checked={community}
                    onChange={() => setCommunity(!community)}
                  />
                  <CheckboxField
                    label="Caste"
                    checked={caste}
                    onChange={() => setCaste(!caste)}
                  />
                  <CheckboxField
                    label="Religion"
                    checked={religion}
                    onChange={() => setReligion(!religion)}
                  />
                  <CheckboxField
                    label="Nationality"
                    checked={nationality}
                    onChange={() => setNationality(!nationality)}
                  />
                  <CheckboxField
                    label="Mobile Number 1"
                    checked={mobileNo1}
                    onChange={() => setMobileNo1(!mobileNo1)}
                  />
                  <CheckboxField
                    label="Mobile Number 2"
                    checked={mobileNo2}
                    onChange={() => setMobileNo2(!mobileNo2)}
                  />
                  <CheckboxField
                    label="Email"
                    checked={email}
                    onChange={() => setEmail(!email)}
                  />
                  <CheckboxField
                    label="Mother Tongue"
                    checked={motherTongue}
                    onChange={() => setMotherTongue(!motherTongue)}
                  />
                  <CheckboxField
                    label="Language Known"
                    checked={languageKnown}
                    onChange={() => setLanguageKnown(!languageKnown)}
                  />
                  <CheckboxField
                    label="Employment Type"
                    checked={employeeType}
                    onChange={() => setEmployeeType(!employeeType)}
                  />
                  <CheckboxField
                    label="Date of Joining"
                    checked={dateofJoin}
                    onChange={() => setDateofJoin(!dateofJoin)}
                  />
                  <CheckboxField
                    label="Designation "
                    checked={designation}
                    onChange={() => setDesignation(!designation)}
                  />
                  <CheckboxField
                    label="Teaching Staff "
                    checked={teachingStaff}
                    onChange={() => setTeachingStaff(!teachingStaff)}
                  />
                  <CheckboxField
                    label="Department"
                    checked={department}
                    onChange={() => setDepartment(!department)}
                  />
                  <CheckboxField
                    label="Report To"
                    checked={reportTo}
                    onChange={() => setReportTo(!reportTo)}
                  />
                  <CheckboxField
                    label="Aadhaar Number"
                    checked={aadhaarNo}
                    onChange={() => setAadhaarNo(!aadhaarNo)}
                  />
                </div>
                <div className="col-lg-6">
                  <CheckboxField
                    label="Passport Number"
                    checked={passportNo}
                    onChange={() => setPassportNo(!passportNo)}
                  />
                  <CheckboxField
                    label="Place of Issue"
                    checked={placeofIssue}
                    onChange={() => setPlaceofIssue(!placeofIssue)}
                  />
                  <CheckboxField
                    label="Issue Date"
                    checked={issueDate}
                    onChange={() => setIssueDate(!issueDate)}
                  />
                  <CheckboxField
                    label="Expiry Date"
                    checked={expiryDate}
                    onChange={() => setExpiryDate(!expiryDate)}
                  />
                  <CheckboxField
                    label="Salary Mode"
                    checked={salaryMode}
                    onChange={() => setSalaryMode(!salaryMode)}
                  />
                  <CheckboxField
                    label="Bank Name"
                    checked={bankName}
                    onChange={() => setBankName(!bankName)}
                  />
                  <CheckboxField
                    label="Bank Account Number"
                    checked={accountNo}
                    onChange={() => setAccountNo(!accountNo)}
                  />
                  <CheckboxField
                    label="IFSC Code"
                    checked={iFSCCode}
                    onChange={() => setIFSCCode(!iFSCCode)}
                  />
                  <CheckboxField
                    label="Branch Name"
                    checked={branchName}
                    onChange={() => setBranchName(!branchName)}
                  />
                  <CheckboxField
                    label="PAN Number"
                    checked={panNo}
                    onChange={() => setPanNo(!panNo)}
                  />
                  <CheckboxField
                    label="Emergency Contact Name 1 "
                    checked={emergencyCantactName1}
                    onChange={() =>
                      setEmergencyCantactName1(!emergencyCantactName1)
                    }
                  />
                  <CheckboxField
                    label="Relation 1"
                    checked={relation1}
                    onChange={() => setRelation1(!relation1)}
                  />
                  <CheckboxField
                    label="Emergency Contact Number 1"
                    checked={emergencyCantactNo1}
                    onChange={() =>
                      setEmergencyCantactNo1(!emergencyCantactNo1)
                    }
                  />
                  <CheckboxField
                    label="Emergency Contact Name 2"
                    checked={emergencyCantactName2}
                    onChange={() =>
                      setEmergencyCantactName2(!emergencyCantactName2)
                    }
                  />
                  <CheckboxField
                    label="Relation 2"
                    checked={relation2}
                    onChange={() => setRelation2(!relation2)}
                  />
                  <CheckboxField
                    label="Emergency Contact Number 2"
                    checked={emergencyCantactNo2}
                    onChange={() =>
                      setEmergencyCantactNo2(!emergencyCantactNo2)
                    }
                  />
                  <CheckboxField
                    label="Temporary Address"
                    checked={tempAddr}
                    onChange={() => setTempAddr(!tempAddr)}
                  />

                  <CheckboxField
                    label="Permanant Address"
                    checked={permanentAddr}
                    onChange={() => setPermanentAddr(!permanentAddr)}
                  />

                  <CheckboxField
                    label="Resignation Letter Date"
                    checked={resignationLetterDate}
                    onChange={() =>
                      setResignationLetterDate(!resignationLetterDate)
                    }
                  />
                  <CheckboxField
                    label="Relieve Date"
                    checked={relieveDate}
                    onChange={() => setRelieveDate(!relieveDate)}
                  />
                  <CheckboxField
                    label="Reason for Leaving"
                    checked={reason}
                    onChange={() => setReason(!reason)}
                  />
                  <CheckboxField
                    label="Increment Date"
                    checked={incrementDate}
                    onChange={() => setIncrementDate(!incrementDate)}
                  />
                  <CheckboxField
                    label="Status"
                    checked={status}
                    onChange={() => setStatus(!status)}
                  />
                </div>
              </div>
            </Modal.Body>
            <Modal.Footer>
              {/* {checkBoxError ? (
                <ErrorMessage
                  Message={"You cannot select more than 15 checkboxes!"}
                  view={checkBoxError}
                />
              ) : null} */}
              <Button
                frmButton={false}
                type="button"
                text="Show"
                onClick={() => {
                  handleShow(value);
                }}
              />
              <Button
                id="close"
                frmButton={false}
                text="Close"
                type="button"
                onClick={(e) => {
                  setOpenModal(false);
                }}
              />
            </Modal.Footer>
          </Modal>
        </div>
      </div>
    </div>
  );
}
export default EmployeeGeneralReport;
