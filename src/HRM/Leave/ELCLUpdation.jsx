import React, { useEffect, useState, useContext } from "react";
import HeadingIcon from "@mui/icons-material/DateRange";
import moment from "moment";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

import empApi from "../../api/EmployeeApi";

import { authorizedByList } from "../../component/common/CommonArray";
import Button from "../../component/FormField/Button";
import EmployeeCard from "../EmployeeCard";
import ErrorMessage from "../../component/common/ErrorMessage";
import preFunction from "../../component/common/CommonFunction";
import CustomActivityIndicator from "../../component/common/CustomActivityIndicator";
import ReactSelectField from "../../component/FormField/ReactSelectField";
import TextField from "../../component/FormField/TextField";
import ModalComponent from "../../component/ModalComponent";
import AuthContext from "../../auth/context";
import ScreenTitle from "../../component/common/ScreenTitle";

function LeaveUpdation() {
  const navigate = useNavigate();

  const [load, setLoad] = useState(false);
  const [showErrorMessage, setShowErrorMessage] = useState(false);
  const [empCodeList, setEmpCodeList] = useState([]);
  const [leaveTypeError, setLeaveTypeError] = useState(false);
  const [opBalanceError, setOpBalanceError] = useState(false);
  const [balanceValidationError, setBalanceValidationError] = useState(false);
  const [empCode, setEmpCode] = useState("");
  const [leaveType, setLeaveType] = useState("");
  const [leaveTypeList, setLeaveTypeList] = useState([]);
  const [allocatedLeave, setAllocatedLeave] = useState([]);
  const [maxCount, setMaxCount] = useState(0);
  const [note, setNote] = useState("");
  const [noteError, setNoteError] = useState(false);
  const [authorizedBy, setAuthorizedBy] = useState("");
  const [authorizedByError, setAuthorizedByError] = useState(false);
  const [opBalance, setOpBalance] = useState();
  const [employeeInfo, setEmployeeInfo] = useState();

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

  const closeErrors = () => {
    setNoteError(false);
    setLeaveTypeError(false);
    setOpBalanceError(false);
    setAuthorizedByError(false);
    setShowErrorMessage(false);
    setBalanceValidationError(false);
  };

  const handleSubmit = async () => {
    try {
      setLoad(true);
      console.log(
        "allocatedLeave---",
        allocatedLeave[0][leaveType.value].leaves_taken,
        opBalance
      );
      const checkLeaveAllocation = await empApi.checkLeave(
        empCode.name,
        leaveType.value
      );
      console.log("checkLeaveAllocation", checkLeaveAllocation);
      if (checkLeaveAllocation.data.data[0].name) {
        if (opBalance > allocatedLeave[0][leaveType.value].leaves_taken) {
          const editLeaveAllocation = await empApi.editLeaveAllocation(
            checkLeaveAllocation.data.data[0].name,
            parseFloat(opBalance),
            authorizedBy.value,
            note
          );
          console.log("editLeaveAllocation", editLeaveAllocation);
          if (!editLeaveAllocation.ok) {
            setModalMessage(
              JSON.parse(
                JSON.parse(editLeaveAllocation.data._server_messages)[0]
              ).message
            );
            setModalTitle("Message");
            setModalErrorOpen(true);
            setLoad(false);
            return false;
          }
          handleUnSavedChanges(0);
          toast.success("Leave Allocation Updated Successfully");
        } else {
          setModalMessage(
            "The Employee already taken" +
              " " +
              allocatedLeave[0][leaveType.value].leaves_taken +
              " " +
              "Leaves"
          );
          setModalTitle("Message");
          setModalErrorOpen(true);
          setLoad(false);
          return false;
        }
      }
      handleGetEmployeeLeaveDetails(empCode.name);
      setLoad(false);
      return true;
    } catch (error) {
      setLoad(false);
      console.log("error", error);
    }
  };

  const handleLeaveError = async () => {
    closeErrors();
    let err = false;
    if (!note) {
      err = true;
      setNoteError(true);
      document.getElementById("note")?.focus();
    }
    if (maxCount < opBalance) {
      err = true;
      setBalanceValidationError(true);
      document.getElementById("opBalance")?.focus();
    }
    if (!opBalance) {
      err = true;
      setOpBalanceError(true);
      document.getElementById("opBalance")?.focus();
    }
    if (!leaveType) {
      err = true;
      setLeaveTypeError(true);
      document.getElementById("leaveType")?.focus();
    }
    if (authorizedBy == "") {
      err = true;
      setAuthorizedByError(true);
      document.getElementById("authorizedBy")?.focus();
    }
    if (err) return true;
  };

  const handleLeaveAllocation = async () => {
    if (load) return;
    let err = false;
    err = await handleLeaveError();
    if (err) return;
    if (await handleSubmit()) {
      setAuthorizedBy("");
      setLeaveType("");
      setOpBalance("");
      setNote("");
    }
  };

  const handleGetEmployeeLeaveDetails = async (employeeId) => {
    try {
      setLoad(true);
      const leaveAllocation = await empApi.viewEmployeeLeveAllocation(
        employeeId,
        moment().format("YYYY-MM-DD")
      );
      if (
        Object.keys(leaveAllocation.data.message.leave_allocation).length === 0
      ) {
        setAllocatedLeave([]);
        setLeaveTypeList([]);
        setShowErrorMessage(true);
      } else {
        setShowErrorMessage(false);
        delete leaveAllocation.data.message.leave_allocation["Tour"];
        setAllocatedLeave([leaveAllocation.data.message.leave_allocation]);
        let leaveAllocateArr = Object.keys(
          leaveAllocation.data.message.leave_allocation
        );
        let leaveTypeArr = [];
        for (let i = 0; i < leaveAllocateArr.length; i++) {
          if (leaveAllocateArr[i] != "Tour") {
            leaveTypeArr.push({
              label: leaveAllocateArr[i],
              value: leaveAllocateArr[i],
            });
          }
        }
        setLeaveTypeList(leaveTypeArr);
      }
      setLoad(false);
    } catch (error) {
      setLoad(false);
      console.log("error----", error);
    }
  };

  const handleGetEmployeeDetails = async (employeeDetail) => {
    setAuthorizedBy("");
    setLeaveType("");
    setOpBalance("");
    setNote("");
    try {
      setLoad(true);
      setEmployeeInfo(employeeDetail);
      handleGetEmployeeLeaveDetails(employeeDetail.name);
      setLoad(false);
    } catch (error) {
      setLoad(false);
      console.log("error----", error);
    }
  };

  const employeeSearch = async (value) => {
    setEmpCodeList([]);
    try {
      if (value.length > 2) {
        const employeeRes = await empApi.employeeSearch(value);
        console.log("employeeRes", employeeRes.data.message.employee_data[0]);
        setEmpCodeList(employeeRes.data.message.employee_data);
      }
    } catch (error) {
      console.log("error----", error);
    }
  };

  const handleLeave = async (leaveType) => {
    try {
      if (leaveType) {
        const validateLeave = await empApi.getLeaveTypeCount(leaveType.label);
        console.log("validateLeave---", validateLeave, leaveType.label);
        if (validateLeave.data.data.length > 0) {
          if (validateLeave.data.data[0].max_leaves_allowed === 365) {
            setMaxCount(preFunction.getDaysPassed(moment()));
          } else setMaxCount(validateLeave.data.data[0].max_leaves_allowed);
        }
      }
    } catch (error) {
      setLoad(false);
      console.log("error----", error);
    }
  };

  useEffect(() => {}, []);

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
        <div className="col-lg-9">
          <ReactSelectField
            autoFocus
            label="Employee No. / Name"
            id="empCode"
            mandatory={1}
            labelSize={3}
            clear={true}
            style={{ width: "70%" }}
            tabIndex={1}
            value={empCode}
            search={true}
            options={empCodeList}
            getOptionLabel={(option) =>
              option.custom_employeeid + " - " + option.employee_name
            }
            getOptionValue={(option) => option.name}
            onInputChange={(inputValue) => {
              employeeSearch(inputValue);
            }}
            onChange={(text) => {
              setEmpCode(text);
              handleGetEmployeeDetails(text);
              closeErrors();
            }}
          />
        </div>
        {empCode ? (
          <>
            <div className="subhead-row">
              <div className="subhead">Employee Details</div>
              <div className="col line-div"></div>
            </div>

            {employeeInfo && <EmployeeCard employeeInfo={employeeInfo} />}

            <ErrorMessage
              Message={"Please allocate leave for this Employee"}
              view={showErrorMessage}
            />
          </>
        ) : null}
        {empCode && allocatedLeave.length > 0 ? (
          <div className="row p-0">
            <div className="subhead-row p-0">
              <div className="subhead">Allocated Leaves</div>
              <div className="col line-div"></div>
            </div>
            <div className=" col-lg-2"></div>
            <div className="col-lg-8 mt-1">
              <table className="table table-bordered table-hover m-0">
                <thead>
                  <tr>
                    <th width="1%">No.</th>
                    <th>Leave Type</th>
                    <th>Opening Balance</th>
                    <th>Availed</th>
                    <th>Balance</th>
                  </tr>
                </thead>
                <tbody>
                  {allocatedLeave.map((item, index) => {
                    return Object.keys(item).map((data, index) => {
                      return (
                        <tr key={index}>
                          <td>{index + 1}</td>
                          <td>{data}</td>
                          <td>{item[data].total_leaves}</td>
                          <td>{item[data].leaves_taken}</td>
                          <td>{item[data].remaining_leaves}</td>
                        </tr>
                      );
                    });
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : null}
        {empCode && !showErrorMessage ? (
          <>
            <div className="subhead-row">
              <div className="subhead">Update Allocated Leaves</div>
              <div className="col line-div"></div>
            </div>
            <div className="col-lg-9">
              <ReactSelectField
                label="Authorized By"
                id="authorizedBy"
                searchIcon={false}
                mandatory={1}
                maxlength={15}
                labelSize={3}
                tabIndex={2}
                value={authorizedBy}
                placeholder="Authorized By"
                options={authorizedByList}
                style={{ width: "50%" }}
                onChange={(etxt) => {
                  closeErrors();
                  setAuthorizedBy(etxt);
                  handleUnSavedChanges(1);
                }}
                error={authorizedByError ? "Please select Authorized By" : ""}
                touched={authorizedByError ? true : false}
              />

              <ReactSelectField
                id="leaveType"
                searchIcon={false}
                mandatory={1}
                maxlength={16}
                labelSize={3}
                tabIndex={3}
                style={{ width: "50%" }}
                value={leaveType}
                label="Leave type"
                placeholder="Leave type"
                options={leaveTypeList}
                onChange={(etxt) => {
                  closeErrors();
                  setLeaveType(etxt);
                  handleLeave(etxt);
                  handleUnSavedChanges(1);
                }}
                error={leaveTypeError ? "Please select Leave Type" : ""}
                touched={leaveTypeError ? true : false}
              />

              <TextField
                id="opBalance"
                name="opBalance"
                label="Opening Balance"
                placeholder="Balance"
                labelSize={3}
                tabIndex={4}
                value={opBalance > 0 ? opBalance : ""}
                maxlength={3}
                mandatory={1}
                style={{ width: "20%" }}
                onChange={(e) => {
                  closeErrors();
                  if (
                    !isNaN(e.target.value) &&
                    !e.target.value.includes(" ") &&
                    !e.target.value.includes(".")
                  )
                    setOpBalance(e.target.value);
                  setBalanceValidationError(false);
                  handleUnSavedChanges(1);
                }}
                error={
                  opBalanceError
                    ? "Please enter Opening Balance"
                    : balanceValidationError
                    ? "Maximum" + " " + maxCount + " " + "only allowed"
                    : ""
                }
                touched={
                  opBalanceError ? true : balanceValidationError ? true : false
                }
              />

              <TextField
                id="note"
                name="note"
                label="Note"
                labelSize={3}
                tabIndex={5}
                placeholder="Note"
                value={note}
                mandatory={1}
                style={{ width: "70%" }}
                maxlength={140}
                onChange={(e) => {
                  closeErrors();
                  setNote(e.target.value);
                  handleUnSavedChanges(1);
                }}
                error={noteError ? "Please enter Note" : ""}
                touched={noteError ? true : false}
              />
            </div>
            <Button
              id="save"
              text={"F4 - Save"}
              tabIndex={6}
              onClick={(e) => {
                handleLeaveAllocation();
              }}
            />
          </>
        ) : null}
      </div>
    </div>
  );
}

export default LeaveUpdation;
