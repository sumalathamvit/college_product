import React, { useEffect, useState, useRef, useContext } from "react";
import { Formik } from "formik";
import * as Yup from "yup";
import PaymentsOutlinedIcon from "@mui/icons-material/PaymentsOutlined";
import moment from "moment";

import StudentApi from "../api/StudentApi";

import preFunction from "../component/common/CommonFunction";
import CustomActivityIndicator from "../component/common/CustomActivityIndicator";

import Button from "../component/FormField/Button";
import SelectFieldFormik from "../component/FormField/SelectFieldFormik";
import ScreenTitle from "../component/common/ScreenTitle";
import AuthContext from "../auth/context";
import { useSelector } from "react-redux";

function FeeModificationReport() {
  const RENAME = useSelector((state) => state.web.rename);
  const formikRef = useRef();
  const [data, setData] = useState([]);
  const [load, setLoad] = useState(false);
  const [courseList, setCourseList] = useState([]);
  const [batchList, setBatchList] = useState([]);
  const [enrollNumberList, setEnrollNumberList] = useState([]);
  const [admissionTypeList, setAdmissionTypeList] = useState([]);
  const [particularList, setParticularList] = useState([]);
  const [showRes, setShowRes] = useState(false);
  const [showLoadMore, setShowLoadMore] = useState(false);

  const { collegeName } = useContext(AuthContext);

  const reportSchema = Yup.object().shape({
    course: Yup.object().required("Please select " + RENAME?.course),
    batch: Yup.object().required("Please select " + RENAME?.batch),
  });

  const handleCSVData = async (values, type) => {
    console.log("reportValues---", values);

    const feesConcessionReportRes = await StudentApi.getFeesConcessionReport(
      values.course.id,
      values.batch.id,
      0,
      values.particular ? values.particular.id : null,
      values.admissionType ? values.admissionType.id : null,
      values.enrollNumber ? values.enrollNumber.enrollNo : null
    );
    console.log("feesConcessionReportRes", feesConcessionReportRes);

    let csvData = [
      [
        "No",
        "Student No.",
        "Student Name",
        "Authorized By",
        "Reference Number",
        "Reference Date",
        "Particular",
        "Opening Balance",
        "Concession Amount",
      ],
    ];
    feesConcessionReportRes.data.message.data.map((item, index) => {
      csvData[index + 1] = [
        index + 1,
        item.enrollNo,
        item.name,
        item.authorizedBy,
        item.referenceNo,
        moment(item.referenceDate).format("DD-MM-YYYY"),
        item.particular,
        item.currentOpeningBalance,
        item.currentConcession,
      ];
    });

    if (type == 1) {
      preFunction.generatePDF(collegeName, "Fees Concession Report", csvData);
    } else {
      preFunction.downloadCSV(csvData, "Fees Concession Report.csv");
    }
    setLoad(false);
  };

  const handleShow = async (values) => {
    if (load) return;
    console.log("values", values);
    try {
      setLoad(true);
      setShowRes(true);
      console.log(
        "values",
        values.course.id,
        values.batch.id,
        values.particular ? values.particular.id : null,
        values.admissionType ? values.admissionType.id : null,
        values.enrollNumber ? values.enrollNumber.enrollNo : null
      );
      const feesConcessionReportRes = await StudentApi.getFeesConcessionReport(
        values.course.id,
        values.batch.id,
        0,
        values.particular ? values.particular.id : null,
        values.admissionType ? values.admissionType.id : null,
        values.enrollNumber ? values.enrollNumber.enrollNo : null
      );
      console.log("feesConcessionReportRes", feesConcessionReportRes);
      setData(feesConcessionReportRes.data.message.data);

      setLoad(false);
    } catch (error) {
      setLoad(false);
      console.log("error", error);
    }
  };

  const getAllList = async () => {
    try {
      setLoad(true);
      const masterRes = await StudentApi.getMaster(5);
      console.log("MasterRes----", masterRes);
      setCourseList(masterRes.data.message.data.course_data);
      setBatchList(masterRes.data.message.data.batch_data);
      masterRes.data.message.data.admission_type_data.splice(0, 0, {
        admissionType: "All",
        id: null,
      });
      setAdmissionTypeList(masterRes.data.message.data.admission_type_data);
      masterRes.data.message.data.particular_common_data.splice(0, 0, {
        particular: "All",
        id: null,
      });
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

  const getStudentList = async (course, batch) => {
    console.log("test", course.id, batch.id, 1);
    try {
      setLoad(true);

      const feesConcessionStudentRes = await StudentApi.getFeesConcessionReport(
        course.id,
        batch.id,
        1,
        null,
        null,
        null
      );
      console.log("feesConcessionStudentRes", feesConcessionStudentRes);
      setEnrollNumberList(feesConcessionStudentRes.data.message.data);

      setLoad(false);
    } catch (error) {
      console.log("error", error);
      setLoad(false);
    }
  };

  const setReactSelectMaxlength = () => {
    document.getElementById("course") &&
      document.getElementById("course").setAttribute("maxlength", 40);
    document.getElementById("batch") &&
      document.getElementById("batch").setAttribute("maxlength", 15);
    document.getElementById("admissionType") &&
      document.getElementById("admissionType").setAttribute("maxlength", 20);
    document.getElementById("particular") &&
      document.getElementById("particular").setAttribute("maxlength", 30);
  };

  useEffect(() => {
    return () => {
      getAllList();
    };
  }, []);

  return (
    <div className="content-area-report" onClick={preFunction.hideNavbar}>
      <CustomActivityIndicator
        style={{ height: 100, alignSelf: "center" }}
        visible={load}
      />
      <div className="row no-gutters bg-white-report">
        <ScreenTitle titleClass={"page-heading-position-report"} />
        <div className="row no-gutters mt-2">
          <Formik
            enableReinitialize={true}
            innerRef={formikRef}
            initialValues={{
              enrollNumber: "",
              batch: "",
              course: "",
              admissionType: { admissionType: "All", id: null },
              particular: { particular: "All", id: null },
            }}
            validationSchema={reportSchema}
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
                  {/* <div className="row mb-4 col-lg-3"></div> */}
                  <div className="row no-gutters col-lg-8">
                    <SelectFieldFormik
                      mandatory={1}
                      label={RENAME?.course}
                      id="course"
                      options={courseList}
                      clear={false}
                      getOptionLabel={(option) => option.courseName}
                      getOptionValue={(option) => option.id}
                      onChange={(text) => {
                        setFieldValue("course", text);
                        setShowRes(false);
                      }}
                    />

                    <SelectFieldFormik
                      label={RENAME?.batch}
                      id="batch"
                      mandatory={1}
                      options={batchList}
                      clear={false}
                      getOptionLabel={(option) => option.batch}
                      getOptionValue={(option) => option.id}
                      style={{ width: "55%" }}
                      onChange={(text) => {
                        setFieldValue("batch", text);
                        getStudentList(values.course, text);
                        setShowRes(false);
                      }}
                    />
                    <SelectFieldFormik
                      label="Admission Type"
                      id="admissionType"
                      options={admissionTypeList}
                      clear={false}
                      getOptionLabel={(option) => option.admissionType}
                      getOptionValue={(option) => option.id}
                      style={{ width: "60%" }}
                      onChange={(text) => {
                        setFieldValue("admissionType", text);
                        setShowRes(false);
                      }}
                    />

                    <SelectFieldFormik
                      label="Particular"
                      id="particular"
                      options={particularList}
                      clear={false}
                      getOptionLabel={(option) => option.particular}
                      getOptionValue={(option) => option.id}
                      onChange={(text) => {
                        setFieldValue("particular", text);
                        setShowRes(false);
                      }}
                    />
                    {values.batch ? (
                      <SelectFieldFormik
                        label="Student No./Name"
                        id="enrollNumber"
                        searchIcon={true}
                        options={enrollNumberList}
                        getOptionLabel={(option) => option.name}
                        getOptionValue={(option) => option.id}
                        onChange={(text) => {
                          setFieldValue("enrollNumber", text);
                          setShowRes(false);
                        }}
                      />
                    ) : null}
                  </div>
                  <Button
                    text="Show"
                    isTable={true}
                    type="submit"
                    onClick={() => preFunction.handleErrorFocus(errors)}
                  />
                  {showRes ? (
                    <div className="row border mt-4 px-3">
                      <div className="row no-gutters totcntstyle mb-2">
                        {data.length > 0 && (
                          <>
                            <div className=" col-lg-6"></div>
                            <div className=" col-lg-6 text-right">
                              <button
                                type="button"
                                className="btn"
                                onClick={(e) => {
                                  handleCSVData(values, 2);
                                }}
                              >
                                Export Excel
                              </button>
                              &nbsp; &nbsp;
                              <button
                                className="btn"
                                onClick={(e) => {
                                  handleCSVData(values, 1);
                                }}
                              >
                                Export PDF
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                      <>
                        <div className="table-responsive p-0">
                          <table
                            className="table table-bordered report-table table-bordered"
                            id="pdf-table"
                          >
                            <thead>
                              <tr>
                                <th width="1%">No.</th>
                                <th width="5%">Student No.</th>
                                <th>Student Name</th>
                                <th width="5%">Authorized By</th>
                                <th width="5%">Reference Number</th>
                                <th width="5%">Reference Date</th>
                                <th width="15%">Particulars</th>
                                <th width="5%">Opening Balance (₹)</th>
                                <th width="5%">Concession Amount (₹)</th>
                              </tr>
                            </thead>
                            <tbody>
                              {data.length === 0 ? (
                                <tr>
                                  <td colspan={9} align="center">
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
                                      <td>{item.authorizedBy}</td>
                                      <td>{item.referenceNo}</td>
                                      <td>
                                        {moment(item.referenceDate).format(
                                          "DD-MM-YYYY"
                                        )}
                                      </td>
                                      <td>{item.particular}</td>
                                      <td align="right">
                                        {item.currentOpeningBalance}
                                      </td>
                                      <td align="right">
                                        {item.currentConcession}
                                      </td>
                                    </tr>
                                  );
                                })
                              )}
                            </tbody>
                          </table>
                          {/* {showLoadMore ? (
                          <Button
                            text="Show All"
                            type="button"
                            onClick={(e) => handleShow(values, 1)}
                          />
                        ) : null}  */}
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
export default FeeModificationReport;
