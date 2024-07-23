import React, { useEffect, useState, useContext, useRef } from "react";
import { Formik } from "formik";
import moment from "moment";
import { useSelector } from "react-redux";
import * as Yup from "yup";

import AuthContext from "../../auth/context";

import StudentApi from "../../api/StudentApi";
import academicApi from "../../api/AcademicApi";

import preFunction from "../../component/common/CommonFunction";
import CustomActivityIndicator from "../../component/common/CustomActivityIndicator";
import Button from "../../component/FormField/Button";
import DateFieldFormik from "../../component/FormField/DateFieldFormik";
import SelectFieldFormik from "../../component/FormField/SelectFieldFormik";
import ScreenTitle from "../../component/common/ScreenTitle";
import ErrorMessage from "../../component/common/ErrorMessage";
import string from "../../string";
import $ from "jquery";

import {
  boldStyle,
  lineWhiteStyle,
  topLineStyle,
  totStyle,
} from "../../component/common/CommonArray";
import AcademicApi from "../../api/AcademicApi";

function SchoolAttendanceReport() {
  const RENAME = useSelector((state) => state.web.rename);
  const formikRef = useRef();
  const [data, setData] = useState([]);
  const [load, setLoad] = useState(false);

  const [filterError, setFilterError] = useState(false);
  const [showRes, setShowRes] = useState(false);
  const [enrollNumberList, setEnrollNumberList] = useState([]);
  const [sectionList, setSectionList] = useState([]);
  const [boardList, setBoardList] = useState([]);
  const [classList, setClassList] = useState([]);
  const [empCodeList, setEmpCodeList] = useState([]);
  const [dateError, setDateError] = useState(false);
  const [boardConfig, setBoardConfig] = useState([]);
  const [showLoadMore, setShowLoadMore] = useState(false);

  const { collegeId, collegeName } = useContext(AuthContext);
  const collegeConfig = useSelector((state) => state.web.college);

  const reportSchema = Yup.object().shape({
    board: $("#board").attr("class")?.includes("non-mandatory")
      ? Yup.mixed().notRequired()
      : Yup.object().required(
          `Please select ${$("#board").attr("alt") ?? RENAME?.course}`
        ),
    class: $("#class").attr("class")?.includes("non-mandatory")
      ? Yup.mixed().notRequired()
      : Yup.object().required(
          `Please select ${$("#class").attr("alt") ?? RENAME?.sem}`
        ),
  });

  const handleCSVData = async (exportData, type, values) => {
    console.log("exportData", exportData);
    try {
      setLoad(true);
      var pdfData = [];
      if (type == 2) {
        pdfData.push([
          "No.",
          "Roll No.",
          "Student Name",
          "Present",
          "Absent",
          "Total",
        ]);
      } else {
        var filterContent = [];
        filterContent.push([
          {
            content: `${
              values.class ? RENAME?.sem + " : " + values.class.className : ""
            } `,
            styles: boldStyle,
          },
        ]);
        (values.section || values.enrollNo) &&
          filterContent.push([
            {
              content:
                (values.section ? `Section : ${values.section.section}` : "") +
                (values.enrollNo
                  ? `   Student No./Name : ${values.enrollNo.enrollNo} - ${values.enrollNo.name}`
                  : ""),
              styles: boldStyle,
            },
          ]);
        (values.fromDate || values.toDate) &&
          filterContent.push([
            {
              content:
                (values.fromDate
                  ? `   From Date : ${moment(values.fromDate).format(
                      "DD-MM-yyyy"
                    )}`
                  : "") +
                (values.toDate
                  ? `   To Date : ${moment(values.toDate).format("DD-MM-yyyy")}`
                  : ""),

              styles: boldStyle,
            },
          ]);
        var head1 = [
          [
            { content: "No.", styles: topLineStyle },
            { content: "Roll No.", styles: topLineStyle },
            { content: "Student Name", styles: topLineStyle },
            { content: "Present", styles: topLineStyle },
            { content: "Absent", styles: topLineStyle },
            { content: "Total", styles: topLineStyle },
          ],
        ];
      }

      exportData.map((item, index) => {
        pdfData.push([
          index + 1,
          item.rollNo ?? "",
          item.name,
          item.presentCount,
          item.absentCount,
          item.presentCount + item.absentCount,
        ]);
      });

      if (type === 2) {
        preFunction.downloadCSV(pdfData, "Student Attendance Report.csv");
      } else {
        let pdfHeadToPass = [[], [...head1]];
        let pdfDataToPass = [filterContent, pdfData];

        preFunction.generatePDFContent(
          formikRef.current.values.college
            ? formikRef.current.values.college.collegeName
            : collegeName,
          "Student Attendance Report",
          pdfHeadToPass,
          pdfDataToPass,
          [],
          "Portrait",
          "a4"
        );
      }

      setLoad(false);
    } catch (error) {
      setLoad(false);
      console.log("error", error);
    }
  };

  const handleShow = async (values, showAll, report) => {
    if (load) return;
    console.log("values", values);
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

    try {
      setLoad(true);
      const res = await academicApi.getSchoolAttendanceReport(
        // values.board ? values.board.id : null,
        values.class ? values.class.semester : null,
        values.section ? values.section.classID : null,
        values.fromDate ? moment(values.fromDate).format("YYYY-MM-DD") : null,
        values.toDate ? moment(values.toDate).format("YYYY-MM-DD") : null,
        values.enrollNo ? values.enrollNo.id : null
      );
      console.log("res", res);
      setShowRes(true);

      if (report) {
        handleCSVData(res.data.message.data.attendance_report, report, values);
      } else {
        setData(res.data.message.data.attendance_report);
        setShowLoadMore(false);
        if (
          res.data.message.data.attendance_report.length === string.PAGE_LIMIT
        ) {
          setShowLoadMore(true);
        }
      }

      setLoad(false);
    } catch (error) {
      setLoad(false);
      console.log("error", error);
    }
  };

  const handleSearchStudent = async (text) => {
    if (text.replace(/\s\s+/g, " ").trim().length > 2) {
      try {
        const searchStudentRes = await StudentApi.searchStudent(text);
        console.log("searchStudentRes--------", searchStudentRes);
        setEnrollNumberList(searchStudentRes.data.message.data.student);
      } catch (error) {
        console.log("error--", error);
      }
    } else {
      setEnrollNumberList([]);
    }
  };

  const handleSectionList = async (board, classSection) => {
    console.log("course", board, classSection);
    setSectionList([]);
    formikRef.current.setFieldValue("section", "");
    setShowRes(false);
    if (board && classSection) {
      try {
        const sectionRes = await StudentApi.getMaster(
          8,
          collegeId,
          board.id,
          classSection.semester
        );
        console.log("sectionRes", sectionRes);
        setSectionList(sectionRes.data.message.data.class_data);
      } catch (error) {
        console.log("error", error);
      }
    }
  };

  const handleBoard = async (board) => {
    formikRef.current.setFieldValue("class", "");
    formikRef.current.setFieldValue("section", "");
    setShowRes(false);
    if (board) {
      const classRes = await AcademicApi.getMasterSubjectStaff(
        collegeConfig.is_university
          ? formikRef.current.values.college.collegeID
          : collegeId,
        "batch",
        board.id
      );
      console.log("classRes", classRes);
      setClassList(classRes.data.message.data.batch);
    }
  };

  const getBoardList = async (collegeId) => {
    try {
      setLoad(true);
      const masterList = await StudentApi.getMaster(5, collegeId);
      console.log("MasterList5", masterList);
      setBoardConfig(masterList.data.message.data.course_data);
      if (masterList.data.message.data.course_data.length == 1) {
        formikRef.current.setFieldValue(
          "board",
          masterList.data.message.data.course_data[0]
        );
        handleBoard(masterList.data.message.data.course_data[0]);
      } else {
        setBoardList(masterList.data.message.data.course_data);
      }

      setLoad(false);
    } catch (error) {
      setLoad(false);
      console.log("Error", error);
    }
  };

  const handleClear = () => {
    setData([]);
    setShowRes(false);
    setFilterError(false);
  };

  useEffect(() => {
    console.log(collegeConfig, "collegeConfig");
    getBoardList(collegeId);
  }, [collegeConfig.is_university]);

  return (
    <div className="content-area-report" onClick={preFunction.hideNavbar}>
      <CustomActivityIndicator
        style={{ height: 100, alignSelf: "center" }}
        visible={load}
      />
      <div className="row no-gutters bg-white-report">
        <ScreenTitle titleClass={"page-heading-position-report"} />
        <div className="row no-gutters mt-1">
          <Formik
            enableReinitialize={false}
            innerRef={formikRef}
            initialValues={{
              board: "",
              class: "",
              section: "",
              fromDate: new Date(
                new Date().getFullYear(),
                new Date().getMonth(),
                1
              ).toLocaleDateString(),
              toDate: new Date().toLocaleDateString(),
              enrollNo: "",
            }}
            validationSchema={reportSchema}
            onSubmit={handleShow}
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
                  <div className="row">
                    {boardConfig.length > 1 ? (
                      <SelectFieldFormik
                        tabIndex={1}
                        label={RENAME?.course}
                        mandatory={1}
                        labelSize={4}
                        id="board"
                        getOptionLabel={(option) => option.courseName}
                        getOptionValue={(option) => option.id}
                        options={boardList}
                        onChange={(text) => {
                          setFieldValue("board", text);
                          handleBoard(text);
                        }}
                        style={{ width: "50%" }}
                      />
                    ) : null}

                    <SelectFieldFormik
                      tabIndex={2}
                      label={RENAME?.sem}
                      id="class"
                      labelSize={4}
                      mandatory={1}
                      getOptionLabel={(option) => option.className}
                      getOptionValue={(option) => option.semester}
                      options={classList}
                      style={{ width: "30%" }}
                      onChange={(text) => {
                        setFieldValue("class", text);
                        handleSectionList(values.board, text);
                      }}
                    />

                    <SelectFieldFormik
                      tabIndex={3}
                      label={RENAME?.section}
                      id="section"
                      labelSize={4}
                      getOptionLabel={(option) => option.section}
                      getOptionValue={(option) => option.classID}
                      options={sectionList}
                      style={{ width: "20%" }}
                      onChange={(text) => {
                        setFieldValue("section", text);
                      }}
                    />
                    <DateFieldFormik
                      tabIndex={4}
                      id="fromDate"
                      label="Attendance Date From"
                      minDate={""}
                      maxDate={new Date()}
                      labelSize={4}
                      onChange={(e) => {
                        setFieldValue("fromDate", e.target.value);
                        setDateError(false);
                        handleClear();
                      }}
                      style={{ width: "30%" }}
                    />
                    <DateFieldFormik
                      tabIndex={5}
                      id="toDate"
                      label="Attendance Date To"
                      minDate={""}
                      maxDate={new Date()}
                      labelSize={4}
                      onChange={(e) => {
                        setFieldValue("toDate", e.target.value);
                        setDateError(false);
                        handleClear();
                      }}
                      style={{ width: "30%" }}
                    />
                    <SelectFieldFormik
                      tabIndex={6}
                      id="enrollNo"
                      maxlength={15}
                      label="Student No./Name"
                      clear={true}
                      searchIcon={true}
                      options={enrollNumberList}
                      labelSize={4}
                      getOptionLabel={(option) => option.name}
                      getOptionValue={(option) => option.id}
                      onInputChange={(inputValue) => {
                        handleSearchStudent(inputValue);
                      }}
                      onChange={(text) => {
                        setFieldValue("enrollNo", text);
                        handleClear();
                      }}
                      style={{ width: "90%" }}
                    />

                    {filterError && (
                      <div className="row no-gutters text-center mb-2 mt-1">
                        <ErrorMessage
                          Message={"Please apply atleast one filter"}
                          view={filterError}
                        />
                      </div>
                    )}
                    <div className="mt-1">
                      <ErrorMessage
                        Message={"Choose both Attendance Date From & To"}
                        view={dateError}
                      />
                    </div>
                    <div className="row no-gutters">
                      <div className="col-lg-6 text-right pe-1">
                        <Button
                          tabIndex={7}
                          type="submit"
                          text="Show"
                          isCenter={false}
                          onClick={(e) => preFunction.handleErrorFocus(errors)}
                        />
                      </div>
                      <div className="col-lg-5 ms-2">
                        <Button
                          type="button"
                          text="Clear"
                          isCenter={false}
                          onClick={() => {
                            resetForm();
                            handleClear();
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  {showRes ? (
                    <>
                      {/* <div className="row">
                        <div className="col-lg-3"></div> */}
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
                                <Button
                                  type="button"
                                  frmButton={false}
                                  onClick={(e) => {
                                    handleShow(values, 1, 1);
                                  }}
                                  text="Export PDF"
                                />
                              </div>
                            </div>
                          )}
                        </div>
                        {/* <div className="col-lg-12 text-right p-0 mt-3 student-text">
                          Total Days : 3
                        </div> */}
                        <div className="table-responsive mt-4 p-0">
                          <table
                            className="table table-bordered report-table"
                            // id="pdf-table"
                          >
                            <thead>
                              <tr>
                                <th width="5%">No.</th>
                                <th width="8%">Roll No.</th>
                                <th>Student Name</th>
                                <th width="10">Present</th>
                                <th width="10">Absent</th>
                                <th width="10">Total</th>
                              </tr>
                            </thead>
                            <tbody>
                              {data.length === 0 ? (
                                <tr>
                                  <td align="center" colSpan={10}>
                                    No data found
                                  </td>
                                </tr>
                              ) : (
                                data.map((item, index) => {
                                  return (
                                    <>
                                      <tr key={index}>
                                        <td>{index + 1}</td>
                                        <td>{item.rollNo}</td>
                                        <td>{item.name}</td>
                                        <td>{item.presentCount}</td>
                                        <td>{item.absentCount}</td>
                                        <td>
                                          {item.presentCount + item.absentCount}
                                        </td>
                                      </tr>
                                    </>
                                  );
                                })
                              )}
                            </tbody>
                          </table>
                        </div>
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
                      {/* <div className="col-lg-3"></div> */}
                      {/* </div> */}
                    </>
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
export default SchoolAttendanceReport;
