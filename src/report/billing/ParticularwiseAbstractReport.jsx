import React, { useEffect, useState, useRef, useContext } from "react";
import { Formik } from "formik";
import moment from "moment";
import * as Yup from "yup";

import AuthContext from "../../auth/context";

import StudentApi from "../../api/StudentApi";

import { boldStyle, topLineStyle } from "../../component/common/CommonArray";
import preFunction from "../../component/common/CommonFunction";
import CustomActivityIndicator from "../../component/common/CustomActivityIndicator";
import Button from "../../component/FormField/Button";
import ReactSelectField from "../../component/FormField/ReactSelectField";
import DateFieldFormik from "../../component/FormField/DateFieldFormik";
import string from "../../string";
import ScreenTitle from "../../component/common/ScreenTitle";
import ModalComponent from "../../component/ModalComponent";
import SelectFieldFormik from "../../component/FormField/SelectFieldFormik";

import { useSelector } from "react-redux";

function ParticularwiseAbstractReport() {
  const collegeConfig = useSelector((state) => state.web.college);
  const { collegeId, collegeName } = useContext(AuthContext);

  const [data, setData] = useState([]);
  const [dueData, setDueData] = useState([]);
  const [load, setLoad] = useState(false);
  const [particularList, setParticularList] = useState([]);

  const [headerKeys, setHeaderKeys] = useState([]);
  const [showRes, setShowRes] = useState(false);

  const [modalErrorOpen, setModalErrorOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [modalTitle, setModalTitle] = useState("");
  const [showAll, setShowAll] = useState(0);

  const formikRef = useRef();

  const reportSchema = Yup.object().shape({
    college: collegeConfig.is_university
      ? Yup.object().required("Please select College")
      : Yup.mixed().notRequired(),
    fromDate: Yup.string().required("Please select From Date"),
    toDate: Yup.string().required("Please select To Date"),
  });

  const handleCSVData = async (values, type) => {
    console.log("billParticularReport------", values);
    if (type == 1) {
      let filterContent = [
        [
          {
            content:
              "From Date : " +
              moment(formikRef.current.values.fromDate).format("DD-MM-YYYY") +
              "       To Date : " +
              moment(formikRef.current.values.toDate).format("DD-MM-YYYY"),
            styles: boldStyle,
          },
        ],
      ];

      formikRef.current.values.particular &&
        filterContent.push([
          {
            content:
              "Particular : " + formikRef.current.values.particular.particular,
            styles: boldStyle,
          },
        ]);

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
      console.log("head1", head1);
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
        "Bill Collection Report",
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
    if (type == 1) {
      values.map((item, index) => {
        csvData[index + 1] = [index + 1];
        headerKeys.map((itemList, keys) =>
          csvData[index + 1].push(item[headerKeys[keys]])
        );
      });
      preFunction.generatePDF(
        collegeName,
        "Particular Wise Abstract Report",
        csvData
      );
    } else {
      values.map((item, index) => {
        csvData[index + 1] = [
          index + 1,
          headerKeys.map((itemList, keys) => {
            return item[itemList];
          }),
        ];
      });
      preFunction.downloadCSV(csvData, "Particular Wise Abstract Report.csv");
    }
    setLoad(false);
  };

  const handleShow = async (values, report, showFull = 0) => {
    if (load) return;
    setDueData([]);
    if (report === 0 && showFull) {
      setShowAll(showFull);
    } else {
      setShowAll(0);
    }
    console.log("values-----", values);
    console.log("report-----", report);
    console.log("showAll-----", showFull);

    try {
      setShowRes(true);
      console.log("billParticular Values", values);
      if (report > 0 && (showAll == 1 || data.length < string.PAGE_LIMIT)) {
        handleCSVData(data, report);
        return;
      }
      setLoad(true);
      setData([]);
      setHeaderKeys([]);
      const billParticularWise = await StudentApi.particularWiseReport(
        collegeConfig.is_university ? values?.college?.collegeID : collegeId,
        moment(values.fromDate).format("yyyy-MM-DD"),
        moment(values.toDate).format("yyyy-MM-DD"),
        values?.particular?.id
      );
      console.log("billParticularList---", billParticularWise);
      if (!billParticularWise.data.message.success) {
        setModalMessage(billParticularWise.data.message.message);
        setModalTitle("Message");
        setModalErrorOpen(true);
        setLoad(false);
        return;
      }
      setData(
        billParticularWise.data.message.billing_collection_particularwise_report
      );
      if (report > 0) {
        handleCSVData(
          billParticularWise.data.message
            .billing_collection_particularwise_report,
          report
        );
        return;
      }
      if (
        billParticularWise.data.message.billing_collection_particularwise_report
          .length > 0
      ) {
        const keys = Object.keys(
          billParticularWise.data.message
            .billing_collection_particularwise_report[0]
        );
        console.log("keys", keys);
        setHeaderKeys(keys);
      }

      setLoad(false);
    } catch (error) {
      setLoad(false);
      console.log("error", error);
    }
  };

  const getAllMasterList = async () => {
    try {
      const particularMasterList = await StudentApi.getMaster(4, "");
      console.log("particularMasterList", particularMasterList);
      if (particularMasterList.data.message.success) {
        setParticularList(
          particularMasterList.data.message.data.particular_data
        );
      }
    } catch (error) {
      console.log("error", error);
    }
  };
  useEffect(() => {
    getAllMasterList();
  }, []);

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
            innerRef={formikRef}
            enableReinitialize={false}
            initialValues={{
              college: "",
              particular: "",
              fromDate: moment().subtract(1, "years").toDate(),
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
                    <div className="col-lg-2"></div>
                    <div className="col-lg-8 border p-3">
                      <div className="ps-3">
                        {collegeConfig.is_university && (
                          <SelectFieldFormik
                            autoFocus
                            tabIndex={0}
                            labelSize={3}
                            clear={true}
                            label="College"
                            id="college"
                            mandatory={1}
                            options={collegeConfig.collegeList}
                            getOptionLabel={(option) => option.collegeName}
                            getOptionValue={(option) => option.collegeID}
                            style={{ width: "60%" }}
                            searchIcon={false}
                            onChange={(text) => {
                              setShowRes(false);
                              setFieldValue("college", text);
                              setFieldValue("particular", "");
                              setParticularList([]);
                            }}
                          />
                        )}
                        <ReactSelectField
                          autoFocus={!collegeConfig.is_university}
                          label="Particular"
                          labelSize={3}
                          tabIndex={1}
                          id="particular"
                          value={values.particular}
                          searchIcon={false}
                          clear={true}
                          style={{ width: "80%" }}
                          options={particularList}
                          getOptionLabel={(option) => option.particular}
                          getOptionValue={(option) => option.id}
                          onChange={(text) => {
                            setShowRes(false);
                            setFieldValue("particular", text);
                          }}
                        />
                        <DateFieldFormik
                          label="From Date"
                          labelSize={3}
                          tabIndex={2}
                          id="fromDate"
                          mandatory={1}
                          onChange={(e) => {
                            setFieldValue("fromDate", e.target.value);
                            setShowRes(false);
                          }}
                          minDate={new Date(moment().subtract(6, "years"))}
                          maxDate={new Date()}
                          style={{ width: "20%" }}
                        />

                        <DateFieldFormik
                          label="To Date"
                          id="toDate"
                          labelSize={3}
                          tabIndex={3}
                          mandatory={1}
                          maxDate={new Date()}
                          minDate={values.fromDate}
                          onChange={(e) => {
                            setFieldValue("toDate", e.target.value);
                            setShowRes(false);
                          }}
                          style={{ width: "20%" }}
                        />
                      </div>
                      <Button
                        text="Show"
                        type="submit"
                        tabIndex={4}
                        onClick={() => {
                          preFunction.handleErrorFocus(errors);
                        }}
                      />
                    </div>
                  </div>
                  {showRes && (
                    <>
                      <div className="row no-gutters border p-3 mt-3">
                        <div className="row no-gutters totcntstyle">
                          {data.length > 0 || dueData.length > 0 ? (
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
                              {data.length > 0 && (
                                <thead>
                                  <tr>
                                    <th width="1%">No.</th>
                                    {headerKeys.map((keys, index) => (
                                      <th key={index} width={index > 0 && "5%"}>
                                        {preFunction.capitalizeFirst(keys)}{" "}
                                        {index > 0 && "(₹)"}
                                      </th>
                                    ))}
                                  </tr>
                                </thead>
                              )}
                              {data.length === 0 ? (
                                <tbody>
                                  <tr>
                                    <td colSpan={20} align="center">
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
                                        {headerKeys?.map((itemList, keys) => {
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
                              )}
                            </table>
                          </div>
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
export default ParticularwiseAbstractReport;
