import React, { useContext, useEffect, useState } from "react";
import DirectionsBusIcon from "@mui/icons-material/DirectionsBus";
import { Formik } from "formik";
import { toast } from "react-toastify";
import * as Yup from "yup";
import AuthContext from "../auth/context";

import StudentApi from "../api/StudentApi";

import SelectFieldFormik from "../component/FormField/SelectFieldFormik";
import preFunction from "../component/common/CommonFunction";
import CustomActivityIndicator from "../component/common/CustomActivityIndicator";
import { sectionList } from "../component/common/CommonArray";
import Button from "../component/FormField/Button";

import string from "../string";
import ScreenTitle from "../component/common/ScreenTitle";
import { useSelector } from "react-redux";

function TransportStrengthReport() {
  const RENAME = useSelector((state) => state.web.rename);
  const [data, setData] = useState([]);
  const [load, setLoad] = useState(false);
  const [moreLoading, setMoreLoading] = useState(false);
  const [showLoadMore, setShowLoadMore] = useState(false);
  const [courseList, setCourseList] = useState([]);
  const [batchList, setBatchList] = useState([]);
  const [showRes, setShowRes] = useState(false);
  const [allBatch, setAllBatch] = useState(false);
  const [allbatchList, setAllBatchList] = useState([]);

  const { collegeId, collegeName } = useContext(AuthContext);
  const collegeConfig = useSelector((state) => state.web.college);

  const FormSchema = Yup.object().shape({
    batch: Yup.object().required("Please select " + RENAME?.batch),
  });

  const handleCSVData = async (values, report, showAll) => {
    const transportCsvReportRes = await StudentApi.transportStrengthReport(
      values.batch.batchID,
      values.course.id,
      values.section.value ? values.section.value : null,
      showAll
    );
    console.log("transportCsvReportRes", transportCsvReportRes);

    let csvData = [
      [
        "No.",
        "Student No.",
        "Student Name",
        RENAME?.course,
        RENAME?.batch,
        RENAME?.section,
      ],
    ];
    transportCsvReportRes.data.message.transport_strength_report.map(
      (item, index) => {
        csvData[index + 1] = [
          index + 1,
          item.enrollNo,
          item.name,
          item.courseName,
          item.batch,
          item.section,
        ];
      }
    );
    if (report == 1) {
      preFunction.generatePDF(
        collegeName,
        "Transport Strength Report",
        csvData
      );
    } else {
      preFunction.downloadCSV(csvData, "Transport Strength Report.csv");
    }
  };

  const handleShow = async (values, showAll = 0) => {
    if (load) return;
    try {
      console.log("values", values);
      console.log("showAll", showAll);

      setLoad(true);
      setShowRes(true);
      const transportReportRes = await StudentApi.transportStrengthReport(
        values.batch.batchID,
        values.course.id,
        values.section.value ? values.section.value : null,
        showAll
      );
      console.log("transportReportRes", transportReportRes);
      if (showAll == 1) {
        setData([]);
        setData(transportReportRes.data.message.transport_strength_report);
        setShowLoadMore(false);
      } else {
        setData(transportReportRes.data.message.transport_strength_report);
        if (
          transportReportRes.data.message.transport_strength_report.length >=
          string.PAGE_LIMIT
        )
          setShowLoadMore(true);
      }

      setLoad(false);
      setMoreLoading(false);
      return;
    } catch (error) {
      setLoad(false);
      console.log("error", error);
    }
  };

  const getAllList = async () => {
    try {
      setLoad(true);
      const masterList = await StudentApi.getMaster(5, "");
      console.log("MasterList", masterList);
      setCourseList(masterList.data.message.data.course_data);
      // let batchDt = [];
      // let passedBatchDt = [];
      // for (let i = 0; i < masterList.data.message.data.batch_data.length; i++) {
      //   if (
      //     masterList.data.message.data.batch_data.findIndex(
      //       (x) =>
      //         x.batchID == masterList.data.message.data.batch_data[i].batchID
      //     ) == -1
      //   ) {
      //     passedBatchDt.push(masterList.data.message.data.batch_data[i]);
      //   } else {
      //     batchDt.push(masterList.data.message.data.batch_data[i]);
      //   }
      // }

      // let neededBatchList = [
      //   { label: "Current", options: batchDt },
      //   { label: "Passed Out", options: passedBatchDt },
      // ];
      if (collegeConfig.institution_type === 1)
        setBatchList(masterList.data.message.data.semester_data);
      else setBatchList(masterList.data.message.data.batch_data);

      // setAllBatchList(masterList.data.message.data.batch_data);
      setLoad(false);
    } catch (error) {
      setLoad(false);
      console.log("error", error);
    }
  };

  useEffect(() => {
    getAllList();
  }, []);

  return (
    <div className="content-area-report" onClick={preFunction.hideNavbar}>
      <CustomActivityIndicator
        style={{ height: 100, alignSelf: "center" }}
        visible={load}
      />
      <div className="row no-gutters bg-white-report">
        <ScreenTitle titleClass={"page-heading-position-report"} />
        <Formik
          enableReinitialize={true}
          initialValues={{
            course: null,
            batch: null,
            section: null,
          }}
          validationSchema={FormSchema}
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
                <div className="row no-gutters mb-1 mt-1">
                  <div className="col-lg-8">
                    <SelectFieldFormik
                      label={
                        collegeConfig.institution_type === 1
                          ? RENAME?.sem
                          : RENAME?.batch
                      }
                      labelSize={2}
                      id="batch"
                      tabIndex={2}
                      mandatory={1}
                      maxlength={10}
                      clear={false}
                      searchIcon={false}
                      options={batchList}
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
                      onChange={(text) => {
                        setFieldValue("batch", text);
                        setShowRes(false);
                      }}
                      style={{ width: "30%" }}
                    />
                    <SelectFieldFormik
                      label={RENAME?.course}
                      labelSize={2}
                      id="course"
                      tabIndex={2}
                      maxlength={40}
                      options={courseList}
                      clear={false}
                      getOptionLabel={(option) => option.courseName}
                      getOptionValue={(option) => option.id}
                      onChange={(text) => {
                        setFieldValue("course", text);
                        setData([]);
                        setShowRes(false);
                      }}
                    />
                    <SelectFieldFormik
                      label={RENAME?.section}
                      id="section"
                      labelSize={2}
                      clear={false}
                      tabIndex={3}
                      maxlength={1}
                      options={sectionList}
                      style={{ width: "27%" }}
                      onChange={(text) => {
                        setFieldValue("section", text);
                        setData([]);
                        setShowRes(false);
                      }}
                    />
                  </div>
                  <Button
                    text={"Show"}
                    tabIndex={4}
                    onClick={() => preFunction.handleErrorFocus(errors)}
                  />
                </div>
                {showRes && (
                  <>
                    <div className="row no-gutters mt-2">
                      <div className="row border mt-2 px-3">
                        <div className="row no-gutters totcntstyle  mb-2">
                          {data.length > 0 && (
                            <>
                              <div className="col-lg-8"></div>
                              <div className="col-lg-2 text-right">
                                <Button
                                  type="button"
                                  isCenter={false}
                                  onClick={() => handleCSVData(values, 2, 1)}
                                  text="Export Excel"
                                />
                              </div>
                              <div className="col-lg-2 text-right">
                                <Button
                                  type="button"
                                  isCenter={false}
                                  onClick={(e) => handleCSVData(values, 1, 1)}
                                  text="Export PDF"
                                />
                              </div>
                            </>
                          )}
                        </div>
                        <>
                          <div className="table-responsive row no-gutters">
                            <table
                              className="table table-bordered report-table table-bordered"
                              id="pdf-table"
                            >
                              <thead>
                                <tr>
                                  <th width="1%">No.</th>
                                  <th width="15%">Student No.</th>
                                  <th>Student Name</th>
                                  <th width="10%">Course</th>
                                  <th width="15%">Batch</th>
                                  <th width="5%">Section</th>
                                </tr>
                              </thead>
                              {data.length === 0 ? (
                                <tbody>
                                  <tr>
                                    <td colSpan={10} align="center">
                                      No records found
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
                                        <td>{item.courseName}</td>
                                        <td>{item.batch}</td>
                                        <td>{item.section}</td>
                                      </tr>
                                    );
                                  })}
                                </tbody>
                              )}
                            </table>
                          </div>
                          {showLoadMore && (
                            <>
                              <div className="row text-right mt-2">
                                <Button
                                  text="Show All"
                                  type="button"
                                  isTable={true}
                                  onClick={(e) => {
                                    handleShow(values, 1);
                                  }}
                                />
                              </div>
                            </>
                          )}
                        </>
                      </div>
                    </div>
                  </>
                )}
              </form>
            );
          }}
        </Formik>
      </div>
    </div>
  );
}
export default TransportStrengthReport;
