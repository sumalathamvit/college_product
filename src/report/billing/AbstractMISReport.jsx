import React, { useState, useRef, useContext } from "react";
import { Formik } from "formik";
import moment from "moment";
import * as Yup from "yup";

import AuthContext from "../../auth/context";

import StudentApi from "../../api/StudentApi";

import { topLineStyle } from "../../component/common/CommonArray";
import preFunction from "../../component/common/CommonFunction";
import CustomActivityIndicator from "../../component/common/CustomActivityIndicator";
import Button from "../../component/FormField/Button";
import DateFieldFormik from "../../component/FormField/DateFieldFormik";

import ScreenTitle from "../../component/common/ScreenTitle";
import ModalComponent from "../../component/ModalComponent";
import SelectFieldFormik from "../../component/FormField/SelectFieldFormik";

import { useSelector } from "react-redux";

function AbstractMISReport() {
  const collegeConfig = useSelector((state) => state.web.college);
  const { collegeId, collegeName } = useContext(AuthContext);

  const [data, setData] = useState([]);
  const [load, setLoad] = useState(false);

  const [headerKeys, setHeaderKeys] = useState([]);
  const [showAllButton, setShowAllButton] = useState(false);
  const [showRes, setShowRes] = useState(false);

  const [modalErrorOpen, setModalErrorOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [modalTitle, setModalTitle] = useState("");

  const formikRef = useRef();

  const reportSchema = Yup.object().shape({
    college: collegeConfig.is_university
      ? Yup.object().required("Please select College")
      : Yup.mixed().notRequired(),
    fromDate: Yup.string().required("Please select From Date"),
    toDate: Yup.string().required("Please select To Date"),
  });

  const handleCSVData = async (values, type) => {
    if (type == 1) {
      let filterContent = [
        [
          {
            content: " ",
            styles: { topLineStyle },
          },
        ],
      ];

      let head1 = [
        headerKeys.map((keys, index) => {
          console.log("keys", keys, index);
          return {
            content: preFunction.capitalizeFirst(keys),
            styles:
              index === 0 ? topLineStyle : { ...topLineStyle, halign: "right" },
          };
        }),
      ];

      let pdfData = [];

      values.map((item, index) => {
        let pdfData1 = [];
        headerKeys.map((itemList, keys) => {
          pdfData1.push({
            content:
              keys === 0
                ? item[itemList]
                : preFunction.formatIndianNumber(item[itemList]),
            styles: keys > 0 ? { halign: "right" } : {},
          });
        });
        pdfData.push(pdfData1);
      });

      let pdfHeadToPass = [[], head1];

      let pdfDataToPass = [filterContent, pdfData];

      preFunction.generatePDFContent(
        formikRef.current.values.college
          ? formikRef.current.values.college.collegeName
          : collegeName,
        "Abstract Report",
        pdfHeadToPass,
        pdfDataToPass
      );
      return;
    }
    const csvData = [["No."]];
    headerKeys.map((keys) => {
      csvData[0].push(keys);
    });
    console.log("csvData", csvData);

    values.map((item, index) => {
      console.log("item", item);
      console.log("index", index);
      csvData[index + 1] = [
        index + 1,
        headerKeys.map((itemList, keys) => {
          console.log("itemlist", itemList, keys);
          return item[itemList];
        }),
      ];
    });
    preFunction.downloadCSV(csvData, "Billing Abstract MIS Report.csv");
  };

  const handleShow = async (values, report, showFull = 0) => {
    if (load) return;
    console.log("values-----", values);
    console.log("report-----", report);
    console.log("showAll-----", showFull);
    try {
      setShowRes(true);
      console.log("billMIS Values", values);
      if (report > 0) {
        handleCSVData(data, report);
        return;
      }

      setHeaderKeys([]);
      setLoad(true);
      const billingMisReport = await StudentApi.billAbstractMisReport(
        collegeConfig.is_university ? values?.college?.collegeID : collegeId,
        moment(values.fromDate).format("yyyy-MM-DD"),
        moment(values.toDate).format("yyyy-MM-DD")
      );
      console.log("billingMISList---", billingMisReport);
      if (!billingMisReport.data.message.success) {
        setModalMessage(billingMisReport.data.message.message);
        setModalTitle("Message");
        setModalErrorOpen(true);
        setLoad(false);
        return;
      }
      setData(billingMisReport.data.message.billing_abstract_mis_report);

      const keys = Object.keys(
        billingMisReport.data.message.billing_abstract_mis_report[0]
      );
      console.log("keys", keys);
      setHeaderKeys(keys);

      setShowAllButton(false);

      setLoad(false);
    } catch (error) {
      setLoad(false);
      console.log("error", error);
    }
  };

  return (
    <div className="content-area-report" onClick={preFunction.hideNavbar}>
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
            innerRef={formikRef}
            enableReinitialize={false}
            initialValues={{
              college: null,
              fromDate: moment().subtract(1, "months").toDate(),
              toDate: moment(),
            }}
            validationSchema={reportSchema}
            onSubmit={(values) => {
              handleShow(values, 0, 0);
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
                  <div className="row no-gutters mb-2">
                    {collegeConfig.is_university && (
                      <SelectFieldFormik
                        autoFocus
                        tabIndex={0}
                        labelSize={2}
                        clear={true}
                        label="College"
                        id="college"
                        mandatory={1}
                        style={{ width: "70%" }}
                        options={collegeConfig.collegeList}
                        getOptionLabel={(option) => option.collegeName}
                        getOptionValue={(option) => option.collegeID}
                        searchIcon={false}
                        onChange={(text) => {
                          setShowRes(false);
                          setFieldValue("college", text);
                        }}
                      />
                    )}

                    <DateFieldFormik
                      autoFocus={!collegeConfig.is_university}
                      label="From Date"
                      labelSize={2}
                      tabIndex={1}
                      id="fromDate"
                      mandatory={1}
                      onChange={(e) => {
                        setFieldValue("fromDate", e.target.value);
                        setShowRes(false);
                      }}
                      minDate={new Date(moment().subtract(6, "years"))}
                      maxDate={values.toDate}
                      style={{ width: "30%" }}
                    />

                    <DateFieldFormik
                      label="To Date"
                      id="toDate"
                      mandatory={1}
                      labelSize={2}
                      tabIndex={2}
                      maxDate={new Date()}
                      minDate={values.fromDate}
                      onChange={(e) => {
                        setFieldValue("toDate", e.target.value);
                        setShowRes(false);
                      }}
                      style={{ width: "30%" }}
                    />
                  </div>
                  <Button
                    text="Show"
                    type="submit"
                    tabIndex={3}
                    onClick={() => {
                      preFunction.handleErrorFocus(errors);
                    }}
                  />
                  {showRes && (
                    <>
                      <div className="row no-gutters border p-3 mt-3">
                        <div className="row no-gutters totcntstyle">
                          {data.length > 0 ? (
                            <>
                              <div className="col-lg-12">
                                <div className="text-right">
                                  <Button
                                    type="button"
                                    frmButton={false}
                                    isTable={true}
                                    className="btn me-2"
                                    onClick={() => handleShow(values, 2, 1)}
                                    text="Export Excel"
                                  />
                                  <Button
                                    type="button"
                                    isTable={true}
                                    frmButton={false}
                                    className="btn ms-2"
                                    onClick={(e) => handleShow(values, 1, 1)}
                                    text="Export PDF"
                                  />
                                </div>
                              </div>
                            </>
                          ) : null}
                        </div>
                        <div>
                          <div className="table-responsive">
                            <table
                              className="table table-bordered table-hover report-table"
                              id="pdf-table"
                            >
                              <thead>
                                <tr>
                                  <th width="1%">No.</th>
                                  {headerKeys.map((keys, index) => (
                                    <th key={index} width={index > 0 && "5%"}>
                                      {keys} (₹)
                                    </th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody>
                                {data.map((item, index) => {
                                  return (
                                    <tr key={index}>
                                      <td>{index + 1}</td>
                                      {headerKeys.map((itemList, keys) => {
                                        return (
                                          <td align={keys > 0 && "right"}>
                                            {keys === 0
                                              ? item[itemList]
                                              : item[itemList]
                                              ? preFunction.formatIndianNumber(
                                                  item[itemList]
                                                )
                                              : "0"}
                                          </td>
                                        );
                                      })}
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                          {showAllButton && (
                            <>
                              <div className="row text-right mt-2">
                                <Button
                                  text="Show All"
                                  type="button"
                                  isTable={true}
                                  onClick={(e) => {
                                    handleShow(values, 0, 1);
                                  }}
                                />
                              </div>
                            </>
                          )}
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
    </div>
  );
}
export default AbstractMISReport;
