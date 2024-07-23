import React, { useEffect, useState, useRef, useContext } from "react";
import { Formik } from "formik";
import { useSelector } from "react-redux";
import * as Yup from "yup";
import moment from "moment";

import StudentApi from "../../api/StudentApi";
import AcademicApi from "../../api/AcademicApi";

import preFunction from "../../component/common/CommonFunction";
import CustomActivityIndicator from "../../component/common/CustomActivityIndicator";
import Button from "../../component/FormField/Button";
import SelectFieldFormik from "../../component/FormField/SelectFieldFormik";
import ScreenTitle from "../../component/common/ScreenTitle";
import {
  boldStyle,
  topLineStyle,
  totStyle,
} from "../../component/common/CommonArray";

import string from "../../string";

import AuthContext from "../../auth/context";

function DueAbstract() {
  const RENAME = useSelector((state) => state.web.rename);
  const collegeConfig = useSelector((state) => state.web.college);
  const { collegeId, collegeName } = useContext(AuthContext);

  const formikRef = useRef();
  const [data, setData] = useState([]);
  const [load, setLoad] = useState(false);
  const [courseList, setCourseList] = useState([]);
  const [batchList, setBatchList] = useState([]);
  const [classList, setClassList] = useState([]);
  const [admissionTypeList, setAdmissionTypeList] = useState([]);
  const [particularList, setParticularList] = useState([]);
  const [showRes, setShowRes] = useState(false);
  const [showLoadMore, setShowLoadMore] = useState(false);
  const [sectionList, setSectionList] = useState([]);

  const [openingTotal, setOpeningTotal] = useState(0);
  const [paidTotal, setPaidTotal] = useState(0);
  const [concessionTotal, setConcessionTotal] = useState(0);
  const [refundTotal, setRefundTotal] = useState(0);
  const [dueTotal, setDueTotal] = useState(0);

  const reportSchema = Yup.object().shape({
    college: collegeConfig.is_university
      ? Yup.object().required("Please select College")
      : Yup.mixed().notRequired(),
    course: Yup.object().required("Please select " + RENAME?.course),
  });

  // Function to export CSV and PDF data
  const handleExport = async (values, report) => {
    setLoad(true);
    console.log("reportValues---", values);

    if (report === 1) {
      let filterContent = [];
      if (formikRef.current.values.course) {
        filterContent.push([
          {
            content:
              RENAME?.course +
              " : " +
              formikRef.current.values.course.courseName,
            styles: boldStyle,
          },
        ]);
      }
      if (
        formikRef.current.values.batch ||
        formikRef.current.values.class ||
        formikRef.current.values.section ||
        formikRef.current.values.admissionType
      ) {
        filterContent.push([
          {
            content:
              (formikRef.current.values.batch
                ? RENAME?.batch + " : " + formikRef.current.values.batch.batch
                : "") +
              "  " +
              (formikRef.current.values.class &&
              collegeConfig.institution_type === 1
                ? RENAME?.sem + " : " + formikRef.current.values.class.className
                : "") +
              "  " +
              (formikRef.current.values.section
                ? RENAME?.section +
                  " : " +
                  formikRef.current.values.section.section
                : "") +
              "  " +
              (formikRef.current.values.admissionType
                ? "Admission Type: " +
                  formikRef.current.values.admissionType.admissionType
                : ""),
            styles: boldStyle,
          },
        ]);
      }
      if (formikRef.current.values.particular) {
        filterContent.push([
          {
            content:
              "Particular: " + formikRef.current.values.particular.particular,
            styles: boldStyle,
          },
        ]);
      }
      let head1 = [
        [
          { content: "No.", styles: topLineStyle },
          { content: "Student No.", styles: topLineStyle },
          { content: "Student Name", styles: topLineStyle },
          { content: "Permission Upto", styles: topLineStyle },
          {
            content: "Opening Bal (Rs.)",
            styles: { ...topLineStyle, halign: "right" },
          },
          {
            content: "Concession Amt (Rs.)",
            styles: { ...topLineStyle, halign: "right" },
          },
          {
            content: "Refund Amt (Rs.)",
            styles: { ...topLineStyle, halign: "right" },
          },
          {
            content: "Paid Amt (Rs.)",
            styles: { ...topLineStyle, halign: "right" },
          },
          {
            content: "Due Amt (Rs.)",
            styles: { ...topLineStyle, halign: "right" },
          },
        ],
      ];
      let pdfData = [];
      let openingAmt = 0;
      let concessionAmt = 0;
      let paidAmt = 0;
      let dueAmt = 0;
      let refundAmount = 0;
      values.map((item, index) => {
        openingAmt += parseInt(item.openingBalance);
        concessionAmt += item.concessionAmount
          ? parseInt(item.concessionAmount)
          : 0;
        paidAmt += item.PaidAmount ? parseInt(item.PaidAmount) : 0;
        dueAmt += item.DueAmount ? parseInt(item.DueAmount) : 0;
        refundAmount += item.refundAmount ? parseInt(item.refundAmount) : 0;

        pdfData.push([
          {
            content: index + 1,
          },
          {
            content: item.EnrollNumber,
          },
          {
            content: item.StudentName,
          },
          {
            content: item.permissionUpto
              ? moment(item.permissionUpto).format("DD-MM-YYYY") +
                " (" +
                item.PermissionAmount +
                ")"
              : "",
          },
          {
            content: item.openingBalance,
            styles: { halign: "right" },
          },
          {
            content: item.concessionAmount ? item.concessionAmount : "0",
            styles: { halign: "right" },
          },
          {
            content: item.PaidAmount,
            styles: { halign: "right" },
          },
          {
            content: item.refundAmount ? item.refundAmount : "0",
            styles: { halign: "right" },
          },
          {
            content: item.DueAmount,
            styles: { halign: "right" },
          },
        ]);
      });
      pdfData.push([
        {
          content: "Total",
          colSpan: 4,
          styles: totStyle,
        },
        {
          content: openingAmt,
          styles: totStyle,
        },
        {
          content: concessionAmt,
          styles: totStyle,
        },
        {
          content: paidAmt,
          styles: totStyle,
        },
        {
          content: refundAmount,
          styles: totStyle,
        },
        {
          content: dueAmt,
          styles: totStyle,
        },
      ]);

      let pdfHeadToPass = [[], [...head1]];

      let pdfDataToPass = [filterContent, [...pdfData]];

      let columnWidth = [5, 10, 20, 10, 10, 15, 10, 10, 10];
      let colWidthToPass = [[], [...columnWidth]];

      preFunction.generatePDFContent(
        formikRef.current.values.college
          ? formikRef.current.values.college.collegeName
          : collegeName,
        "Student Due Abstract",
        pdfHeadToPass,
        pdfDataToPass,
        colWidthToPass,
        "landscape"
      );

      setLoad(false);
      return;
    } else {
      var csvData = [
        [
          "No.",
          "Student No.",
          "Student Name",
          "Permission Upto",
          "Opening Balance",
          "Concession Amount",
          "Paid Amount",
          "Refund Amount",
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
          item.refundAmount,
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
        refundTotal,
        dueTotal,
      ];
      csvData.push(rowArray);
      preFunction.downloadCSV(csvData, "Student Due Abstract.csv");
    }
    setLoad(false);
  };

  const handleShow = async (values, showAll = 0, report = 0) => {
    if (load) return;
    setShowLoadMore(false);
    console.log("values--------", showAll, values);
    setOpeningTotal(0);
    setDueTotal(0);
    setPaidTotal(0);
    setConcessionTotal(0);
    setRefundTotal(0);

    try {
      setLoad(true);
      setShowRes(true);
      if (report === 0) {
        setData([]);
      }
      if (showAll === 1) {
        setShowLoadMore(false);
      }
      const dueAbstractRes = await StudentApi.getDueAbstract(
        values.course ? values.course.id : null,
        values.batch ? values.batch.batchID : null,
        values.section ? values.section.classID : null,
        collegeConfig.institution_type === 1 && values.class
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
        handleExport(dueAbstractRes.data.message.due_abstract, report);
      }
      setData(dueAbstractRes.data.message.due_abstract);
      let openingTotalSum = 0;
      let paidTotalSum = 0;
      let dueTotalSum = 0;
      let concessionTotalSum = 0;
      let refundTotalSum = 0;

      dueAbstractRes.data.message.due_abstract.map((item, index) => {
        openingTotalSum += item.openingBalance;
        paidTotalSum += item.PaidAmount;
        dueTotalSum += item.DueAmount;
        concessionTotalSum += item.concessionAmount;
        refundTotalSum += item.refundAmount;
      });
      setOpeningTotal(openingTotalSum);
      setPaidTotal(paidTotalSum);
      setDueTotal(dueTotalSum);
      setConcessionTotal(concessionTotalSum);
      setRefundTotal(refundTotalSum);
      if (showAll === 0) {
        if (
          dueAbstractRes.data.message.due_abstract.length >= string.PAGE_LIMIT
        )
          setShowLoadMore(true);
      }

      setLoad(false);
    } catch (error) {
      setLoad(false);
      console.log("error", error);
    }
  };

  const handleCourseChange = async (values) => {
    setBatchList([]);
    setSectionList([]);
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
          return;
        }
        setBatchList(batchRes.data.message.data.batch);
        setClassList(batchRes.data.message.data.batch);
      }
    } catch (error) {
      console.log("error", error);
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
  const handleBatchChange = async (values, batch) => {
    console.log("values", values, batch);
    formikRef.current.setFieldTouched("batch", false);
    setSectionList([]);
    try {
      if (values) {
        let batchRes;
        if (collegeConfig.institution_type === 1) {
          batchRes = await StudentApi.getSectionList(
            values.course.id,
            batch.batchID
          );
          console.log("batchRes", batchRes);
        } else {
          batchRes = await StudentApi.getSectionList(
            values.course.id,
            batch.batchID
          );
          console.log("batchRes---------------", batchRes);
        }
        if (collegeConfig.institution_type === 1)
          setSectionList(batchRes.data.message);
        else setSectionList(batchRes.data.message);
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
      const masterRes2 = await StudentApi.getMaster(5, college_id);

      let combinedArray =
        masterRes2.data.message.data.particular_common_data.concat(
          masterRes2.data.message.data.particular_uncommon_data
        );
      setParticularList(combinedArray);
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
                        options={courseList}
                        mandatory={1}
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
                    {collegeConfig.institution_type === 1 ? (
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
                          handleBatchChange(values, text);
                          setFieldValue("section", "");
                          setFieldValue("batch", "");
                        }}
                      />
                    ) : (
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
                          handleBatchChange(values, text);
                        }}
                      />
                    )}
                    <SelectFieldFormik
                      label={RENAME?.section}
                      maxlength={2}
                      tabIndex={4}
                      id="section"
                      clear={true}
                      options={sectionList}
                      getOptionLabel={(option) => option.section}
                      getOptionValue={(option) => option.classID}
                      style={{ width: "25%" }}
                      matchFrom="start"
                      onChange={(text) => {
                        setFieldValue("section", text);
                        setShowRes(false);
                      }}
                    />

                    <SelectFieldFormik
                      label="Admission Type"
                      id="admissionType"
                      clear={true}
                      tabIndex={5}
                      options={admissionTypeList}
                      getOptionLabel={(option) => option.admissionType}
                      getOptionValue={(option) => option.id}
                      style={{ width: "50%" }}
                      onChange={(text) => {
                        setShowRes(false);
                        setFieldValue("admissionType", text);
                      }}
                    />

                    <SelectFieldFormik
                      label="Particular"
                      id="particular"
                      clear={true}
                      tabIndex={6}
                      options={particularList}
                      getOptionLabel={(option) => option.particular}
                      getOptionValue={(option) => option.id}
                      onChange={(text) => {
                        setShowRes(false);
                        setFieldValue("particular", text);
                      }}
                    />
                  </div>
                  <Button
                    text="Show"
                    tabIndex={7}
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
                              handleShow(values, 1, 2);
                            }}
                          >
                            Export Excel
                          </button>
                          &nbsp; &nbsp;
                          <button
                            className="btn"
                            onClick={(e) => {
                              handleShow(values, 1, 1);
                            }}
                          >
                            Export PDF
                          </button>
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
                                <th width="5%">Student No.</th>
                                <th>Student Name</th>
                                <th width="10%">Permission Upto</th>
                                <th width="5%">Opening Balance (₹)</th>
                                <th width="5%">Concession Amount (₹)</th>
                                <th width="5%">Paid Amount (₹)</th>
                                <th width="5%">Refund Amount (₹)</th>
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
                                          ? moment(item.permissionUpto).format(
                                              "DD-MM-YYYY"
                                            ) +
                                            " (₹" +
                                            item.PermissionAmount +
                                            ")"
                                          : ""}
                                      </td>
                                      <td align="right">
                                        {item.openingBalance}
                                      </td>
                                      <td align="right">
                                        {item.concessionAmount
                                          ? item.concessionAmount
                                          : 0}
                                      </td>
                                      <td align="right">{item.PaidAmount}</td>
                                      <td align="right">
                                        {item.refundAmount
                                          ? item.refundAmount
                                          : 0}
                                      </td>
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
                                    {refundTotal}
                                  </td>
                                  <td className="table-total" align="right">
                                    {dueTotal}
                                  </td>
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
export default DueAbstract;
