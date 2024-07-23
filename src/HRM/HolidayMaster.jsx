import React, { useEffect, useState, useRef, useContext } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import * as Yup from "yup";
import moment from "moment";
import { toast } from "react-toastify";
import { Formik } from "formik";
import { Modal } from "react-bootstrap";

import employeeapi from "../api/EmployeeApi";

import AuthContext from "../auth/context";
import Button from "../component/FormField/Button";
import CustomActivityIndicator from "../component/common/CustomActivityIndicator";
import DisplayText from "../component/FormField/DisplayText";
import DateField from "../component/FormField/DateField";
import ErrorMessage from "../component/common/ErrorMessage";
import ModalComponent from "../component/ModalComponent";
import preFunction from "../component/common/CommonFunction";
import SelectFieldFormik from "../component/FormField/SelectFieldFormik";
import TextField from "../component/FormField/TextField";
import { weekOffList } from "../component/common/CommonArray";
import ScreenTitle from "../component/common/ScreenTitle";

import "react-toastify/dist/ReactToastify.css";
import { tab } from "@testing-library/user-event/dist/tab";

const FormSchema = Yup.object().shape({
  // holidayName: Yup.string()
  //   .required("Please enter Holiday List Name")
  //   .min(3, "Must be at least 3 characters long")
  //   .matches(/^[A-Za-z0-9@., ()-]+$/, "Please enter valid name")
  //   .trim(),
  year: Yup.object().required("Please select Year"),
  weekOff: Yup.array().required("Please select Week Off"),
});

