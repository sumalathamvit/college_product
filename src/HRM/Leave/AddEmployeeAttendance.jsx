import React, { useRef, useState, useContext, useEffect } from "react";
import { toast } from "react-toastify";
import moment from "moment";
import { useSelector } from "react-redux";
import { Formik } from "formik";
import * as Yup from "yup";

import empApi from "../../api/EmployeeApi";

import Button from "../../component/FormField/Button";
import preFunction from "../../component/common/CommonFunction";
import CustomActivityIndicator from "../../component/common/CustomActivityIndicator";
import SelectFieldFormik from "../../component/FormField/SelectFieldFormik";
import { employeeAttendanceList } from "../../component/common/CommonArray";
import ReactSelectField from "../../component/FormField/ReactSelectField";
import DateFieldFormik from "../../component/FormField/DateFieldFormik";
import ScreenTitle from "../../component/common/ScreenTitle";
import ModalComponent from "../../component/ModalComponent";

import AuthContext from "../../auth/context";
import storage from "../../auth/storage";

function AddEmployeeAttendance() {
  const formikRef = useRef();
  const [load, setLoad] = useState(false);

  const [showRes, setShowRes] = useState(false);
  const [data, setData] = useState([]);

  const [modalErrorOpen, setModalErrorOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [modalTitle, setModalTitle] = useState("");

  const [FormSchema, setFormSchema] = useState();
  const { setUnSavedChanges, collegeName, collegeId } = useContext(AuthContext);
  const collegeConfig = useSelector((state) => state.web.college);

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
    if (PAYROLL_DATE == "") {
      let schema = Yup.object().shape({
        college: collegeConfig?.is_university
          ? Yup.object().required("Please select College")
          : Yup.mixed().notRequired(),
        attendanceDate: Yup.date().required("Please select Attendance Date"),
      });
      setFormSchema(schema);
      return;
    }
    console.log("PAYROLL_DATE", PAYROLL_DATE);

    let schema = Yup.object().shape({
      college: collegeConfig.is_university
        ? Yup.object().required("Please select College")
        : Yup.mixed().notRequired(),
      attendanceDate: Yup.date()
        .min(
          moment(PAYROLL_DATE),
          `Date must be after ${moment(PAYROLL_DATE).format("DD-MM-YYYY")}`
        )
        .max(
          moment().add(1, "months"),
          `Date must be before ${moment()
            .add(1, "months")
            .format("DD-MM-YYYY")}`
        )
        .required("Please select Valid Month"),
    });
    setFormSchema(schema);
  };

  const handleShow = async (values) => {
    try {
      setLoad(true);
      setShowRes(true);
      console.log("values---", values);
      const attendanceRes = await empApi.getEmployeeAttendance(
        values.college ? values.college.collegeID : collegeId,
        moment(values.attendanceDate).format("yyyy-MM-DD")
      );
      console.log("attendanceRes----", attendanceRes);

      if (!attendanceRes.data.message.success) {
        setModalErrorOpen(true);
        setModalMessage(attendanceRes.data.message.message);
        setModalTitle("Message");
        setLoad(false);
        return;
      } else {
        let attendance = attendanceRes.data.message.data.employee_data;
        let count = 0;
        attendance?.map((item) => {
          if (
            item.attendanceID &&
            item.attendanceID != null &&
            item.status != "On Leave" &&
            item.status != "Half Day"
          ) {
            count++;
          }
        });
        console.log("count", count);
        if (count > 0) {
          let temp = [];
          attendance?.map((item) => {
            let tempItem = item;
            if (item.status == "Half Day") {
              if (item.session == "FN") {
                tempItem.status = "Forenoon Absent";
              } else if (item.session == "AN") {
                tempItem.status = "Afternoon Absent";
              }
            }
            temp.push(tempItem);
          });
          console.log("temp", temp);
          setData(temp);
        } else {
          let temp = [];
          attendance?.map((item) => {
            let tempItem = item;

            tempItem.status = "Present";

            temp.push(tempItem);
          });
          console.log("temp", temp);
          setData(temp);
        }
      }

      setLoad(false);
    } catch (error) {
      console.log("error", error);
      setLoad(false);
    }
  };

  const handleSave = async (values) => {
    if (load) return;
    try {
      console.log("values---", values);
      console.log("data---", data);
      setLoad(true);

      let count = 0;

      let modifiedData = await data.map((item) => {
        if (!item.status) {
          setModalErrorOpen(true);
          setModalMessage(
            `Please put attendance for ${
              item.custom_employeeid + " - " + item.employee_name
            }`
          );
          setModalTitle("Message");
          setLoad(false);
          count++;
          return;
        }
        if (item.status == "Forenoon Absent") {
          item.session = "AN";
          item.status = "Half Day";
        } else if (item.status == "Afternoon Absent") {
          item.session = "FN";
          item.status = "Half Day";
        }
        return item;
      });

      if (count > 0) {
        setLoad(false);
        return;
      }

      for (let i = 0; i < modifiedData.length; i++) {
        let item = modifiedData[i];
        let res = await empApi.saveEmployeeAttendance(
          item.attendanceID ? item.attendanceID : null,
          values.college ? values.college.collegeName : collegeName,
          item.employeeID,
          item.department,
          moment(values.attendanceDate).format("yyyy-MM-DD"),
          item.session,
          item.status
        );
        console.log("res", res);
      }

      toast.success("Attendance added successfully");
      setData([]);
      setShowRes(false);
      formikRef.current.resetForm();
      handleUnSavedChanges(0);
      if (collegeConfig.is_university) {
        document.getElementById("college").focus();
      } else {
        document.getElementById("attendanceDate").focus();
      }

      setLoad(false);
    } catch (error) {
      console.log("error", error);
      setLoad(false);
    }
  };

  useEffect(() => {
    if (collegeConfig.institution_type === 4) {
      handleSchema("");
    } else {
      console.log("institueArr", institueArr);
      institueArr.map((item) => {
        if (item.collegeID == collegeId) {
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
        <ScreenTitle titleClass={"page-heading-position-report"} />
        <div className="row no-gutters mt-1">
          <Formik
            enableReinitialize={false}
            innerRef={formikRef}
            initialValues={{
              college: "",
              attendanceDate: new Date(),
            }}
            validationSchema={FormSchema}
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
            }) => {
              return (
                <form onSubmit={handleSubmit} autoComplete="off">
                  <div className="row no-gutters mt-1">
                    <div className="row no-gutters">
                      <div className="col-lg-12">
                        {collegeConfig.is_university && (
                          <SelectFieldFormik
                            autoFocus={collegeConfig.is_university}
                            tabIndex={0}
                            label="College"
                            id="college"
                            mandatory={1}
                            labelSize={2}
                            matchFrom="start"
                            options={collegeConfig?.collegeList}
                            getOptionLabel={(option) => option?.collegeName}
                            getOptionValue={(option) => option?.collegeID}
                            searchIcon={false}
                            clear={false}
                            style={{ width: "40%" }}
                            onChange={(text) => {
                              setFieldValue("college", text);
                              handleUnSavedChanges(1);
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

                        <DateFieldFormik
                          autoFocus={!collegeConfig.is_university}
                          label="Attendance Date"
                          labelSize={2}
                          tabIndex={1}
                          mandatory={1}
                          id="attendanceDate"
                          maxDate={moment()}
                          minDate={moment().subtract(5, "months")}
                          style={{ width: "18%" }}
                          onChange={(e) => {
                            setFieldValue("attendanceDate", e.target.value);
                            setShowRes(false);
                            setData([]);
                          }}
                        />
                      </div>
                      <Button
                        text="Show"
                        tabIndex={3}
                        type="submit"
                        onClick={(e) => {
                          preFunction.handleErrorFocus(errors);
                        }}
                      />

                      {showRes ? (
                        <div className="row border p-3 mt-3">
                          <div className="row p-0"></div>
                          <table className="table table-bordered table-hover">
                            <thead>
                              <tr>
                                <th width="1$">No.</th>
                                <th width="5%">Employee No.</th>
                                <th>Employee Name</th>
                                <th width="40%">Department</th>
                                <th width="20%">Attendance</th>
                              </tr>
                            </thead>
                            {data.length === 0 ? (
                              <tbody>
                                <tr>
                                  <td colspan={9} align="center">
                                    No data found
                                  </td>
                                </tr>
                              </tbody>
                            ) : (
                              <tbody>
                                {data.map((item, index) => {
                                  return (
                                    <tr>
                                      <td align="center">{index + 1}</td>
                                      <td>{item.custom_employeeid}</td>
                                      <td>{item.employee_name}</td>
                                      <td>{item?.department?.split("-")[0]}</td>
                                      <td>
                                        <ReactSelectField
                                          id={"status" + index}
                                          mandatory={1}
                                          matchFrom="start"
                                          value={
                                            item.status
                                              ? {
                                                  label: item.status,
                                                  value: item.status,
                                                }
                                              : null
                                          }
                                          options={employeeAttendanceList}
                                          searchIcon={false}
                                          search={false}
                                          clear={false}
                                          onChange={(text) => {
                                            console.log("text", text);
                                            if (item.status === "On Leave") {
                                              setModalErrorOpen(true);
                                              setModalMessage(
                                                "Please Cancel the Leave Application , then change the attendance"
                                              );
                                              setModalTitle("Message");
                                              return;
                                            }
                                            let status = text ? text.value : "";
                                            data[index].status = status;
                                            // if (status == "Forenoon Absent") {
                                            //   data[index].session = "AN";
                                            // } else if (
                                            //   status == "Afternoon Absent"
                                            // ) {
                                            //   data[index].session = "FN";
                                            // }
                                            setData([...data]);
                                            handleUnSavedChanges(1);
                                          }}
                                        />
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            )}
                          </table>
                          {data.length > 0 && (
                            <Button
                              type="button"
                              onClick={(e) => {
                                handleSave(values);
                              }}
                              id="save"
                              text="F4 - Save"
                            />
                          )}
                        </div>
                      ) : null}
                    </div>
                  </div>
                </form>
              );
            }}
          </Formik>
        </div>
      </div>
    </div>
  );
}

export default AddEmployeeAttendance;
