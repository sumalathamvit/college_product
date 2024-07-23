import React, { useEffect, useState, useRef, useContext } from "react";
import { useSelector } from "react-redux";
import { Formik } from "formik";
import * as Yup from "yup";

import StudentApi from "../../api/StudentApi";
import AcademicApi from "../../api/AcademicApi";

import preFunction from "../../component/common/CommonFunction";
import CustomActivityIndicator from "../../component/common/CustomActivityIndicator";
import Button from "../../component/FormField/Button";
import SelectFieldFormik from "../../component/FormField/SelectFieldFormik";
import ScreenTitle from "../../component/common/ScreenTitle";
import AuthContext from "../../auth/context";

function AllDueParticularsNameWise() {
  const RENAME = useSelector((state) => state.web.rename);
  const formikRef = useRef();
  const [data, setData] = useState([]);
  const [load, setLoad] = useState(false);
  const [courseList, setCourseList] = useState([]);
  const [batchList, setBatchList] = useState([]);
  const [classList, setClassList] = useState([]);
  const [admissionTypeList, setAdmissionTypeList] = useState([]);
  const [headerList, setHeaderList] = useState([]);
  const [totalList, setTotalList] = useState([]);
  const [showRes, setShowRes] = useState(false);
  const [showLoadMore, setShowLoadMore] = useState(false);
  const collegeConfig = useSelector((state) => state.web.college);
  const { collegeId, collegeName } = useContext(AuthContext);

  const reportSchema = Yup.object().shape({
    college: collegeConfig.is_university
      ? Yup.object().required("Please select College")
      : Yup.mixed().notRequired(),
    course: Yup.object().required("Please select " + RENAME?.course),
  });

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
    if (report === 1) {
      preFunction.generatePDF(
        formikRef.current.values.college
          ? formikRef.current.values.college.collegeName
          : collegeName,
        "All Due Particular Name Wise",
        csvData
      );
    } else {
      preFunction.downloadCSV(csvData, "All Due Particularwise.csv");
    }
  };

  const handleShow = async (values, showAll = 0, report = 0) => {
    if (load) return;
    console.log("values--------", showAll, values);
    setShowLoadMore(false);
    try {
      setLoad(true);
      setShowRes(true);
      if (report === 0) {
        setData([]);
      }
      if (showAll === 1) {
        setShowLoadMore(false);
      }

      const studentReportRes = await StudentApi.getAllDueParticularWise(
        values.enrollNumber ? values.enrollNumber.enrollNo : null,
        values.course ? values.course.id : null,
        values.batch ? values.batch.batchID : null,
        collegeConfig.institution_type === 1 && values.class
          ? values.class.semester
          : null,
        values.admissionType ? values.admissionType.id : null,
        "name",
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

      setLoad(false);
    } catch (error) {
      setLoad(false);
      console.log("error", error);
    }
  };

  const handleCourseChange = async (values) => {
    setBatchList([]);
    setClassList([]);
    try {
      formikRef.current.setFieldValue("batch", null);
      formikRef.current.setFieldTouched("course", false);
      formikRef.current.setFieldTouched("batch", false);
      if (values) {
        const batchRes = await AcademicApi.getMasterSubjectStaff(
          collegeConfig.is_university
            ? formikRef.current.values.college.collegeID
            : collegeId,
          "batch",
          values.id
        );
        console.log("batchRes", batchRes);
        if (!batchRes.data.message.success) {
          setLoad(false);
          return;
        }
        setBatchList(batchRes.data.message.data.batch);
        setClassList(batchRes.data.message.data.batch);
      }
    } catch (error) {
      console.log("error", error);
    }
  };

  const getAllList = async (college_id) => {
    try {
      const masterRes = await StudentApi.getMaster(
        collegeConfig.institution_type === 1 ? 8 : 5,
        college_id
      );
      console.log("MasterRes----", masterRes);
      if (masterRes.data.message.data.course_data.length === 1) {
        formikRef.current.setFieldValue(
          "course",
          masterRes.data.message.data.course_data[0]
        );
        handleCourseChange(masterRes.data.message.data.course_data[0]);
      }
      setCourseList(masterRes.data.message.data.course_data);
      setAdmissionTypeList(masterRes.data.message.data.admission_type_data);
    } catch (error) {
      setLoad(false);
      console.log("error", error);
    }
  };

  useEffect(() => {
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
        <div className="row no-gutters mt-3">
          <Formik
            innerRef={formikRef}
            enableReinitialize={true}
            initialValues={{
              college: "",
              batch: "",
              class: "",
              section: "",
              course: "",
              admissionType: "",
              particular: "",
            }}
            validationSchema={reportSchema}
            onSubmit={(values) => {
              handleShow(values, 0);
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
                          getAllList(text.collegeID);
                          setFieldValue("course", "");
                          setFieldValue("batch", "");
                          setFieldTouched("course", false);
                          setFieldTouched("batch", false);
                          setFieldTouched("college", false);
                        }}
                      />
                    )}
                    {courseList.length > 1 && (
                      <SelectFieldFormik
                        autoFocus={!collegeConfig.is_university}
                        tabIndex={2}
                        label={RENAME?.course}
                        id="course"
                        mandatory={1}
                        options={courseList}
                        getOptionLabel={(option) => option.courseName}
                        getOptionValue={(option) => option.id}
                        onChange={(text) => {
                          setFieldValue("course", text);
                          setFieldValue("batch", "");
                          setFieldValue("class", "");
                          setShowRes(false);
                          handleCourseChange(text);
                        }}
                      />
                    )}
                    {collegeConfig.institution_type !== 1 ? (
                      <SelectFieldFormik
                        label={RENAME?.batch}
                        id="batch"
                        tabIndex={3}
                        clear={true}
                        options={batchList}
                        getOptionLabel={(option) => option.batch}
                        getOptionValue={(option) => option.batchID}
                        style={{ width: "50%" }}
                        onChange={(text) => {
                          setFieldValue("batch", text);
                          setShowRes(false);
                        }}
                      />
                    ) : (
                      <SelectFieldFormik
                        tabIndex={3}
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
                        }}
                      />
                    )}
                    <SelectFieldFormik
                      label="Admission Type"
                      id="admissionType"
                      tabIndex={4}
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
                  </div>
                  <Button
                    text="Show"
                    tabIndex={5}
                    onClick={() => preFunction.handleErrorFocus(errors)}
                    type="submit"
                  />
                  {showRes ? (
                    <div className="row no-gutters border p-3 mt-3">
                      {data.length > 0 && (
                        <div className="mb-3 text-right">
                          <button
                            type="button"
                            className="btn"
                            onClick={(e) => {
                              handleCSVData34(2);
                            }}
                          >
                            Export Excel
                          </button>
                          {/* &nbsp; &nbsp;
                            <button
                              className="btn"
                              onClick={(e) => {
                                handleCSVData34(1);
                              }}
                            >
                              Export PDF
                            </button> */}
                        </div>
                      )}
                      <>
                        <div className="table-responsive p-0">
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
                          {showLoadMore ? (
                            <Button
                              text="Show All"
                              type="button"
                              onClick={(e) => handleShow(values, 1)}
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
export default AllDueParticularsNameWise;
