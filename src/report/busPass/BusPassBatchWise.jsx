import React, { useContext, useEffect, useState, useRef } from "react";
import { Formik } from "formik";
import moment from "moment";
import { useSelector } from "react-redux";
import * as Yup from "yup";

import StudentApi from "../../api/StudentApi";

import preFunction from "../../component/common/CommonFunction";
import CustomActivityIndicator from "../../component/common/CustomActivityIndicator";
import Button from "../../component/FormField/Button";
import DateFieldFormik from "../../component/FormFieldLibrary/DateFieldFormik";
import SelectFieldFormik from "../../component/FormFieldLibrary/SelectFieldFormik";
import TextFieldFormik from "../../component/FormFieldLibrary/TextFieldFormik";
import CommonApi from "../../component/common/CommonApi";

import ScreenTitle from "../../component/common/ScreenTitle";
import ErrorMessage from "../../component/common/ErrorMessage";
import string from "../../string";
import AuthContext from "../../auth/context";
import { boldStyle, topLineStyle } from "../../component/common/CommonArray";

function BusPassBatchWise() {
  const RENAME = useSelector((state) => state.web.rename);
  const collegeConfig = useSelector((state) => state.web.college);
  const [data, setData] = useState([]);
  const [load, setLoad] = useState(false);

  const [filterError, setFilterError] = useState(false);
  const [courseList, setCourseList] = useState([]);
  const [batchList, setBatchList] = useState([]);
  const [boardingPlace, setBoardingPlace] = useState([]);

  const [showRes, setShowRes] = useState(false);
  const [showLoadMore, setShowLoadMore] = useState(false);
  const [studentList, setStudentList] = useState([]);
  const [passNoValidateError, setPassNoValidateError] = useState(false);
  const [passNoError, setPassNoError] = useState(false);
  const [dateError, setDateError] = useState(false);
  const formikRef = useRef();

  const { collegeName, collegeId } = useContext(AuthContext);

  const reportSchema = Yup.object().shape({
    college: collegeConfig.is_university
      ? Yup.object().required("Please select College")
      : Yup.mixed().notRequired(),
  });

  const handleCSVData = async (exportData, values, type) => {
    try {
      console.log("csvDataList-----", data, values, exportData, type);

      if (type == 2) {
        let csvData = [];

        csvData.push([
          "No.",
          "Student No.",
          "Student Name",
          RENAME?.course + " / " + RENAME?.sem,
          "Reg. Date",
          "Boarding Place",
          "Pass No.",
          "Amount",
          // "Trans. co-or.",
          // "A.O",
          "Principal",
          "Student Sign.",
        ]);

        exportData.map((item, index) => {
          if (
            index == 0 ||
            exportData[index - 1].className !== item.className ||
            exportData[index - 1].courseName !== item.courseName
          ) {
            csvData.push([
              item.courseName +
                " / " +
                item.className +
                ", , , , , , , , , , , ,",
            ]);
          }

          csvData.push([
            index + 1,
            item.enrollNo,
            item.name,
            item.courseName + " / " + item.className,
            item.passRegisterDate
              ? moment(item.passRegisterDate).format("DD-MM-yyyy")
              : null,
            item.boardingPlace,
            item.passNo,
            item.amount,
            null,
            null,
          ]);
        });

        preFunction.downloadCSV(
          csvData,
          "Student Bus Pass Register Batch Wise"
        );
      } else {
        let pdfData = [];
        let filterContent = [];

        (values.course || values.batch) &&
          filterContent.push([
            {
              content:
                (values.course
                  ? `   Course : ${values.course.courseName}`
                  : "") +
                (values.batch ? `   Batch : ${values.batch.batch}` : ""),
              styles: boldStyle,
            },
          ]);

        (values.boardingPlace || values.passNoFrom || values.passNoTo) &&
          filterContent.push([
            {
              content:
                (values.boardingPlace
                  ? `Boarding Place : ${values.boardingPlace.boardingPlace}`
                  : "") +
                (values.passNoFrom
                  ? `   Pass No. From : ${values.passNoFrom}`
                  : "") +
                (values.passNoTo ? `   Pass No. To : ${values.passNoTo}` : ""),
              styles: boldStyle,
            },
          ]);

        (values.enrollNo || values.fromDate || values.toDate) &&
          filterContent.push([
            {
              content:
                (values.enrollNo
                  ? `Student No./Name : ${values.enrollNo.enrollNo}`
                  : "") +
                (values.fromDate
                  ? `   From Date : ${moment(values.fromDate).format(
                      "DD-MM-yyyy"
                    )}`
                  : "") +
                (values.toDate
                  ? `  To Date : ${moment(values.toDate).format("DD-MM-yyyy")}`
                  : ""),
              styles: boldStyle,
            },
          ]);

        var head1 = [
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
              content: RENAME?.course + " / " + RENAME?.sem,
              styles: topLineStyle,
            },
            {
              content: "Reg. Date",
              styles: topLineStyle,
            },
            {
              content: "Boarding Place",
              styles: topLineStyle,
            },
            {
              content: "Pass No.",
              styles: topLineStyle,
            },
            {
              content: "Amount",
              styles: topLineStyle,
            },
            // {
            //   content: "Trans. co-or.",
            //   styles: topLineStyle,
            // },
            // {
            //   content: "A.O",
            //   styles: topLineStyle,
            // },
            {
              content: "Principal",
              styles: topLineStyle,
            },
            {
              content: "Student Sign.",
              styles: topLineStyle,
            },
          ],
        ];
        exportData.map((item, index) => {
          if (
            index == 0 ||
            exportData[index - 1].className !== item.className ||
            exportData[index - 1].courseName !== item.courseName
          ) {
            pdfData.push([
              {
                content: `${item.courseName + " / " + item.className}`,
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
              content: item.name.substr(0, 19),
            },
            {
              content: item.courseName.substr(0, 31) + " / " + item.className,
            },
            {
              content: item.passRegisterDate
                ? moment(item.passRegisterDate).format("DD-MM-yyyy")
                : null,
            },
            {
              content: item.boardingPlace.substr(0, 35),
            },
            {
              content: item.passNo,
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
          ]);
        });
        console.log("pdfData", pdfData, [...pdfData]);
        let pdfHeadToPass = [[], [...head1]];
        let pdfDataToPass = [filterContent, [...pdfData]];

        var columnWidth = [3, 10, 13, 20, 7, 18, 7, 6, 8, 9];

        let colWidthToPass = [[], [...columnWidth]];

        preFunction.generatePDFContent(
          values.college ? values.college.collegeName : collegeName,
          "Student Bus Pass Register Batch Wise",
          pdfHeadToPass,
          pdfDataToPass,
          colWidthToPass,
          "landscape"
        );
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
      // (values.year == "" || !values.year) &&
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
        values.college ? values.college.collegeID : collegeId,
        "student_bus_pass_batch_wise",
        values.course ? values.course.id : null,
        collegeConfig.institution_type !== 1 && values.batch
          ? values.batch.batchID
          : null,
        collegeConfig.institution_type === 1 && values.batch
          ? values.batch.semester
          : null,
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
          values,
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

  const handleCourse = async (values, course) => {
    setBatchList([]);
    if (course) {
      const classRes = await StudentApi.getMaster(8, collegeId, course.id);
      console.log("classRes", classRes);
      setBatchList(classRes.data.message.data.semester_data);
    } else {
      if (values?.college) getAllList(values?.college.collegeID);
    }
  };

  const getAllList = async (college_id) => {
    try {
      setLoad(true);

      const masterRes = await StudentApi.getMaster(5, college_id);
      console.log("MasterRes----", masterRes);
      setBoardingPlace(masterRes.data.message.data.boarding_place_data);
      setCourseList(masterRes.data.message.data.course_data);
      if (masterRes.data.message.data.course_data.length === 1) {
        formikRef.current.setFieldValue(
          "course",
          masterRes.data.message.data.course_data[0]
        );
        handleCourse(
          formikRef.current.values,
          masterRes.data.message.data.course_data[0]
        );
      }
      if (collegeConfig.institution_type !== 1) {
        console.log("here------");
        setBatchList(masterRes.data.message.data.all_batch_data);
      }
      setLoad(false);
    } catch (error) {
      setLoad(false);
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
        <div className="row no-gutters mt-1">
          <Formik
            enableReinitialize={true}
            innerRef={formikRef}
            initialValues={{
              college: "",
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
                  <div className="row col-lg-10">
                    {collegeConfig.is_university && (
                      <SelectFieldFormik
                        autoFocus
                        tabIndex={1}
                        labelSize={3}
                        // clear={true}
                        label="College"
                        id="college"
                        mandatory={1}
                        options={collegeConfig.collegeList}
                        getOptionLabel={(option) => option.collegeName}
                        getOptionValue={(option) => option.collegeID}
                        style={{ width: "39%" }}
                        searchIcon={false}
                        onChange={(text) => {
                          setFieldValue("college", text);
                          setFieldValue("course", "");
                          setFieldValue("batch", "");
                          setBatchList([]);
                          setCourseList([]);
                          getAllList(text?.collegeID);
                          handleClear();
                        }}
                      />
                    )}
                  </div>

                  <div className="row no-gutters">
                    <div className="col-lg-6 p-0">
                      <div className="row">
                        <div className="col-lg-8 p-0 pe-2">
                          <SelectFieldFormik
                            tabIndex={2}
                            id="course"
                            maxlength={40}
                            label={RENAME?.course}
                            searchIcon={false}
                            options={courseList}
                            getOptionLabel={(option) => option.courseName}
                            getOptionValue={(option) => option.id}
                            onChange={(text) => {
                              setFieldValue("course", text);
                              setFieldValue("year", "");
                              handleCourse(values, text);
                              handleClear();
                            }}
                          />
                        </div>
                        <div className="col-lg-4 p-0 ps-2 pe-2">
                          {collegeConfig.institution_type === 1 ? (
                            <SelectFieldFormik
                              tabIndex={3}
                              label={RENAME?.sem}
                              id="batch"
                              maxlength={15}
                              mandatory={0}
                              searchIcon={false}
                              options={batchList}
                              getOptionLabel={(option) => option.className}
                              getOptionValue={(option) => option.semester}
                              onChange={(text) => {
                                setFieldValue("batch", text);
                                handleClear();
                              }}
                            />
                          ) : (
                            <SelectFieldFormik
                              tabIndex={3}
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
                          )}
                        </div>
                      </div>

                      <div className="row">
                        <div className="col-lg-12 p-0 pe-2">
                          <SelectFieldFormik
                            tabIndex={4}
                            id="enrollNo"
                            maxlength={15}
                            label="Student No./Name"
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
                      </div>
                    </div>
                    <div className="col-lg-6 row p-0 ps-2">
                      <div className="col-lg-6 p-0">
                        <SelectFieldFormik
                          tabIndex={5}
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
                            tabIndex={6}
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
                            tabIndex={7}
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
                            tabIndex={8}
                            id="fromDate"
                            label="From Date"
                            dateStyle={true}
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
                            tabIndex={9}
                            id="toDate"
                            label="To Date"
                            dateStyle={true}
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
                        tabIndex={10}
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
                          <div className="row col-lg-6 totcntstyle p-0 mb-2"></div>
                          {data.length > 0 && (
                            <div className="col-lg-6 mb-3">
                              <div className="text-right">
                                <Button
                                  frmButton={false}
                                  isTable={true}
                                  className={"btn me-3"}
                                  type="button"
                                  onClick={(e) => handleShow(values, 1, 2)}
                                  text="Export Excel"
                                />
                                <Button
                                  type="button"
                                  isTable={true}
                                  frmButton={false}
                                  onClick={(e) => handleShow(values, 1, 1)}
                                  text="Export PDF"
                                />
                              </div>
                            </div>
                          )}
                        </div>
                        <div className="table-responsive p-0">
                          <table
                            className="table table-bordered"
                            id="pdf-table"
                          >
                            <thead>
                              <tr>
                                <th width="1%">No.</th>
                                <th width="5%">Student No.</th>
                                <th width="22%">Student Name</th>
                                <th width="29%">
                                  {RENAME?.course + " / " + RENAME?.sem}
                                </th>
                                <th width="10%">Reg. Date</th>
                                <th width="13%">Boarding Place</th>
                                <th width="5%">Pass No.</th>
                                <th width="5%">Amount</th>
                                {/* <th width="5%">Trans. co-or.</th>
                                <th width="5%">A.O</th> */}
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
                                      data[index - 1].className !==
                                        item.className ||
                                      data[index - 1].courseName !==
                                        item.courseName ? (
                                        <tr>
                                          <td
                                            colSpan={13}
                                            className="table-total"
                                          >
                                            {item.courseName} / {item.className}
                                          </td>
                                        </tr>
                                      ) : null}
                                      <tr key={index}>
                                        <td>{index + 1}</td>
                                        <td>{item.enrollNo}</td>
                                        <td>{item.name}</td>
                                        <td>
                                          {item.courseName} / {item.className}
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
                                        <td>{item.amount}</td>
                                        <td></td>
                                        <td></td>
                                      </tr>
                                    </>
                                  );
                                })
                              )}
                            </tbody>
                          </table>
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
export default BusPassBatchWise;