function HolidayMaster() {
  const location = useLocation();
  const navigate = useNavigate();
  const [load, setLoad] = useState(false);
  const [holidayArray, setHolidayArray] = useState([]);
  const [weekOffArray, setWeekOffArray] = useState([]);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [date, setDate] = useState("");
  const [holiday, setHoliday] = useState("");
  const [holidayDateError, setHolidayDateError] = useState(false);
  const [holidayNameError, setHolidayNameError] = useState(false);
  const [holidayID, setHolidayID] = useState("");
  const [modalErrorOpen, setModalErrorOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [modalTitle, setModalTitle] = useState("");
  const { unSavedChanges, setUnSavedChanges } = useContext(AuthContext);
  const [copyHoliday, setCopyHoliday] = useState(false);
  const [weekOffError, setWeekOffError] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [yearModal, setYearModal] = useState();

  let tabIndex = 2;

  const handleUnSavedChanges = (changed) => {
    if (changed == 1) {
      sessionStorage.setItem("unSavedChanges", true);
      setUnSavedChanges(true);
    } else {
      sessionStorage.setItem("unSavedChanges", false);
      setUnSavedChanges(false);
    }
  };

  const currentYear = new Date().getFullYear();
  const years = [];
  years.push(
    { label: currentYear - 1, value: currentYear - 1 },
    { label: currentYear, value: currentYear },
    { label: currentYear + 1, value: currentYear + 1 }
  );

  const formikRef = useRef();

  const closeErrors = () => {
    setHolidayDateError(false);
    setHolidayNameError(false);
  };

  const getHolidayList = async () => {
    try {
      setLoad(true);
      if (location.state && location.state.id) {
        console.log("location.state.id--", location.state.id);
        const viewHolidayListDetail = await employeeapi.viewHolidayListDetail(
          location.state.id
        );
        console.log("viewHolidayListDetail---", viewHolidayListDetail);
        calculateWeekOff(viewHolidayListDetail.data.data);
      }
      setLoad(false);
    } catch (error) {
      setLoad(false);
      console.log(error);
    }
  };

  const getYearWiseHoliday = async (fromDate, toDate, copyHolidayList = 0) => {
    // if (!filterChange) return;
    try {
      setLoad(true);
      if (copyHolidayList) {
        setModalMessage("Please check the Holidays and Holiday Date");
        setModalTitle("Message");
        setModalErrorOpen(true);
      }

      setHolidayID();
      setCopyHoliday(false);
      setWeekOffError(false);
      if ((fromDate, toDate)) {
        console.log("year--", fromDate, toDate);
        const getHolidayName = await employeeapi.getHolidayName(
          fromDate,
          toDate
        );
        console.log("getHolidayName---", getHolidayName);
        if (getHolidayName.data.data.length == 0) {
          formikRef.current.setFieldValue("weekOff", "");
          formikRef.current.setFieldValue("date", "");
          formikRef.current.setFieldValue("holiday", "");
          setHolidayArray([]);
          getHolidayNameDetail(
            fromDate.split("-")[0] - 1 + "-01-01",
            fromDate.split("-")[0] - 1 + "-12-31"
          );
          // setCopyHoliday(true);
        } else {
          if (copyHolidayList) {
            setHolidayID("");
          } else {
            setHolidayID(getHolidayName.data.data[0].name);
          }
          const viewHolidayListDetail = await employeeapi.viewHolidayListDetail(
            getHolidayName.data.data[0].name
          );
          console.log("viewHolidayListDetail---", viewHolidayListDetail);
          if (copyHolidayList) {
            closeErrors();
            const date = viewHolidayListDetail.data.data;
            viewHolidayListDetail.data.data.from_date =
              formikRef?.current?.values?.year?.value +
              "-" +
              date.from_date.split("-")[1] +
              "-" +
              date.from_date.split("-")[2];
            viewHolidayListDetail.data.data.to_date =
              formikRef?.current?.values?.year?.value +
              "-" +
              date.to_date.split("-")[1] +
              "-" +
              date.to_date.split("-")[2];

            for (
              let i = 0;
              i < viewHolidayListDetail.data.data.holidays.length;
              i++
            ) {
              const date =
                viewHolidayListDetail.data.data.holidays[i].holiday_date;
              viewHolidayListDetail.data.data.holidays[i].holiday_date =
                formikRef?.current?.values?.year?.value +
                "-" +
                date.split("-")[1] +
                "-" +
                date.split("-")[2];
            }
          }
          calculateWeekOff(viewHolidayListDetail.data.data, copyHolidayList);
        }
      }
      setLoad(false);
    } catch (error) {
      setLoad(false);
      console.log(error);
    }
  };

  const getHolidayNameDetail = async (fromDate, toDate) => {
    try {
      setLoad(true);
      if ((fromDate, toDate)) {
        console.log("year--", fromDate, toDate);
        const getHolidayName = await employeeapi.getHolidayName(
          fromDate,
          toDate
        );
        console.log("getHolidayName---", getHolidayName);
        if (getHolidayName.data.data.length > 0) {
          setCopyHoliday(true);
        }
      }
      setLoad(false);
    } catch (error) {
      setLoad(false);
      console.log(error);
    }
  };

  const calculateWeekOff = (values, copyHolidayList) => {
    let week = [];
    let holidayAddDetails = [];
    console.log("values.holidays", values.holidays);
    for (let i = 0; i < values.holidays.length; i++) {
      let isInUniqueArray = false;
      let holidayDescription = values.holidays[i].description;

      for (let j = 0; j < weekOffList.length; j++) {
        if (weekOffList[j].label === holidayDescription) {
          let days = {
            value: weekOffList[j].value,
            label: holidayDescription,
          };
          week.push(days);
          isInUniqueArray = true;
          break;
        }
      }
      if (!isInUniqueArray) {
        let obj = {
          holiday_date: moment(values.holidays[i].holiday_date).format(
            "YYYY-MM-DD"
          ),
          description: holidayDescription,
        };
        holidayAddDetails.push(obj);
      }
    }
    const uniqueArray = Array.from(new Set(week.map(JSON.stringify))).map(
      JSON.parse
    );
    holidayAddDetails.sort((a, b) => {
      return new Date(a.holiday_date) - new Date(b.holiday_date);
    });
    console.log(
      "holidayAddDetails-----",
      holidayAddDetails,
      uniqueArray,
      values,
      week
    );
    setFormikFieldValue(
      values,
      uniqueArray,
      holidayAddDetails,
      copyHolidayList
    );
  };

  const setFormikFieldValue = async (
    values,
    uniqueArray,
    holidayAddDetails,
    copyHolidayList
  ) => {
    console.log("values----", values);
    if (copyHolidayList == 0) {
      setFromDate(values.from_date);
      setToDate(values.to_date);
    }
    // setHolidayName(values.name);
    if (formikRef.current) {
      console.log("values----", values.name);
      // formikRef.current.setFieldValue("holidayName", values.name);
      if (copyHolidayList == 0) {
        formikRef.current.setFieldValue("year", {
          value: new Date(values.from_date).getFullYear(),
          label: new Date(values.from_date).getFullYear(),
        });
      }
      formikRef.current.setFieldValue("weekOff", uniqueArray);
      console.log("holidayAddDetails", holidayAddDetails, holidayArray);
      // if (copyHolidayList) {
      //   let holidayList = holidayArray.concat(holidayAddDetails);
      //   console.log("holidayList", holidayList);
      //   setHolidayArray(holidayList);
      // } else {
      setHolidayArray(holidayAddDetails);
      // }

      console.log("values.from_date", values.from_date, values.to_date);
      handleWeekOff(
        {
          value: new Date(values.from_date).getFullYear(),
          label: new Date(values.from_date).getFullYear(),
        },
        uniqueArray
      );
    }
  };

  const handleWeekOff = async (year, weekOff) => {
    // if (!filterChange) return;
    formikRef.current.setFieldTouched("weekOff", false);
    setHolidayDateError(false);
    setHolidayNameError(false);
    if (year && weekOff) {
      console.log("year", year.value, "weekOff", weekOff);
      const sundays = [];
      const startDate = new Date(`${year.value}-01-01`);
      const endDate = new Date(`${year.value}-12-31`);

      for (let i = 0; i < weekOff.length; i++) {
        let currentDate = new Date(startDate);
        while (currentDate <= endDate) {
          if (currentDate.getDay() === Number(weekOff[i].value)) {
            sundays.push({
              holiday_date: moment(currentDate).format("yyyy-MM-DD"),
              description: weekOff[i].label,
            });
          }
          currentDate.setDate(currentDate.getDate() + 1);
        }
      }
      console.log("sundays", sundays);
      setWeekOffArray(sundays);
    }
  };

  const handleSave = async (values) => {
    if (load) return;
    if (modalErrorOpen) return;
    closeErrors();
    let err = false;
    if (values.weekOff.length > 2) {
      setWeekOffError(true);
      document.getElementById("weekOff").focus();
      err = true;
    }
    if (date == "" && holidayArray.length == 0) {
      setHolidayDateError(true);
      err = true;
    }
    if (holiday == "" && holidayArray.length == 0) {
      setHolidayNameError(true);
      err = true;
    }
    if (err) {
      return;
    }
    try {
      setLoad(true);
      let previous = holidayArray.length;
      let current = 0;
      if (date && holiday) {
        handleAddHoliday();
        current = holidayArray.length;
      }
      console.log("addHoliday", previous, current, holidayArray, weekOffArray);
      let holidayList = [];
      for (let i = 0; i < holidayArray.length; i++) {
        for (let j = 0; j < weekOffArray.length; j++) {
          if (holidayArray[i].holiday_date == weekOffArray[j].holiday_date) {
            holidayArray[i].weekly_off = true;
          }
        }
      }
      holidayList = holidayArray.concat(weekOffArray);
      console.log("holidayList", holidayList);
      if (previous !== current) {
        handleAddandEditHoliday(values, holidayList);
      }
      setLoad(false);
    } catch (error) {
      console.log("error", error);
      setLoad(false);
    }
  };

  const handleAddandEditHoliday = async (values, holidayList) => {
    try {
      setLoad(true);
      console.log("values", values);
      if ((location.state && location.state.id) || holidayID) {
        const editHoliday = await employeeapi.editHoliday(
          holidayList,
          holidayID ? holidayID : location.state.id
        );
        console.log("editHoliday", editHoliday);
        if (editHoliday.data.data) {
          handleUnSavedChanges(0);
          toast.success("Holiday List Updated Successfully");
          formikRef.current.resetForm();
          setFromDate("");
          setToDate("");
          setHolidayArray([]);
          setWeekOffArray([]);
          document.getElementById("year").focus();
          // navigate("/holiday-list");
        }
      } else {
        console.log("Holidays", holidayArray.concat(weekOffArray));
        const addHolidayRes = await employeeapi.addHoliday(
          values.year.value,
          moment(fromDate).format("YYYY-MM-DD"),
          moment(toDate).format("YYYY-MM-DD"),
          holidayList
        );
        console.log("addHolidayRes", addHolidayRes);
        if (addHolidayRes.data.data) {
          handleUnSavedChanges(0);
          toast.success("Holiday List Added Successfully");
          formikRef.current.resetForm();
          setFromDate("");
          setToDate("");
          setHolidayArray([]);
          setWeekOffArray([]);
          document.getElementById("year").focus();
          // getYearWiseHoliday(fromDate, toDate);
          // navigate("/holiday-list");
        }
      }
      setLoad(false);
    } catch (error) {
      console.log("error", error);
      setLoad(false);
    }
  };

  const handleValidateHolidayDate = (date, index) => {
    if (date) {
      let count = 0;
      if (holidayArray.length > 0) {
        for (let i = 0; i < holidayArray.length; i++) {
          if (
            moment(date).format("yyyy-MM-DD") === holidayArray[i].holiday_date
          ) {
            count = count + 1;
          }
        }
      }
      console.log("count", count, date);
      if (count == 1) {
        setModalMessage(
          moment(date).format("DD-MM-YYYY") + " " + "holiday date already added"
        );
        setModalTitle("Message");
        setModalErrorOpen(true);
        return;
      }
      if (
        moment(date).format("yyyy-MM-DD") <
        moment(new Date()).format("yyyy-MM-DD")
      ) {
        setModalMessage("Please select current and future holiday date");
        setModalTitle("Message");
        setModalErrorOpen(true);
        return;
      }
      holidayArray[index].holiday_date = date;
      setHolidayArray([...holidayArray]);
    }
  };

  const handleAddHoliday = async () => {
    closeErrors();
    let err = false;
    if (date == "") {
      setHolidayDateError(true);
      err = true;
    }
    const regEx = /^[A-Za-z@. ]+$/;
    if (holiday.trim() === "" || !regEx.test(holiday)) {
      err = true;
      setHolidayNameError(true);
    }
    if (holidayArray.length > 0) {
      for (let i = 0; i < holidayArray.length; i++) {
        if (
          moment(date).format("yyyy-MM-DD") === holidayArray[i].holiday_date
        ) {
          setModalMessage(
            moment(date).format("DD-MM-YYYY") +
              " " +
              "holiday date already added"
          );
          setModalTitle("Message");
          setModalErrorOpen(true);
          setLoad(false);
          return;
        }
      }
    }
    if (
      moment(date).format("yyyy-MM-DD") <
      moment(new Date()).format("yyyy-MM-DD")
    ) {
      setModalMessage("Please select current and future holiday date");
      setModalTitle("Message");
      setModalErrorOpen(true);
      setLoad(false);
      err = true;
    }
    if (err) {
      return;
    }
    try {
      console.log("values", date, holiday);
      let holidayAddDetails = holidayArray;
      let obj = {
        holiday_date: moment(date).format("yyyy-MM-DD"),
        description: holiday,
      };
      holidayAddDetails.push(obj);
      console.log("obj-----", holidayAddDetails);
      setHolidayArray(holidayAddDetails);
      setDate("");
      setHoliday("");
    } catch (error) {
      console.log("error", error);
    }
  };

  const handleDeleteHoliday = async (item) => {
    const deleteHoliday = holidayArray.filter((m) => m !== item);
    console.log("deleteHoliday", deleteHoliday);
    setHolidayArray(deleteHoliday);
  };

  useEffect(() => {
    getHolidayList();
  }, []);

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
        <div className="row no-gutters">
          <Formik
            enableReinitialize={true}
            innerRef={formikRef}
            initialValues={{
              year: "",
              weekOff: "",
              date: "",
              holiday: "",
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
                  <div className="row p-0">
                    <div className="col-lg-7 p-0 ps-3">
                      <SelectFieldFormik
                        autoFocus
                        label="Year"
                        id="year"
                        mandatory={1}
                        tabIndex={tabIndex - 1}
                        options={years}
                        maxlength={4}
                        placeholder="Year"
                        style={{ width: "50%" }}
                        search={false}
                        labelSize={4}
                        onChange={(text) => {
                          if (unSavedChanges) {
                            setOpenModal(true);
                            setYearModal(text);
                          } else {
                            setFieldValue("year", text);
                            setFromDate(
                              text ? text.value + "-" + "01-01" : null
                            );
                            setToDate(text ? text.value + "-" + "12-31" : null);
                            handleWeekOff(
                              text ? text.value : null,
                              values.weekOff
                            );
                            getYearWiseHoliday(
                              text ? text.value + "-" + "01-01" : null,
                              text ? text.value + "-" + "12-31" : null
                            );
                            handleUnSavedChanges(0);
                            // tabIndex = 2;
                          }
                        }}
                      />
                    </div>
                    {copyHoliday && (
                      <div className="col-lg-5 p-0 text-right">
                        <Button
                          type="button"
                          frmButton={false}
                          className={"btn-green"}
                          text="Copy Previous Year"
                          onClick={() => {
                            getYearWiseHoliday(
                              values?.year
                                ? values?.year.value - 1 + "-" + "01-01"
                                : null,
                              values?.year
                                ? values?.year.value - 1 + "-" + "12-31"
                                : null,
                              1
                            );
                          }}
                        />
                      </div>
                    )}
                  </div>
                  <div className="col-lg-10">
                    <DisplayText
                      isTable={true}
                      labelSize={3}
                      label="From Date"
                      value={
                        fromDate ? moment(fromDate).format("DD-MM-YYYY") : "-"
                      }
                    />
                    <DisplayText
                      label="To Date"
                      labelSize={3}
                      value={toDate ? moment(toDate).format("DD-MM-YYYY") : "-"}
                    />
                    {values.year.value < currentYear ? (
                      <DisplayText
                        label="Week Off"
                        value={
                          formikRef?.current?.values?.weekOff &&
                          formikRef?.current?.values?.weekOff
                            .map((item) => item.label)
                            .join(" , ")
                        }
                        labelSize={3}
                      />
                    ) : (
                      <SelectFieldFormik
                        style={{ width: "70%" }}
                        // autoFocus={weekOffError ? true : false}
                        id="weekOff"
                        label="Week Off"
                        placeholder="Week Off"
                        tabIndex={tabIndex}
                        mandatory={1}
                        maxlength={10}
                        labelSize={3}
                        options={weekOffList}
                        onChange={(text) => {
                          console.log("text--", text);
                          if (text.length > 0) setFieldValue("weekOff", text);
                          else setFieldValue("weekOff", "");
                          handleWeekOff(values.year, text);
                          handleUnSavedChanges(1);
                          // handleUnSavedChanges(1);
                          if (text.length <= 2) setWeekOffError(false);
                        }}
                        customErrorMessage={
                          weekOffError ? "Please select only 2 Week Off" : ""
                        }
                        isSearchable={true}
                        isMulti
                      />
                    )}
                  </div>

                  <div className="row">
                    <div className="subhead-row p-0">
                      <div className="subhead"> Holiday Detail</div>
                      <div className="col line-div"></div>
                    </div>
                    <div className="col-lg-12 p-0">
                      <table className="table table-bordered mb-2">
                        <thead>
                          <tr>
                            <th width="1%">No.</th>
                            <th width="5%"> Holiday Date</th>
                            <th>Holiday Name</th>
                            <th width="5%"></th>
                          </tr>
                        </thead>
                        <tbody>
                          {values?.year?.value <= currentYear &&
                          holidayArray.length == 0 ? (
                            <tr>
                              <td colSpan="4" align="center">
                                No data found
                              </td>
                            </tr>
                          ) : (
                            holidayArray.map((item, index) => {
                              (values.year.value > currentYear ||
                                moment(item.holiday_date).format(
                                  "yyyy-MM-DD"
                                ) >= moment(new Date()).format("yyyy-MM-DD")) &&
                                (tabIndex = tabIndex + 1);
                              // console.log("item", tabIndex);
                              return (
                                <tr>
                                  <td>{index + 1}</td>
                                  <td>
                                    {values.year.value > currentYear ||
                                    moment(item.holiday_date).format(
                                      "yyyy-MM-DD"
                                    ) >=
                                      moment(new Date()).format(
                                        "yyyy-MM-DD"
                                      ) ? (
                                      <DateField
                                        tabIndex={tabIndex}
                                        id="date"
                                        type="date"
                                        isTable={true}
                                        minDate={fromDate}
                                        maxDate={toDate}
                                        value={item.holiday_date}
                                        mandatory={1}
                                        style={{ width: "100%" }}
                                        onChange={(e) => {
                                          handleUnSavedChanges(1);
                                          handleValidateHolidayDate(
                                            e.target.value,
                                            index
                                          );
                                        }}
                                      />
                                    ) : (
                                      moment(item.holiday_date).format(
                                        "DD-MM-YYYY"
                                      )
                                    )}
                                  </td>
                                  <td>{item.description}</td>
                                  <td>
                                    {moment(item.holiday_date).format(
                                      "yyyy-MM-DD"
                                    ) >=
                                      moment(new Date()).format(
                                        "yyyy-MM-DD"
                                      ) && (
                                      <Button
                                        type="button"
                                        className="plus-button"
                                        title="Sub"
                                        onClick={() => {
                                          handleDeleteHoliday(item);
                                        }}
                                        isTable={true}
                                        text={"-"}
                                      />
                                    )}
                                  </td>
                                </tr>
                              );
                            })
                          )}
                          {(values?.year?.value >= currentYear ||
                            values?.year == "") && (
                            // ||
                            // holidayArray.length == 0
                            <tr>
                              <td>{holidayArray.length + 1}</td>
                              <td>
                                <DateField
                                  id="date"
                                  type="date"
                                  isTable={true}
                                  minDate={fromDate}
                                  maxDate={toDate}
                                  value={date}
                                  mandatory={1}
                                  tabIndex={tabIndex + 1}
                                  style={{ width: "100%" }}
                                  onChange={(e) => {
                                    setDate(e.target.value);
                                    closeErrors();
                                    handleUnSavedChanges(1);
                                  }}
                                />
                                <ErrorMessage
                                  Message={"Please select Date"}
                                  view={holidayDateError}
                                />
                              </td>
                              <td>
                                <TextField
                                  id="holiday"
                                  name="holiday"
                                  placeholder="Holiday Name"
                                  value={holiday}
                                  tabIndex={tabIndex + 2}
                                  isTable={true}
                                  mandatory={1}
                                  maxlength={40}
                                  onChange={(e) => {
                                    setHoliday(e.target.value);
                                    closeErrors();
                                    handleUnSavedChanges(1);
                                  }}
                                  error={
                                    holidayNameError
                                      ? "Please enter valid Holiday Name"
                                      : ""
                                  }
                                  touched={holidayNameError ? true : false}
                                />
                              </td>
                              <td align="center">
                                <Button
                                  type="button"
                                  tabIndex={tabIndex + 3}
                                  className="plus-button"
                                  title="Add"
                                  isTable={true}
                                  onClick={() => {
                                    handleAddHoliday();
                                  }}
                                  text="+"
                                />
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                  {(values?.year?.value >= currentYear ||
                    values?.year == "" ||
                    holidayArray.length == 0) && (
                    <Button
                      id="save"
                      tabIndex={6}
                      text="F4 - Save"
                      type="submit"
                      onClick={(e) => {
                        !load && preFunction.handleErrorFocus(errors);
                      }}
                    />
                  )}
                </form>
              );
            }}
          </Formik>
        </div>
        <Modal
          show={openModal}
          dialogClassName="my-modal"
          onEscapeKeyDown={(e) => setOpenModal(false)}
        >
          <Modal.Header>
            <Modal.Title>Leave Page?</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <div className="">
              Changes you made may not be saved. Are you sure you want to change
              the filter?
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button
              text="Yes"
              frmButton={false}
              onClick={() => {
                setOpenModal(false);
                setUnSavedChanges(false);
                console.log("yearModal", yearModal);
                if (yearModal) {
                  setFromDate(
                    yearModal ? yearModal.value + "-" + "01-01" : null
                  );
                  setToDate(yearModal ? yearModal.value + "-" + "12-31" : null);
                  formikRef.current.setFieldValue("year", yearModal);
                  handleWeekOff(
                    yearModal ? yearModal.value : null,
                    formikRef.current.values.weekOff
                  );
                  getYearWiseHoliday(
                    yearModal ? yearModal.value + "-" + "01-01" : null,
                    yearModal ? yearModal.value + "-" + "12-31" : null
                  );
                  setYearModal();
                }
                handleUnSavedChanges(0);
              }}
            />
            &nbsp;&nbsp;
            <Button
              autoFocus
              text="No"
              frmButton={false}
              onClick={() => {
                setOpenModal(false);
              }}
            />
          </Modal.Footer>
        </Modal>
      </div>
    </div>
  );
}

export default HolidayMaster;
