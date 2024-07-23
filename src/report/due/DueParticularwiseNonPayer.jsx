import React, { useEffect, useState, useRef, useContext } from "react";
import { Formik } from "formik";
import { useSelector } from "react-redux";
import * as Yup from "yup";

import StudentApi from "../../api/StudentApi";
import AcademicApi from "../../api/AcademicApi";

import preFunction from "../../component/common/CommonFunction";
import CustomActivityIndicator from "../../component/common/CustomActivityIndicator";
import Button from "../../component/FormField/Button";
import SelectFieldFormik from "../../component/FormField/SelectFieldFormik";
import ScreenTitle from "../../component/common/ScreenTitle";

import AuthContext from "../../auth/context";
import {
  boldStyle,
  lineWhiteStyle,
  topLineStyle,
  totStyle,
} from "../../component/common/CommonArray";

function DueParticularwiseNonPayer() {
  const RENAME = useSelector((state) => state.web.rename);
  const formikRef = useRef();
  const [data, setData] = useState([]);
  const [load, setLoad] = useState(false);
  const [courseList, setCourseList] = useState([]);
  const [batchList, setBatchList] = useState([]);
  const [classList, setClassList] = useState([]);
  const [particularList, setParticularList] = useState([]);
  const [showRes, setShowRes] = useState(false);
  const [showLoadMore, setShowLoadMore] = useState(false);

  const collegeConfig = useSelector((state) => state.web.college);
  const { collegeId, collegeName } = useContext(AuthContext);

  const reportSchema = Yup.object().shape({
    college: collegeConfig.is_university
      ? Yup.object().required("Please select College")
      : Yup.mixed().notRequired(),
  });

  const handleDueAbstractCSVData = async (values, report) => {
    console.log("values---", values);
    setLoad(true);
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
        formikRef.current.values.particular ||
        formikRef.current.values.class
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
              (formikRef.current.values.particular
                ? "Particular: " +
                  formikRef.current.values.particular.particular
                : ""),
            styles: boldStyle,
          },
        ]);
      }
      let head1 = [
        [
          { content: "No.", styles: topLineStyle },
          { content: "Student No.", styles: topLineStyle },
          { content: "Student Name", styles: topLineStyle },
          { content: "Particulars", styles: topLineStyle },
          {
            content: "Opening Bal (Rs.)",
            styles: { ...topLineStyle, halign: "right" },
          },
          {
            content: "Concession (Rs.)",
            styles: { ...topLineStyle, halign: "right" },
          },
          {
            content: "Paid Amt (Rs.)",
            styles: { ...topLineStyle, halign: "right" },
          },
          {
            content: "Refund Amt (Rs.)",
            styles: { ...topLineStyle, halign: "right" },
          },
          {
            content: "Due Amt (Rs.)",
            styles: { ...topLineStyle, halign: "right" },
          },
        ],
      ];

      let pdfData = [];
      pdfData.push([
        {
          content: "Due Type : Excess Paid",
          colSpan: 7,
        },
      ]);
      values.excess_fees.map((item, index) => {
        pdfData.push([
          {
            content: index + 1,
          },
          {
            content: item.enrollNo,
          },
          {
            content: item.name,
          },
          {
            content: item.particular,
          },
          {
            content: item.openingBalance,
            styles: { halign: "right" },
          },
          {
            content: item.concession,
            styles: { halign: "right" },
          },
          {
            content: item.PaidAmount,
            styles: { halign: "right" },
          },
          {
            content: item.refundAmount,
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
          content: "Due Type : Fully Paid",
          colSpan: 7,
        },
      ]);
      values.fully_paid.map((item, index) => {
        pdfData.push([
          {
            content: values.excess_fees.length + index + 1,
          },
          {
            content: item.enrollNo,
          },
          {
            content: item.name,
          },
          {
            content: item.particular,
          },
          {
            content: item.openingBalance,
            styles: { halign: "right" },
          },
          {
            content: item.concession,
            styles: { halign: "right" },
          },
          {
            content: item.PaidAmount,
            styles: { halign: "right" },
          },
          {
            content: item.refundAmount,
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
          content: "Due Type : Non Payer",
          colSpan: 7,
        },
      ]);
      values.non_paid.map((item, index) => {
        pdfData.push([
          {
            content:
              values.fully_paid.length + values.excess_fees.length + index + 1,
          },
          {
            content: item.enrollNo,
          },
          {
            content: item.name,
          },
          {
            content: item.particular,
          },
          {
            content: item.openingBalance,
            styles: { halign: "right" },
          },
          {
            content: item.concession,
            styles: { halign: "right" },
          },
          {
            content: item.PaidAmount,
            styles: { halign: "right" },
          },
          {
            content: item.refundAmount,
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
          content: "Due Type : Partially Paid",
          colSpan: 7,
        },
      ]);
      values.partially_paid.map((item, index) => {
        pdfData.push([
          {
            content:
              values.non_paid.length +
              values.fully_paid.length +
              values.excess_fees.length +
              index +
              1,
          },
          {
            content: item.enrollNo,
          },
          {
            content: item.name,
          },
          {
            content: item.particular,
          },
          {
            content: item.openingBalance,
            styles: { halign: "right" },
          },
          {
            content: item.concessionAmount,
            styles: { halign: "right" },
          },
          {
            content: item.PaidAmount,
            styles: { halign: "right" },
          },
          {
            content: item.refundAmount,
            styles: { halign: "right" },
          },
          {
            content: item.DueAmount,
            styles: { halign: "right" },
          },
        ]);
      });

      let pdfHeadToPass = [[], [...head1]];

      let pdfDataToPass = [filterContent, [...pdfData]];

      let columnWidth = [5, 10, 15, 20, 10, 10, 10, 10, 10];
      let colWidthToPass = [[], [...columnWidth]];

      preFunction.generatePDFContent(
        formikRef.current.values.college
          ? formikRef.current.values.college.collegeName
          : collegeName,
        "Due Particular wise Non Payer",
        pdfHeadToPass,
        pdfDataToPass,
        colWidthToPass,
        "landscape"
      );

      setLoad(false);
      return;
    } else {
      console.log("reportValues---", values);
      var csvData = [
        [
          "No.",
          "Student No.",
          "Student Name",
          "Particulars",
          "Opening Balance",
          "Concession Amount",
          "Paid Amount",
          "Refund Amount",
          "Due Amount",
        ],
      ];
      const rowData = ["Due Type : Excess Paid", "", "", "", "", "", ""];
      csvData.push(rowData);
      values.excess_fees.map((item, index) => {
        csvData[index + 2] = [
          index + 1,
          item.enrollNo,
          item.name,
          item.particular,
          item.openingBalance,
          item.concession,
          item.PaidAmount,
          item.refundAmount,
          item.DueAmount,
        ];
      });
      const rowData1 = ["Due Type : Fully Paid", "", "", "", "", "", ""];
      csvData.push(rowData1);
      values.fully_paid.map((item, index) => {
        csvData[values.excess_fees.length + index + 3] = [
          values.excess_fees.length + index + 1,
          item.enrollNo,
          item.name,
          item.particular,
          item.openingBalance,
          item.concession,
          item.PaidAmount,
          item.refundAmount,
          item.DueAmount,
        ];
      });
      const rowData2 = ["Due Type : Non Payer", "", "", "", "", "", ""];
      csvData.push(rowData2);
      values.non_paid.map((item, index) => {
        csvData[
          values.fully_paid.length + values.excess_fees.length + index + 4
        ] = [
          values.fully_paid.length + values.excess_fees.length + index + 1,
          item.enrollNo,
          item.name,
          item.particular,
          item.openingBalance,
          item.concession,
          item.PaidAmount,
          item.refundAmount,
          item.DueAmount,
        ];
      });
      const rowData3 = ["Due Type : Partially Paid", "", "", "", "", "", ""];
      csvData.push(rowData3);
      values.partially_paid.map((item, index) => {
        csvData[
          values.non_paid.length +
            values.fully_paid.length +
            values.excess_fees.length +
            index +
            5
        ] = [
          values.non_paid.length +
            values.fully_paid.length +
            values.excess_fees.length +
            index +
            1,
          item.enrollNo,
          item.name,
          item.particular,
          item.openingBalance,
          item.concessionAmount,
          item.PaidAmount,
          item.refundAmount,
          item.DueAmount,
        ];
      });
      preFunction.downloadCSV(csvData, "Due Particular wise Non Payer.csv");
    }
    setLoad(false);
  };

  const handleShow = async (values, showAll = 1, report = 0) => {
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

      const dueNonPayerRes = await StudentApi.getNonPayerDueReport(
        values.course ? values.course.id : null,
        values.batch ? values.batch.batchID : null,
        collegeConfig.institution_type === 1 && values.class
          ? values.class.semester
          : null,
        values.particular ? values.particular.id : null,
        showAll,
        collegeConfig.is_university ? values.college.collegeID : collegeId
      );
      console.log("dueNonPayerRes ---", dueNonPayerRes);
      setData(dueNonPayerRes.data.message.data);
      if (report) {
        handleDueAbstractCSVData(dueNonPayerRes.data.message.data, report);
      }
      // if (showAll === 0) {
      //   if (dueNonPayerRes.data.message.data.length >= string.PAGE_LIMIT)
      //     setShowLoadMore(true);
      // }

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
              course: "",
              particular: "",
            }}
            validationSchema={reportSchema}
            onSubmit={(values) => {
              handleShow(values, 1);
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
                          getAllList(text?.collegeID);
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
                        clear={true}
                        options={courseList}
                        getOptionLabel={(option) => option.courseName}
                        getOptionValue={(option) => option.id}
                        onChange={(text) => {
                          setFieldValue("course", text);
                          setFieldValue("batch", "");
                          setFieldValue("class", "");
                          handleCourseChange(text);
                          setShowRes(false);
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
                        }}
                      />
                    )}

                    <SelectFieldFormik
                      label="Particular"
                      id="particular"
                      tabIndex={4}
                      clear={true}
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
                    tabIndex={5}
                    onClick={() => preFunction.handleErrorFocus(errors)}
                    type="submit"
                  />
                  {showRes ? (
                    <div className="row no-gutters border p-3 mt-3">
                      {/* {data.length > 0 && ( */}
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
                      {/* )} */}
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
                                <th width="15%">Student Name</th>
                                <th>Particulars</th>
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
                                          <td align="right">
                                            {item.openingBalance}
                                          </td>
                                          <td align="right">
                                            {item.concession
                                              ? item.concession
                                              : 0}
                                          </td>
                                          <td align="right">
                                            {item.PaidAmount}
                                          </td>
                                          <td align="right">
                                            {item.refundAmount}
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
                                    {"Due Type : Fully Paid"}
                                  </td>
                                </tr>
                                {data.fully_paid.length > 0 ? (
                                  <>
                                    {data.fully_paid.map((item, index) => {
                                      let Count = 0;
                                      Count = Count + data.excess_fees.length;
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
                                            {item.concession
                                              ? item.concession
                                              : 0}
                                          </td>
                                          <td align="right">
                                            {item.PaidAmount}
                                          </td>
                                          <td align="right">
                                            {item.refundAmount}
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
                                      let Count = 0;
                                      Count =
                                        Count +
                                        data.excess_fees.length +
                                        data.fully_paid.length +
                                        index +
                                        1;
                                      return (
                                        <tr key={index}>
                                          <td>{Count}</td>
                                          <td>{item.enrollNo}</td>
                                          <td>{item.name}</td>
                                          <td>{item.particular}</td>
                                          <td align="right">
                                            {item.openingBalance}
                                          </td>
                                          <td align="right">
                                            {item.concession
                                              ? item.concession
                                              : 0}
                                          </td>
                                          <td align="right">
                                            {item.PaidAmount}
                                          </td>
                                          <td align="right">
                                            {item.refundAmount}
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
                                    {data.partially_paid.map((item, index) => {
                                      let Count = 0;
                                      Count =
                                        Count +
                                        data.excess_fees.length +
                                        data.fully_paid.length +
                                        data.non_paid.length +
                                        index +
                                        1;
                                      return (
                                        <tr key={index}>
                                          <td>{Count}</td>
                                          <td>{item.enrollNo}</td>
                                          <td>{item.name}</td>
                                          <td>{item.particular}</td>
                                          <td align="right">
                                            {item.openingBalance}
                                          </td>
                                          <td align="right">
                                            {item.concessionAmount}
                                          </td>
                                          <td align="right">
                                            {item.PaidAmount}
                                          </td>
                                          <td align="right">
                                            {item.refundAmount}
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
export default DueParticularwiseNonPayer;
