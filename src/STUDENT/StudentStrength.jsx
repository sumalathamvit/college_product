import React, { useContext, useEffect, useRef, useState } from "react";
import { Formik } from "formik";
import * as Yup from "yup";

import "jspdf-autotable";

import StudentApi from "../api/StudentApi";
import preFunction from "../component/common/CommonFunction";
import CustomActivityIndicator from "../component/common/CustomActivityIndicator";
import Button from "../component/FormField/Button";
import SelectFieldFormik from "../component/FormField/SelectFieldFormik";
import RecentActorsIcon from "@mui/icons-material/RecentActors";
import ScreenTitle from "../component/common/ScreenTitle";
import AuthContext from "../auth/context";
import { useSelector } from "react-redux";
import { topLineStyle } from "../component/common/CommonArray";

const formSchema = Yup.object().shape({
  course: Yup.object().required("Please select course"),
});

function StudentStrength() {
  const formikRef = useRef();
  const [data, setData] = useState([]);
  const [load, setLoad] = useState(false);

  const [course, setCourse] = useState("");
  const [academicYear, setAcademicYear] = useState("");
  const [year, setYear] = useState("");
  const arrayToMap = Array.from({ length: year });

  const [courseList, setCourseList] = useState([]);
  const [academicYearList, setAcademicYearList] = useState([]);
  const [headerList, setHeaderList] = useState([]);

  const { collegeId, collegeName } = useContext(AuthContext);
  const collegeConfig = useSelector((state) => state.web.college);
  const RENAME = useSelector((state) => state.web.rename);

  const handleCSVData = async (report) => {
    let csvData = [["No"]];
    headerList.map((item) => {
      csvData[0].push(item);
    });
    {
      data.map((item, index) => {
        const values = Object.values(item);
        const rowData = [index + 1, ...values];
        csvData.push(rowData);
        return null;
      });
    }
    console.log("csvData-------------------", csvData);

    if (report == 1) {
      preFunction.generatePDF(collegeName, "Student - Strength", csvData);
    } else {
      preFunction.downloadCSV(csvData, "Student - Strength" + ".csv");
    }
    setLoad(false);
  };

  const handleShow = async (values) => {
    if (load) return;
    try {
      setLoad(true);
      setYear(values.course.duration);
      const studentStrengthRes = await StudentApi.getStudentStrength(
        values.course.id,
        values.course.duration
      );
      console.log("studentStrengthRes ---", studentStrengthRes);
      let strengthArray =
        studentStrengthRes.data.message.student_strength_report.map(
          ({ id, ...rest }) => rest
        );
      setData(strengthArray);
      const headers = Object.keys(strengthArray[0]);
      setHeaderList(headers);

      setLoad(false);
    } catch (error) {
      console.log(error);
      setLoad(false);
    }
  };

  const getAllList = async (college_id) => {
    try {
      const masterRes = await StudentApi.getMaster(5, college_id);
      console.log("MasterRes----", masterRes);
      if (masterRes.data.message.data.course_data.length === 1) {
        formikRef.current.setFieldValue(
          "course",
          masterRes.data.message.data.course_data[0]
        );
      }
      setCourseList(masterRes.data.message.data.course_data);
    } catch (error) {
      console.log("error", error);
    }
  };

  const setReactSelectMaxlength = () => {
    document.getElementById("course") &&
      document.getElementById("course").setAttribute("maxlength", 40);
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
        <ScreenTitle titleClass={"page-heading-position-report"} />
        <div className="row no-gutters mt-1">
          <Formik
            enableReinitialize={true}
            innerRef={formikRef}
            initialValues={{
              course: course,
            }}
            validationSchema={formSchema}
            onSubmit={(values) => {
              handleShow(values);
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
                <form
                  onSubmit={handleSubmit}
                  onLoad={setReactSelectMaxlength()}
                  autoComplete="off"
                >
                  <div className="col-lg-9">
                    {collegeConfig.is_university && (
                      <SelectFieldFormik
                        autoFocus
                        tabIndex={1}
                        mandatory={1}
                        clear={false}
                        label="College"
                        id="college"
                        options={collegeConfig.collegeList}
                        getOptionLabel={(option) => option.collegeName}
                        getOptionValue={(option) => option.collegeID}
                        searchIcon={false}
                        onChange={(text) => {
                          setFieldValue("college", text);
                          getAllList(text?.collegeID);
                        }}
                      />
                    )}
                    <SelectFieldFormik
                      label={RENAME?.course}
                      id="course"
                      options={courseList}
                      getOptionLabel={(option) => option.courseName}
                      getOptionValue={(option) => option.id}
                      mandatory={1}
                      onChange={(text) => {
                        setFieldValue("course", text);
                      }}
                    />
                  </div>
                  <Button text="Show" type="submit" />
                  {data.length > 0 ? (
                    <>
                      <div className="row border mt-4 p-3">
                        <div className="row no-gutters totcntstyle  mb-2">
                          <div className="col-lg-12">
                            <div className="text-right">
                              <Button
                                type="button"
                                frmButton={false}
                                isTable={true}
                                onClick={(e) => handleCSVData(2)}
                                text={"Export Excel"}
                              />
                              &nbsp;&nbsp;
                              <Button
                                frmButton={false}
                                isTable={true}
                                type="button"
                                onClick={(e) => handleCSVData(1)}
                                text={"Export PDF"}
                              />
                            </div>
                          </div>
                        </div>

                        <div className="table-responsive p-0">
                          <table className="table table-bordered report-table table-bordered">
                            <thead>
                              <tr>
                                <th rowSpan={3} valign="middle" width="1%">
                                  No.
                                </th>
                                <th
                                  rowSpan={3}
                                  align="center"
                                  style={{ textAlign: "center" }}
                                >
                                  {collegeConfig.institution_type === 1
                                    ? RENAME?.sem
                                    : RENAME?.batch}
                                </th>
                                <th
                                  rowSpan={3}
                                  align="center"
                                  style={{ textAlign: "center" }}
                                >
                                  {RENAME?.course}
                                </th>
                                {arrayToMap.map((item, index) => {
                                  return (
                                    <>
                                      <th
                                        key={index}
                                        style={{ textAlign: "center" }}
                                        colSpan={7}
                                      >
                                        {index + 1} Year
                                      </th>
                                    </>
                                  );
                                })}
                                <th rowSpan={3} style={{ textAlign: "center" }}>
                                  Total
                                </th>
                              </tr>
                              <tr>
                                {arrayToMap.map((_, index) => {
                                  return (
                                    <>
                                      <th
                                        colSpan={2}
                                        style={{ textAlign: "center" }}
                                      >
                                        Male
                                      </th>
                                      <th
                                        colSpan={2}
                                        style={{ textAlign: "center" }}
                                      >
                                        Female
                                      </th>
                                      <th
                                        colSpan={2}
                                        style={{ textAlign: "center" }}
                                      >
                                        Others
                                      </th>
                                      <th
                                        rowSpan={2}
                                        style={{ textAlign: "center" }}
                                      >
                                        Total
                                      </th>
                                    </>
                                  );
                                })}
                              </tr>
                              <tr>
                                {arrayToMap.map((_, index) => {
                                  return (
                                    <>
                                      <th style={{ textAlign: "center" }}>
                                        Regular
                                      </th>
                                      <th style={{ textAlign: "center" }}>
                                        Hostel
                                      </th>
                                      <th style={{ textAlign: "center" }}>
                                        Regular
                                      </th>
                                      <th style={{ textAlign: "center" }}>
                                        Hostel
                                      </th>
                                      <th style={{ textAlign: "center" }}>
                                        Regular
                                      </th>
                                      <th style={{ textAlign: "center" }}>
                                        Hostel
                                      </th>
                                    </>
                                  );
                                })}
                              </tr>
                            </thead>

                            <tbody>
                              {data.map((item, index) => {
                                let values = Object.values(item);
                                return (
                                  <tr key={index}>
                                    <td>{index + 1}</td>
                                    {values.map((item, idx) => (
                                      <td key={idx}>{item}</td>
                                    ))}
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      </div>
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
export default StudentStrength;
