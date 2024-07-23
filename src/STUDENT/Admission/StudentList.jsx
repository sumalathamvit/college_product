import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import api from "../../api/StudentApi";

import preFunction from "../../component/common/CommonFunction";
import CustomActivityIndicator from "../../component/common/CustomActivityIndicator";

import Button from "../../component/FormField/Button";

import TextField from "../../component/FormField/TextField";
import ScreenTitle from "../../component/common/ScreenTitle";

function StudentList() {
  const collegeConfig = useSelector((state) => state.web.college);
  const RENAME = useSelector((state) => state.web.rename);
  console.log("rename testing", RENAME);
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [load, setLoad] = useState(false);
  const [studentId, setStudentId] = useState();
  const [studentIDError, setStudentIDError] = useState(false);
  const [enrollLengthError, setEnrollLengthError] = useState(false);
  const [changes, setChanges] = useState(false);

  const getStudentSearch = async () => {
    setStudentIDError(false);
    setEnrollLengthError(false);
    if (!studentId?.trim()) {
      setStudentIDError(true);
      document.getElementById("student")?.focus();
      return;
    }
    if (studentId.length < 3) {
      setEnrollLengthError(true);
      document.getElementById("student")?.focus();
      return;
    }
    if (!changes) {
      document.getElementById("student").select();
      return;
    }
    try {
      setData([]);
      setLoad(true);
      const getAllStudentListRes = await api.allStudentDetails(studentId);
      console.log("getAllStudentList---", getAllStudentListRes);
      if (getAllStudentListRes.data.message.success) {
        setData(getAllStudentListRes.data.message.data.student);
      }
      document.getElementById("student").select();
      setChanges(false);
      setLoad(false);
      return;
    } catch (error) {
      setLoad(false);
      console.log("exception--", error);
    }
  };

  const getStudentdetail = async () => {
    try {
      setLoad(true);
      const getAllStudentForListRes = await api.allStudentDetails("");
      console.log("getAllStudentForList---", getAllStudentForListRes);
      if (getAllStudentForListRes.data.message.success) {
        setData(getAllStudentForListRes.data.message.data.student);
      }

      setLoad(false);
      return;
    } catch (error) {
      setLoad(false);
      console.log("exception--", error);
    }
  };

  useEffect(() => {
    getStudentdetail();
  }, []);

  return (
    <div className="content-area-report" onClick={preFunction.hideNavbar}>
      <CustomActivityIndicator
        style={{ height: 100, alignSelf: "center" }}
        visible={load}
      />
      <div className="row no-gutters bg-white-report">
        <ScreenTitle titleClass={"page-heading-position-report"} />
        <div className="row no-gutters">
          <div className="row no-gutters mt-2">
            <div className="col-lg-3 pe-2">
              <TextField
                autoFocus
                id="student"
                // tabIndex={1}
                mandatory={1}
                value={studentId}
                error={
                  studentIDError
                    ? "Please enter Student No./Name"
                    : enrollLengthError
                    ? "Please enter min 3 character to search"
                    : ""
                }
                touched={
                  studentIDError ? true : enrollLengthError ? true : false
                }
                maxlength={40}
                placeholder="Student No. / Name"
                onChange={(e) => {
                  if (!e.target.value || e.target.value === "") {
                    setStudentId("");
                    getStudentdetail();
                  } else setStudentId(e.target.value);
                  setChanges(true);
                  setStudentIDError(false);
                  setEnrollLengthError(false);
                }}
                onKeyUp={(e) => e.keyCode == 13 && getStudentSearch()}
              />
            </div>
            <div className="col-lg-1 ps-2 mt-1">
              <Button
                // tabIndex={2}
                isTable={true}
                frmButton={false}
                onClick={() => getStudentSearch()}
                text={"Search"}
                type="button"
              />
            </div>
          </div>
        </div>
        <div className="row no-gutters mt-3">
          <>
            <div className="table-responsive">
              <table className="table table-bordered table-hover">
                <thead>
                  <tr>
                    <th width="1%">No.</th>
                    <th width="5%">Student No.</th>
                    <th width="20%">Name</th>
                    <th>{RENAME?.course}</th>
                    <th width="15%">{RENAME?.sem}</th>
                    <th width="5%">Edit</th>
                  </tr>
                </thead>
                {data?.length === 0 ? (
                  <tbody>
                    <tr>
                      <td colSpan={8} align="center">
                        No students found
                      </td>
                    </tr>
                  </tbody>
                ) : (
                  <tbody>
                    {data?.map((item, index) => (
                      <tr key={index}>
                        <td>{index + 1}</td>
                        <td>{item.enrollNo}</td>
                        <td>{item.name}</td>
                        <td>{item.courseName}</td>
                        <td>
                          {collegeConfig?.institution_type === 1
                            ? item.className
                            : collegeConfig?.institution_type === 5
                            ? item.batch
                            : item.semester}
                        </td>
                        <td>
                          <Button
                            isTable={true}
                            text="Edit"
                            className="btn-3"
                            title="edit"
                            onClick={() => {
                              collegeConfig?.institution_type === 5
                                ? navigate("/registration", {
                                    state: { id: item.id },
                                  })
                                : collegeConfig?.institution_type === 1
                                ? navigate("/add-school-student", {
                                    state: { id: item.id },
                                  })
                                : navigate("/add-student", {
                                    state: { id: item.id },
                                  });
                            }}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                )}
              </table>
            </div>
          </>
        </div>
      </div>
    </div>
  );
}
export default StudentList;
