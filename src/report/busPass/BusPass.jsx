import React, { useContext, useEffect, useState, useRef } from "react";
import { Formik } from "formik";
import * as Yup from "yup";
import moment from "moment";

import StudentApi from "../../api/StudentApi";

import preFunction from "../../component/common/CommonFunction";
import CustomActivityIndicator from "../../component/common/CustomActivityIndicator";
import blankProfile from "../../assests/png/blank-profile-picture.png";
import DisplayText from "../../component/FormField/DisplayText";
import Button from "../../component/FormField/Button";
import DateFieldFormik from "../../component/FormFieldLibrary/DateFieldFormik";
import SelectFieldFormik from "../../component/FormFieldLibrary/SelectFieldFormik";
import TextFieldFormik from "../../component/FormFieldLibrary/TextFieldFormik";

import ScreenTitle from "../../component/common/ScreenTitle";
import ErrorMessage from "../../component/common/ErrorMessage";
import string from "../../string";
import AuthContext from "../../auth/context";
import CommonApi from "../../component/common/CommonApi";
import { useSelector } from "react-redux";
import BusPassPDFDetail from "../../component/BusPassPDF";
import PdfComponent from "../../component/common/PdfComponent";

function BusPass() {
  const RENAME = useSelector((state) => state.web.rename);
  const collegeConfig = useSelector((state) => state.web.college);
  const formikRef = useRef();
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
  const [openModal, setOpenModal] = useState(false);

  const { collegeName, collegeId } = useContext(AuthContext);
  const { instituteArray } = useContext(AuthContext);
  const [pdfContent, setPdfContent] = useState("");
  const [address, setAddress] = useState();

  let year = 0;

  const reportSchema = Yup.object().shape({
    college: collegeConfig.is_university
      ? Yup.object().required("Please select College")
      : Yup.mixed().notRequired(),
  });

  const handleReprint = async () => {
    setOpenModal(true);
    setTimeout(() => {
      setOpenModal(false);
    }, 100);
  };

  const handleShow = async (values, showAll = 0, report = 0) => {
    if (load) return;
    console.log("values", values);
    if (
      (values.batch == "" || !values.batch) &&
      (values.course == "" || !values.course) &&
      (values.enrollNo == "" || !values.enrollNo) &&
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
        "student_bus_pass",
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
      setData([]);
      setData(studentTransportRes.data.message.data.transportDetail);

      if (moment().format("MM") > 5) {
        year = parseInt(moment().format("YYYY")) + 1;
      } else {
        year = parseInt(moment().format("YYYY"));
      }

      let pdfContent =
        studentTransportRes.data.message.data.transportDetail.map(
          (item, index) => {
            return (
              <BusPassPDFDetail
                collegeName={
                  values.college ? values.college.collegeName : collegeName
                }
                studentData={item}
                year={year}
                address={address}
              />
            );
          }
        );

      setPdfContent(pdfContent);
      setShowLoadMore(false);
      if (
        studentTransportRes.data.message.data.transportDetail.length ===
        string.PAGE_LIMIT
      ) {
        setShowLoadMore(true);
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
    console.log("collegeConfig", collegeConfig);
    try {
      setLoad(true);
      const masterRes = await StudentApi.getMaster(5, college_id);
      console.log("MasterRes----", masterRes);
      setBoardingPlace(masterRes.data.message.data.boarding_place_data);
      setCourseList(masterRes.data.message.data.course_data);
      if (masterRes.data.message.data.course_data.length == 1) {
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
        setBatchList(masterRes.data.message.data.all_batch_data);
      }
      setLoad(false);
    } catch (error) {
      setLoad(false);
      console.log("error", error);
    }
  };

  const handleAddress = () => {
    const addressParts = collegeConfig?.address?.split(",");
    let firstPart =
      addressParts[0] + " , " + addressParts[1] + " , " + addressParts[2];
    let secondPart = addressParts[3] ? addressParts.slice(3).join(",") : "";
    if (firstPart.length > 45) {
      firstPart = addressParts[0] + " , " + addressParts[1];
      secondPart = addressParts[2] ? addressParts.slice(2).join(",") : "";
    }
    setAddress({ firstPart, secondPart });
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
    handleAddress();
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
                              // setFieldValue("year", "");
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
                              searchIcon={false}
                              options={batchList}
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
                          searchIcon={false}
                          options={boardingPlace}
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
                          <div className="col-lg-6"></div>
                          {data.length > 0 && (
                            <div className="col-lg-6">
                              <div className="text-right">
                                <Button
                                  isTable={true}
                                  type="button"
                                  frmButton={false}
                                  onClick={(e) => handleReprint()}
                                  text="Print"
                                />
                              </div>
                            </div>
                          )}
                        </div>
                        <div className="table-responsive mt-4 p-0">
                          {data.length > 0
                            ? data.map((item, index) => (
                                <div className="row mb-3" key={index}>
                                  <div className="col-lg-1"></div>
                                  <div className="col-lg-5 p-3 border">
                                    <div className="bus-pass-card">
                                      <div className="col-12 text-center mt-2 mb-2">
                                        <div
                                          style={{
                                            color: "#30583e",
                                            fontSize: "20px",
                                          }}
                                        >
                                          <div
                                            style={{
                                              zIndex: 1,
                                              position: "absolute",
                                              paddingLeft: 40,
                                            }}
                                          >
                                            <img
                                              src={
                                                instituteArray &&
                                                instituteArray.find((obj) =>
                                                  obj.name == values.college
                                                    ? values.college.collegeName
                                                    : collegeName
                                                )?.logo
                                              }
                                              width={50}
                                              height={50}
                                            />
                                          </div>
                                          {instituteArray &&
                                            instituteArray.find((obj) =>
                                              obj.name == values.college
                                                ? values.college.collegeName
                                                : collegeName
                                            )?.name}
                                        </div>
                                        <div className="text-center">
                                          {address?.firstPart}
                                        </div>
                                        <div className="text-center">
                                          {address?.secondPart}
                                        </div>
                                      </div>
                                      <div className="border-top"></div>

                                      <div className="fw-bolder text-danger text-center mt-1">
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
                                            label={
                                              RENAME.course +
                                              " / " +
                                              RENAME.year
                                            }
                                            value={
                                              item.department +
                                              " / " +
                                              item.className
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
                                        <div className="col-lg-4 ps-2 text-center mt-2">
                                          <img
                                            src={
                                              item.photo
                                                ? string.FILEURL + item.photo
                                                : blankProfile
                                            }
                                            alt=""
                                            height="100"
                                            width="100"
                                          />
                                        </div>
                                        <div className="row">
                                          <label className="col-lg-8"></label>
                                          <div className="col-lg-4 text-center text-danger fw-bolder">
                                            PRINCIPAL
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="col-lg-5 border p-3">
                                    <div className="bus-pass-card">
                                      <div className="row mt-2 mb-2">
                                        <div className="col-lg-8">
                                          <div className="mt-2 fw-bolder text-primary">
                                            Address :
                                          </div>
                                          <div className="mt-2 text-primary">
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
                                        <div className="mt-5 text-danger fw-bolder text-center bg-warning">
                                          Validity : Upto - May {year}
                                        </div>
                                        <div
                                          className="bonafide-completion-bold ms-2 text-success"
                                          style={{ marginTop: "20%" }}
                                        >
                                          {collegeConfig.fifth_line}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="col-lg-1"></div>
                                </div>
                              ))
                            : null}
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
        {openModal ? (
          <PdfComponent
            printContent={pdfContent}
            handleClick={() => {
              setOpenModal(false);
            }}
          />
        ) : null}
      </div>
    </div>
  );
}
export default BusPass;
