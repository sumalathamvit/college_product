import React, { useContext, useEffect, useRef, useState } from "react";
import moment from "moment";
import * as Yup from "yup";
import { Formik } from "formik";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";

import attendanceApi from "../../api/attendanceapi";

import preFunction from "../../component/common/CommonFunction";
import CustomActivityIndicator from "../../component/common/CustomActivityIndicator";
import {
  absentTypeConfirmList,
  absentTypeList,
  punchTypeList,
} from "../../component/common/CommonArray";
import ScreenTitle from "../../component/common/ScreenTitle";
import DateFieldFormik from "../../component/FormFieldLibrary/DateFieldFormik";
import Button from "../../component/FormField/Button";
import ReactSelectField from "../../component/FormField/ReactSelectField";
import SelectFieldFormik from "../../component/FormFieldLibrary/SelectFieldFormik";
import CommonApi from "../../component/common/CommonApi";
import ModalComponent from "../../component/ModalComponent";

import AuthContext from "../../auth/context";
import storage from "../../auth/storage";

function UpdateBioMetric() {
  const [attendanceData, setAttendanceData] = useState([]);
  const [load, setLoad] = useState(false);
  const [empCodeList, setEmpCodeList] = useState([]);

  const formikRef = useRef();

  const [FormSchema, setFormSchema] = useState();
  const [showRes, setShowRes] = useState(false);
  const collegeConfig = useSelector((state) => state.web.college);
  const { collegeId, setUnSavedChanges } = useContext(AuthContext);

  const [modalErrorOpen, setModalErrorOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [modalTitle, setModalTitle] = useState("");

  const institueArr = storage.getInstituteArray();

  const handleUnSavedChanges = (changed) => {
    if (changed == 1) {
      sessionStorage.setItem("unSavedChanges", true);
      setUnSavedChanges(true);
    } else {
      sessionStorage.setItem("unSavedChanges", false);
      setUnSavedChanges(false);
    }
  };

  const handleSchema = (PAYROLL_DATE) => {
    console.log("PAYROLL_DATE---", moment(PAYROLL_DATE).format("DD-MM-YYYY"));
    if (PAYROLL_DATE == "") {
      let schema = Yup.object().shape({
        college: collegeConfig.is_university
          ? Yup.object().required("Please select College")
          : Yup.mixed().notRequired(),
      });
      setFormSchema(schema);
      return;
    }
    let schema = Yup.object().shape({
      college: collegeConfig.is_university
        ? Yup.object().required("Please select College")
        : Yup.mixed().notRequired(),
      fromDate: Yup.date()
        .min(
          moment(PAYROLL_DATE).add(1, "days"),
          `From Date must be after ${moment(PAYROLL_DATE).format("DD-MM-YYYY")}`
        )
        .max(
          moment().toDate(),
          `From Date must be before ${moment().format("DD-MM-YYYY")}`
        )
        .required("Please select From Date"),
      toDate: Yup.date()
        .min(
          moment(PAYROLL_DATE).add(1, "days"),
          `To Date must be after ${moment(PAYROLL_DATE).format("DD-MM-YYYY")}`
        )
        .max(
          moment().toDate(),
          `To Date must be before ${moment().format("DD-MM-YYYY")}`
        )
        .required("Please select To Date"),
    });
    console.log("schema---", schema);
    setFormSchema(schema);
  };

  const searchEmployee = async (text) => {
    const empList = await CommonApi.searchEmployee(text);
    setEmpCodeList(empList);
  };

  const handleSave = async () => {
    try {
      setLoad(true);
      console.log("attendanceData---", attendanceData);
      for (let i = 0; i < attendanceData.length; i++) {
        if (attendanceData[i].absentType.value != attendanceData[i].status) {
          console.log("attendanceData---", attendanceData[i]);
          //cancel attendance
          const cancelAttendanceRes = await attendanceApi.ERPBulkcancel(
            "Attendance",
            [attendanceData[i].attendanceID]
          );
          console.log("cancelAttendanceRes---", cancelAttendanceRes);
          if (!cancelAttendanceRes.ok) {
            setModalMessage(cancelAttendanceRes.data.message);
            setModalErrorOpen(true);
            setModalTitle("Message");
            setLoad(false);
            return;
          }
          //insert new attendance
          const addAttendanceRes = await attendanceApi.addAttendance(
            attendanceData[i].employee,
            attendanceData[i].attendance_date,
            attendanceData[i].in_time,
            attendanceData[i].out_time,
            attendanceData[i].working_hours,
            attendanceData[i].absentType.value,
            attendanceData[i].shift,
            attendanceData[i].late_entry,
            attendanceData[i].early_exit,
            attendanceData[i].custom_short_excess,
            0
          );
          console.log("addAttendanceRes---", addAttendanceRes);
          if (!addAttendanceRes.ok) {
            setModalMessage(addAttendanceRes.data.message);
            setModalErrorOpen(true);
            setModalTitle("Message");
            setLoad(false);
            return;
          }
        }
      }
      setLoad(false);
      toast.success("Attendance Updated Successfully");
      setShowRes(false);
      handleUnSavedChanges(0);
    } catch (error) {
      console.log(error);
    }
  };

  const handleModification = async (values) => {
    try {
      setLoad(true);
      setShowRes(true);
      const getAttendanceDataModificationRes =
        await attendanceApi.getAttendanceDataModification(
          moment(values.fromDate).format("yyyy-MM-DD"),
          moment(values.toDate).format("yyyy-MM-DD"),
          values.absentType.value != "" ? values.absentType.value : null,
          values.punchType.value != "" ? values.punchType.value : null,
          values.employeeCode ? values.employeeCode.custom_employeeid : null
        );
      console.log(
        "getAttendanceDataModificationRes---",
        getAttendanceDataModificationRes
      );
      //check status
      if (getAttendanceDataModificationRes.data.message.success) {
        for (
          let i = 0;
          i <
          getAttendanceDataModificationRes.data.message.data.attendance_data
            .length;
          i++
        ) {
          for (let j = 0; j < absentTypeConfirmList.length; j++) {
            if (
              getAttendanceDataModificationRes.data.message.data
                .attendance_data[i].status == absentTypeConfirmList[j].value
            ) {
              getAttendanceDataModificationRes.data.message.data.attendance_data[
                i
              ].absentType = absentTypeConfirmList[j];
            }
          }
        }
        setAttendanceData(
          getAttendanceDataModificationRes.data.message.data.attendance_data
        );
      }

      setLoad(false);
    } catch (error) {
      setLoad(false);
      console.log(error);
    }
  };

  useEffect(() => {
    if (collegeConfig.is_university) {
      handleSchema("");
    } else {
      institueArr.map((item) => {
        if (item.collegeID === collegeId) {
          handleSchema(
            item.PAYROLL_DATE ? moment(item.PAYROLL_DATE, "DD-MM-YYYY") : ""
          );
        }
      });
    }
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
        <Formik
          enableReinitialize={false}
          innerRef={formikRef}
          initialValues={{
            fromDate: moment().subtract(1, "days"),
            toDate: moment().subtract(1, "days"),
            absentType: absentTypeList[0],
            punchType: punchTypeList[0],
            employeeCode: "",
          }}
          validationSchema={FormSchema}
          onSubmit={handleModification}
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
                <div className="row no-gutters">
                  {collegeConfig.is_university && (
                    <SelectFieldFormik
                      autoFocus
                      tabIndex={0}
                      labelSize={2}
                      label="College"
                      id="college"
                      mandatory={1}
                      matchFrom="start"
                      options={collegeConfig?.collegeList}
                      getOptionLabel={(option) => option?.collegeName}
                      getOptionValue={(option) => option?.collegeID}
                      searchIcon={false}
                      clear={false}
                      style={{ width: "50%" }}
                      onChange={(text) => {
                        setFieldValue("college", text);
                        setFieldTouched("payrollMonth", false);
                        institueArr.map((item) => {
                          if (item.collegeID === text.collegeID) {
                            handleSchema(
                              item.PAYROLL_DATE
                                ? moment(item.PAYROLL_DATE, "DD-MM-YYYY")
                                : ""
                            );
                          }
                        });
                      }}
                    />
                  )}
                  <div className="col-lg-2 pe-2">
                    <DateFieldFormik
                      autoFocus={!collegeConfig.is_university}
                      label={"From"}
                      labelSize={5}
                      id="fromDate"
                      minDate={null}
                      maxDate={null}
                      tabIndex={1}
                      mandatory={1}
                      onChange={(e) => {
                        setFieldValue("fromDate", e.target.value);
                        setShowRes(false);
                        handleUnSavedChanges(0);
                      }}
                    />
                  </div>
                  <div className="col-lg-2 pe-2 ps-2">
                    <DateFieldFormik
                      label={"To"}
                      labelSize={5}
                      id="toDate"
                      minDate={null}
                      maxDate={null}
                      tabIndex={2}
                      mandatory={1}
                      onChange={(e) => {
                        setFieldValue("toDate", e.target.value);
                        setShowRes(false);
                        handleUnSavedChanges(0);
                      }}
                    />
                  </div>
                  <div className="col-lg-2 ps-2 pe-2">
                    <SelectFieldFormik
                      label={"Punch Type"}
                      labelSize={5}
                      id="punchType"
                      tabIndex={3}
                      clear={false}
                      options={punchTypeList}
                      onChange={(e) => {
                        setFieldValue("punchType", e);
                        setShowRes(false);
                        handleUnSavedChanges(0);
                      }}
                    />
                  </div>
                  <div className="col-lg-2 pe-2 ps-2">
                    <SelectFieldFormik
                      label={"Absent Type"}
                      labelSize={4}
                      id="absentType"
                      name="absentType"
                      tabIndex={4}
                      clear={false}
                      options={absentTypeList}
                      onChange={(e) => {
                        setFieldValue("absentType", e);
                        setShowRes(false);
                        handleUnSavedChanges(0);
                      }}
                    />
                  </div>
                  <div className="col-lg-4 ps-2 pe-2">
                    <SelectFieldFormik
                      label="Employee No. / Name"
                      id="employeeCode"
                      tabIndex={5}
                      options={empCodeList}
                      searchIcon={true}
                      clear={true}
                      labelSize={5}
                      getOptionLabel={(option) =>
                        option.custom_employeeid + " - " + option.employee_name
                      }
                      getOptionValue={(option) => option.name}
                      onInputChange={(inputValue) => {
                        searchEmployee(inputValue);
                      }}
                      onChange={(text) => {
                        setFieldValue("employeeCode", text);
                        setShowRes(false);
                        handleUnSavedChanges(0);
                      }}
                    />
                  </div>
                </div>
                <Button
                  tabIndex={6}
                  text="Show"
                  onClick={(e) => {
                    preFunction.handleErrorFocus(errors);
                  }}
                />
              </form>
            );
          }}
        </Formik>
        {showRes && (
          <div className="row mt-4 p-0">
            <table className="table table-bordered">
              <thead>
                <tr>
                  <th width="1%">No.</th>
                  <th width="10%">Employee No.</th>
                  <th>Name</th>
                  <th width="10%">Date</th>
                  <th width="8%">Punch Time</th>
                  <th width="5%">Hours</th>
                  <th width="10%">Absent Type</th>
                  <th width="20%">Save As</th>
                </tr>
              </thead>
              <tbody>
                {attendanceData.length == 0 ? (
                  <tr>
                    <td colspan={9} align="center">
                      No data found
                    </td>
                  </tr>
                ) : (
                  attendanceData.map((item, index) => {
                    return (
                      <tr key={index}>
                        <td>{index + 1}</td>
                        <td>{item?.employee_id}</td>
                        <td>{item?.employee_name}</td>
                        <td>
                          {moment(item?.attendance_date).format("DD-MM-yyyy")}
                        </td>
                        <td>
                          {item.time.split(",").map((item1, key) => (
                            <div key={key}>{item1.substr(0, 5)}</div>
                          ))}
                        </td>
                        <td>
                          {preFunction.convertDecimalToTime(
                            item?.working_hours
                          )}
                        </td>
                        <td>
                          {item?.custom_is_permission
                            ? "Permission"
                            : item?.status}
                        </td>
                        <td>
                          <ReactSelectField
                            placeholder={"Absent Type"}
                            labelSize={5}
                            id="absentType"
                            name="absentType"
                            tabIndex={3}
                            mandatory={1}
                            clear={false}
                            searchIcon={false}
                            options={absentTypeConfirmList}
                            value={item.absentType}
                            onChange={(text) => {
                              attendanceData[index].absentType = text;
                              setAttendanceData([...attendanceData]);
                              handleUnSavedChanges(1);
                            }}
                          />
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>

            {attendanceData.length > 0 && (
              <Button
                text="F4 - Save"
                onClick={(e) => {
                  handleSave();
                }}
                id="save"
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default UpdateBioMetric;
