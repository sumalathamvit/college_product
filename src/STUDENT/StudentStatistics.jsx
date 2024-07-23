import React, { useContext, useEffect, useRef, useState } from "react";
import { Formik } from "formik";
import StudentApi from "../api/StudentApi";
import * as Yup from "yup";

import preFunction from "../component/common/CommonFunction";
import CustomActivityIndicator from "../component/common/CustomActivityIndicator";
import SelectFieldFormik from "../component/FormField/SelectFieldFormik";
import Button from "../component/FormField/Button";
import ScreenTitle from "../component/common/ScreenTitle";
import { useSelector } from "react-redux";
import AuthContext from "../auth/context";

function StudentStatistics() {
  const formikRef = useRef();
  const { collegeId, collegeName } = useContext(AuthContext);
  const collegeConfig = useSelector((state) => state.web.college);
  const RENAME = useSelector((state) => state.web.rename);

  const [data, setData] = useState([]);
  const [load, setLoad] = useState(false);
  const [genderList, setGenderList] = useState([]);
  const [religionList, setReligionList] = useState([]);
  const [communityList, setCommunityList] = useState([]);
  const [admissionTypeList, setAdmissionTypeList] = useState([]);
  const [courseList, setCourseList] = useState([]);
  const [batchList, setBatchList] = useState([]);
  const [headerList, setHeaderList] = useState([]);
  const [showRes, setShowRes] = useState(false);

  const detailSchema = Yup.object().shape({
    college: collegeConfig.is_university
      ? Yup.object().required("Please select College")
      : Yup.string().nullable(),
    course: Yup.object().required("Please select " + RENAME?.course),
    batch: Yup.object().required("Please select " + RENAME?.batch),
  });

  const handleCSVData = async (report) => {
    setLoad(true);
    let csvData = [["No.", RENAME?.course]];
    headerList.map((item) => {
      csvData[0].push(item.substr(0, 4));
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
      preFunction.generatePDF(collegeName, "Student - Statistics", csvData);
    } else {
      preFunction.downloadCSV(csvData, "Student - Statistics" + ".csv");
    }
    setLoad(false);
  };

  const handleShow = async (values) => {
    if (load) return;
    try {
      setLoad(true);
      setShowRes(true);
      console.log("Values---", values);

      const statisticsRes = await StudentApi.getStatistics(
        collegeConfig.institution_type,
        values.course.id,
        collegeConfig.institution_type === 1 ? null : values?.batch?.batchID,
        collegeConfig.institution_type === 1 ? values?.batch?.semester : null
      );
      console.log("statisticsRes", statisticsRes);
      setData(statisticsRes.data.message.student_statistics_report);
      const headers = Object.keys(
        statisticsRes.data.message.student_statistics_report[0]
      );
      const filteredHeaders = headers.filter(
        (header) => header !== RENAME?.course
      );
      setHeaderList(filteredHeaders);

      setLoad(false);
    } catch (error) {
      console.log(error);
      setLoad(false);
    }
  };

  const getAllList = async (college_id) => {
    try {
      const masterRes1 = await StudentApi.getMaster(1, college_id);
      console.log("MasterRes1----", masterRes1);

      setGenderList(masterRes1.data.message.data.gender_data);
      setCommunityList(masterRes1.data.message.data.community_data);
      setReligionList(masterRes1.data.message.data.religion_data);

      const masterRes2 = await StudentApi.getMaster(5, college_id);
      console.log("MasterRes2----", masterRes2);
      if (masterRes2.data.message.data.course_data.length === 1) {
        formikRef.current.setFieldValue(
          "course",
          masterRes2.data.message.data.course_data[0]
        );
      }

      setCourseList(masterRes2.data.message.data.course_data);
      setAdmissionTypeList(masterRes2.data.message.data.admission_type_data);
      setBatchList(masterRes2.data.message.data.batch_data);
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
        <div className="row no-gutters mt-1">
          <Formik
            enableReinitialize={true}
            innerRef={formikRef}
            initialValues={{
              course: "",
              batch: "",
            }}
            validationSchema={detailSchema}
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
            }) => {
              return (
                <form onSubmit={handleSubmit} autoComplete="off">
                  <div className="row no-gutters">
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
                          style={{ width: "80%" }}
                          searchIcon={false}
                          onChange={(text) => {
                            setShowRes(false);
                            setFieldValue("college", text);
                            getAllList(text?.collegeID);
                          }}
                        />
                      )}
                      <SelectFieldFormik
                        autoFocus={!collegeConfig.is_university}
                        label={RENAME?.course}
                        id="course"
                        tabIndex={1}
                        mandatory={1}
                        options={courseList}
                        getOptionLabel={(option) => option.courseName}
                        getOptionValue={(option) => option.id}
                        style={{ width: "80%" }}
                        onChange={(text) => setFieldValue("course", text)}
                      />
                      <SelectFieldFormik
                        label={
                          collegeConfig.institution_type === 1
                            ? RENAME?.sem
                            : RENAME?.batch
                        }
                        tabIndex={2}
                        id="batch"
                        options={batchList}
                        maxlength={10}
                        getOptionLabel={(option) =>
                          collegeConfig.institution_type === 1
                            ? option.className
                            : option.batch
                        }
                        getOptionValue={(option) =>
                          collegeConfig.institution_type === 1
                            ? option.semester
                            : option.batchID
                        }
                        matchFrom="start"
                        mandatory={1}
                        style={{ width: "40%" }}
                        onChange={(text) => {
                          setFieldValue("batch", text);
                          setShowRes(false);
                        }}
                      />
                      <SelectFieldFormik
                        label={RENAME?.sem}
                        tabIndex={2}
                        id="semester"
                        options={batchList}
                        maxlength={10}
                        getOptionLabel={(option) => option.className}
                        getOptionValue={(option) => option.semester}
                        matchFrom="start"
                        mandatory={1}
                        style={{ width: "40%" }}
                        onChange={(text) => {
                          setFieldValue("batch", text);
                          setShowRes(false);
                        }}
                      />
                      <SelectFieldFormik
                        label={RENAME?.batch}
                        tabIndex={2}
                        id="batch"
                        options={batchList}
                        maxlength={10}
                        getOptionLabel={(option) => option.batch}
                        getOptionValue={(option) => option.batchID}
                        matchFrom="start"
                        mandatory={1}
                        style={{ width: "40%" }}
                        onChange={(text) => {
                          setFieldValue("batch", text);
                          setShowRes(false);
                        }}
                      />
                    </div>
                    <div className="col-lg-3"></div>
                  </div>
                  <Button
                    text="Show"
                    tabIndex={3}
                    onClick={(e) => preFunction.handleErrorFocus(errors)}
                  />
                </form>
              );
            }}
          </Formik>
        </div>
        {showRes ? (
          <div className="row border mt-4 p-3">
            {data.length > 0 && (
              <>
                <div className=" col-lg-12 text-right mb-4 p-0">
                  <button
                    type="button"
                    className="btn"
                    onClick={(e) => {
                      handleCSVData(2);
                    }}
                  >
                    Export Excel
                  </button>
                  &nbsp; &nbsp;
                  <button
                    className="btn"
                    onClick={(e) => {
                      handleCSVData(1);
                    }}
                  >
                    Export PDF
                  </button>
                </div>
                <div className="table-responsive p-0">
                  <table className="table table-bordered report-table">
                    <thead>
                      <tr>
                        <th
                          width="1%"
                          rowSpan={2}
                          style={{ paddingBottom: "27px" }}
                        >
                          No.
                        </th>
                        <th rowSpan={2} style={{ paddingBottom: "27px" }}>
                          {RENAME?.course}
                        </th>
                        <th rowSpan={2} style={{ paddingBottom: "27px" }}>
                          {collegeConfig.institution_type === 1
                            ? RENAME?.sem
                            : RENAME?.batch}
                        </th>
                        <th
                          colSpan={genderList.length + 1}
                          width="15%"
                          className="heading-center"
                        >
                          Gender
                        </th>
                        <th
                          colSpan={communityList.length + 1}
                          width="20%"
                          className="heading-center"
                        >
                          Community
                        </th>
                        <th
                          colSpan={religionList.length + 1}
                          width="5%"
                          className="heading-center"
                        >
                          Religion
                        </th>
                        <th
                          colSpan={admissionTypeList.length + 1}
                          width="5%"
                          className="heading-center"
                        >
                          Admission Type
                        </th>
                      </tr>
                      <tr>
                        {headerList.map((item) => {
                          return (
                            <th>
                              {item == "Gender Total" ||
                              item == "Community Total" ||
                              item == "Religion Total" ||
                              item == "Admission Total"
                                ? "Total"
                                : item}
                            </th>
                          );
                        })}
                      </tr>
                    </thead>
                    <tbody>
                      {data.map((item, index) => {
                        const values = Object.values(item);
                        return (
                          <tr key={index}>
                            <td align="center">{index + 1}</td>
                            {values.map((value, idx) => {
                              return <td key={idx}>{value}</td>;
                            })}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}
export default StudentStatistics;
