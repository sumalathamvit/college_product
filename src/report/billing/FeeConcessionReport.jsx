import React, { useEffect, useState, useRef, useContext } from "react";
import { Formik } from "formik";
import * as Yup from "yup";
import moment from "moment";

import StudentApi from "../../api/StudentApi";

import preFunction from "../../component/common/CommonFunction";
import CustomActivityIndicator from "../../component/common/CustomActivityIndicator";
import Button from "../../component/FormField/Button";
import SelectFieldFormik from "../../component/FormField/SelectFieldFormik";
import ScreenTitle from "../../component/common/ScreenTitle";
import string from "../../string";
import { useSelector } from "react-redux";
import AuthContext from "../../auth/context";
import { boldStyle, topLineStyle } from "../../component/common/CommonArray";
import CommonApi from "../../component/common/CommonApi";

function FeeConcessionReport() {
  const formikRef = useRef();
  const [data, setData] = useState([]);
  const [load, setLoad] = useState(false);
  const [courseList, setCourseList] = useState([]);
  const [batchList, setBatchList] = useState([]);
  const [studentList, setStudentList] = useState([]);
  const [admissionTypeList, setAdmissionTypeList] = useState([]);
  const [concessionTypeList, setConcessionTypeList] = useState([]);
  const [particularList, setParticularList] = useState([]);
  const [showRes, setShowRes] = useState(false);
  const [showLoadMore, setShowLoadMore] = useState(false);

  const { collegeId, collegeName } = useContext(AuthContext);
  const collegeConfig = useSelector((state) => state.web.college);
  const RENAME = useSelector((state) => state.web.rename);

  const reportSchema = Yup.object().shape({
    college: collegeConfig.is_university
      ? Yup.object().required("Please select College")
      : Yup.object().notRequired(),
    course: Yup.object().required("Please select " + RENAME?.course),
    batch: Yup.object().required(
      collegeConfig.institution_type === 1
        ? "Please select " + RENAME?.sem
        : "Please select " + RENAME?.batch
    ),
  });

  const handleCSVData = async (data, values, type) => {
    console.log("reportValues---", data);
    console.log("type---", type);
    if (type == 1) {
      let filterContent = [
        [
          {
            content:
              RENAME?.course +
              values.course.courseName +
              (collegeConfig.institution_type === 1
                ? "          " + RENAME?.sem + ":" + values.batch.className
                : "           " + RENAME?.batch + ": " + values.batch.batch),
            styles: boldStyle,
          },
        ],
      ];
      if (values.admissionType || values.particular) {
        filterContent.push([
          {
            content:
              (values.admissionType
                ? "Admission Type: " + values.admissionType.admissionType
                : "") +
              (values.particular
                ? "    Particular: " + values.particular.particular
                : ""),
            styles: boldStyle,
          },
        ]);
      }
      if (values.concessionType) {
        filterContent.push([
          {
            content: "Concession Type: " + values.concessionType.concessionType,
            styles: boldStyle,
          },
        ]);
      }
      let head1 = [
        [
          { content: "No", styles: topLineStyle },
          { content: "Student No.", styles: topLineStyle },
          { content: "Student Name", styles: topLineStyle },
          { content: "Authorized By", styles: topLineStyle },
          { content: "Reference Number", styles: topLineStyle },
          { content: "Reference Date", styles: topLineStyle },
          { content: "Particular", styles: topLineStyle },
          { content: "Concession Type", styles: topLineStyle },
          {
            content: "Opening Bal (Rs.)",
            styles: { ...topLineStyle, halign: "right" },
          },
          {
            content: "Concession Amt (Rs.)",
            styles: { ...topLineStyle, halign: "right" },
          },
        ],
      ];
      let pdfData = [];
      data.map((item, index) => {
        pdfData.push([
          { content: index + 1 },
          { content: item.enrollNo },
          { content: item.name },
          { content: item.authorizedBy },
          { content: item.referenceNo },
          { content: moment(item.referenceDate).format("DD-MM-YYYY") },
          { content: item.particular },
          { content: item.concessionType ?? "Others" },
          {
            content: item.previousAmount,
            styles: { halign: "right" },
          },
          {
            content: item.concessionAmount,
            styles: { halign: "right" },
          },
        ]);
      });

      let pdfHeadToPass = [[], [...head1]];
      let pdfDataToPass = [filterContent, pdfData];

      console.log("pdfDataToPass---", pdfDataToPass);
      console.log("pdfHeadToPass---", pdfHeadToPass);

      preFunction.generatePDFContent(
        values.college.collegeName,
        "Fees Concession Report",
        pdfHeadToPass,
        pdfDataToPass,
        [],
        "landscape"
      );
      return;
    }
    let csvData = [
      [
        "No",
        "Student No.",
        "Student Name",
        "Authorized By",
        "Reference Number",
        "Reference Date",
        "Particular",
        "Concession Type",
        "Opening Balance",
        "Concession Amount",
      ],
    ];
    data.map((item, index) => {
      csvData[index + 1] = [
        index + 1,
        item.enrollNo,
        item.name,
        item.authorizedBy,
        item.referenceNo,
        moment(item.referenceDate).format("DD-MM-YYYY"),
        item.particular,
        item.concessionType ?? "Others",
        item.previousAmount,
        item.concessionAmount,
      ];
    });

    preFunction.downloadCSV(csvData, "Fees Concession Report.csv");

    setLoad(false);
  };

  const handleShow = async (values, report, showAll = 0) => {
    if (load) return;
    console.log("values", values);
    console.log("showAll", showAll);
    console.log("report", report);
    console.log("showLoadMore", showLoadMore);
    setShowLoadMore(false);
    if (report > 0 && showLoadMore === false) {
      handleCSVData(data, values, report);
      return;
    }
    try {
      setLoad(true);
      setShowRes(true);
      setData([]);
      console.log("values", values);
      const feesConcessionReportRes = await StudentApi.getFeesConcessionReport(
        collegeConfig.institution_type,
        values?.course?.id,
        values?.batch?.batchID,
        values?.batch?.semester,
        values?.particular?.id,
        values?.admissionType?.id,
        values.concessionType ? values.concessionType.id : -1,
        showAll
      );
      console.log("feesConcessionReportRes", feesConcessionReportRes);
      setData(feesConcessionReportRes.data.message.data);
      if (report > 0) {
        handleCSVData(
          feesConcessionReportRes.data.message.data,
          values,
          report
        );
        return;
      }
      if (feesConcessionReportRes.data.message.data.length >= string.PAGE_LIMIT)
        setShowLoadMore(true);
      setLoad(false);
    } catch (error) {
      setLoad(false);
      console.log("error", error);
    }
  };

  const getAllList = async (college_id) => {
    try {
      setLoad(true);
      const masterRes = await StudentApi.getMaster(
        collegeConfig.institution_type == 1 ? 8 : 5,
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
      if (collegeConfig.institution_type === 1) {
        setBatchList(masterRes.data.message.data.semester_data);
      } else {
        setBatchList(masterRes.data.message.data.batch_data);
      }
      setAdmissionTypeList(masterRes.data.message.data.admission_type_data);
      const particularMasterList = await StudentApi.getMaster(4, college_id);
      console.log("particularMasterList", particularMasterList);
      if (particularMasterList.data.message.success) {
        setParticularList(
          particularMasterList.data.message.data.particular_data
        );
      }

      const masterRes2 = await StudentApi.getMaster(5, college_id);
      console.log("masterRes2----", masterRes2);

      masterRes2.data.message.data.concession_type_data.push({
        id: null,
        concessionType: "Others",
      });
      setConcessionTypeList(masterRes2.data.message.data.concession_type_data);

      setLoad(false);
    } catch (error) {
      setLoad(false);
      console.log("error", error);
    }
  };

  const handleCourseChange = async (values) => {
    try {
      console.log("values", values);
      formikRef.current.setFieldValue("batch", null);
      formikRef.current.setFieldTouched("course", false);
      formikRef.current.setFieldTouched("batch", false);
      if (values) {
        const batchRes = await StudentApi.getMaster(
          collegeConfig.institution_type === 1 ? 8 : 5,
          collegeConfig?.is_university ? values?.collegeID : collegeId,
          values.id
        );
        console.log("batchRes", batchRes);

        if (collegeConfig.institution_type === 1)
          setBatchList(batchRes.data.message.data.semester_data);
        else setBatchList(batchRes.data.message.data.batch_data);
      }
    } catch (error) {
      console.log("error", error);
    }
  };

  const searchStudent = async (value) => {
    setStudentList(await CommonApi.searchStudent(value));
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
        <div className="row no-gutters mt-2">
          <Formik
            enableReinitialize={true}
            innerRef={formikRef}
            initialValues={{
              college: "",
              batch: "",
              course: "",
              admissionType: null,
              concessionType: null,
              particular: null,
            }}
            validationSchema={reportSchema}
            onSubmit={(values) => handleShow(values, 0, 0)}
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
                        mandatory={1}
                        clear={false}
                        label="College"
                        id="college"
                        options={collegeConfig.collegeList}
                        getOptionLabel={(option) => option.collegeName}
                        getOptionValue={(option) => option.collegeID}
                        searchIcon={false}
                        onChange={(text) => {
                          setShowRes(false);
                          setFieldValue("college", text);
                          getAllList(text?.collegeID);
                        }}
                      />
                    )}
                    {courseList.length > 1 && (
                      <SelectFieldFormik
                        autoFocus={!collegeConfig.is_university}
                        mandatory={1}
                        label={RENAME.course}
                        id="course"
                        options={courseList}
                        clear={false}
                        tabIndex={1}
                        getOptionLabel={(option) => option.courseName}
                        getOptionValue={(option) => option.id}
                        onChange={(text) => {
                          setFieldValue("course", text);
                          handleCourseChange(text);
                          setShowRes(false);
                        }}
                      />
                    )}
                    {collegeConfig.institution_type === 1 ? (
                      <SelectFieldFormik
                        label={RENAME.sem}
                        tabIndex={2}
                        id="batch"
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
                    ) : (
                      <SelectFieldFormik
                        label={RENAME.batch}
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
                    )}
                    <SelectFieldFormik
                      label="Admission Type"
                      id="admissionType"
                      options={admissionTypeList}
                      tabIndex={3}
                      clear={true}
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
                      clear={true}
                      tabIndex={4}
                      getOptionLabel={(option) => option.particular}
                      getOptionValue={(option) => option.id}
                      onChange={(text) => {
                        setFieldValue("particular", text);
                        setShowRes(false);
                      }}
                    />
                    <SelectFieldFormik
                      label="Concession Type"
                      id="concessionType"
                      options={concessionTypeList}
                      tabIndex={3}
                      clear={true}
                      getOptionLabel={(option) => option.concessionType}
                      getOptionValue={(option) => option.id}
                      style={{ width: "60%" }}
                      onChange={(text) => {
                        setFieldValue("concessionType", text);
                        setShowRes(false);
                      }}
                    />
                    {/* <SelectFieldFormik
                      label="Student No./Name"
                      id="enrollNumber"
                      searchIcon={true}
                      tabIndex={5}
                      options={enrollNumberList}
                      getOptionLabel={(option) =>
                        option.name
                      }
                      getOptionValue={(option) => option.studentID}
                      onInputChange={(inputValue) => {
                        searchStudent(inputValue);
                      }}
                      onChange={(text) => {
                        setFieldValue("enrollNumber", text);
                        setShowRes(false);
                      }}
                    /> */}
                  </div>
                  <Button
                    text="Show"
                    tabIndex={6}
                    type="submit"
                    onClick={() => preFunction.handleErrorFocus(errors)}
                  />
                  {showRes ? (
                    <div className="row border mt-4 px-3">
                      <div className="row no-gutters totcntstyle mb-2">
                        {data.length > 0 && (
                          <div className="col-lg-12 text-right">
                            <Button
                              type="button"
                              frmButton={false}
                              onClick={(e) => {
                                handleShow(values, 2, showLoadMore);
                              }}
                              text={"Export Excel"}
                            />
                            &nbsp; &nbsp;
                            <Button
                              frmButton={false}
                              type="button"
                              onClick={(e) => {
                                handleShow(values, 1, showLoadMore);
                              }}
                              text={"Export PDF"}
                            />
                          </div>
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
                                <th width="15%">Concession Type</th>
                                <th width="5%">Opening Balance (₹)</th>
                                <th width="5%">Concession Amount (₹)</th>
                              </tr>
                            </thead>
                            <tbody>
                              {data.length === 0 ? (
                                <tr>
                                  <td colspan={15} align="center">
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
                                      <td>{item.concessionType ?? "Others"}</td>
                                      <td align="right">
                                        {item.previousAmount}
                                      </td>
                                      <td align="right">
                                        {item.concessionAmount}
                                      </td>
                                    </tr>
                                  );
                                })
                              )}
                            </tbody>
                          </table>
                          {showLoadMore ? (
                            <Button
                              text="Show All"
                              type="button"
                              onClick={(e) => handleShow(values, 0, 1)}
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
export default FeeConcessionReport;
