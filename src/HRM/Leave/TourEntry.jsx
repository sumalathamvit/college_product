import React, { useEffect, useRef, useState, useContext } from "react";
import moment from "moment";
import DateRangeIcon from "@mui/icons-material/DateRange";
import { toast } from "react-toastify";
import * as Yup from "yup";
import { Formik } from "formik";
import { useSelector } from "react-redux";

import empApi from "../../api/EmployeeApi";

import ErrorMessage from "../../component/common/ErrorMessage";
import preFunction from "../../component/common/CommonFunction";
import CustomActivityIndicator from "../../component/common/CustomActivityIndicator";
import ReactSelectField from "../../component/FormField/ReactSelectField";
import Button from "../../component/FormField/Button";
import DateFieldFormik from "../../component/FormField/DateFieldFormik";
import DisplayText from "../../component/FormField/DisplayText";
import ModalComponent from "../../component/ModalComponent";
import AuthContext from "../../auth/context";

import EmployeeCard from "../EmployeeCard";
import ScreenTitle from "../../component/common/ScreenTitle";
import storage from "../../auth/storage";

function TourEntry() {
  const formikRef = useRef();

  const [load, setLoad] = useState(false);
  const [numofDays, setNumofDays] = useState(0);
  const [empCodeList, setEmpCodeList] = useState([]);
  const [empDetail, setEmpDetail] = useState([]);
  const [historyArr, setHisroryArr] = useState([]);
  const [empCode, setEmpCode] = useState("");

  const [modalErrorOpen, setModalErrorOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [modalTitle, setModalTitle] = useState("");
  const [dayError, setDayError] = useState(false);

  const [FormSchema, setFormSchema] = useState("");
  const { unSavedChanges, setUnSavedChanges } = useContext(AuthContext);
  const [tourBalance, setTourBalance] = useState([]);
  const collegeConfig = useSelector((state) => state.web.college);
  const institueArr = storage.getInstituteArray();

  const handleSchema = (PAYROLL_DATE) => {
    if (PAYROLL_DATE == "") return;
    console.log("PAYROLL_DATE", PAYROLL_DATE);

    let schema = Yup.object().shape({
      fromDate: Yup.date()
        .min(
          moment(PAYROLL_DATE).add(1, "days"),
          `From Date must be after ${moment(PAYROLL_DATE).format("DD-MM-YYYY")}`
        )
        .max(
          moment().add(2, "months").toDate(),
          `From Date must be before ${moment()
            .add(2, "months")
            .format("DD-MM-YYYY")}`
        )
        .required("Please select From Date"),
      toDate: Yup.date()
        .min(
          moment(PAYROLL_DATE).add(1, "days"),
          `To Date must be after ${moment(PAYROLL_DATE).format("DD-MM-YYYY")}`
        )
        .max(
          moment().add(2, "months").toDate(),
          `To Date must be before ${moment()
            .add(2, "months")
            .format("DD-MM-YYYY")}`
        )
        .required("Please select To Date"),
    });
    setFormSchema(schema);
  };

  const handleUnSavedChanges = (changed) => {
    if (changed == 1) {
      sessionStorage.setItem("unSavedChanges", true);
      setUnSavedChanges(true);
    } else {
      sessionStorage.setItem("unSavedChanges", false);
      setUnSavedChanges(false);
    }
  };

  const employeeSearch = async (value) => {
    setEmpCodeList([]);
    try {
      if (value.length > 2) {
        const employeeRes = await empApi.employeeSearch(value);
        console.log("employeeRes---", employeeRes);
        setEmpCodeList(employeeRes.data.message.employee_data);
      }
    } catch (error) {
      console.log("error----", error);
    }
  };

  const handleGetEmployeeDetails = async (item) => {
    formikRef?.current?.setFieldValue("fromDate", "");
    formikRef?.current?.setFieldValue("toDate", "");
    formikRef?.current?.setFieldTouched("toDate", false);
    formikRef?.current?.setFieldTouched("fromDate", false);
    try {
      if (!item) {
        return;
      }
      setHisroryArr([]);
      setNumofDays(0);
      console.log("item", item);

      const tourDetailRes = await empApi.getTourDetails(
        item.name,
        moment().subtract(3, "months").format("YYYY-MM-DD"),
        moment().format("YYYY-MM-DD")
      );
      console.log("tourDetailRes---", tourDetailRes);
      if (tourDetailRes.data.data.length > 0) {
        setHisroryArr(tourDetailRes.data.data);
      }

      const checkTourRes = await empApi.checkLeave(item.name, "Tour");
      console.log("checkTourRes---", checkTourRes);
      setTourBalance(checkTourRes.data.data);
    } catch (error) {
      console.log("error----", error);
    }
  };

  const handleDays = async (fromDate, toDate) => {
    if (fromDate && toDate && fromDate <= toDate) {
      const calculateDays = await empApi.calculateDays(
        empCode.name,
        "Tour",
        moment(fromDate).format("YYYY-MM-DD"),
        moment(toDate).format("YYYY-MM-DD")
      );
      console.log("calculateDays---", calculateDays);
      setNumofDays(calculateDays.data.message);
    }
  };

  const handleValidateDate = async (fromDate, toDate) => {
    console.log("fromDate && toDate--", fromDate, toDate);
    if (fromDate && toDate) {
      if (fromDate > toDate) {
        setModalMessage("From Date should be less than To Date");
        setModalTitle("Message");
        setModalErrorOpen(true);
        setLoad(false);
        return false;
      }

      try {
        const attendanceRes = await empApi.getAttendanceByEmployee(
          empCode.name,
          moment(fromDate).format("YYYY-MM-DD"),
          moment(toDate).format("YYYY-MM-DD")
        );
        console.log("attendanceRes", attendanceRes);

        var availAttendance = [];
        if (attendanceRes.data.data.length > 0) {
          for (let k = 0; k < attendanceRes.data.data.length; k++) {
            console.log(attendanceRes.data.data[k].attendance_date);
            availAttendance.push(
              moment(attendanceRes.data.data[k].attendance_date).format(
                "DD-MM-YYYY"
              )
            );
          }
        }
        console.log("availAttendance---", availAttendance);
        if (availAttendance.length > 0) {
          var presentArr = availAttendance.join(",");
          setModalMessage(
            availAttendance.length == 1
              ? "Attendance for this Date " +
                  presentArr +
                  " is already marked. Please change date"
              : "Attendance for Dates " +
                  presentArr +
                  " are already marked. Please change dates"
          );
          setModalTitle("Message");
          setModalErrorOpen(true);

          return false;
        }
        // else {
        //   const calculateDays = await empApi.calculateDays(
        //     empCode.name,
        //     "Tour",
        //     moment(fromDate).format("YYYY-MM-DD"),
        //     moment(toDate).format("YYYY-MM-DD")
        //   );
        //   console.log("calculateDays---", calculateDays);
        //   setNumofDays(calculateDays.data.message);
        // }
        return true;
      } catch (error) {
        console.log("error", error);
        return false;
      }
    }
  };

  const handleSave = async (values, { resetForm }) => {
    console.log("values", values);
    console.log("numofDays", numofDays);
    console.log("tourBalance", tourBalance);
    if (load) return;
    setLoad(true);
    let validateDate = await handleValidateDate(values.fromDate, values.toDate);
    if (!validateDate) {
      setLoad(false);
      return;
    }

    if (numofDays == 0) {
      setDayError(true);
      setLoad(false);
      return;
    }
    if (tourBalance[0].total_leaves_allocated < numofDays) {
      setModalMessage(
        "Tour balance is " +
          tourBalance[0].total_leaves_allocated +
          " , which is not enough to apply for the tour."
      );
      setModalTitle("Message");
      setModalErrorOpen(true);
      setLoad(false);
      return;
    }
    if (
      !moment(values.fromDate).isBetween(
        moment(tourBalance[0].from_date).subtract(1, "days"),
        moment(tourBalance[0].to_date).add(1, "days")
      ) ||
      !moment(values.toDate).isBetween(
        moment(tourBalance[0].from_date).subtract(1, "days"),
        moment(tourBalance[0].to_date).add(1, "days")
      )
    ) {
      setModalMessage(
        "Please choose the date between " +
          moment(tourBalance[0].from_date).format("DD-MM-YYYY") +
          " and " +
          moment(tourBalance[0].to_date).format("DD-MM-YYYY")
      );
      setModalTitle("Message");
      setModalErrorOpen(true);
      setLoad(false);
      return;
    }

    try {
      console.log("empCode---", empCode);
      setLoad(true);

      var addTourRes = await empApi.addTour(
        empCode.name,
        "Tour",
        moment(values.fromDate).format("YYYY-MM-DD"),
        moment(values.toDate).format("YYYY-MM-DD"),
        "Approved"
      );
      console.log("addTourRes-------------", addTourRes);
      if (!addTourRes.ok) {
        setModalMessage(
          JSON.parse(
            JSON.parse(addTourRes.data._server_messages)[0]
          ).message.split("<Br>")[0]
        );
        setModalTitle("Message");
        setModalErrorOpen(true);
        setLoad(false);
        return;
      } else {
        handleUnSavedChanges(0);
        toast.success("Tour Applied Successfully");
        // formikRef.current.setFieldValue("fromDate", null);
        // formikRef.current.setFieldValue("toDate", null);
        // formikRef.current.setFieldTouched("toDate", false);
        // formikRef.current.setFieldTouched("fromDate", false);

        resetForm();
        setNumofDays(0);
        handleGetEmployeeDetails(empCode);
        setLoad(false);
      }
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
        <ScreenTitle titleClass="page-heading-position-report" />
        <div className="row no-gutters mt-1">
          <div className="row no-gutters col-lg-8">
            <ReactSelectField
              autoFocus
              label="Employee No. / Name"
              id="salutation"
              mandatory={1}
              tabIndex={1}
              labelSize={3}
              clear={true}
              values={empCode}
              style={{ width: "80%" }}
              getOptionLabel={(option) =>
                option.custom_employeeid + " - " + option.employee_name
              }
              getOptionValue={(option) => option.name}
              options={empCodeList}
              onInputChange={(inputValue) => {
                employeeSearch(inputValue);
              }}
              onChange={(text) => {
                setEmpCode(text);
                setEmpDetail(text);
                handleGetEmployeeDetails(text);
                handleUnSavedChanges(0);
                institueArr.map((item) => {
                  if (item.name === text.company) {
                    handleSchema(
                      item.PAYROLL_DATE
                        ? moment(item.PAYROLL_DATE, "DD-MM-YYYY")
                        : ""
                    );
                  }
                });
              }}
            />
          </div>
          {empCode ? (
            <>
              {empDetail && (
                <>
                  <div className="subhead-row">
                    <div className="subhead">Employee Details</div>
                    <div className="col line-div"></div>
                  </div>
                  <EmployeeCard employeeInfo={empDetail} />
                </>
              )}
              {historyArr && historyArr.length > 0 ? (
                <div className="row no-gutters">
                  <div className="subhead-row">
                    <div className="subhead">Leave history</div>
                    <div className="col line-div"></div>
                  </div>

                  <div className="row no-gutters">
                    <div className="col-lg-3"></div>
                    <div className="col-lg-6 text-center">
                      <table className="table table-bordered table-hover">
                        <thead>
                          <tr>
                            <th width="1%">No.</th>
                            <th width="45%">From Date</th>
                            <th>To Date</th>
                            <th width="10%">Days</th>
                          </tr>
                        </thead>
                        <tbody>
                          {historyArr.map((item, index) => {
                            return (
                              <tr>
                                <td>{index + 1}</td>
                                <td>
                                  {moment(item.from_date).format("DD-MM-yyyy")}
                                </td>
                                <td>
                                  {moment(item.to_date).format("DD-MM-yyyy")}
                                </td>
                                <td>{item.total_leave_days}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                    <div className="col-lg-1"></div>
                  </div>
                </div>
              ) : null}
              <Formik
                innerRef={formikRef}
                enableReinitialize={false}
                initialValues={{
                  fromDate: "",
                  toDate: "",
                }}
                validationSchema={FormSchema}
                onSubmit={handleSave}
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
                      <div className="subhead-row">
                        <div className="subhead">Add Tour Entry </div>
                        <div className="col line-div"></div>
                      </div>
                      <div className="col-lg-8">
                        <DateFieldFormik
                          label="Leave From"
                          id="fromDate"
                          style={{ width: "35%" }}
                          labelSize={3}
                          tabIndex={2}
                          mandatory={1}
                          onChange={(e) => {
                            setFieldValue("fromDate", e.target.value);
                            handleDays(e.target.value, values.toDate);
                            handleUnSavedChanges(1);
                            setDayError(false);
                          }}
                          minDate={null}
                          maxDate={null}
                        />
                        <DateFieldFormik
                          label="To Date"
                          id="toDate"
                          style={{ width: "35%" }}
                          labelSize={3}
                          tabIndex={3}
                          mandatory={1}
                          onChange={(e) => {
                            setFieldValue("toDate", e.target.value);
                            handleDays(values.fromDate, e.target.value);
                            handleUnSavedChanges(1);
                            setDayError(false);
                          }}
                          minDate={null}
                          maxDate={null}
                        />
                        <DisplayText
                          label={"Number of Days"}
                          labelSize={3}
                          value={numofDays ?? "-"}
                        />
                      </div>
                      <div className="text-center mb-2">
                        <ErrorMessage
                          Message={
                            "The given dates are Holiday or WeekOff. Please change the Dates."
                          }
                          view={dayError}
                        />
                      </div>
                      <Button
                        id="save"
                        isTable={true}
                        text="F4 - Save"
                        tabIndex={4}
                        onClick={(e) => preFunction.handleErrorFocus(errors)}
                      />
                    </form>
                  );
                }}
              </Formik>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export default TourEntry;
