import React, { useEffect, useState, useRef, useContext } from "react";
import { Formik } from "formik";
import StudentApi from "../api/StudentApi";
import * as Yup from "yup";

import preFunction from "../component/common/CommonFunction";
import CustomActivityIndicator from "../component/common/CustomActivityIndicator";
import {
  dueReportList,
  dueSchoolReportList,
} from "../component/common/CommonArray";
import Button from "../component/FormField/Button";
import SelectFieldFormik from "../component/FormField/SelectFieldFormik";
import ReactSelectField from "../component/FormField/ReactSelectField";
import ScreenTitle from "../component/common/ScreenTitle";
import moment from "moment";
import string from "../string";
import AcademicApi from "../api/AcademicApi";
import { useSelector } from "react-redux";
import AuthContext from "../auth/context";
import { set } from "lodash";

function StudentDueReport() {
  const RENAME = useSelector((state) => state.web.rename);
  const formikRef = useRef();
  const [data, setData] = useState([]);
  const [load, setLoad] = useState(false);
  const [reportType, setReportType] = useState({
    value: 1,
    label: "Due Report - Abstract",
  });
  const [courseList, setCourseList] = useState([]);
  const [batchList, setBatchList] = useState([]);
  const [classList, setClassList] = useState([]);
  const [enrollNumberList, setEnrollNumberList] = useState([]);
  const [admissionTypeList, setAdmissionTypeList] = useState([]);
  const [particularList, setParticularList] = useState([]);
  const [headerList, setHeaderList] = useState([]);
  const [totalList, setTotalList] = useState([]);
  const [showRes, setShowRes] = useState(false);
  const [showLoadMore, setShowLoadMore] = useState(false);
  const [filterError, setFilterError] = useState(false);

  const [sectionList, setSectionList] = useState([]);

  const [openingTotal, setOpeningTotal] = useState(0);
  const [paidTotal, setPaidTotal] = useState(0);
  const [concessionTotal, setConcessionTotal] = useState(0);
  const [dueTotal, setDueTotal] = useState(0);
  const collegeConfig = useSelector((state) => state.web.college);
  const { collegeId, collegeName } = useContext(AuthContext);

  const reportSchema = Yup.object().shape({
    college: collegeConfig.is_university
      ? Yup.object().required("Please select College")
      : Yup.mixed().notRequired(),
  });

  let Count = 1;
  let nonPayerCount = 1;
  let partialCount = 1;

  const handleDueAbstractCSVData = async (values, report) => {
    setLoad(true);
    console.log("reportValues---", values);

    if (reportType.value == 1) {
      var csvData = [
        [
          "No.",
          "Student Number",
          "Student Name",
          "Permission Upto",
          "Opening Balance",
          "Concession Amount",
          "Paid Amount",
          "Due Amount",
        ],
      ];
      values.map((item, index) => {
        csvData[index + 1] = [
          index + 1,
          item.EnrollNumber,
          item.StudentName,
          item.permissionUpto
            ? moment(item.permissionUpto).format("DD-MM-YYYY") +
              " (" +
              item.PermissionAmount +
              ")"
            : 0,
          item.openingBalance,
          item.concessionAmount,
          item.PaidAmount,
          item.DueAmount,
        ];
      });
      const rowArray = [
        "",
        "",
        "",
        "Total",
        openingTotal,
        concessionTotal,
        paidTotal,
        dueTotal,
      ];
      csvData.push(rowArray);
    } else if (reportType.value == 2) {
      console.log("reportValues---", values);
      var csvData = [
        [
          "No.",
          "Student Number",
          "Student Name",
          "Particular",
          "Permission Upto",
          "Opening Balance",
          "Paid Amount",
          "Due Amount",
        ],
      ];
      values.map((item, index) => {
        csvData[index + 1] = [
          index + 1,
          item.enrollNo,
          item.name,
          item.particular,
          item.permissionUpto
            ? moment(item.permissionUpto).format("DD-MM-YYYY") +
              " (" +
              item.PermissionAmount +
              ")"
            : 0,
          item.openingBalance,
          item.PaidAmount,
          item.DueAmount,
        ];
      });
      const rowArray = [
        "",
        "",
        "",
        "",
        "Total",
        openingTotal,
        paidTotal,
        dueTotal,
      ];
      csvData.push(rowArray);
    } else if (reportType.value == 5) {
      console.log("reportValues---", values);
      var csvData = [
        [
          "No.",
          "Study Year",
          RENAME?.course,
          RENAME?.dept,
          "Opening",
          "Paid",
          "Balance",
        ],
      ];
      values.map((item, index) => {
        csvData[index + 1] = [
          index + 1,
          item.studyYear,
          item.courseShort,
          item.department,
          item.openingBalance,
          item.paid,
          item.balance,
        ];
      });
      const rowArray = ["", "", "", "Total", openingTotal, paidTotal, dueTotal];
      csvData.push(rowArray);
    } else if (reportType.value == 6) {
      var csvData = [
        [
          "No.",
          "Student Number",
          "Student Name",
          "Permission Upto",
          "Opening Balance",
          "Paid Amount",
          "Due Amount",
        ],
      ];
      values.map((item, index) => {
        csvData[index + 1] = [
          index + 1,
          item.EnrollNumber,
          item.StudentName,
          item.permissionUpto
            ? moment(item.permissionUpto).format("DD-MM-YYYY") +
              " (" +
              item.PermissionAmount +
              ")"
            : 0,
          item.openingBalance,
          item.PaidAmount,
          item.DueAmount,
        ];
      });
      const rowArray = ["", "", "", "Total", openingTotal, paidTotal, dueTotal];
      csvData.push(rowArray);
    }
    if (report == 1) {
      preFunction.generatePDF(collegeName, reportType.label, csvData);
    } else {
      preFunction.downloadCSV(csvData, reportType.label + ".csv");
    }
    setLoad(false);
  };

  const handleCSVData34 = async (report) => {
    let csvData = [["No."]];

    headerList.map((item) => {
      csvData[0].push(item.substr(0));
    });
    console.log("csvData-------------------", csvData);
    data.map((student, index) => {
      const rowArray = [index + 1, ...headerList.map((item) => student[item])];
      csvData.push(rowArray);
    });

    totalList.map((student, index) => {
      const filteredHeaderList = headerList.filter(
        (item) =>
          item !== "Enroll Number" &&
          item !== "Student Name" &&
          item !== RENAME?.course &&
          item !== "Permission Upto"
      );

      const rowArray = [
        "",
        "",
        "",
        "Total",
        ...filteredHeaderList.map((item) => student[item]),
      ];
      csvData.push(rowArray);
      console.log("filterHeader", filteredHeaderList);
    });

    console.log(csvData);

    console.log("csvData-------------------", csvData);
    if (report == 1) {
      preFunction.generatePDF(collegeName, reportType.label, csvData);
    } else {
      preFunction.downloadCSV(csvData, reportType.label + ".csv");
    }
  };

  const handleShow1 = async (values, showAll = 0, report = 0) => {
    if (load) return;
    console.log("values--------", showAll, reportType, values);
    setOpeningTotal(0);
    setDueTotal(0);
    setPaidTotal(0);
    setConcessionTotal(0);
    setFilterError(false);
    if (reportType.value !== 5 && reportType.value !== 10) {
      if (
        (values.batch === "" || !values.batch) &&
        (values.course === "" || !values.course) &&
        (values.enrollNumber === "" || !values.enrollNumber)
      ) {
        document.getElementById("course")?.focus();
        setFilterError(true);
        return;
      }
    }

    try {
      setLoad(true);
      setShowRes(true);
      if (report == 0) {
        setData([]);
      }
      if (showAll == 1) {
        setShowLoadMore(false);
      }
      if (reportType.value == 1) {
        const dueAbstractRes = await StudentApi.getDueAbstract(
          values.course ? values.course.id : null,
          values.batch ? values.batch.batchID : null,
          values.section ? values.section.classID : null,
          collegeConfig.institution_type == 1 && values.class
            ? values.class.semester
            : null,
          values.admissionType ? values.admissionType.id : null,
          values.particular ? values.particular.id : null,
          values.enrollNumber ? values.enrollNumber.enrollNo : null,
          showAll,
          collegeConfig.is_university ? values.college.collegeID : collegeId
        );
        console.log("Due Abstract ---", dueAbstractRes);
        if (report) {
          handleDueAbstractCSVData(
            dueAbstractRes.data.message.due_abstract,
            report
          );
        }
        setData(dueAbstractRes.data.message.due_abstract);
        let openingTotalSum = 0;
        let paidTotalSum = 0;
        let dueTotalSum = 0;
        let concessionTotalSum = 0;

        dueAbstractRes.data.message.due_abstract.map((item, index) => {
          openingTotalSum += item.openingBalance;
          paidTotalSum += item.PaidAmount;
          dueTotalSum += item.DueAmount;
          concessionTotalSum += item.concessionAmount;
        });
        setOpeningTotal(openingTotalSum);
        setPaidTotal(paidTotalSum);
        setDueTotal(dueTotalSum);
        setConcessionTotal(concessionTotalSum);
        if (showAll == 0) {
          if (
            dueAbstractRes.data.message.due_abstract.length >= string.PAGE_LIMIT
          )
            setShowLoadMore(true);
        }
      } else if (reportType.value == 2) {
        const dueParticularWiseRes = await StudentApi.getDueParticularWise(
          values.course ? values.course.id : null,
          values.batch ? values.batch.batchID : null,
          values.admissionType ? values.admissionType.id : null,
          values.particular ? values.particular.id : null,
          values.enrollNumber ? values.enrollNumber.enrollNo : null,
          showAll,
          collegeConfig.is_university ? values.college.collegeID : collegeId
        );
        console.log("Due ParticularWise ---", dueParticularWiseRes);
        if (report) {
          handleDueAbstractCSVData(
            dueParticularWiseRes.data.message.due_particularwise_report,
            report
          );
        }
        setData(dueParticularWiseRes.data.message.due_particularwise_report);
        let openingTotalSum = 0;
        let paidTotalSum = 0;
        let dueTotalSum = 0;

        dueParticularWiseRes.data.message.due_particularwise_report.map(
          (item, index) => {
            openingTotalSum += item.openingBalance;
            paidTotalSum += item.PaidAmount;
            dueTotalSum += item.DueAmount;
          }
        );
        setOpeningTotal(openingTotalSum);
        setPaidTotal(paidTotalSum);
        setDueTotal(dueTotalSum);
        if (showAll == 0) {
          if (
            dueParticularWiseRes.data.message.due_particularwise_report
              .length >= string.PAGE_LIMIT
          )
            setShowLoadMore(true);
        }
      } else if (
        reportType.value == 3 ||
        reportType.value == 7 ||
        reportType.value == 8 ||
        reportType.value == 9
      ) {
        const studentReportRes = await StudentApi.getAllDueParticularWise(
          values.enrollNumber ? values.enrollNumber.enrollNo : null,
          values.course ? values.course.id : null,
          values.batch ? values.batch.batchID : null,
          values.admissionType ? values.admissionType.id : null,
          reportType.value == 7
            ? "name"
            : reportType.value == 8
            ? "course"
            : reportType.value == 9
            ? "year"
            : null,
          collegeConfig.is_university ? values.college.collegeID : collegeId
        );
        console.log("studentReportRes", studentReportRes);
        let array = studentReportRes.data.message.all_due_particularwise_report;
        setData(array);
        const headers = Object.keys(array[0]);
        setHeaderList(headers);
        let totalArray = {};
        for (let i = 0; i < headers.length; i++) {
          let values = 0;
          for (let j = 0; j < array.length; j++) {
            if (
              headers[i] !== "Enroll Number" &&
              headers[i] !== RENAME?.course &&
              headers[i] !== "Student Name" &&
              headers[i] !== "Permission Upto"
            ) {
              values += array[j][headers[i]];
            }
          }
          totalArray[headers[i]] = values;
        }
        console.log("TotalArray --- ", totalArray);
        setTotalList([totalArray]);
      } else if (reportType.value == 4) {
        const studentReportRes = await StudentApi.getYearWiseDueReport(
          values.enrollNumber ? values.enrollNumber.enrollNo : null,
          values.batch ? values.batch.batchID : null,
          values.course ? values.course.id : null,
          values.admissionType ? values.admissionType.id : null,
          collegeConfig.is_university ? values.college.collegeID : collegeId
        );

        console.log("studentReportRes ----", studentReportRes);
        let array = studentReportRes.data.message.yearwise_due_report;
        setData(array);
        const headers = Object.keys(array[0]);
        setHeaderList(headers);
        let totalArray = {};
        for (let i = 0; i < headers.length; i++) {
          let values = 0;
          for (let j = 0; j < array.length; j++) {
            if (
              headers[i] !== "Enroll Number" &&
              headers[i] !== RENAME?.course &&
              headers[i] !== "Student Name" &&
              headers[i] !== "Permission Upto"
            ) {
              values += array[j][headers[i]];
            }
          }
          totalArray[headers[i]] = values;
        }
        console.log("TotalArray --- ", totalArray);
        setTotalList([totalArray]);
      } else if (reportType.value == 5) {
        const getDueSummaryRes = await StudentApi.getDueSummaryReport(
          values.course ? values.course.id : null,
          values.batch ? values.batch.batchID : null,
          showAll,
          collegeConfig.is_university ? values.college.collegeID : collegeId
        );
        console.log("getDueSummaryReport ---", getDueSummaryRes);
        if (report) {
          handleDueAbstractCSVData(
            getDueSummaryRes.data.message.data.summary_report,
            report
          );
        }
        setData(getDueSummaryRes.data.message.data.summary_report);
        let openingTotalSum = 0;
        let paidTotalSum = 0;
        let dueTotalSum = 0;

        getDueSummaryRes.data.message.data.summary_report.map((item, index) => {
          openingTotalSum += item.openingBalance;
          paidTotalSum += item.paid;
          dueTotalSum += item.balance;
        });
        setOpeningTotal(openingTotalSum);
        setPaidTotal(paidTotalSum);
        setDueTotal(dueTotalSum);
        if (showAll == 0) {
          if (
            getDueSummaryRes.data.message.data.summary_report.length >=
            string.PAGE_LIMIT
          )
            setShowLoadMore(true);
        }
      } else if (reportType.value == 6) {
        const dueOverallAbstractRes = await StudentApi.getOverallDueAbstract(
          values.course ? values.course.id : null,
          values.batch ? values.batch.batchID : null,
          values.section ? values.section.classID : null,
          values.admissionType ? values.admissionType.id : null,
          values.particular ? values.particular.id : null,
          values.enrollNumber ? values.enrollNumber.enrollNo : null,
          showAll,
          collegeConfig.is_university ? values.college.collegeID : collegeId
        );
        console.log("OverallAbstract ---", dueOverallAbstractRes);
        if (report) {
          handleDueAbstractCSVData(
            dueOverallAbstractRes.data.message.due_abstract,
            report
          );
        }
        setData(dueOverallAbstractRes.data.message.due_abstract);
        let openingTotalSum = 0;
        let paidTotalSum = 0;
        let dueTotalSum = 0;

        dueOverallAbstractRes.data.message.due_abstract.map((item, index) => {
          openingTotalSum += item.openingBalance;
          paidTotalSum += item.PaidAmount;
          dueTotalSum += item.DueAmount;
        });
        setOpeningTotal(openingTotalSum);
        setPaidTotal(paidTotalSum);
        setDueTotal(dueTotalSum);
        if (showAll == 0) {
          if (
            dueOverallAbstractRes.data.message.due_abstract.length >=
            string.PAGE_LIMIT
          )
            setShowLoadMore(true);
        }
      } else if (reportType.value == 10) {
        const dueNonPayerRes = await StudentApi.getNonPayerDueReport(
          values.course ? values.course.id : null,
          values.batch ? values.batch.batchID : null,
          values.particular ? values.particular.id : null,
          showAll,
          collegeConfig.is_university ? values.college.collegeID : collegeId
        );
        console.log("dueNonPayerRes ---", dueNonPayerRes);
        setData(dueNonPayerRes.data.message.data);
        Count = dueNonPayerRes.data.message.data.excess_fees.length;
        nonPayerCount = Count;
        partialCount =
          nonPayerCount + dueNonPayerRes.data.message.data.non_paid.length;
        if (report) {
          handleDueAbstractCSVData(dueNonPayerRes.data.message.data, report);
        }
        if (showAll == 0) {
          if (dueNonPayerRes.data.message.data.length >= string.PAGE_LIMIT)
            setShowLoadMore(true);
        }
      }

      setLoad(false);
    } catch (error) {
      setLoad(false);
      console.log("error", error);
    }
  };

  const handleBatchChange = async (values, batch) => {
    console.log("values", values);
    formikRef.current.setFieldTouched("batch", false);
    setSectionList([]);
    try {
      if (values) {
        let batchRes;
        if (collegeConfig.institution_type === 1) {
          batchRes = await StudentApi.getMaster(
            8,
            collegeConfig?.is_university ? values.collegeID : collegeId,
            values.course.courseID,
            batch.semester
          );
        } else {
          batchRes = await AcademicApi.getMasterSubjectStaff(
            collegeConfig.is_university
              ? formikRef.current.values.college.collegeID
              : collegeId,
            "subject",
            values.course.id,
            batch.batchID,
            batch.semester
          );
        }
        console.log("batchRes", batchRes);
        if (!batchRes.data.message.success) {
          // setModalMessage(batchRes.data.message.message);
          // setModalErrorOpen(true);
          // setModalTitle("Message");
          return;
        }
        // batchRes.data.message.data.section.splice(0, 0, {
        //   classID: null,
        //   section: "All",
        // });
        // batchRes.data.message.data.class_data.splice(0, 0, {
        //   classID: null,
        //   section: "All",
        // });
        if (collegeConfig.institution_type === 1)
          setSectionList(batchRes.data.message.data.class_data);
        else setSectionList(batchRes.data.message.data.section);
      }
    } catch (error) {
      console.log("error", error);
    }
  };

  const getAllList = async (college_id) => {
    try {
      setLoad(true);

      const masterRes = await StudentApi.getMaster(5, college_id);
      console.log("MasterRes----", masterRes);
      setCourseList(masterRes.data.message.data.course_data);
      setClassList(masterRes.data.message.data.semester_data);
      setBatchList(masterRes.data.message.data.all_batch_data);
      setAdmissionTypeList(masterRes.data.message.data.admission_type_data);
      let combinedArray =
        masterRes.data.message.data.particular_common_data.concat(
          masterRes.data.message.data.particular_uncommon_data
        );
      setParticularList(combinedArray);
      setLoad(false);
    } catch (error) {
      setLoad(false);
      console.log("error", error);
    }
  };

  const getEnrollNumberbySearch = async (text) => {
    try {
      setEnrollNumberList([]);
      if (text.length > 2) {
        try {
          const enrollNumberRes = await StudentApi.searchStudent(text);
          console.log("enrollNumber", enrollNumberRes);
          setEnrollNumberList(enrollNumberRes.data.message.student);
        } catch (error) {
          console.log("error--", error);
        }
      }
    } catch (error) {
      console.log("error", error);
    }
  };

  useEffect(() => {
    if (!collegeConfig.is_university) {
      getAllList(collegeId);
    }
  }, [collegeConfig.is_university]);

  useEffect(() => {}, []);

  return (
    <div className="content-area-bigreport" onClick={preFunction.hideNavbar}>
      <CustomActivityIndicator
        style={{ height: 100, alignSelf: "center" }}
        visible={load}
      />
      <div className="row no-gutters bg-white-report">
        <ScreenTitle titleClass={"page-heading-position-report"} />
        <div className="row no-gutters mt-3">
          <Formik
            innerRef={formikRef}
            enableReinitialize={true}
            initialValues={{
              reportType: reportType,
              college: "",
              enrollNumber: "",
              batch: "",
              class: "",
              section: "",
              // section: {
              //   classID: null,
              //   section: "All",
              // },
              course: "",
              admissionType: "",
              particular: "",
            }}
            validationSchema={reportSchema}
            onSubmit={(values) => {
              handleShow1(values, 0);
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
                  <div className="row no-gutters col-lg-8">
                    <ReactSelectField
                      autoFocus
                      label="Report Type"
                      id="reportType"
                      value={reportType}
                      placeholder="Report Type"
                      search={false}
                      mandatory={1}
                      options={
                        collegeConfig.institution_type == 1
                          ? dueSchoolReportList
                          : dueReportList
                      }
                      onChange={(text) => {
                        setReportType(text);
                        setShowRes(false);
                        setFilterError(false);
                      }}
                    />
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
                        onChange={(text) => {
                          setShowRes(false);
                          setFieldValue("college", text);
                          // setSelectedCollege(text);
                          setFilterError(false);
                          getAllList(text.collegeID);
                          setFieldValue("course", "");
                          setFieldValue("batch", "");
                          setFieldTouched("course", false);
                          setFieldTouched("batch", false);
                          setFieldTouched("college", false);
                        }}
                      />
                    )}
                    <SelectFieldFormik
                      label={RENAME?.course}
                      id="course"
                      clear={true}
                      options={courseList}
                      getOptionLabel={(option) => option.courseName}
                      getOptionValue={(option) => option.id}
                      onChange={(text) => {
                        setFieldValue("course", text);
                        setShowRes(false);
                        setFilterError(false);
                      }}
                    />
                    {collegeConfig.institution_type !== 1 ? (
                      <SelectFieldFormik
                        label={RENAME?.batch}
                        id="batch"
                        clear={true}
                        options={batchList}
                        getOptionLabel={(option) => option.batch}
                        getOptionValue={(option) => option.batchID}
                        style={{ width: "50%" }}
                        onChange={(text) => {
                          setFieldValue("batch", text);
                          setShowRes(false);
                          setFilterError(false);
                          // setFieldValue("section", {
                          //   classID: null,
                          //   section: "All",
                          // });
                          handleBatchChange(values, text);
                        }}
                      />
                    ) : (
                      <SelectFieldFormik
                        tabIndex={2}
                        label={RENAME?.sem}
                        id="class"
                        clear={true}
                        maxlength={10}
                        options={classList}
                        getOptionLabel={(option) => option.className}
                        getOptionValue={(option) => option.semester}
                        style={{ width: "50%" }}
                        onChange={(text) => {
                          setFieldValue("class", text);
                          setFieldTouched("class", false);
                          handleBatchChange(values, text);
                          // setSelectedBatch(text);
                          // getSectionMaster(values.course, text);
                        }}
                      />
                    )}
                    {reportType.value == 1 || reportType.value == 6 ? (
                      <SelectFieldFormik
                        label={RENAME?.section}
                        maxlength={2}
                        id="section"
                        clear={true}
                        options={sectionList}
                        getOptionLabel={(option) => option.section}
                        getOptionValue={(option) => option.classID}
                        style={{ width: "20%" }}
                        matchFrom="start"
                        onChange={(text) => {
                          setFieldValue("section", text);
                          setShowRes(false);
                        }}
                      />
                    ) : null}
                    {reportType.value != 5 && reportType.value != 10 && (
                      <SelectFieldFormik
                        label="Admission Type"
                        id="admissionType"
                        clear={true}
                        options={admissionTypeList}
                        getOptionLabel={(option) => option.admissionType}
                        getOptionValue={(option) => option.id}
                        style={{ width: "50%" }}
                        onChange={(text) => {
                          setShowRes(false);
                          setFieldValue("admissionType", text);
                        }}
                      />
                    )}
                    {reportType.value == 1 ||
                    reportType.value == 2 ||
                    reportType.value == 3 ||
                    reportType.value == 6 ||
                    reportType.value == 10 ? (
                      <>
                        {reportType.value != 3 ? (
                          <SelectFieldFormik
                            label="Particular"
                            id="particular"
                            clear={true}
                            options={particularList}
                            getOptionLabel={(option) => option.particular}
                            getOptionValue={(option) => option.id}
                            onChange={(text) => {
                              setShowRes(false);
                              setFieldValue("particular", text);
                            }}
                          />
                        ) : null}
                      </>
                    ) : null}
                    {reportType.value != 5 && reportType.value != 10 && (
                      <SelectFieldFormik
                        label="Student Number/Name"
                        placeholder="Student Number / Name"
                        id="enrollNumber"
                        searchIcon={true}
                        clear={true}
                        options={enrollNumberList}
                        getOptionLabel={(option) => option.name}
                        getOptionValue={(option) => option.id}
                        onChange={(text) => {
                          setShowRes(false);
                          setFieldValue("enrollNumber", text);
                          setFilterError(false);
                        }}
                        onInputChange={(text) => {
                          getEnrollNumberbySearch(text);
                        }}
                        customErrorMessage={
                          filterError
                            ? `Please choose ${RENAME?.course} or Student Number`
                            : ""
                        }
                      />
                    )}
                  </div>
                  <Button
                    text="Show"
                    onClick={() => preFunction.handleErrorFocus(errors)}
                    type="submit"
                  />
                  {showRes ? (
                    <div className="row mt-3">
                      <div className="row no-gutters totcntstyle  mb-2">
                        {data.length > 0 && (
                          <div className=" col-lg-12 text-right">
                            <button
                              type="button"
                              className="btn"
                              onClick={(e) => {
                                reportType.value == 3 ||
                                reportType.value == 4 ||
                                reportType.value == 7 ||
                                reportType.value == 8 ||
                                reportType.value == 9
                                  ? handleCSVData34(2)
                                  : handleShow1(values, 1, 2);
                              }}
                            >
                              Export Excel
                            </button>
                            &nbsp; &nbsp;
                            <button
                              className="btn"
                              onClick={(e) => {
                                reportType.value == 3 ||
                                reportType.value == 4 ||
                                reportType.value == 7 ||
                                reportType.value == 8 ||
                                reportType.value == 9
                                  ? handleCSVData34(1)
                                  : handleShow1(values, 1, 1);
                              }}
                            >
                              Export PDF
                            </button>
                          </div>
                        )}
                      </div>
                      <>
                        <div className="table-responsive p-0">
                          {reportType.value == 1 || reportType.value == 6 ? (
                            <table
                              className="table table-bordered report-table table-bordered"
                              id="pdf-table"
                            >
                              <thead>
                                <tr>
                                  <th width="1%">No.</th>
                                  <th width="5%">Student Number</th>
                                  <th>Student Name</th>
                                  <th width="10%">Permission Upto</th>
                                  <th width="5%">Opening Balance (₹)</th>
                                  <th width="5%">Concession Amount (₹)</th>
                                  <th width="5%">Paid Amount (₹)</th>
                                  <th width="5%">Due Amount (₹)</th>
                                </tr>
                              </thead>
                              {data.length === 0 ? (
                                <tbody>
                                  <tr>
                                    <td colSpan={9} align="center">
                                      No Student found
                                    </td>
                                  </tr>
                                </tbody>
                              ) : (
                                <tbody>
                                  {data.map((item, index) => {
                                    return (
                                      <tr key={index}>
                                        <td>{index + 1}</td>
                                        <td>{item.EnrollNumber}</td>
                                        <td>{item.StudentName}</td>
                                        <td>
                                          {item.permissionUpto
                                            ? moment(
                                                item.permissionUpto
                                              ).format("DD-MM-YYYY") +
                                              " (₹" +
                                              item.PermissionAmount +
                                              ")"
                                            : ""}
                                        </td>
                                        <td align="right">
                                          {item.openingBalance}
                                        </td>
                                        <td align="right">
                                          {item.concessionAmount}
                                        </td>
                                        <td align="right">{item.PaidAmount}</td>
                                        <td align="right">{item.DueAmount}</td>
                                      </tr>
                                    );
                                  })}
                                  <tr
                                    style={{
                                      lineHeight: "32px",
                                    }}
                                  >
                                    <td
                                      className="table-total"
                                      align="right"
                                      colSpan={4}
                                    >
                                      Total
                                    </td>
                                    <td className="table-total" align="right">
                                      {openingTotal}
                                    </td>
                                    <td className="table-total" align="right">
                                      {concessionTotal}
                                    </td>
                                    <td className="table-total" align="right">
                                      {paidTotal}
                                    </td>
                                    <td className="table-total" align="right">
                                      {dueTotal}
                                    </td>
                                  </tr>
                                </tbody>
                              )}
                            </table>
                          ) : null}
                          {reportType.value == 2 ? (
                            <table
                              className="table table-bordered report-table table-bordered"
                              id="pdf-table"
                            >
                              <thead>
                                <tr>
                                  <th width="1%">No.</th>
                                  <th width="5%">Student Number</th>
                                  <th width="15%">Student Name</th>
                                  <th>Particular</th>
                                  <th width="10%">Permission Upto</th>
                                  <th width="5%">Opening Balance (₹)</th>
                                  <th width="5%">Paid Amount (₹)</th>
                                  <th width="5%">Due Amount (₹)</th>
                                </tr>
                              </thead>
                              {data.length === 0 ? (
                                <tbody>
                                  <tr>
                                    <td colSpan={9} align="center">
                                      No Student found
                                    </td>
                                  </tr>
                                </tbody>
                              ) : (
                                <tbody>
                                  {data.map((item, index) => {
                                    return (
                                      <tr key={index}>
                                        <td>{index + 1}</td>
                                        <td>{item.enrollNo}</td>
                                        <td>{item.name}</td>
                                        <td>{item.particular}</td>
                                        <td>
                                          {item.permissionUpto
                                            ? moment(
                                                item.permissionUpto
                                              ).format("DD-MM-YYYY") +
                                              " (₹" +
                                              item.PermissionAmount +
                                              ")"
                                            : ""}
                                        </td>
                                        <td align="right">
                                          {item.openingBalance}
                                        </td>
                                        <td align="right">{item.PaidAmount}</td>
                                        <td align="right">{item.DueAmount}</td>
                                      </tr>
                                    );
                                  })}
                                  <tr
                                    style={{
                                      lineHeight: "32px",
                                    }}
                                  >
                                    <td
                                      className="table-total"
                                      align="right"
                                      colSpan={5}
                                    >
                                      Total
                                    </td>
                                    <td className="table-total" align="right">
                                      {openingTotal}
                                    </td>
                                    <td className="table-total" align="right">
                                      {paidTotal}
                                    </td>
                                    <td className="table-total" align="right">
                                      {dueTotal}
                                    </td>
                                  </tr>
                                </tbody>
                              )}
                            </table>
                          ) : null}
                          {reportType.value == 3 ||
                          reportType.value == 4 ||
                          reportType.value == 7 ||
                          reportType.value == 8 ||
                          reportType.value == 9 ? (
                            <table
                              className="table table-bordered report-table table-bordered"
                              id="pdf-table"
                            >
                              <thead>
                                <tr>
                                  <th width="1%">No.</th>
                                  {headerList.map((item) => {
                                    return <th width="5%">{item}</th>;
                                  })}
                                </tr>
                              </thead>
                              {data.length === 0 ? (
                                <tbody>
                                  <tr>
                                    <td colSpan={9} align="center">
                                      No Student found
                                    </td>
                                  </tr>
                                </tbody>
                              ) : (
                                <tbody>
                                  {data.map((student, index) => {
                                    return (
                                      <tr key={index}>
                                        <td>{index + 1}</td>
                                        {headerList.map((item, idx) => (
                                          <td key={idx}>{student[item]}</td>
                                        ))}
                                      </tr>
                                    );
                                  })}

                                  <tr
                                    style={{
                                      lineHeight: "32px",
                                    }}
                                  >
                                    <td
                                      className="table-total"
                                      align="right"
                                      colSpan={4}
                                    >
                                      Total
                                    </td>
                                    {totalList.map((student, index) =>
                                      headerList.map((item, idx) =>
                                        item !== "Enroll Number" &&
                                        item !== "Student Name" &&
                                        item !== RENAME?.course ? (
                                          <td className="table-total" key={idx}>
                                            {student[item]}
                                          </td>
                                        ) : null
                                      )
                                    )}
                                  </tr>
                                </tbody>
                              )}
                            </table>
                          ) : null}
                          {reportType.value == 5 ? (
                            <table
                              className="table table-bordered report-table table-bordered"
                              id="pdf-table"
                            >
                              <thead>
                                <tr>
                                  <th width="1%">No.</th>
                                  <th width="5%">Study Year</th>
                                  <th width="5%">Course</th>
                                  <th>Department</th>
                                  <th width="5%">Opening (₹)</th>
                                  <th width="5%">Paid (₹)</th>
                                  <th width="5%">Balance (₹)</th>
                                </tr>
                              </thead>
                              {data.length === 0 ? (
                                <tbody>
                                  <tr>
                                    <td colSpan={9} align="center">
                                      No Student found
                                    </td>
                                  </tr>
                                </tbody>
                              ) : (
                                <tbody>
                                  {data.map((item, index) => {
                                    return (
                                      <tr key={index}>
                                        <td>{index + 1}</td>
                                        <td>{item.studyYear}</td>
                                        <td>{item.courseShort}</td>
                                        <td>{item.department}</td>
                                        <td align="right">
                                          {item.openingBalance}
                                        </td>
                                        <td align="right">{item.paid}</td>
                                        <td align="right">{item.balance}</td>
                                      </tr>
                                    );
                                  })}
                                  <tr
                                    style={{
                                      lineHeight: "32px",
                                    }}
                                  >
                                    <td
                                      className="table-total"
                                      align="right"
                                      colSpan={4}
                                    >
                                      Total
                                    </td>
                                    <td className="table-total" align="right">
                                      {openingTotal}
                                    </td>
                                    <td className="table-total" align="right">
                                      {paidTotal}
                                    </td>
                                    <td className="table-total" align="right">
                                      {dueTotal}
                                    </td>
                                  </tr>
                                </tbody>
                              )}
                            </table>
                          ) : null}
                          {reportType.value == 10 ? (
                            <table
                              className="table table-bordered report-table table-bordered"
                              id="pdf-table"
                            >
                              <thead>
                                <tr>
                                  <th width="1%">No.</th>
                                  <th width="5%">Student Number</th>
                                  <th width="15%">Student Name</th>
                                  <th>Particulars</th>
                                  <th width="5%">Opening Balance (₹)</th>
                                  <th width="5%">Paid Amount (₹)</th>
                                  <th width="5%">Due Amount (₹)</th>
                                </tr>
                              </thead>
                              {data.length === 0 ? (
                                <tbody>
                                  <tr>
                                    <td colSpan={9} align="center">
                                      No Student found
                                    </td>
                                  </tr>
                                </tbody>
                              ) : (
                                <tbody>
                                  <tr>
                                    <td colSpan={10} className="table-total">
                                      {"Particulars : "}{" "}
                                      {values?.particular
                                        ? values?.particular.particular
                                        : "All"}
                                    </td>
                                  </tr>
                                  <tr>
                                    <td colSpan={10} className="table-total">
                                      {"Due Type : Excess Paid"}
                                    </td>
                                  </tr>
                                  {data.excess_fees.length > 0 ? (
                                    <>
                                      {data.excess_fees.map((item, index) => {
                                        return (
                                          <tr key={index}>
                                            <td>{index + 1}</td>
                                            <td>{item.enrollNo}</td>
                                            <td>{item.name}</td>
                                            <td>{item.particular}</td>
                                            <td align="center">{"-"}</td>
                                            <td align="center">{"-"}</td>
                                            <td align="right">
                                              {" - " + item.DueAmount}
                                            </td>
                                          </tr>
                                        );
                                      })}
                                    </>
                                  ) : (
                                    <tr>
                                      <td colSpan={10} align="center">
                                        No Student found
                                      </td>
                                    </tr>
                                  )}
                                  <tr>
                                    <td colSpan={10} className="table-total">
                                      {"Due Type : Fully Paid"}
                                    </td>
                                  </tr>
                                  {data.fully_paid.length > 0 ? (
                                    <>
                                      {data.fully_paid.map((item, index) => {
                                        // let Count = 0;
                                        // Count = Count + data.excess_fees.length;
                                        return (
                                          <tr key={index}>
                                            <td>{Count + index + 1}</td>
                                            <td>{item.enrollNo}</td>
                                            <td>{item.name}</td>
                                            <td>{item.particular}</td>
                                            <td align="right">
                                              {item.openingBalance}
                                            </td>
                                            <td align="right">
                                              {item.PaidAmount}
                                            </td>
                                            <td align="right">
                                              {item.DueAmount}
                                            </td>
                                          </tr>
                                        );
                                      })}
                                    </>
                                  ) : (
                                    <tr>
                                      <td colSpan={10} align="center">
                                        No Student found
                                      </td>
                                    </tr>
                                  )}
                                  <tr>
                                    <td colSpan={10} className="table-total">
                                      {"Due Type : Non Payer"}
                                    </td>
                                  </tr>
                                  {data.non_paid.length > 0 ? (
                                    <>
                                      {data.non_paid.map((item, index) => {
                                        return (
                                          <tr key={index}>
                                            <td>{nonPayerCount + index + 1}</td>
                                            <td>{item.enrollNo}</td>
                                            <td>{item.name}</td>
                                            <td>{item.particular}</td>
                                            <td align="right">
                                              {item.openingBalance}
                                            </td>
                                            <td align="right">
                                              {item.PaidAmount}
                                            </td>
                                            <td align="right">
                                              {item.DueAmount}
                                            </td>
                                          </tr>
                                        );
                                      })}
                                    </>
                                  ) : (
                                    <tr>
                                      <td colSpan={10} align="center">
                                        No Student found
                                      </td>
                                    </tr>
                                  )}
                                  <tr>
                                    <td colSpan={10} className="table-total">
                                      {"Due Type : Partially Paid"}
                                    </td>
                                  </tr>
                                  {data.partially_paid.length > 0 ? (
                                    <>
                                      {data.partially_paid.map(
                                        (item, index) => {
                                          return (
                                            <tr key={index}>
                                              <td>
                                                {partialCount + index + 1}
                                              </td>
                                              <td>{item.enrollNo}</td>
                                              <td>{item.name}</td>
                                              <td>{item.particular}</td>
                                              <td align="right">
                                                {item.openingBalance}
                                              </td>
                                              <td align="right">
                                                {item.PaidAmount}
                                              </td>
                                              <td align="right">
                                                {item.DueAmount}
                                              </td>
                                            </tr>
                                          );
                                        }
                                      )}
                                    </>
                                  ) : (
                                    <tr>
                                      <td colSpan={10} align="center">
                                        No Student found
                                      </td>
                                    </tr>
                                  )}
                                </tbody>
                              )}
                            </table>
                          ) : null}
                          {showLoadMore ? (
                            <Button
                              text="Show All"
                              type="button"
                              onClick={(e) => handleShow1(values, 1)}
                            />
                          ) : null}
                        </div>
                      </>
                    </div>
                  ) : null}
                </form>
              );
            }}
          </Formik>
        </div>
      </div>
    </div>
  );
}
export default StudentDueReport;
