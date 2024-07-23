import React, { useEffect, useState, useContext, useRef } from "react";
import { Formik } from "formik";
import * as Yup from "yup";
import { Modal } from "react-bootstrap";
import moment from "moment";
import { useSelector } from "react-redux";

import StudentApi from "../../api/StudentApi";

import preFunction from "../../component/common/CommonFunction";
import AuthContext from "../../auth/context";
import CustomActivityIndicator from "../../component/common/CustomActivityIndicator";
import Button from "../../component/FormField/Button";
import CheckboxField from "../../component/FormField/CheckboxField";
import DateFieldFormik from "../../component/FormFieldLibrary/DateFieldFormik";
import SelectFieldFormik from "../../component/FormFieldLibrary/SelectFieldFormik";
import ScreenTitle from "../../component/common/ScreenTitle";
import ErrorMessage from "../../component/common/ErrorMessage";

import string from "../../string";

function StudentMasterReport() {
  const RENAME = useSelector((state) => state.web.rename);
  const formikRef = useRef();
  const [data, setData] = useState([]);
  const [load, setLoad] = useState(false);

  const [filterError, setFilterError] = useState(false);
  const [courseList, setCourseList] = useState([]);
  const [batchList, setBatchList] = useState([]);

  const [showRes, setShowRes] = useState(false);
  const [showLoadMore, setShowLoadMore] = useState(false);
  const [genderList, setGenderList] = useState([]);
  const [categoryList, setCategoryList] = useState([]);
  const [enrollNumberList, setEnrollNumberList] = useState([]);
  const [communityList, setCommunityList] = useState([]);
  const [religionList, setReligionList] = useState([]);
  const [admissionTypeList, setAdmissionTypeList] = useState([]);
  const [modeOfAdmissionList, setModeOfAdmissionList] = useState([]);
  const [dateError, setDateError] = useState(false);
  const [sectionList, setSectionList] = useState([]);

  const [openModel, setOpenModal] = useState(false);
  const [fatherName, setFatherName] = useState(true);
  const [dateofBirth, setDateofBirth] = useState(true);
  const [gender, setGender] = useState(true);
  const [studentEmail, setStudentEmail] = useState(false);
  const [applicationNo, setApplicationNo] = useState(false);
  const [board, setBoard] = useState(true);
  const [className, setClassName] = useState(true);
  const [admissionType, setAdmissionType] = useState(true);
  const [fatherEmail, setFatherEmail] = useState(false);
  const [fatherMobile, setFatherMobile] = useState(true);
  const [fatherOccupation, setFatherOccupation] = useState(false);
  const [fatherIncome, setFatherIncome] = useState(false);
  const [fatherQualification, setFatherQualification] = useState(false);

  const [motherName, setMotherName] = useState(false);
  const [motherEmail, setMotherEmail] = useState(false);
  const [motherMobile, setMotherMobile] = useState(false);
  const [motherOccupation, setMotherOccupation] = useState(false);
  const [motherIncome, setMotherIncome] = useState(false);
  const [motherQualification, setMotherQualification] = useState(false);
  const [guardianName, setGuardianName] = useState(false);
  const [guardianEmail, setGuardianEmail] = useState(false);
  const [guardianMobile, setGuardianMobile] = useState(false);
  const [guardianOccupation, setGuardianOccupation] = useState(false);
  const [guardianIncome, setGuardianIncome] = useState(false);
  const [guardianQualification, setGuardianQualification] = useState(false);

  const [bloodGroup, setBloodGroup] = useState(false);
  const [community, setCommunity] = useState(true);
  const [religion, setReligion] = useState(true);
  const [nationality, setNationality] = useState(true);
  const [aadhaarNo, setAadhaarNo] = useState(true);
  const [tempAddr, setTempAddr] = useState(false);
  const [permanentAddr, setPermanentAddr] = useState(false);
  const [previousSchool, setPreviousSchool] = useState(false);
  const [previousBoard, setPreviousBoard] = useState(false);
  const [tcNumber, setTcNumber] = useState(false);
  const [value, setValue] = useState([]);

  const { collegeId, collegeName } = useContext(AuthContext);
  const collegeConfig = useSelector((state) => state.web.college);

  const reportSchema = Yup.object().shape({
    college: collegeConfig.is_university
      ? Yup.object().required("Please select College")
      : Yup.mixed().notRequired(),
    course:
      collegeConfig.institution_type === 1
        ? Yup.object().required("Please select " + RENAME?.course)
        : Yup.mixed().notRequired(),
    batch:
      collegeConfig.institution_type !== 1
        ? Yup.object().required("Please select " + RENAME?.batch)
        : Yup.mixed().notRequired(),
  });

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
        setStudentEmail(true);
        setBloodGroup(true);
        setAadhaarNo(true);
        setNationality(true);
        setReligion(true);
        setCommunity(true);
        setApplicationNo(true);
        setBoard(true);
        setClassName(true);
        setAdmissionType(true);
        setFatherEmail(true);
        setFatherMobile(true);
        setFatherQualification(true);
        setFatherOccupation(true);
        setFatherIncome(true);
        setMotherName(true);
        setMotherEmail(true);
        setMotherMobile(true);
        setMotherQualification(true);
        setMotherOccupation(true);
        setMotherIncome(true);
        setGuardianName(true);
        setGuardianEmail(true);
        setGuardianMobile(true);
        setGuardianQualification(true);
        setGuardianOccupation(true);
        setGuardianIncome(true);
        setTempAddr(true);
        setPermanentAddr(true);
        setPreviousSchool(true);
        setPreviousBoard(true);
        setTcNumber(true);
      });
    } else {
      checkboxes.forEach((checkbox) => {
        checkbox.checked = false;
        setFatherName(false);
        setDateofBirth(false);
        setGender(false);
        setStudentEmail(false);
        setBloodGroup(false);
        setAadhaarNo(false);
        setNationality(false);
        setReligion(false);
        setCommunity(false);
        setApplicationNo(false);
        setBoard(false);
        setClassName(false);
        setAdmissionType(false);
        setFatherEmail(false);
        setFatherMobile(false);
        setFatherQualification(false);
        setFatherOccupation(false);
        setFatherIncome(false);
        setMotherName(false);
        setMotherEmail(false);
        setMotherMobile(false);
        setMotherQualification(false);
        setMotherOccupation(false);
        setMotherIncome(false);
        setGuardianName(false);
        setGuardianEmail(false);
        setGuardianMobile(false);
        setGuardianQualification(false);
        setGuardianOccupation(false);
        setGuardianIncome(false);
        setTempAddr(false);
        setPermanentAddr(false);
        setPreviousSchool(false);
        setPreviousBoard(false);
        setTcNumber(false);
      });
    }
  };

  const handleCSVData = async (values, type) => {
    console.log("values-----", values, type);

    try {
      setLoad(true);
      let csvDatas = [];
      csvDatas[0] = ["No"];
      csvDatas[0].push("Student No");
      csvDatas[0].push("Student Name");
      var columnWidths = [];
      columnWidths.push(3);
      if (fatherName) {
        csvDatas[0].push("Father Name");
        columnWidths.push(12);
      }
      if (dateofBirth) {
        csvDatas[0].push("Date of Birth");
        columnWidths.push(7);
      }
      if (gender) {
        csvDatas[0].push("Gender");
        columnWidths.push(5);
      }
      if (studentEmail) {
        csvDatas[0].push("Student Email");
        columnWidths.push(12);
      }
      if (applicationNo) {
        csvDatas[0].push("Application No");
        columnWidths.push(7);
      }
      if (board) {
        csvDatas[0].push(RENAME?.course);
        columnWidths.push(7);
      }
      if (className) {
        csvDatas[0].push(RENAME?.sem);
        columnWidths.push(5);
      }
      if (admissionType) {
        csvDatas[0].push("Admission Type");
        columnWidths.push(7);
      }
      if (fatherEmail) {
        csvDatas[0].push("Father Email");
        columnWidths.push(12);
      }
      if (fatherMobile) {
        csvDatas[0].push("Father Mobile");
        columnWidths.push(7);
      }
      if (fatherOccupation) {
        csvDatas[0].push("Father Occupation");
        columnWidths.push(10);
      }
      if (fatherIncome) {
        csvDatas[0].push("Father Income");
        columnWidths.push(7);
      }
      if (fatherQualification) {
        csvDatas[0].push("Father Qualification");
        columnWidths.push(10);
      }
      if (motherName) {
        csvDatas[0].push("Mother Name");
        columnWidths.push(12);
      }
      if (motherEmail) {
        csvDatas[0].push("Mother Email");
        columnWidths.push(10);
      }
      if (motherMobile) {
        csvDatas[0].push("Mother Mobile");
        columnWidths.push(7);
      }
      if (motherOccupation) {
        csvDatas[0].push("Mother Occupation");
        columnWidths.push(10);
      }
      if (motherIncome) {
        csvDatas[0].push("Mother Income");
        columnWidths.push(7);
      }
      if (motherQualification) {
        csvDatas[0].push("Mother Qualification");
        columnWidths.push(10);
      }
      if (guardianName) {
        csvDatas[0].push("Guardian Name");
        columnWidths.push(12);
      }
      if (guardianEmail) {
        csvDatas[0].push("Guardian Email");
        columnWidths.push(10);
      }
      if (guardianMobile) {
        csvDatas[0].push("Guardian Mobile");
        columnWidths.push(7);
      }
      if (guardianOccupation) {
        csvDatas[0].push("Guardian Occupation");
        columnWidths.push(10);
      }
      if (guardianIncome) {
        csvDatas[0].push("Guardian Income");
        columnWidths.push(7);
      }
      if (guardianQualification) {
        csvDatas[0].push("Guardian Qualification");
        columnWidths.push(10);
      }
      if (bloodGroup) {
        csvDatas[0].push("Blood Group");
        columnWidths.push(7);
      }
      if (community) {
        csvDatas[0].push("Community");
        columnWidths.push(7);
      }
      if (religion) {
        csvDatas[0].push("Religion");
        columnWidths.push(7);
      }
      if (nationality) {
        csvDatas[0].push("Nationality");
        columnWidths.push(7);
      }
      if (aadhaarNo) {
        csvDatas[0].push("Aadhaar No");
        columnWidths.push(10);
      }
      if (tempAddr) {
        csvDatas[0].push("Temporary Address");
        columnWidths.push(20);
      }
      if (permanentAddr) {
        csvDatas[0].push("Permanent Address");
        columnWidths.push(20);
      }
      if (previousSchool) {
        csvDatas[0].push("Previous School");
        columnWidths.push(20);
      }
      if (previousBoard) {
        csvDatas[0].push("Previous " + RENAME?.course);
        columnWidths.push(10);
      }
      if (tcNumber) {
        csvDatas[0].push("TC Number");
        columnWidths.push(10);
      }

      console.log("csvData---", csvDatas);
      values.map((item, index) => {
        csvDatas[index + 1] = [];
        csvDatas[index + 1].push(index + 1);
        csvDatas[index + 1].push(item.enrollNo);
        csvDatas[index + 1].push(item.name);
        if (fatherName) csvDatas[index + 1].push(item.fatherName);
        if (dateofBirth) csvDatas[index + 1].push(item.DOB);
        if (gender) csvDatas[index + 1].push(item.gender);
        if (studentEmail) csvDatas[index + 1].push(item.email);
        if (applicationNo) csvDatas[index + 1].push(item.applicationNo);
        if (board) csvDatas[index + 1].push(item.courseName);
        if (className) csvDatas[index + 1].push(item.className);
        if (admissionType) csvDatas[index + 1].push(item.admissionType);
        if (fatherEmail) csvDatas[index + 1].push(item.fatheEmail);
        if (fatherMobile) csvDatas[index + 1].push(item.fatherMobile);
        if (fatherOccupation) csvDatas[index + 1].push(item.fatherOccupation);
        if (fatherIncome) csvDatas[index + 1].push(item.fatherIncome);
        if (fatherQualification)
          csvDatas[index + 1].push(
            item.fatherQualification &&
              item.fatherQualification.replace(/,/g, " / ")
          );
        if (motherName) csvDatas[index + 1].push(item.motherName);
        if (motherEmail) csvDatas[index + 1].push(item.motherEmail);
        if (motherMobile) csvDatas[index + 1].push(item.motherMobile);
        if (motherOccupation) csvDatas[index + 1].push(item.motherOccupation);
        if (motherIncome) csvDatas[index + 1].push(item.motherIncome);
        if (motherQualification)
          csvDatas[index + 1].push(
            item.motherQualification &&
              item.motherQualification.replace(/,/g, " / ")
          );
        if (guardianName) csvDatas[index + 1].push(item.guardianName);
        if (guardianEmail) csvDatas[index + 1].push(item.guardianEmail);
        if (guardianMobile) csvDatas[index + 1].push(item.guardianMobile);
        if (guardianOccupation)
          csvDatas[index + 1].push(item.guardianOccupation);
        if (guardianIncome) csvDatas[index + 1].push(item.guardianIncome);
        if (guardianQualification)
          csvDatas[index + 1].push(item.guardianQualification);
        if (bloodGroup) csvDatas[index + 1].push(item.bloodGroup);
        if (community) csvDatas[index + 1].push(item.community);
        if (religion) csvDatas[index + 1].push(item.religion);
        if (nationality) csvDatas[index + 1].push(item.nationality);
        if (aadhaarNo) csvDatas[index + 1].push(item.aadhaar);

        if (tempAddr) {
          if (type == 1) {
            //   csvDatas[index + 1].push(
            //     `${
            //       item.taddress1 != "" &&
            //       item.taddress1 != null &&
            //       (item.taddress1.endsWith(",")
            //         ? item.taddress1
            //         : item.taddress1 + " , ")
            //     }
            //   ${
            //     item.taddress2 != "" &&
            //     item.taddress2 != null &&
            //     (item.taddress2.endsWith(",")
            //       ? item.taddress2
            //       : item.taddress2 + " , ")
            //   }
            //   ${item.tplace != "" && item.tplace != null && item.tplace + " , "}
            //   ${item.tcity != "" && item.tcity != null && item.tcity + " , "}
            //   ${item.tstate != "" && item.tstate != null && item.tstate + " , "}
            // ${
            //   item.tcountry != "" &&
            //   item.tcountry != null &&
            //   item.tcountry + " , "
            // }
            //   ${item.tpincode != "" && item.tpincode != null && item.tpincode}`
            //   );
          } else {
            csvDatas[index + 1].push(
              `${
                (item.taddress1 && item.taddress1.trim() !== ""
                  ? item.taddress1.endsWith(",")
                    ? item.taddress1.replace(/,/g, " / ")
                    : item.taddress1.replace(/,/g, " / ") + " / "
                  : "") +
                (item.taddress2 && item.taddress2.trim() !== ""
                  ? item.taddress2.endsWith(",")
                    ? item.taddress2.replace(/,/g, " / ")
                    : item.taddress2.replace(/,/g, " / ") + " / "
                  : "") +
                (item.tplace && item.tplace.trim() !== ""
                  ? item.tplace.replace(/,/g, " / ") + " / "
                  : "") +
                (item.tcity && item.tcity.trim() !== ""
                  ? item.tcity.replace(/,/g, " / ") + " / "
                  : "") +
                (item.tstate && item.tstate.trim() !== ""
                  ? item.tstate.replace(/,/g, " / ") + " / "
                  : "") +
                (item.tcountry && item.tcountry.trim() !== ""
                  ? item.tcountry.replace(/,/g, " / ") + " / "
                  : "") +
                (item.tpincode && item.tpincode.trim() !== ""
                  ? item.tpincode.replace(/,/g, " / ")
                  : "")
              }`
            );
          }
        }

        if (permanentAddr) {
          if (type == 1) {
            // csvDatas[index + 1].push(
            //   `${
            //     item.address1 != "" &&
            //     item.address1 != null &&
            //     (item.address1.endsWith(",")
            //       ? item.address1
            //       : item.address1 + " , ")
            //   }
            // ${
            //   item.address2 != "" &&
            //   item.address2 != null &&
            //   (item.address2.endsWith(",")
            //     ? item.address2
            //     : item.address2 + " , ")
            // }
            // ${item.place != "" && item.place != null && item.place + " , "}
            // ${item.city != "" && item.city != null && item.city + " , "}
            // ${item.state != "" && item.state != null && item.state + " , "}
            // ${
            //   item.country != "" && item.country != null && item.country + " , "
            // }
            // ${item.pincode != "" && item.pincode != null && item.pincode}`
            // );
          } else {
            csvDatas[index + 1].push(
              `${
                (item.address1 && item.address1.trim() !== ""
                  ? item.address1.endsWith(",")
                    ? item.address1.replace(/,/g, " / ")
                    : item.address1.replace(/,/g, " / ") + " / "
                  : "") +
                (item.address2 && item.address2.trim() !== ""
                  ? item.address2.endsWith(",")
                    ? item.address2.replace(/,/g, " / ")
                    : item.address2.replace(/,/g, " / ") + " / "
                  : "") +
                (item.place && item.place.trim() !== ""
                  ? item.place.replace(/,/g, " / ") + " / "
                  : "") +
                (item.city && item.city.trim() !== ""
                  ? item.city.replace(/,/g, " / ") + " / "
                  : "") +
                (item.state && item.state.trim() !== ""
                  ? item.state.replace(/,/g, " / ") + " / "
                  : "") +
                (item.country && item.country.trim() !== ""
                  ? item.country.replace(/,/g, " / ") + " / "
                  : "") +
                (item.pincode && item.pincode.trim() !== ""
                  ? item.pincode.replace(/,/g, " / ")
                  : "")
              }`
            );
          }
        }

        if (previousSchool) csvDatas[index + 1].push(item.schoolCollegeName);
        if (previousBoard) csvDatas[index + 1].push(item.boardUniversity);
        if (tcNumber) csvDatas[index + 1].push(item.tcNo);
      });
      // const adjustedPercentages = adjustPercentages(columnWidths);

      // console.log(adjustedPercentages); // Output: [5, 9, 77, 9]

      // console.log("csvDatas---", csvDatas, adjustedPercentages);
      if (type == 1) {
        // preFunction.generatePDF(
        //   collegeName,
        //   "Student General Report",
        //   csvDatas,
        //   adjustedPercentages,
        //   false,
        //   "landscape",
        //   columnWidths.length > 10 ? true : false
        // );
      } else {
        preFunction.downloadCSV(csvDatas, "Student General Report.csv");
      }
      setLoad(false);
    } catch (error) {
      console.log(error);
      setLoad(false);
    }
  };

  const handleShow = async (values, showAll, report) => {
    setFilterError(false);
    console.log("values", values);
    if (
      !values.course &&
      !values.batch &&
      !values.section &&
      !values.gender &&
      !values.community &&
      !values.religion &&
      !values.modeOfAdmission &&
      !values.admissionType &&
      !values.enrollNo &&
      // !values.category &&
      !values.fromDate &&
      !values.toDate
    ) {
      setFilterError(true);
      return;
    }
    setOpenModal(false);

    if (
      (values.fromDate !== "" && values.fromDate) ||
      (values.toDate !== "" && values.toDate)
    ) {
      console.log("from to-------------");
      if (
        values.fromDate === "" ||
        !values.fromDate ||
        values.toDate === "" ||
        !values.toDate
      ) {
        setDateError(true);
        return;
      }
    }

    setShowRes(true);

    try {
      setLoad(true);
      setShowRes(true);
      const studentRes = await StudentApi.getStudentMasterReport(
        collegeConfig.institution_type,
        values.college ? values.college.collegeID : collegeId,
        values.course ? values.course.id : null,
        collegeConfig.institution_type !== 1 && values.batch
          ? values.batch.batchID
          : null,
        values.enrollNo ? values.enrollNo.enrollNo : null,
        values.admissionType ? values.admissionType.id : null,
        values.gender ? values.gender.id : null,
        values.community ? values.community.id : null,
        values.religion ? values.religion.id : null,
        values.section ? values.section.classID : null,
        // values.category ? values.category.id : null,
        values.fromDate ? values.fromDate : null,
        values.toDate ? values.toDate : null,
        collegeConfig.institution_type == 1 && values.batch
          ? values.batch.semester
          : null,
        values.modeOfAdmission ? values.modeOfAdmission.id : null,
        showAll == 1 ? 1 : 0
      );

      console.log("studentRes------", studentRes);

      if (report) {
        handleCSVData(studentRes.data.message.data, report);
      } else {
        setData(studentRes.data.message.data);
        setShowLoadMore(false);
        if (studentRes.data.message.data.length === string.PAGE_LIMIT) {
          setShowLoadMore(true);
        }
      }
      setLoad(false);
    } catch (error) {
      setLoad(false);
      console.log("error", error);
    }
  };

  const getAllList = async (collegeId, course) => {
    try {
      const masterList = await StudentApi.getMaster(
        5,
        collegeId,
        course ? course.id : null
      );
      console.log("MasterList5", masterList);
      setCourseList(masterList.data.message.data.course_data);
      if (masterList.data.message.data.course_data.length === 1) {
        handleCourse(masterList.data.message.data.course_data[0]);
        formikRef.current.setFieldValue(
          "course",
          masterList.data.message.data.course_data[0]
        );
      }
      setCategoryList(masterList.data.message.data.category);
      setAdmissionTypeList(masterList.data.message.data.admission_type_data);
      if (collegeConfig.institution_type !== 1) {
        masterList.data.message.data.all_batch_data.splice(0, 0, {
          batchID: null,
          batch: "All Current " + RENAME?.batch,
        });
        setBatchList(masterList.data.message.data.all_batch_data);
        formikRef.current.setFieldValue("batch", {
          batchID: null,
          batch: "All Current " + RENAME?.batch,
        });
      }

      const masterRes = await StudentApi.getMaster(1, collegeId);
      console.log("MasterList1", masterRes);

      setGenderList(masterRes.data.message.data.gender_data);
      setReligionList(masterRes.data.message.data.religion_data);
      setCommunityList(masterRes.data.message.data.community_data);

      const masterRes2 = await StudentApi.getMaster(2, collegeId);
      console.log("MasterList2", masterRes2);

      setModeOfAdmissionList(masterRes2.data.message.data.admission_mode_data);
    } catch (error) {
      console.log("error", error);
    }
  };

  const handleSearchStudent = async (text, collegeID) => {
    if (text.replace(/\s\s+/g, " ").trim().length > 2) {
      try {
        const searchStudentRes = await StudentApi.searchStudent(
          text,
          collegeID ? collegeID : collegeId
        );
        console.log("searchStudentRes--------", searchStudentRes);
        setEnrollNumberList(searchStudentRes.data.message.data.student);
      } catch (error) {
        console.log("error--", error);
      }
    } else {
      setEnrollNumberList([]);
    }
  };

  const handleCourse = async (course) => {
    setBatchList([]);
    if (course) {
      let yearList = [];
      for (let i = 0; i < course.duration; i++) {
        let year = i + 1;
        yearList.push({ label: year, value: year });
      }
      console.log("yearList", yearList);

      const classRes = await StudentApi.getMaster(8, collegeId, course.id);
      console.log("classRes", classRes);
      setBatchList(classRes.data.message.data.semester_data);
    }
  };

  const handleSectionList = async (course, batch) => {
    console.log("course", course, batch);
    setSectionList([]);
    if (course && batch) {
      let batchRes;
      try {
        if (collegeConfig.institution_type === 1) {
          batchRes = await StudentApi.getMaster(
            8,
            collegeId,
            course.id,
            batch.semester
          );
          console.log("batchResSchool", batchRes);
          setSectionList(batchRes.data.message.data.class_data);
        } else {
          batchRes = await StudentApi.getSectionList(course.id, batch.batchID);
          console.log("batchRes", batchRes);
          setSectionList(batchRes.data.message);
        }
      } catch (error) {
        console.log("error", error);
      }
    }
  };

  const handleClear = () => {
    setData([]);
    setShowRes(false);
    setFilterError(false);
  };

  const handleCollegeWiseClear = () => {
    formikRef.current.setFieldValue("course", "");
    formikRef.current.setFieldValue("batch", "");
    formikRef.current.setFieldValue("section", "");
    formikRef.current.setFieldValue("gender", "");
    formikRef.current.setFieldValue("community", "");
    formikRef.current.setFieldValue("religion", "");
    formikRef.current.setFieldValue("modeOfAdmission", "");
    formikRef.current.setFieldValue("admissionType", "");
    formikRef.current.setFieldValue("enrollNo", "");
    formikRef.current.setFieldValue("category", "");
    formikRef.current.setFieldValue("fromDate", "");
    formikRef.current.setFieldValue("toDate", "");
    setData([]);
    setShowRes(false);
    setFilterError(false);
  };

  useEffect(() => {
    console.log("collegeId", collegeId);
    console.log("collegeConfig.is_university", collegeConfig.is_university);
    if (!collegeConfig.is_university) {
      getAllList(collegeId);
    }
  }, [collegeConfig.is_university]);

  return (
    <div className="content-area-bigreport" onClick={preFunction.hideNavbar}>
      <CustomActivityIndicator
        style={{ height: 100, alignSelf: "center" }}
        visible={load}
      />
      <div className="row no-gutters bg-white-report">
        <ScreenTitle titleClass={"page-heading-position-report"} />
        <div className="row no-gutters mt-1">
          <Formik
            enableReinitialize={true}
            innerRef={formikRef}
            initialValues={{
              college: "",
              course: "",
              batch: "",
              section: "",
              gender: "",
              community: "",
              religion: "",
              modeOfAdmission: "",
              admissionType: "",
              enrollNo: "",
              category: "",
              fromDate: "",
              toDate: "",
            }}
            validationSchema={reportSchema}
            // onSubmit={handleShow}
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
              resetForm,
            }) => {
              return (
                <form onSubmit={handleSubmit} autoComplete="off">
                  {collegeConfig.institution_type !== 1 ? (
                    <>
                      {collegeConfig.is_university ? (
                        <SelectFieldFormik
                          autoFocus
                          tabIndex={1}
                          label="College"
                          id="college"
                          mandatory={1}
                          options={collegeConfig.collegeList}
                          getOptionLabel={(option) => option.collegeName}
                          getOptionValue={(option) => option.collegeID}
                          style={{ width: "30%" }}
                          searchIcon={false}
                          clear={false}
                          onChange={(text) => {
                            setFieldValue("college", text);
                            handleCollegeWiseClear();
                            getAllList(
                              text ? text.collegeID : null,
                              values.course
                            );
                          }}
                        />
                      ) : null}
                    </>
                  ) : null}

                  <div className="row no-gutters">
                    <div className="col-lg-6 p-0 pe-2">
                      <div className="row">
                        <div className="col-lg-8 p-0 pe-2">
                          <SelectFieldFormik
                            tabIndex={2}
                            id="course"
                            maxlength={15}
                            label={RENAME?.course}
                            mandatory={
                              collegeConfig.institution_type === 1 ? 1 : 0
                            }
                            clear={
                              collegeConfig.institution_type === 1
                                ? false
                                : true
                            }
                            searchIcon={false}
                            options={courseList}
                            getOptionLabel={(option) => option.courseName}
                            getOptionValue={(option) => option.id}
                            onChange={(text) => {
                              setFieldValue("course", text);
                              if (collegeConfig.institution_type !== 1) {
                                getAllList(
                                  values.college
                                    ? values.college.collegeID
                                    : collegeId,
                                  text
                                );
                              } else {
                                handleCourse(text);
                              }
                              handleClear();
                              handleSectionList(text, values.batch);
                            }}
                          />
                        </div>
                        <div className="col-lg-4 p-0">
                          {collegeConfig.institution_type === 1 ? (
                            <SelectFieldFormik
                              tabIndex={3}
                              label={RENAME?.sem}
                              id="batch"
                              maxlength={15}
                              mandatory={0}
                              searchIcon={false}
                              clear={false}
                              options={batchList}
                              getOptionLabel={(option) => option.className}
                              getOptionValue={(option) => option.semester}
                              onChange={(text) => {
                                setFieldValue("batch", text);
                                setFieldTouched("batch", false);
                                handleClear();
                                handleSectionList(values.course, text);
                              }}
                            />
                          ) : (
                            <SelectFieldFormik
                              tabIndex={3}
                              label={RENAME?.batch}
                              id="batch"
                              maxlength={15}
                              mandatory={1}
                              searchIcon={false}
                              clear={false}
                              options={batchList}
                              getOptionLabel={(option) => option.batch}
                              getOptionValue={(option) => option.batchID}
                              onChange={(text) => {
                                setFieldValue("batch", text);
                                setFieldTouched("batch", false);
                                handleClear();
                                handleSectionList(values.course, text);
                              }}
                            />
                          )}
                        </div>
                      </div>

                      <div className="row">
                        <div className="col-lg-3 p-0 pe-2">
                          <SelectFieldFormik
                            tabIndex={4}
                            id="section"
                            maxlength={15}
                            label={RENAME?.section}
                            searchIcon={false}
                            getOptionLabel={(option) => option.section}
                            getOptionValue={(option) => option.classID}
                            options={sectionList}
                            onChange={(text) => {
                              setFieldValue("section", text);
                              handleClear();
                            }}
                          />
                        </div>
                        <div className="col-lg-3 p-0 pe-2">
                          <SelectFieldFormik
                            tabIndex={5}
                            id="gender"
                            maxlength={15}
                            label="Gender"
                            searchIcon={false}
                            options={genderList}
                            getOptionLabel={(option) => option.gender}
                            getOptionValue={(option) => option.id}
                            onChange={(text) => {
                              setFieldValue("gender", text);
                              handleClear();
                            }}
                          />
                        </div>
                        <div className="col-lg-3 p-0 pe-2">
                          <SelectFieldFormik
                            tabIndex={6}
                            label="Community"
                            id="community"
                            maxlength={15}
                            matchFrom="start"
                            options={communityList}
                            getOptionLabel={(option) => option.community}
                            getOptionValue={(option) => option.id}
                            onChange={(text) => {
                              setFieldValue("community", text);
                              handleClear();
                            }}
                          />
                        </div>
                        <div className="col-lg-3 p-0">
                          <SelectFieldFormik
                            tabIndex={7}
                            label="Religion"
                            id="religion"
                            matchFrom="start"
                            maxlength={15}
                            options={religionList}
                            getOptionLabel={(option) => option.religion}
                            getOptionValue={(option) => option.id}
                            onChange={(text) => {
                              setFieldValue("religion", text);
                              handleClear();
                            }}
                          />
                        </div>
                      </div>
                      {/* {collegeConfig.institution_type !== 1 ? (
                        <>
                          <div className="row">
                            <div className="col-lg-6 p-0 pe-2">
                              <SelectFieldFormik
                                label="Mode of Admission"
                                tabIndex={13}
                                id="modeOfAdmission"
                                maxlength={15}
                                options={modeOfAdmissionList}
                                getOptionLabel={(option) =>
                                  option.admissionMode
                                }
                                getOptionValue={(option) => option.id}
                                onChange={(text) => {
                                  setFieldValue("modeOfAdmission", text);
                                }}
                              />
                            </div>
                          </div>
                        </>
                      ) : null} */}
                    </div>
                    <div className="col-lg-6 ps-2">
                      <div className="row">
                        <div className="col-lg-6 p-0 pe-2">
                          <SelectFieldFormik
                            tabIndex={8}
                            id="admissionType"
                            maxlength={15}
                            label="Admission Type"
                            searchIcon={false}
                            options={admissionTypeList}
                            getOptionLabel={(option) => option.admissionType}
                            getOptionValue={(option) => option.id}
                            onChange={(text) => {
                              setFieldValue("admissionType", text);
                              handleClear();
                            }}
                          />
                        </div>

                        <div className="col-lg-6 p-0">
                          <SelectFieldFormik
                            tabIndex={9}
                            id="enrollNo"
                            maxlength={15}
                            label="Student No./Name"
                            clear={true}
                            searchIcon={true}
                            options={enrollNumberList}
                            getOptionLabel={(option) => option.name}
                            getOptionValue={(option) => option.id}
                            onInputChange={(inputValue) => {
                              handleSearchStudent(
                                inputValue,
                                values.college.collegeID
                              );
                            }}
                            onChange={(text) => {
                              setFieldValue("enrollNo", text);
                              handleClear();
                            }}
                          />
                        </div>
                      </div>

                      <div className="row">
                        {/* {collegeConfig.institution_type !== 1 ? (
                          <div className=" row col-lg-6 p-0 pe-2">
                            <SelectFieldFormik
                              tabIndex={10}
                              id="category"
                              maxlength={15}
                              label="Category"
                              searchIcon={false}
                              options={categoryList}
                              getOptionLabel={(option) =>
                                option.studentCategory
                              }
                              getOptionValue={(option) => option.id}
                              onChange={(text) => {
                                setFieldValue("category", text);
                                handleClear();
                              }}
                            />
                          </div>
                        ) : null} */}
                        {collegeConfig.institution_type !== 1 ? (
                          <>
                            <div className=" row col-lg-6 p-0 pe-2">
                              <SelectFieldFormik
                                label="Mode of Admission"
                                tabIndex={13}
                                id="modeOfAdmission"
                                maxlength={15}
                                options={modeOfAdmissionList}
                                getOptionLabel={(option) =>
                                  option.admissionMode
                                }
                                getOptionValue={(option) => option.id}
                                onChange={(text) => {
                                  setFieldValue("modeOfAdmission", text);
                                }}
                              />
                            </div>
                          </>
                        ) : null}
                        <div className="row col-lg-6 p-0">
                          <div className="col-lg-6 p-0 pe-2">
                            <DateFieldFormik
                              tabIndex={11}
                              id="fromDate"
                              label="Adm. Date From"
                              minDate={""}
                              maxDate={new Date()}
                              onChange={(e) => {
                                setFieldValue("fromDate", e.target.value);
                                setDateError(false);
                                handleClear();
                              }}
                            />
                          </div>
                          <div className="col-lg-6 p-0 ">
                            <DateFieldFormik
                              tabIndex={12}
                              id="toDate"
                              label="Adm. Date To"
                              minDate={""}
                              maxDate={new Date()}
                              labelSize={5}
                              onChange={(e) => {
                                setFieldValue("toDate", e.target.value);
                                setDateError(false);
                                handleClear();
                              }}
                            />
                          </div>
                          <div className="mt-1">
                            <ErrorMessage
                              Message={"Choose both Admission Date From & To"}
                              view={dateError}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {filterError && (
                    <div className="row no-gutters text-center mb-2 mt-1">
                      <ErrorMessage
                        Message={"Please apply atleast one filter"}
                        view={filterError}
                      />
                    </div>
                  )}
                  <div className="row no-gutters">
                    <div className="col-lg-6 text-right p-0">
                      <Button
                        tabIndex={
                          collegeConfig.institution_type === 1 ? 13 : 14
                        }
                        type="submit"
                        text="Choose Fields"
                        isCenter={false}
                        onClick={(e) => {
                          preFunction.handleErrorFocus(errors);
                          setShowRes(false);
                        }}
                      />
                    </div>
                    <div className="col-lg-5 ms-2">
                      <Button
                        type="button"
                        isCenter={false}
                        text="Show"
                        onClick={(e) => handleShow(values)}
                      />
                    </div>
                  </div>

                  {showRes ? (
                    <>
                      <div className="row mt-4 border p-3">
                        <div className="row no-gutters">
                          <div className="col-lg-6"></div>
                          {data.length > 0 && (
                            <div className="col-lg-6">
                              <div className="text-right">
                                <Button
                                  frmButton={false}
                                  className={"btn me-3"}
                                  type="button"
                                  onClick={(e) => handleShow(values, 1, 2)}
                                  text="Export Excel"
                                />
                                {/* <Button
                                  type="button"
                                  frmButton={false}
                                  onClick={(e) => {
                                    handleShow(values, 1, 1);
                                  }}
                                  text="Export PDF"
                                /> */}
                              </div>
                            </div>
                          )}
                        </div>
                        <div className="table-responsive mt-4 p-0">
                          <table className="table table-bordered report-table m-0">
                            <thead>
                              <tr>
                                <th>No.</th>
                                <th>Student No.</th>
                                <th>Student Name</th>
                                {fatherName && <th>Father Name</th>}
                                {dateofBirth && <th>Date of Birth</th>}
                                {gender && <th>Gender</th>}
                                {studentEmail && <th>Student Email ID</th>}
                                {applicationNo && <th>Application No.</th>}
                                {board && <th>{RENAME.course}</th>}
                                {className && <th>{RENAME.sem}</th>}
                                {admissionType && <th>Admission Type</th>}
                                {fatherEmail && <th>Father Email ID</th>}
                                {fatherMobile && <th>Father Mobile</th>}
                                {fatherOccupation && <th>Father Occupation</th>}
                                {fatherIncome && <th>Father Income</th>}
                                {fatherQualification && (
                                  <th>Father Qualification</th>
                                )}
                                {motherName && <th>Mother Name</th>}
                                {motherEmail && <th>Mother Email ID</th>}
                                {motherMobile && <th>Mother Mobile</th>}
                                {motherOccupation && <th>Mother Occupation</th>}
                                {motherIncome && <th>Mother Income</th>}
                                {motherQualification && (
                                  <th>Mother Qualification</th>
                                )}
                                {guardianName && <th>Guardian Name</th>}
                                {guardianEmail && <th>Guardian Email ID</th>}
                                {guardianMobile && <th>Guardian Mobile</th>}
                                {guardianOccupation && (
                                  <th>Guardian Occupation</th>
                                )}
                                {guardianIncome && <th>Guardian Income</th>}
                                {guardianQualification && (
                                  <th>Guardian Qualification</th>
                                )}
                                {bloodGroup && <th>Blood Group</th>}
                                {community && <th>Community</th>}
                                {religion && <th>Religion</th>}
                                {nationality && <th>Nationality</th>}
                                {aadhaarNo && <th>Aadhaar No</th>}
                                {tempAddr && <th>Temporary Address</th>}
                                {permanentAddr && <th>Permanent Address</th>}
                                {previousSchool && <th>Previous School</th>}
                                {previousBoard && (
                                  <th>Previous{RENAME?.course}</th>
                                )}
                                {tcNumber && <th>TC Number</th>}
                              </tr>
                            </thead>
                            <tbody>
                              {data.length === 0 ? (
                                <tr>
                                  <td align="center" colSpan={20}>
                                    No data found
                                  </td>
                                </tr>
                              ) : (
                                data.map((item, index) => {
                                  return (
                                    <tr key={index}>
                                      <td>{index + 1}</td>
                                      <td>{item.enrollNo}</td>
                                      <td>{item.name}</td>
                                      {fatherName && <td>{item.fatherName}</td>}
                                      {dateofBirth && (
                                        <td>
                                          {item.DOB
                                            ? moment(item.DOB).format(
                                                "DD-MM-YYYY"
                                              )
                                            : item.DOB}
                                        </td>
                                      )}
                                      {gender && <td>{item.gender}</td>}
                                      {studentEmail && <td>{item.email}</td>}
                                      {applicationNo && (
                                        <td>{item.applicationNo}</td>
                                      )}
                                      {board && <td>{item.courseName}</td>}
                                      {className && <td>{item.className}</td>}
                                      {admissionType && (
                                        <td>{item.admissionType}</td>
                                      )}
                                      {fatherEmail && (
                                        <td>{item.fatheEmail}</td>
                                      )}
                                      {fatherMobile && (
                                        <td>{item.fatherMobile}</td>
                                      )}
                                      {fatherOccupation && (
                                        <td>{item.fatherOccupation}</td>
                                      )}
                                      {fatherIncome && (
                                        <td>{item.fatherIncome}</td>
                                      )}
                                      {fatherQualification && (
                                        <td>{item.fatherQualification}</td>
                                      )}
                                      {motherName && <td>{item.motherName}</td>}
                                      {motherEmail && (
                                        <td>{item.motherEmail}</td>
                                      )}
                                      {motherMobile && (
                                        <td>{item.motherMobile}</td>
                                      )}
                                      {motherOccupation && (
                                        <td>{item.motherOccupation}</td>
                                      )}
                                      {motherIncome && (
                                        <td>{item.motherIncome}</td>
                                      )}
                                      {motherQualification && (
                                        <td>{item.motherQualification}</td>
                                      )}
                                      {guardianName && (
                                        <td>{item.guardianName}</td>
                                      )}
                                      {guardianEmail && (
                                        <td>{item.guardianEmail}</td>
                                      )}
                                      {guardianMobile && (
                                        <td>{item.guardianMobile}</td>
                                      )}
                                      {guardianOccupation && (
                                        <td>{item.guardianOccupation}</td>
                                      )}
                                      {guardianIncome && (
                                        <td>{item.guardianIncome}</td>
                                      )}
                                      {guardianQualification && (
                                        <td>{item.guardianQualification}</td>
                                      )}
                                      {bloodGroup && <td>{item.bloodGroup}</td>}
                                      {community && <td>{item.community}</td>}
                                      {religion && <td>{item.religion}</td>}
                                      {nationality && (
                                        <td>{item.nationality}</td>
                                      )}
                                      {aadhaarNo && <td>{item.aadhaar}</td>}
                                      {tempAddr && (
                                        <td>
                                          {item.taddress1 != "" &&
                                            item.taddress1 != null &&
                                            (item.taddress1.endsWith(",")
                                              ? item.taddress1
                                              : item.taddress1 + " , ")}
                                          {item.taddress2 != "" &&
                                            item.taddress2 != null &&
                                            (item.taddress2.endsWith(",")
                                              ? item.taddress2
                                              : item.taddress2 + " , ")}
                                          {item.tplace != "" &&
                                            item.tplace != null &&
                                            item.tplace + " , "}
                                          {item.tcity != "" &&
                                            item.tcity != null &&
                                            item.tcity + " , "}
                                          {item.tstate != "" &&
                                            item.tstate != null &&
                                            item.tstate + " , "}
                                          {item.tcountry != "" &&
                                            item.tcountry != null &&
                                            item.tcountry + " , "}
                                          {item.tpincode != "" &&
                                            item.tpincode != null &&
                                            item.tpincode}
                                        </td>
                                      )}
                                      {permanentAddr && (
                                        <td>
                                          {item.address1 != "" &&
                                            item.address1 != null &&
                                            (item.address1.endsWith(",")
                                              ? item.address1
                                              : item.address1 + " , ")}
                                          {item.address2 != "" &&
                                            item.address2 != null &&
                                            (item.address2.endsWith(",")
                                              ? item.address2
                                              : item.address2 + " , ")}
                                          {item.place != "" &&
                                            item.place != null &&
                                            item.place + " , "}
                                          {item.city != "" &&
                                            item.city != null &&
                                            item.city + " , "}
                                          {item.state != "" &&
                                            item.state != null &&
                                            item.state + " , "}
                                          {item.country != "" &&
                                            item.country != null &&
                                            item.country + " , "}
                                          {item.pincode != "" &&
                                            item.pincode != null &&
                                            item.pincode}
                                        </td>
                                      )}
                                      {previousSchool && (
                                        <td>{item.schoolCollegeName}</td>
                                      )}
                                      {previousBoard && (
                                        <td>{item.boardUniversity}</td>
                                      )}
                                      {tcNumber && <td>{item.tcNo}</td>}
                                    </tr>
                                  );
                                })
                              )}
                            </tbody>
                          </table>
                        </div>
                        {showLoadMore && (
                          <div className="row text-right">
                            <Button
                              text="Show All"
                              type="button"
                              onClick={(e) => handleShow(values, 1)}
                            />
                          </div>
                        )}
                      </div>
                    </>
                  ) : null}
                </form>
              );
            }}
          </Formik>
          <Modal show={openModel} dialogClassName="my-modal">
            <Modal.Header>
              <Modal.Title>Choose Export Fields</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <div className="row">
                <div className="text-right">
                  <CheckboxField
                    id="checkAll"
                    label="Select All"
                    checked={false}
                    onChange={(e) => handleCheckAll(e)}
                    onClick={(e) => handleCheckAll(e)}
                  />
                </div>
                <div className="col-lg-4">
                  <CheckboxField
                    label="Father Name"
                    checked={fatherName}
                    onChange={() => setFatherName(!fatherName)}
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
                    label="Student Email ID"
                    checked={studentEmail}
                    onChange={() => setStudentEmail(!studentEmail)}
                  />
                  <CheckboxField
                    label="Blood Group"
                    checked={bloodGroup}
                    onChange={() => setBloodGroup(!bloodGroup)}
                  />
                  <CheckboxField
                    label="Aadhaar Number"
                    checked={aadhaarNo}
                    onChange={() => setAadhaarNo(!aadhaarNo)}
                  />
                  <CheckboxField
                    label="Nationality"
                    checked={nationality}
                    onChange={() => setNationality(!nationality)}
                  />
                  <CheckboxField
                    label="Religion"
                    checked={religion}
                    onChange={() => setReligion(!religion)}
                  />
                  <CheckboxField
                    label="Community"
                    checked={community}
                    onChange={() => setCommunity(!community)}
                  />
                  <CheckboxField
                    label="Application No."
                    checked={applicationNo}
                    onChange={() => setApplicationNo(!applicationNo)}
                  />
                  <CheckboxField
                    label={RENAME?.course}
                    checked={board}
                    onChange={() => setBoard(!board)}
                  />
                  <CheckboxField
                    label={RENAME?.sem}
                    checked={className}
                    onChange={() => setClassName(!className)}
                  />
                </div>
                <div className="col-lg-4">
                  <CheckboxField
                    label="Admission Type"
                    checked={admissionType}
                    onChange={() => setAdmissionType(!admissionType)}
                  />
                  <CheckboxField
                    label="Father Email ID"
                    checked={fatherEmail}
                    onChange={() => setFatherEmail(!fatherEmail)}
                  />
                  <CheckboxField
                    label="Father Mobile"
                    checked={fatherMobile}
                    onChange={() => setFatherMobile(!fatherMobile)}
                  />
                  <CheckboxField
                    label="Father Qualification"
                    checked={fatherQualification}
                    onChange={() =>
                      setFatherQualification(!fatherQualification)
                    }
                  />
                  <CheckboxField
                    label="Father Occupation"
                    checked={fatherOccupation}
                    onChange={() => setFatherOccupation(!fatherOccupation)}
                  />
                  <CheckboxField
                    label="Father Income"
                    checked={fatherIncome}
                    onChange={() => setFatherIncome(!fatherIncome)}
                  />
                  <CheckboxField
                    label="Mother Name"
                    checked={motherName}
                    onChange={() => setMotherName(!motherName)}
                  />
                  <CheckboxField
                    label="Mother Email ID"
                    checked={motherEmail}
                    onChange={() => setMotherEmail(!motherEmail)}
                  />
                  <CheckboxField
                    label="Mother Mobile"
                    checked={motherMobile}
                    onChange={() => setMotherMobile(!motherMobile)}
                  />
                  <CheckboxField
                    label="Mother Qualification"
                    checked={motherQualification}
                    onChange={() =>
                      setMotherQualification(!motherQualification)
                    }
                  />
                  <CheckboxField
                    label="Mother Occupation"
                    checked={motherOccupation}
                    onChange={() => setMotherOccupation(!motherOccupation)}
                  />
                  <CheckboxField
                    label="Mother Income"
                    checked={motherIncome}
                    onChange={() => setMotherIncome(!motherIncome)}
                  />
                </div>
                <div className="col-lg-4">
                  <CheckboxField
                    label="Guardian Name"
                    checked={guardianName}
                    onChange={() => setGuardianName(!guardianName)}
                  />
                  <CheckboxField
                    label="Guardian Email ID"
                    checked={guardianEmail}
                    onChange={() => setGuardianEmail(!guardianEmail)}
                  />
                  <CheckboxField
                    label="Guardian Mobile"
                    checked={guardianMobile}
                    onChange={() => setGuardianMobile(!guardianMobile)}
                  />
                  <CheckboxField
                    label="Guardian Qualification"
                    checked={guardianQualification}
                    onChange={() =>
                      setGuardianQualification(!guardianQualification)
                    }
                  />
                  <CheckboxField
                    label="Guardian Occupation"
                    checked={guardianOccupation}
                    onChange={() => setGuardianOccupation(!guardianOccupation)}
                  />
                  <CheckboxField
                    label="Guardian Income"
                    checked={guardianIncome}
                    onChange={() => setGuardianIncome(!guardianIncome)}
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
                    label="Previous School"
                    checked={previousSchool}
                    onChange={() => setPreviousSchool(!previousSchool)}
                  />
                  <CheckboxField
                    label={"Previous " + RENAME?.course}
                    checked={previousBoard}
                    onChange={() => setPreviousBoard(!previousBoard)}
                  />
                  <CheckboxField
                    label="EMIS / UDISE Number"
                    checked={tcNumber}
                    onChange={() => setTcNumber(!tcNumber)}
                  />
                </div>
              </div>
            </Modal.Body>
            <Modal.Footer>
              <Button
                isTable="true"
                text="Show"
                onClick={() => {
                  handleShow(value);
                }}
              />
            </Modal.Footer>
          </Modal>
        </div>
      </div>
    </div>
  );
}
export default StudentMasterReport;
