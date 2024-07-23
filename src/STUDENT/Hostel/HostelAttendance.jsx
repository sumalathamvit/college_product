import React, { useEffect, useRef, useState, useContext } from "react";
import { toast } from "react-toastify";
import moment from "moment";

import * as Yup from "yup";

import Button from "../../component/FormField/Button";
import preFunction from "../../component/common/CommonFunction";
import CustomActivityIndicator from "../../component/common/CustomActivityIndicator";
import SelectFieldFormik from "../../component/FormField/SelectFieldFormik";
import { sessionList } from "../../component/common/CommonArray";

import { Formik } from "formik";
import DateFieldFormik from "../../component/FormField/DateFieldFormik";
import StudentApi from "../../api/StudentApi";
import ScreenTitle from "../../component/common/ScreenTitle";
import ModalComponent from "../../component/ModalComponent";
import AuthContext from "../../auth/context";

const FormSchema = Yup.object().shape({
  attendanceDate: Yup.date().required("Please select Attendance Date"),
  session: Yup.object().required("Please select Session"),
  building: Yup.object().required("Please select Building"),
});

function HostelAttendance() {
  const formikRef = useRef();
  const [load, setLoad] = useState(false);

  const [showRes, setShowRes] = useState(false);
  const [data, setData] = useState([]);

  const [buildingList, setBuildingList] = useState([]);

  const [modalErrorOpen, setModalErrorOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [modalTitle, setModalTitle] = useState("");
  const { unSavedChanges, setUnSavedChanges } = useContext(AuthContext);

  const handleUnSavedChanges = (changed) => {
    if (changed == 1) {
      sessionStorage.setItem("unSavedChanges", true);
      setUnSavedChanges(true);
    } else {
      sessionStorage.setItem("unSavedChanges", false);
      setUnSavedChanges(false);
    }
  };

  const handleShow = async (values) => {
    if (load) return;
    try {
      setLoad(true);
      console.log("values---", values);
      const studentRes = await StudentApi.getHostelStudent(
        moment(values.attendanceDate).format("yyyy-MM-DD"),
        values.session.value,
        values.building.id
      );
      console.log("studentRes----", studentRes);
      if (studentRes.data.message.hostel_students.length === 0) {
        setModalErrorOpen(true);
        setModalMessage("No students found");
        setModalTitle("Message");
        setLoad(false);
        return;
      }

      setShowRes(true);
      setData(studentRes.data.message.hostel_students);

      setLoad(false);
    } catch (error) {
      console.log("error", error);
      setLoad(false);
    }
  };

  const handleSave = async (values) => {
    if (load) return;
    try {
      setLoad(true);
      console.log("values---", data);
      if (data[0].attendanceDetailID && data[0].attendanceDetailID != null) {
        let univData = data.map(
          ({ enrollNo, name, index, roomNo, roomID, studentID, ...rest }) =>
            rest
        );
        console.log("univData", univData);
        const studentRes = await StudentApi.modifyHostelAttendance(univData);
        console.log("studentRes------------------", studentRes);
        if (!studentRes.data.message.success) {
          setModalErrorOpen(true);
          setModalMessage(studentRes.data.message.message);
          setModalTitle("Error");
          setLoad(false);
          return;
        }
        handleUnSavedChanges(0);
        toast.success(studentRes.data.message.message);
        setShowRes(false);
        setData([]);
      } else {
        let univData = data.map(
          ({ enrollNo, name, index, roomNo, attendanceDetailID, ...rest }) =>
            rest
        );
        const studentRes = await StudentApi.addHostelAttendance(
          moment(values.attendanceDate).format("yyyy-MM-DD"),
          values.session.value,
          univData
        );
        console.log("studentRes----", studentRes);
        if (studentRes.data.message.success) {
          handleUnSavedChanges(0);
          toast.success("Attendance marked successfully");
          setShowRes(false);
          setData([]);
        } else {
          setLoad(false);
          setModalErrorOpen(true);
          setModalMessage(studentRes.data.message.message);
          setModalTitle("Error");
          return;
        }
      }
      document.getElementById("attendanceDate")?.focus();
      setLoad(false);
    } catch (error) {
      console.log("error", error);
      setLoad(false);
    }
  };

  const checkAll = () => {
    if (document.getElementById("checkAll").checked) {
      for (let i = 0; i < data.length; i++) {
        data[i].isAttendance = 1;
        data[i].isLeave = 0;
      }
    } else {
      for (let i = 0; i < data.length; i++) {
        data[i].isAttendance = 0;
      }
    }
    setData([...data]);
  };

  const getList = async () => {
    try {
      const masterRes = await StudentApi.getMaster(7);
      console.log("masterRes---", masterRes);
      setBuildingList(masterRes.data.message.data.building);
    } catch (error) {
      console.log("error", error);
    }
  };

  useEffect(() => {
    getList();
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
              session: "",
              building: "",
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
                      <div className="col-lg-10">
                        <DateFieldFormik
                          autoFocus
                          label="Attendance Date"
                          labelSize={3}
                          tabIndex={1}
                          mandatory={1}
                          id="attendanceDate"
                          maxDate={new Date()}
                          minDate={new Date(moment().subtract(1, "weeks"))}
                          style={{ width: "25%" }}
                          onChange={(e) => {
                            setFieldValue("attendanceDate", e.target.value);
                            setShowRes(false);
                            setData([]);
                          }}
                        />
                        <SelectFieldFormik
                          id="session"
                          label="Session"
                          labelSize={3}
                          tabIndex={2}
                          options={sessionList}
                          mandatory={1}
                          style={{ width: "35%" }}
                          onChange={(text) => {
                            setFieldValue("session", text);
                            setShowRes(false);
                            setData([]);
                          }}
                          maxlength={20}
                        />
                        <SelectFieldFormik
                          id="building"
                          label="Building"
                          labelSize={3}
                          tabIndex={3}
                          options={buildingList}
                          getOptionLabel={(option) => option.building}
                          getOptionValue={(option) => option.id}
                          mandatory={1}
                          style={{ width: "50%" }}
                          onChange={(text) => {
                            setFieldValue("building", text);
                            setShowRes(false);
                            setData([]);
                          }}
                          maxlength={20}
                        />
                      </div>
                      <Button
                        text="Show"
                        tabIndex={4}
                        type="submit"
                        onClick={(e) => {
                          preFunction.handleErrorFocus(errors);
                        }}
                      />
                    </div>
                  </div>
                  {showRes ? (
                    <div className="row border p-3 mt-3">
                      <div className="row p-0"></div>
                      {data.length > 0 && (
                        <>
                          <div className="table-responsive p-0">
                            <table className="table table-bordered table-hover">
                              <thead>
                                <tr>
                                  <th width="5%">No.</th>
                                  <th width="30%">Student No.</th>
                                  <th width="35%">Student Name</th>
                                  <th width="10%">Room No.</th>
                                  <th width="10%">
                                    Attendance{" "}
                                    <input
                                      type="checkbox"
                                      name="checkAll"
                                      id="checkAll"
                                      onClick={(e) => checkAll()}
                                    />
                                  </th>
                                  <th width="10%">Permission</th>
                                </tr>
                              </thead>
                              <tbody>
                                {data.map((item, index) => {
                                  return (
                                    <tr>
                                      <td align="center">{index + 1}</td>
                                      <td>{item.enrollNo}</td>
                                      <td>{item.name}</td>
                                      <td>{item.roomNo}</td>
                                      <td className="text-center">
                                        <input
                                          type="checkbox"
                                          name="attendance"
                                          id="attendance"
                                          checked={
                                            item.isAttendance ? true : false
                                          }
                                          className="attendance"
                                          onClick={(e) => {
                                            data[index].isAttendance = e.target
                                              .checked
                                              ? 1
                                              : 0;
                                            if (e.target.checked)
                                              data[index].isLeave = 0;

                                            setData([...data]);
                                            if (e.target.checked === false) {
                                              document.getElementById(
                                                "checkAll"
                                              ).checked = false;
                                            }
                                            handleUnSavedChanges(1);
                                          }}
                                        />
                                      </td>
                                      <td className="text-center">
                                        <input
                                          type="checkbox"
                                          name="leave"
                                          className="leave"
                                          id="leave"
                                          checked={item.isLeave}
                                          onClick={(e) => {
                                            if (e.target.checked)
                                              document.getElementById(
                                                "checkAll"
                                              ).checked = false;
                                            data[index].isLeave = e.target
                                              .checked
                                              ? 1
                                              : 0;
                                            if (e.target.checked)
                                              data[index].isAttendance = 0;
                                            setData([...data]);
                                            handleUnSavedChanges(1);
                                          }}
                                        />
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                          <Button
                            autoFocus
                            type="button"
                            onClick={(e) => {
                              handleSave(values);
                            }}
                            id="save"
                            text="F4 - Save"
                          />
                        </>
                      )}
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

export default HostelAttendance;
