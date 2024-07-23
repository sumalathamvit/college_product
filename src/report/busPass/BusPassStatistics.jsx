import React, { useContext, useEffect, useState } from "react";
import { Formik } from "formik";
import moment from "moment";
import { useSelector } from "react-redux";

import StudentApi from "../../api/StudentApi";

import preFunction from "../../component/common/CommonFunction";
import CustomActivityIndicator from "../../component/common/CustomActivityIndicator";
import blankProfile from "../../assests/png/blank-profile-picture.png";
import DisplayText from "../../component/FormField/DisplayText";
import { transportReportList } from "../../component/common/CommonArray";
import Button from "../../component/FormField/Button";
import ReactSelectField from "../../component/FormFieldLibrary/ReactSelectField";
import DateFieldFormik from "../../component/FormFieldLibrary/DateFieldFormik";
import SelectFieldFormik from "../../component/FormFieldLibrary/SelectFieldFormik";
import TextFieldFormik from "../../component/FormFieldLibrary/TextFieldFormik";
import CommonApi from "../../component/common/CommonApi";
import ScreenTitle from "../../component/common/ScreenTitle";
import ErrorMessage from "../../component/common/ErrorMessage";

import string from "../../string";
import AuthContext from "../../auth/context";

function BusPassStatistics() {
  const RENAME = useSelector((state) => state.web.rename);
  const [data, setData] = useState([]);
  const [load, setLoad] = useState(false);

  const [filterError, setFilterError] = useState(false);
  const [courseList, setCourseList] = useState([]);
  const [batchList, setBatchList] = useState([]);
  const [boardingPlace, setBoardingPlace] = useState([]);
  const [reportType, setReporType] = useState(transportReportList[0]);

  const [showRes, setShowRes] = useState(false);
  const [showLoadMore, setShowLoadMore] = useState(false);
  const [studentList, setStudentList] = useState([]);
  const [yearList, setYearList] = useState([]);
  const [passNoValidateError, setPassNoValidateError] = useState(false);
  const [passNoError, setPassNoError] = useState(false);
  const [dateError, setDateError] = useState(false);

  const { collegeName } = useContext(AuthContext);

  const handleCSVData = async (values, type) => {
    try {
      console.log("csvDataList-----", data, values);
      if (reportType.value == "student_bus_pass_register") {
        var csvData = [
          [
            "No.",
            "Student No.",
            "Student Name",
            RENAME?.year + " / Branch",
            "Reg. Date",
            "Boarding Place",
            "Pass No.",
            "Bill No.",
            "Amount",
            "Trans. co-or.",
            "A.O",
            "Principal",
            "Student Sign.",
          ],
        ];
        values.map((item, index) => {
          csvData[index + 1] = [
            index + 1,
            item.enrollNo,
            item.name,
            item.studyYear + " / " + item.courseName.split("-")[1],
            item.passRegisterDate
              ? moment(item.passRegisterDate).format("DD-MM-yyyy")
              : null,
            item.boardingPlace,
            item.passNo,
            null,
            item.amount,
            null,
            null,
            null,
            null,
          ];
        });
        var columnWidths = [3, 5, 10, 20, 7, 15, 5, 5, 5, 7, 3, 5, 10];
      }
      if (reportType.value == "student_bus_pass_batch_wise") {
        if (type == 1) {
          var pdfData = [
            [
              { content: "No." },
              { content: "Student No." },
              { content: "Student Name" },
              { content: RENAME?.year + " / Branch" },
              { content: "Reg. Date" },
              { content: "Boarding Place" },
              { content: "Pass No." },
              { content: "Bill No." },
              { content: "Amount" },
              { content: "Trans. co-or." },
              { content: "A.O" },
              { content: "Principal" },
              { content: "Student Sign." },
            ],
          ];
          values.map((item, index) => {
            if (
              index === 0 ||
              values[index - 1].studyYear !== item.studyYear ||
              values[index - 1].courseName.split("-")[1] !==
                item.courseName.split("-")[1]
            ) {
              pdfData.push([
                {
                  content: `${
                    item.courseName.split("-")[1] +
                    " / " +
                    item.studyYear +
                    " - " +
                    RENAME?.year
                  }`,
                  styles: { textColor: [50, 50, 50], fontStyle: "bold" },
                  colSpan: 13,
                },
              ]);
            }
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
                content: item.studyYear + " / " + item.courseName.split("-")[1],
              },
              {
                content: item.passRegisterDate
                  ? moment(item.passRegisterDate).format("DD-MM-yyyy")
                  : null,
              },
              {
                content: item.boardingPlace,
              },
              {
                content: item.passNo,
              },
              {
                content: "",
              },
              {
                content: item.amount,
              },

              {
                content: "",
              },
              {
                content: "",
              },
              {
                content: "",
              },
            ]);
          });
          var columnWidths = [3, 5, 10, 20, 7, 15, 5, 5, 5, 7, 3, 5, 10];
        } else {
          var csvData = [
            [
              "No.",
              "Student No.",
              "Student Name",
              RENAME?.year + " / Branch",
              "Reg. Date",
              "Boarding Place",
              "Pass No.",
              "Bill No.",
              "Amount",
              "Trans. co-or.",
              "A.O",
              "Principal",
              "Student Sign.",
            ],
          ];
          values.map((item, index) => {
            if (
              index === 0 ||
              values[index - 1].studyYear !== item.studyYear ||
              values[index - 1].courseName.split("-")[1] !==
                item.courseName.split("-")[1]
            ) {
              csvData.push([
                item.courseName.split("-")[1] +
                  " / " +
                  item.studyYear +
                  " - " +
                  RENAME?.year +
                  ", , , , , , , , , , , ,",
              ]);
            }

            csvData.push([
              index + 1,
              item.enrollNo,
              item.name,
              item.studyYear + " / " + item.courseName.split("-")[1],
              item.passRegisterDate
                ? moment(item.passRegisterDate).format("DD-MM-yyyy")
                : null,
              item.boardingPlace,
              item.passNo,
              null,
              item.amount,
              null,
              null,
              null,
              null,
            ]);
          });
          console.log("csvData", csvData);
        }
      }

      if (type == 1) {
        console.log("csvData", csvData);
        // return;
        preFunction.generatePDF(
          collegeName,
          reportType.label,
          reportType.value == "student_bus_pass_batch_wise" ? pdfData : csvData,
          columnWidths,
          false,
          "landscape"
        );
      } else {
        preFunction.downloadCSV(csvData, reportType.label);
      }
      setLoad(false);
    } catch (error) {
      console.log(error);
      setLoad(false);
    }
  };

  const handleShow = async (values, showAll = 0, report = 0) => {
    if (load) return;
    console.log("values", values);
    if (
      (values.batch == "" || !values.batch) &&
      (values.course == "" || !values.course) &&
      (values.enrollNo == "" || !values.enrollNo) &&
      (values.year == "" || !values.year) &&
      (values.passNoFrom == "" || !values.passNoFrom) &&
      (values.passNoTo == "" || !values.passNoTo) &&
      (values.fromDate == "" || !values.fromDate) &&
      (values.toDate == "" || !values.toDate) &&
      (values.boardingPlace == "" || !values.boardingPlace)
    ) {
      setFilterError(true);
      return;
    }

    if (
      (values.passNoFrom != "" && values.passNoFrom != null) ||
      (values.passNoTo != "" && values.passNoTo != null)
    ) {
      console.log("from to-------------");
      if (values.passNoFrom && values.passNoTo) {
        if (values.passNoFrom > values.passNoTo) {
          setPassNoValidateError(true);
          return;
        }
      } else {
        setPassNoError(true);
        return;
      }
    }

    if (
      (values.fromDate != "" && values.fromDate != null) ||
      (values.toDate != "" && values.toDate != null)
    ) {
      console.log("from to-------------");
      if (
        values.fromDate == "" ||
        values.fromDate == null ||
        values.toDate == "" ||
        values.toDate == null
      ) {
        setDateError(true);
        return;
      }
    }

    setShowRes(true);

    try {
      setLoad(true);
      const studentTransportRes = await StudentApi.getStudentTransportReport(
        sessionStorage.getItem("COLLEGE_ID"),
        reportType.value,
        values.course ? values.course.id : null,
        values.batch ? values.batch.batchID : null,
        values.year ? values.year.value : null,
        values.enrollNo ? values.enrollNo.enrollNo : null,
        values.boardingPlace ? values.boardingPlace.id : null,
        values.passNoFrom ? values.passNoFrom : null,
        values.passNoTo ? values.passNoTo : null,
        values.fromDate ? values.fromDate : null,
        values.toDate ? values.toDate : null,
        showAll == 1 ? 1 : 0
      );

      console.log("studentTransportRes", studentTransportRes);
      if (report) {
        handleCSVData(
          studentTransportRes.data.message.data.transportDetail,
          report
        );
      } else {
        setData([]);
        setData(studentTransportRes.data.message.data.transportDetail);
        setShowLoadMore(false);
        if (
          studentTransportRes.data.message.data.transportDetail.length ===
          string.PAGE_LIMIT
        ) {
          setShowLoadMore(true);
        }
      }

      setLoad(false);
    } catch (error) {
      setLoad(false);
      console.log("error", error);
    }
  };

  const getAllList = async () => {
    try {
      const masterList = await StudentApi.getMaster(5, "");
      console.log("MasterList5", masterList);
      setBoardingPlace(masterList.data.message.data.boarding_place_data);
      let batchDt = [];
      let passedBatchDt = [];
      for (let i = 0; i < masterList.data.message.data.batch_data.length; i++) {
        if (
          masterList.data.message.data.current_batch_data.findIndex(
            (x) =>
              x.batchID == masterList.data.message.data.batch_data[i].batchID
          ) == -1
        ) {
          passedBatchDt.push(masterList.data.message.data.batch_data[i]);
        } else {
          batchDt.push(masterList.data.message.data.batch_data[i]);
        }
      }

      let neededBatchList = [
        { label: "Current", options: batchDt },
        { label: "Passed Out", options: passedBatchDt },
      ];
      setCourseList(masterList.data.message.data.course_data);
      console.log("neededBatchList", neededBatchList);
      setBatchList(neededBatchList);

      const batch = neededBatchList[0].options[0].batch;
      const [batchStart, batchEnd] = batch.split(/\s*-\s*/).map(Number);
      const years = [];
      let count = 1;
      for (let year = batchStart; year < batchEnd; year++) {
        let counts = count++;
        years.push({ label: counts, value: counts });
      }
      console.log("yearList", years);
      setYearList(years);
    } catch (error) {
      console.log("error", error);
    }
  };

  const searchStudent = async (value) => {
    setStudentList(await CommonApi.searchStudent(value));
  };

  const handleClear = () => {
    setData([]);
    setShowRes(false);
    setFilterError(false);
  };

  useEffect(() => {
    getAllList();
  }, []);

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
            initialValues={{
              batch: "",
              course: "",
              enrollNo: "",
              boardingPlace: "",
              year: "",
              passNoFrom: "",
              passNoTo: "",
              fromDate: "",
              toDate: "",
            }}
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
                  <ReactSelectField
                    autoFocus
                    tabIndex={1}
                    label="Report Type"
                    id="reportType"
                    value={reportType}
                    search={false}
                    clear={false}
                    // mandatory={1}
                    maxlength={40}
                    style={{ width: "25%" }}
                    options={transportReportList}
                    onChange={(text) => {
                      setReporType(text);
                      // setShowRes(false);
                      handleClear();
                    }}
                  />
                  <div className="row no-gutters">
                    <div className="col-lg-6 p-0">
                      <div className="row">
                        <div className="col-lg-8 p-0 pe-2">
                          <SelectFieldFormik
                            tabIndex={11}
                            id="enrollNo"
                            maxlength={15}
                            label="Student Student No./Name"
                            searchIcon={true}
                            options={studentList}
                            getOptionLabel={(option) => option.name}
                            getOptionValue={(option) => option.id}
                            onInputChange={(inputValue) => {
                              searchStudent(inputValue);
                            }}
                            onChange={(text) => {
                              setFieldValue("enrollNo", text);
                              handleClear();
                            }}
                          />
                        </div>
                        <div className="col-lg-4 p-0  ps-2 pe-2">
                          <SelectFieldFormik
                            tabIndex={2}
                            label={RENAME?.batch}
                            id="batch"
                            maxlength={15}
                            // mandatory={1}
                            searchIcon={false}
                            options={batchList}
                            // clear={false}
                            getOptionLabel={(option) => option.batch}
                            getOptionValue={(option) => option.batchID}
                            onChange={(text) => {
                              setFieldValue("batch", text);
                              handleClear();
                            }}
                          />
                        </div>
                      </div>

                      <div className="row">
                        <div className="col-lg-9 p-0 pe-2">
                          <SelectFieldFormik
                            tabIndex={3}
                            id="course"
                            maxlength={15}
                            label={RENAME?.course}
                            // clear={
                            //   values.course?.courseName == "All" ? false : true
                            // }
                            searchIcon={false}
                            options={courseList}
                            getOptionLabel={(option) => option.courseName}
                            getOptionValue={(option) => option.id}
                            onChange={(text) => {
                              setFieldValue("course", text);
                              handleClear();
                            }}
                          />
                        </div>
                        <div className="col-lg-3 p-0 ps-2 pe-2">
                          <SelectFieldFormik
                            tabIndex={4}
                            id="year"
                            maxlength={15}
                            label={RENAME?.year}
                            searchIcon={false}
                            options={yearList}
                            onChange={(text) => {
                              setFieldValue("year", text);
                              handleClear();
                            }}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="col-lg-6 row p-0 ps-2">
                      <div className="col-lg-6 p-0">
                        <SelectFieldFormik
                          tabIndex={2}
                          label="Boarding Place"
                          id="boardingPlace"
                          maxlength={15}
                          // mandatory={1}
                          searchIcon={false}
                          options={boardingPlace}
                          // clear={false}
                          getOptionLabel={(option) => option.boardingPlace}
                          getOptionValue={(option) => option.id}
                          onChange={(text) => {
                            setFieldValue("boardingPlace", text);
                            handleClear();
                          }}
                        />
                      </div>
                      <div className="row col-lg-6 p-0  ps-2 pe-2">
                        <div className="col-lg-6 p-0  ps-2 pe-2">
                          <TextFieldFormik
                            label="Pass No. From"
                            id="passNoFrom"
                            maxlength={7}
                            onChange={(e) => {
                              setFieldValue("passNoFrom", e.target.value);
                              handleClear();
                              setPassNoError(false);
                            }}
                          />
                        </div>
                        <div className="col-lg-6 p-0  ps-2 pe-2">
                          <TextFieldFormik
                            label="Pass No. To"
                            id="passNoTo"
                            maxlength={7}
                            onChange={(e) => {
                              setFieldValue("passNoTo", e.target.value);
                              handleClear();
                              setPassNoError(false);
                            }}
                          />
                        </div>
                        <ErrorMessage
                          Message={"Choose both Pass No. From & To"}
                          view={passNoError}
                        />
                        <ErrorMessage
                          Message={
                            "Pass No. From should be lesser than Pass No. To"
                          }
                          view={passNoValidateError}
                        />
                      </div>

                      <div className="row p-0">
                        <div className="col-lg-3 p-0 pe-2">
                          <DateFieldFormik
                            tabIndex={14}
                            id="fromDate"
                            label="From Date"
                            minDate={""}
                            maxDate={new Date()}
                            onChange={(e) => {
                              setFieldValue("fromDate", e.target.value);
                              setDateError(false);
                              handleClear();
                            }}
                          />
                        </div>
                        <div className="col-lg-3 ps-2 p-0 ">
                          <DateFieldFormik
                            tabIndex={15}
                            id="toDate"
                            label="To Date"
                            minDate={new Date(values.fromDate)}
                            maxDate={new Date()}
                            labelSize={5}
                            onChange={(e) => {
                              setFieldValue("toDate", e.target.value);
                              setDateError(false);
                              handleClear();
                            }}
                          />
                        </div>
                        <div className="mt-1">
                          <ErrorMessage
                            Message={"Choose both Date From & To"}
                            view={dateError}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  {filterError && (
                    <div className="row no-gutters text-center mb-2 mt-1">
                      <ErrorMessage
                        Message={"Please apply atleast one filter"}
                        view={filterError}
                      />
                    </div>
                  )}
                  <div className="row no-gutters">
                    <div className="col-lg-6 text-right pe-1">
                      <Button
                        tabIndex={18}
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
                          setDateError(false);
                          setPassNoError(false);
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
                                  onClick={(e) => handleShow(values, 1, 2)}
                                  text="Export Excel"
                                />
                                <Button
                                  type="button"
                                  frmButton={false}
                                  onClick={(e) => handleShow(values, 1, 1)}
                                  text="Export PDF"
                                />
                              </div>
                            </div>
                          )}
                        </div>
                        <div className="table-responsive mt-4 p-0">
                          {reportType.value == "student_bus_pass"
                            ? data.map((item, index) => (
                                <div className="row mb-3" key={index}>
                                  <div className="col-lg-1"></div>
                                  <div className="col-lg-5">
                                    <div className={`view-card`}>
                                      <div className="text-center mt-3 card-head">
                                        Mailam Engineering College
                                      </div>
                                      <div className="text-center mt-3 card-subhead">
                                        Mailam , Villupurram District - 604 304.
                                      </div>

                                      <div className="box text-center mt-2">
                                        STUDENT BUS PASS
                                      </div>
                                      <div className="row mt-2 mb-2">
                                        <div className="col-lg-8">
                                          <DisplayText
                                            label="Pass No."
                                            value={item.passNo}
                                          />
                                          <DisplayText
                                            label="Name"
                                            value={item.name}
                                          />
                                          <DisplayText
                                            label="Student No."
                                            value={item.enrollNo}
                                          />
                                          <DisplayText
                                            label="Branch / Year"
                                            value={
                                              item.courseName.split("-")[1] +
                                              " / " +
                                              item.studyYear
                                            }
                                          />
                                          <DisplayText
                                            label="Boarding Place"
                                            value={item.boardingPlace}
                                          />
                                          <DisplayText
                                            label="Amount"
                                            value={item.amount}
                                          />
                                        </div>
                                        <div className="col-lg-4 ps-2 text-right">
                                          <img
                                            src={
                                              item.photo
                                                ? string.FILEURL + item.photo
                                                : blankProfile
                                            }
                                            alt=""
                                            height="150"
                                            width="150"
                                            // style={{ padding: 2 }}
                                          />
                                        </div>
                                        <div className="row">
                                          <label className="col-lg-8"></label>
                                          <div className="col-lg-4 text-center card-subhead">
                                            PRINCIPAL
                                          </div>
                                        </div>
                                      </div>

                                      {/* <hr className="card-line" />
                                      <div className="row mt-5 mb-1">
                                        <div className="col-lg-4 text-center card-subhead">
                                          Manager
                                        </div>
                                        <div className="col-lg-4 text-center card-subhead">
                                          Administrative Officer
                                        </div>
                                        <div className="col-lg-4 text-center card-subhead">
                                          Principal
                                        </div>
                                      </div> */}
                                    </div>
                                  </div>
                                  <div className="col-lg-5">
                                    <div className={`view-card`}>
                                      <div className="row mt-2 mb-2">
                                        <div className="col-lg-8">
                                          <div className="card-subhead mt-2">
                                            Address :
                                          </div>
                                          <div className="mt-2">
                                            {/* <br></br> */}
                                            {item.name}
                                            <br></br>
                                            {item.address1}
                                            {" , "}

                                            {item.address2}
                                            <br></br>
                                            {item.place}
                                            {" , "}
                                            {item.city}
                                            <br></br>
                                            {item.state}
                                            <br></br>
                                            {item.pincode}
                                            <br></br>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="col-lg-1"></div>
                                </div>
                              ))
                            : null}
                          {reportType.value == "student_bus_pass_register" ? (
                            <table
                              className="table table-bordered"
                              id="pdf-table"
                            >
                              <thead>
                                <tr>
                                  <th width="1%">No.</th>
                                  <th width="5%">Student No.</th>
                                  <th>Student Name</th>
                                  <th width="20%">Year / Branch</th>
                                  <th width="7%">Reg. Date</th>
                                  <th width="10%">Boarding Place</th>
                                  <th width="5%">Pass No.</th>
                                  <th width="5%">Bill No.</th>
                                  <th width="5%">Amount</th>
                                  <th width="5%">Trans. co-or.</th>
                                  <th width="5%">A.O</th>
                                  <th width="5%">Principal</th>
                                  <th width="5%">Student Sign.</th>
                                </tr>
                              </thead>
                              <tbody>
                                {data.length === 0 ? (
                                  <tr>
                                    <td align="center" colSpan={13}>
                                      No data found
                                    </td>
                                  </tr>
                                ) : (
                                  data.map((item, index) => {
                                    return (
                                      <>
                                        <tr key={index}>
                                          <td>{index + 1}</td>
                                          <td>{item.enrollNo}</td>
                                          <td>{item.name}</td>
                                          <td>
                                            {item.studyYear} /{" "}
                                            {item.courseName.split("-")[1]}
                                          </td>
                                          <td>
                                            {item.passRegisterDate
                                              ? moment(
                                                  item.passRegisterDate
                                                ).format("DD-MM-yyyy")
                                              : null}
                                          </td>
                                          <td>{item.boardingPlace}</td>
                                          <td>{item.passNo}</td>
                                          <td></td>
                                          <td>{item.amount}</td>
                                          <td></td>
                                          <td></td>
                                          <td></td>
                                          <td></td>
                                        </tr>
                                      </>
                                    );
                                  })
                                )}
                              </tbody>
                            </table>
                          ) : null}
                          {reportType.value == "student_bus_pass_batch_wise" ? (
                            <table
                              className="table table-bordered"
                              id="pdf-table"
                            >
                              <thead>
                                <tr>
                                  <th width="1%">No.</th>
                                  <th width="5%">Student No.</th>
                                  <th>Student Name</th>
                                  <th width="20%">Year / Branch</th>
                                  <th width="7%">Reg. Date</th>
                                  <th width="10%">Boarding Place</th>
                                  <th width="5%">Pass No.</th>
                                  <th width="5%">Bill No.</th>
                                  <th width="5%">Amount</th>
                                  <th width="5%">Trans. co-or.</th>
                                  <th width="5%">A.O</th>
                                  <th width="5%">Principal</th>
                                  <th width="5%">Student Sign.</th>
                                </tr>
                              </thead>
                              <tbody>
                                {data.length === 0 ? (
                                  <tr>
                                    <td align="center" colSpan={13}>
                                      No data found
                                    </td>
                                  </tr>
                                ) : (
                                  data.map((item, index) => {
                                    return (
                                      <>
                                        {index === 0 ||
                                        data[index - 1].studyYear !==
                                          item.studyYear ||
                                        data[index - 1].courseName.split(
                                          "-"
                                        )[1] !==
                                          item.courseName.split("-")[1] ? (
                                          <tr>
                                            <td
                                              colSpan={13}
                                              className="table-total"
                                            >
                                              {item.courseName.split("-")[1]} /{" "}
                                              {item.studyYear +
                                                " - " +
                                                RENAME?.year}
                                            </td>
                                          </tr>
                                        ) : null}
                                        <tr key={index}>
                                          <td>{index + 1}</td>
                                          <td>{item.enrollNo}</td>
                                          <td>{item.name}</td>
                                          <td>
                                            {item.studyYear} /{" "}
                                            {item.courseName.split("-")[1]}
                                          </td>
                                          <td>
                                            {item.passRegisterDate
                                              ? moment(
                                                  item.passRegisterDate
                                                ).format("DD-MM-yyyy")
                                              : null}
                                          </td>
                                          <td>{item.boardingPlace}</td>
                                          <td>{item.passNo}</td>
                                          <td></td>
                                          <td>{item.amount}</td>
                                          <td></td>
                                          <td></td>
                                          <td></td>
                                          <td></td>
                                        </tr>
                                      </>
                                    );
                                  })
                                )}
                              </tbody>
                            </table>
                          ) : null}
                          {showLoadMore && (
                            <div className="row text-right">
                              <Button
                                text="ShowAll"
                                type="button"
                                isTable={true}
                                onClick={(e) => handleShow(values, 1)}
                              />
                            </div>
                          )}
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
export default BusPassStatistics;
