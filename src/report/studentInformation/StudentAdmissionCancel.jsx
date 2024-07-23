import React, { useContext, useEffect, useRef, useState } from "react";
import moment from "moment";
import { Formik } from "formik";
import * as Yup from "yup";

import StudentApi from "../../api/StudentApi";

import preFunction from "../../component/common/CommonFunction";
import CustomActivityIndicator from "../../component/common/CustomActivityIndicator";
import Button from "../../component/FormField/Button";
import ScreenTitle from "../../component/common/ScreenTitle";
import string from "../../string";
import { useSelector } from "react-redux";
import SelectFieldFormik from "../../component/FormField/SelectFieldFormik";
import { boldStyle, topLineStyle } from "../../component/common/CommonArray";

import AuthContext from "../../auth/context";

function StudentAdmissionCancelReport() {
  const collegeConfig = useSelector((state) => state.web.college);
  const { collegeId, collegeName } = useContext(AuthContext);
  const RENAME = useSelector((state) => state.web.rename);

  const formikRef = useRef();

  const [data, setData] = useState([]);
  const [load, setLoad] = useState(false);
  const [showRes, setShowRes] = useState(false);
  const [showLoadMore, setShowLoadMore] = useState(false);
  const [yearOfAdmissionList, setYearOfAdmissionList] = useState([]);

  const reportSchema = Yup.object().shape({
    college: collegeConfig.is_university
      ? Yup.object().required("Please select College")
      : Yup.mixed().notRequired(),
    yearOfAdmission: Yup.object().required("Please select Year of Admission"),
  });

  const handleCSVData = async (dbValues, report) => {
    try {
      console.log("reportValues---", dbValues, report);
      if (report == 1) {
        let filterContent = [
          [
            {
              content:
                "Year of Admission : " +
                formikRef.current.values.yearOfAdmission.admnYear,
              styles: boldStyle,
            },
          ],
        ];
        let head1 = [];
        head1 = [
          [
            {
              content: "No.",
              styles: topLineStyle,
            },
            {
              content: "Student No.",
              styles: topLineStyle,
            },
            {
              content: "Student Name",
              styles: topLineStyle,
            },
            {
              content: RENAME.sem,
              styles: topLineStyle,
            },
            {
              content: "Cancel Date",
              styles: topLineStyle,
            },
            {
              content: "Reason",
              styles: topLineStyle,
            },
          ],
        ];
        let pdfData = [];
        dbValues.map((item, index) => {
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
              content: item.className,
            },
            {
              content: moment(item.issueDate).format("DD-MM-YYYY"),
            },
            {
              content: item.leavingReason,
            },
          ]);
        });

        let pdfHeadToPass = [[], [...head1]];
        let pdfDataToPass = [filterContent, [...pdfData]];
        let columnWidth = [5, 15, 25, 10, 15, 30];
        let colWidthToPass = [[], [...columnWidth]];

        preFunction.generatePDFContent(
          formikRef.current.values.college
            ? formikRef.current.values.college.collegeName
            : collegeName,
          "Admission Cancel Report",
          pdfHeadToPass,
          pdfDataToPass,
          colWidthToPass
        );
        return;
      }
      let csvData = [
        [
          "No.",
          "Student No.",
          "Student Name",
          RENAME.sem,
          "Cancel Date",
          "Reason",
        ],
      ];
      dbValues.map((item, index) => {
        csvData[index + 1] = [
          index + 1,
          item.enrollNo,
          item.name,
          item.className,
          moment(item.issueDate).format("DD-MM-YYYY"),
          item.leavingReason,
        ];
      });
      if (report == 1) {
        preFunction.generatePDF(
          collegeName,
          "Admission Cancel Report",
          csvData
        );
      } else {
        preFunction.downloadCSV(csvData, "Admission Cancel Report" + ".csv");
      }
    } catch (error) {
      console.log("error", error);
    }
  };

  const handleShow = async (values, showAll, report) => {
    if (load) return;
    try {
      console.log(values, "values");
      console.log("showAll---", showAll);

      setLoad(true);
      setShowRes(true);
      const getAdmissionCancel = await StudentApi.getAdmissionCancel(
        collegeConfig.is_university ? values?.college?.collegeID : collegeId,
        values.yearOfAdmission.admnYear,
        showAll ? 1 : 0
      );
      console.log("getAdmissionCancel---", getAdmissionCancel);

      if (report > 0) {
        handleCSVData(
          getAdmissionCancel.data.message.data.admission_cancel_report,
          report
        );
      } else {
        setData(getAdmissionCancel.data.message.data.admission_cancel_report);
        setShowLoadMore(false);
        if (
          getAdmissionCancel.data.message.data.admission_cancel_report >
            string.PAGE_LIMIT &&
          showAll == 0
        ) {
          setShowLoadMore(true);
        }
      }
      setLoad(false);
    } catch (error) {
      setLoad(false);
      console.log(error);
    }
  };

  const getAllList = async () => {
    try {
      const masterRes = await StudentApi.getMaster(1);
      console.log("Master----", masterRes, RENAME);
      if (masterRes.data.message.data.year_data.length > 0) {
        setYearOfAdmissionList(masterRes.data.message.data.year_data);
      }
    } catch (error) {
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
        <div className="row no-gutters mt-1">
          <Formik
            enableReinitialize={true}
            innerRef={formikRef}
            initialValues={{
              college: "",
              yearOfAdmission: "",
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
                  <div className="col-lg-10">
                    {collegeConfig.is_university && (
                      <SelectFieldFormik
                        autoFocus
                        tabIndex={1}
                        labelSize={3}
                        clear={true}
                        label="College"
                        id="college"
                        mandatory={1}
                        options={collegeConfig.collegeList}
                        getOptionLabel={(option) => option.collegeName}
                        getOptionValue={(option) => option.collegeID}
                        style={{ width: "80%" }}
                        searchIcon={false}
                        onChange={(text) => {
                          setShowRes(false);
                          setFieldValue("college", text);
                          setFieldValue("yearOfAdmission", "");
                        }}
                      />
                    )}

                    <SelectFieldFormik
                      autoFocus={collegeConfig.is_university ? false : true}
                      tabIndex={2}
                      labelSize={3}
                      label="Year of Admission"
                      placeholder={"Year"}
                      id="yearOfAdmission"
                      mandatory={1}
                      options={yearOfAdmissionList}
                      getOptionLabel={(option) => option.admnYear}
                      getOptionValue={(option) => option.admnYear}
                      style={{ width: "25%" }}
                      onChange={(text) => {
                        setShowRes(false);
                        setFieldValue("yearOfAdmission", text);
                      }}
                    />
                  </div>

                  <Button tabindex={3} text="Show" isTable={true} />

                  {showRes ? (
                    <div className="row border p-3 mt-4">
                      <div className="row col-lg-6 totcntstyle p-0 mb-2"></div>
                      <>
                        {data.length > 0 && (
                          <div className=" col-lg-6 p-0 text-right mb-3">
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

                        <div className="table-responsive p-0">
                          <table className="table table-bordered report-table table-bordered">
                            <thead>
                              <tr>
                                <th width="1%">No.</th>
                                <th width="5%">Student No.</th>
                                <th width="35%">Student Name</th>
                                <th width="5%">{RENAME.sem}</th>
                                <th width="10%">Cancel Date</th>
                                <th>Reason</th>
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
                                      <td>{item.className}</td>
                                      <td>
                                        {moment(item.issueDate).format(
                                          "DD-MM-YYYY"
                                        )}
                                      </td>
                                      <td>{item.leavingReason}</td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            )}
                          </table>
                          {showLoadMore && (
                            <Button
                              text="Show All"
                              onClick={(e) => handleShow(values, 1)}
                            />
                          )}
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
export default StudentAdmissionCancelReport;
