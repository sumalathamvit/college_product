import React, { useEffect, useState, useContext, useRef } from "react";
import { Formik } from "formik";
import * as Yup from "yup";
import moment from "moment";
import { useSelector } from "react-redux";

import AuthContext from "../../../auth/context";

import empApi from "../../../api/EmployeeApi";

import ModalComponent from "../../../component/ModalComponent";
import preFunction from "../../../component/common/CommonFunction";
import CustomActivityIndicator from "../../../component/common/CustomActivityIndicator";
import Button from "../../../component/FormField/Button";
import DateFieldFormik from "../../../component/FormField/DateFieldFormik";
import SelectFieldFormik from "../../../component/FormField/SelectFieldFormik";
import ScreenTitle from "../../../component/common/ScreenTitle";
import {
  boldStyle,
  topLineStyle,
  bottomLineStyle,
  totStyle,
} from "../../../component/common/CommonArray";

function SalaryStatementReport() {
  const formikRef = useRef();
  const [data, setData] = useState([]);
  const [load, setLoad] = useState(false);

  const [showRes, setShowRes] = useState(false);
  const [categoryList, setCategoryList] = useState([]);
  const [headingData, setHeadingData] = useState([]);
  const [modalErrorOpen, setModalErrorOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [modalTitle, setModalTitle] = useState("");

  const { collegeId, collegeName } = useContext(AuthContext);
  const collegeConfig = useSelector((state) => state.web.college);

  const reportSchema = Yup.object().shape({
    college: collegeConfig.is_university
      ? Yup.object().required("Please select College")
      : Yup.mixed().notRequired(),
    salaryMonth: Yup.date()
      .min(
        moment().subtract(10, "years").toDate(),
        `The Payroll Month should be  ${moment()
          .subtract(10, "years")
          .format("MM-YYYY")}`
      )
      .max(
        moment().toDate(),
        `The Payroll Month should be  ${moment().format("MM-YYYY")} or before`
      )
      .required("Please select Payroll Month"),
  });

  const handleCSVData = async (exportData, type, values) => {
    console.log("exportData", exportData);

    try {
      setLoad(true);

      var pdfData = [];

      if (type === 2) {
        // pdfData[0].push(["No.", "Designation Category"]);
        pdfData[0] = ["No.", "Designation Category"];
        headingData.map((item) => {
          if (item !== "custom_designation_category") {
            pdfData[0].push(item);
          }
        });
        pdfData[0].push("Net Salary");
      } else {
        var filterContent = [];

        filterContent.push([
          {
            content: `Payroll Month : ${moment(values.salaryMonth).format(
              "MMM-YYYY"
            )}`,
            styles: boldStyle,
          },
        ]);

        values.designationCategory &&
          filterContent.push([
            {
              content: `Designation Category : ${values.designationCategory}`,
              styles: boldStyle,
            },
          ]);
        console.log("headingData", headingData);
        var head1 = [
          [
            { content: "No.", styles: topLineStyle },
            { content: "Designation Category", styles: topLineStyle },
          ],
        ];
        headingData.map((item) => {
          if (item !== "custom_designation_category") {
            head1[0].push({ content: item, styles: topLineStyle });
          }
        });
        head1[0].push({ content: "Net Salary", styles: topLineStyle });

        var footerContent = [];

        footerContent.push([
          {
            content: "Prepared By HR",
            // add padding top,
            styles: { ...bottomLineStyle, halign: "left" },
          },
          {
            content: "Accountant",
            styles: { ...bottomLineStyle, halign: "left" },
          },
          {
            content: "Accounts Officer",
            styles: bottomLineStyle,
          },
          {
            content: "Manager",
            styles: bottomLineStyle,
          },
          {
            content: "Administrative Officer",
            styles: bottomLineStyle,
          },
          {
            content: "Director",
            styles: bottomLineStyle,
          },
          {
            content: "Chairman",
            styles: { ...bottomLineStyle, halign: "right" },
          },
        ]);
      }

      exportData.map((item, index) => {
        pdfData.push([
          index + 1,
          ...headingData.map((heading) => {
            if (type == 1) {
              return {
                content: item[heading] === 0 ? "-" : item[heading],
                styles: { halign: "center" },
              };
            } else {
              return item[heading] === 0 ? "-" : item[heading];
            }
          }),
          item["Earnings Total"] - item["Deduction Total"],
        ]);
      });

      if (type === 1) {
        pdfData.push([
          {
            content: "Total : ",
            styles: { ...totStyle, halign: "left" },
            // colSpan: 2,
          },
          ...headingData.map((heading) => {
            if (heading !== "custom_designation_category") {
              // push it like total
              return {
                content: exportData.reduce(
                  (acc, item) => acc + item[heading],
                  0
                ),
                styles: { ...totStyle, halign: "center" },
              };
            }
          }),
          {
            content: exportData.reduce(
              (acc, item) =>
                acc + (item["Earnings Total"] - item["Deduction Total"]),
              0
            ),
            styles: { ...totStyle, halign: "center" },
          },
        ]);
      } else {
        pdfData.push([
          "Total",
          ...headingData.map((heading) => {
            if (heading !== "custom_designation_category") {
              return exportData.reduce((acc, item) => acc + item[heading], 0);
            }
          }),
          exportData.reduce(
            (acc, item) =>
              acc + (item["Earnings Total"] - item["Deduction Total"]),
            0
          ),
        ]);
      }

      if (type === 2) {
        preFunction.downloadCSV(pdfData, "Salary Statement Category Wise.csv");
      } else {
        let pdfHeadToPass = [[], [...head1]];
        let pdfDataToPass = [filterContent, [...pdfData], [...footerContent]];

        // var columnWidth = [5, 8, 15, 15, 22, 13, 15, 7];

        // let colWidthToPass = [[], [...columnWidth]];

        preFunction.generatePDFContent(
          collegeName,
          "Salary Statement Category Wise",
          pdfHeadToPass,
          pdfDataToPass,
          [],
          "Landscape",
          "a3"
        );
      }

      setLoad(false);
    } catch (error) {
      setLoad(false);
      console.log("error", error);
    }
  };

  const handleShow = async (values) => {
    console.log("values", values);
    setShowRes(true);
    try {
      setLoad(true);

      let fromDate = moment(values.salaryMonth)
        .startOf("month")
        .format("YYYY-MM-DD");
      let toDate = moment(values.salaryMonth)
        .endOf("month")
        .format("YYYY-MM-DD");

      const statementRes = await empApi.getSalaryStatement(
        collegeConfig.is_university ? values.college.collegeID : collegeId,
        fromDate,
        toDate,
        values.designationCategory
          ? values.designationCategory.designationCategory
          : null
      );

      console.log("studentRes", statementRes);

      if (statementRes.data.message.success) {
        let data =
          statementRes.data.message.data.employee_salary_statement_report;
        setData(data);
        setHeadingData(Object.keys(data[0]));
      } else {
        setModalErrorOpen(true);
        setModalMessage(statementRes.data.message.message);
        setModalTitle("Message");
      }

      setLoad(false);
    } catch (error) {
      setLoad(false);
      console.log("error", error);
    }
  };

  const getAllList = async (collegeId) => {
    try {
      if (collegeId) {
        const masterList = await empApi.getAllMasters(2, collegeId);
        console.log("MasterList----", masterList);
        setCategoryList(masterList.data.message.data.designationCategory);
      }
    } catch (error) {
      console.log("error", error);
    }
  };

  const handleClear = () => {
    setData([]);
    setShowRes(false);
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
      <ModalComponent
        title={modalTitle}
        isOpen={modalErrorOpen}
        message={modalMessage}
        okClick={() => setModalErrorOpen(false)}
      />
      <div className="row no-gutters bg-white-report">
        <ScreenTitle titleClass={"page-heading-position-report"} />
        <div className="row no-gutters mt-1">
          <Formik
            enableReinitialize={false}
            innerRef={formikRef}
            initialValues={{
              college: "",
              salaryMonth: moment().subtract(1, "months").format("yyyy-MM"),
              designationCategory: "",
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
                  {collegeConfig.institution_type !== 1 ? (
                    <>
                      {collegeConfig.is_university ? (
                        <SelectFieldFormik
                          autoFocus
                          tabIndex={1}
                          label="College"
                          id="college"
                          mandatory={1}
                          options={collegeConfig.collegeList}
                          getOptionLabel={(option) => option.collegeName}
                          getOptionValue={(option) => option.collegeID}
                          style={{ width: "60%" }}
                          searchIcon={false}
                          clear={false}
                          onChange={(text) => {
                            setFieldValue("college", text);
                            getAllList(text ? text.collegeID : null);
                          }}
                        />
                      ) : null}
                    </>
                  ) : null}
                  <DateFieldFormik
                    label="Payroll Month"
                    type="month"
                    id="salaryMonth"
                    tabIndex={collegeConfig.institution_type == 1 ? 1 : 2}
                    style={{ width: "20%" }}
                    maxDate={new Date()}
                    minDate={new Date(moment().subtract(10, "years"))}
                    mandatory={1}
                    onChange={(e) => {
                      setFieldValue("salaryMonth", e.target.value);
                    }}
                  />
                  <SelectFieldFormik
                    label="Designation Category"
                    id="designationCategory"
                    tabIndex={collegeConfig.institution_type === 1 ? 2 : 3}
                    clear={true}
                    getOptionLabel={(option) => option.designationCategory}
                    getOptionValue={(option) => option.designationCategory}
                    options={categoryList}
                    onChange={(text) => {
                      setFieldValue("designationCategory", text);
                      handleClear();
                    }}
                    maxlength={15}
                    style={{ width: "50%" }}
                  />

                  <div className="row no-gutters">
                    <div className="col-lg-6 text-right pe-1">
                      <Button
                        tabIndex={collegeConfig.institution_type === 1 ? 7 : 8}
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
                  {showRes ? (
                    <>
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
                                  onClick={(e) =>
                                    handleCSVData(data, 2, values)
                                  }
                                  text="Export Excel"
                                />
                                <Button
                                  type="button"
                                  frmButton={false}
                                  onClick={(e) => {
                                    handleCSVData(data, 1, values);
                                  }}
                                  text="Export PDF"
                                />
                              </div>
                            </div>
                          )}
                        </div>
                        <div className="table-responsive mt-4 p-0">
                          <table
                            className="table table-bordered"
                            // id="pdf-table"
                          >
                            <thead>
                              <tr>
                                <th width="5%">No.</th>
                                <th>Designation Category</th>
                                {headingData.map((item, index) => {
                                  if (item !== "custom_designation_category") {
                                    return <th>{item}</th>;
                                  }
                                })}
                                <th>Net Salary</th>
                              </tr>
                            </thead>
                            <tbody>
                              {data.length === 0 ? (
                                <tr>
                                  <td align="center" colSpan={50}>
                                    No data found
                                  </td>
                                </tr>
                              ) : (
                                <>
                                  {data.map((item, index) => (
                                    <tr key={index}>
                                      <td>{index + 1}</td>
                                      {headingData.map((heading, i) => (
                                        <td key={i}>
                                          {item[heading] === 0
                                            ? "-"
                                            : item[heading]}
                                        </td>
                                      ))}
                                      <td>
                                        {item["Earnings Total"] -
                                          item["Deduction Total"]}
                                      </td>
                                    </tr>
                                  ))}
                                  <tr>
                                    <th colSpan={2}>Total</th>
                                    {headingData.map((heading, i) => {
                                      if (
                                        heading !==
                                        "custom_designation_category"
                                      ) {
                                        return (
                                          <>
                                            <td className="table-total">
                                              {data.reduce(
                                                (acc, item) =>
                                                  acc + item[heading],
                                                0
                                              )}
                                            </td>
                                          </>
                                        );
                                      }
                                    })}

                                    <td className="table-total">
                                      {data.reduce(
                                        (acc, item) =>
                                          acc +
                                          (item["Earnings Total"] -
                                            item["Deduction Total"]),
                                        0
                                      )}
                                    </td>
                                  </tr>
                                </>
                              )}
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
export default SalaryStatementReport;
