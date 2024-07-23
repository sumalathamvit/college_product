import React, { useEffect, useState, useRef, useContext } from "react";
import { Modal } from "react-bootstrap";
import { Formik } from "formik";
import { useSelector } from "react-redux";
import HeadingIcon from "@mui/icons-material/SignalCellularAlt";
import * as Yup from "yup";
import moment from "moment";
import { toast } from "react-toastify";

import empApi from "../../api/EmployeeApi";

import ErrorMessage from "../../component/common/ErrorMessage";
import SelectFieldFormik from "../../component/FormField/SelectFieldFormik";
import Button from "../../component/FormField/Button";
import DateFieldFormik from "../../component/FormField/DateFieldFormik";
import DateField from "../../component/FormField/DateField";
import preFunction from "../../component/common/CommonFunction";
import CustomActivityIndicator from "../../component/common/CustomActivityIndicator";
import DisplayText from "../../component/FormField/DisplayText";
import AuthContext from "../../auth/context";
import ScreenTitle from "../../component/common/ScreenTitle";

function IncrementDateDetails() {
  const formikRef = useRef();
  const [load, setLoad] = useState(false);
  const [designationList, setDesignationList] = useState([]);
  const [departmentList, setDepartmentList] = useState([]);
  const [changeIncrementDate, setChangeIncrementDate] = useState("");
  const [updateEmployeeArr, setUpdateEmployeeArr] = useState([]);
  const [incrementDateError, setIncrementDateError] = useState(false);
  const [emptyMonthError, setEmptyMonthError] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [showRes, setShowRes] = useState(false);
  // const [empCodeList, setEmpCodeList] = useState([]);
  const [employeeArr, setEmployeeArr] = useState([]);
  const collegeConfig = useSelector((state) => state.web.college);
  const { collegeId, collegeName } = useContext(AuthContext);

  const FormSchema = Yup.object().shape({
    college: collegeConfig.is_university
      ? Yup.object().required("Please select College")
      : Yup.mixed().notRequired(),
    incrementDate: Yup.date().required("Please select Month / Year"),
  });

  const handleSave = async () => {
    if (load) return;
    setIncrementDateError(false);
    setEmptyMonthError(false);

    if (changeIncrementDate == "") {
      setEmptyMonthError(true);
      document.getElementById("changeIncrementDate").focus();
      return;
    }
    if (
      changeIncrementDate < moment().format("YYYY-MM-DD") ||
      // changeIncrementDate <= moment(updateEmployeeArr.dateOfJoining).format("YYYY-MM-DD") ||
      changeIncrementDate > moment().add(3, "years").format("YYYY-MM-DD")
    ) {
      setIncrementDateError(true);
      document.getElementById("changeIncrementDate").focus();
      return;
    }
    console.log("empId", updateEmployeeArr.employeeID);
    console.log("date", moment(changeIncrementDate).format("YYYY-MM-DD"));
    try {
      setLoad(true);

      const changeIncrementDateRes = await empApi.editIncrementDate(
        updateEmployeeArr.employeeID,
        moment(changeIncrementDate).format("YYYY-MM-DD")
      );
      console.log("changeIncrementDateRes", changeIncrementDateRes);
      if (!changeIncrementDateRes.ok) {
        setLoad(false);
        return;
      }
      setOpenModal(false);
      toast.success("Increment Month Updated Successfully");
      setShowRes(true);
      setChangeIncrementDate("");
      handleShow(formikRef.current.values);

      setLoad(false);
    } catch (error) {
      setLoad(false);
      console.log("error---", error);
    }
  };

  const handleShow = async (values) => {
    console.log("values", values);
    setShowRes(true);
    try {
      const incrementDateDetails = await empApi.getIncrementDateDetails(
        collegeConfig.is_university ? values.college.collegeID : collegeId,
        moment(values.incrementDate).startOf("month").format("YYYY-MM-DD"),
        moment(values.incrementDate).endOf("month").format("YYYY-MM-DD"),
        values.employeeCode ? values.employeeCode.name : null,
        values.designation ? values.designation.designation : null,
        values.designationCategory
          ? values.designationCategory.designationCategory
          : null,
        values.department ? values.department.department_id : null
      );

      console.log("incrementDateDetails", incrementDateDetails);
      setEmployeeArr(incrementDateDetails.data.message.data);
    } catch (error) {
      setLoad(false);
      console.log("error", error);
    }
  };

  // const searchEmployee = async (text) => {
  //   try {
  //     if (text.length > 2) {
  //       const employeeRes = await empApi.employeeSearch(text);
  //       console.log("empList", employeeRes);
  //       setEmpCodeList(employeeRes.data.message.employee_data);
  //     } else {
  //       setEmpCodeList([]);
  //     }
  //   } catch (error) {
  //     console.log("error----", error);
  //   }
  // };

  const getAllList = async (collegeId) => {
    console.log("collegeId", collegeId);
    try {
      const masterRes = await empApi.getAllMasters(2, collegeId);
      console.log("masterRes---", masterRes);
      setDesignationList(masterRes.data.message.data.designation);
      setDepartmentList(masterRes.data.message.data.department);
    } catch (error) {
      console.log("error----", error);
    }
  };

  useEffect(() => {
    if (!collegeConfig.is_university) {
      getAllList(collegeId);
    }
  }, [collegeConfig.is_university]);

  return (
    <div className="content-area-report" onClick={preFunction.hideNavbar}>
      <CustomActivityIndicator
        style={{ height: 100, alignSelf: "center" }}
        visible={load}
      />
      <div className="row no-gutters bg-white-report">
        <ScreenTitle titleClass="page-heading-position-report" />
        <div className="row no-gutters mt-1">
          <Formik
            innerRef={formikRef}
            enableReinitialize={true}
            initialValues={{
              college: "",
              employeeCode: "",
              incrementDate: moment().format("YYYY-MM-DD"),
              designation: "",
              department: "",
              designationCategory: "",
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
                  <div className="row no-gutters">
                    <div className="col-lg-9">
                      {collegeConfig.is_university && (
                        <SelectFieldFormik
                          autoFocus
                          labelSize={3}
                          tabIndex={1}
                          label="College"
                          id="college"
                          mandatory={1}
                          options={collegeConfig.collegeList}
                          getOptionLabel={(option) => option.collegeName}
                          getOptionValue={(option) => option.collegeID}
                          searchIcon={false}
                          clear={false}
                          style={{ width: "80%" }}
                          onChange={(text) => {
                            setFieldValue("college", text);
                            console.log("text", text);
                            setShowRes(false);
                            getAllList(text?.collegeID);
                          }}
                        />
                      )}
                      <DateFieldFormik
                        autoFocus={!collegeConfig.is_university}
                        type="month"
                        tabIndex={2}
                        label="Increment Month / Year"
                        id="incrementDate"
                        style={{ width: "30%" }}
                        labelSize={3}
                        mandatory={1}
                        onChange={(e) => {
                          setFieldValue("incrementDate", e.target.value);
                          setShowRes(false);
                        }}
                        minDate={moment().subtract(5, "months")}
                        maxDate={moment().add(3, "years")}
                      />
                      <SelectFieldFormik
                        label="Department"
                        id="department"
                        tabIndex={3}
                        labelSize={3}
                        clear={true}
                        options={departmentList}
                        style={{ width: "80%" }}
                        getOptionLabel={(option) => option.department}
                        getOptionValue={(option) => option.department_id}
                        onChange={(text) => {
                          setFieldValue("department", text);
                          setShowRes(false);
                        }}
                      />
                      <SelectFieldFormik
                        label="Designation"
                        id="designation"
                        tabIndex={4}
                        labelSize={3}
                        clear={true}
                        getOptionLabel={(option) => option.designation}
                        getOptionValue={(option) => option.designation}
                        options={designationList}
                        style={{ width: "60%" }}
                        onChange={(text) => {
                          setFieldValue("designation", text);
                          setShowRes(false);
                        }}
                      />
                    </div>
                    <Button
                      text="Show"
                      tabIndex={6}
                      onClick={(e) => preFunction.handleErrorFocus(errors)}
                    />
                    {showRes ? (
                      <>
                        <div className="subhead-row">
                          <div className="subhead">Employee Details</div>
                          <div className="col line-div"></div>
                        </div>
                        <div className="table-responsive row mt-2 p-0">
                          <table className="table table-bordered table-hover">
                            <thead>
                              <tr>
                                <th width="1%">No.</th>
                                <th width="12%">Employee No.</th>
                                <th>Name</th>
                                <th width="10%">Date of Joining</th>
                                <th width="10%">Increment Month</th>
                                <th width="5%">Experience (Year)</th>
                                <th width="5%">Leave Without Pay</th>
                                <th width="10%">Modify Month</th>
                              </tr>
                            </thead>
                            <tbody>
                              {employeeArr.length === 0 ? (
                                <tr>
                                  <td colspan={9} align="center">
                                    No Employee found
                                  </td>
                                </tr>
                              ) : (
                                employeeArr.map((item, index) => {
                                  return (
                                    <tr key={index}>
                                      <td>{index + 1}</td>
                                      <td>{item.custom_employeeid}</td>
                                      <td>{item.name}</td>
                                      <td>
                                        {moment(item.dateOfJoining).format(
                                          "DD-MM-YYYY"
                                        )}
                                      </td>
                                      <td>
                                        {moment(item.incrementDate).format(
                                          "MMMM-YYYY"
                                        )}
                                      </td>
                                      <td>{item.experience}</td>
                                      <td>{item.lopCount}</td>
                                      <td className="text-center">
                                        <Button
                                          isTable={true}
                                          className={"btn-3"}
                                          text="Modify Month"
                                          type="button"
                                          onClick={() => {
                                            setOpenModal(true);
                                            setUpdateEmployeeArr(item);
                                            setChangeIncrementDate("");
                                            setIncrementDateError(false);
                                            setEmptyMonthError(false);
                                          }}
                                        />
                                      </td>
                                    </tr>
                                  );
                                })
                              )}
                            </tbody>
                          </table>
                        </div>
                      </>
                    ) : null}
                  </div>
                </form>
              );
            }}
          </Formik>
        </div>
      </div>
      <Modal
        show={openModal}
        onEscapeKeyDown={(e) => {
          setOpenModal(false);
          setChangeIncrementDate("");
        }}
      >
        <Modal.Header>
          <Modal.Title>Modify Increment Month</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <DisplayText
            label="Employee No."
            value={updateEmployeeArr?.custom_employeeid}
          />
          <DisplayText label="Name" value={updateEmployeeArr?.name} />
          <DisplayText
            label="Date of Joining"
            value={moment(updateEmployeeArr.dateOfJoining).format("DD-MM-yyyy")}
          />
          <DisplayText
            label="Increment Date"
            value={moment(updateEmployeeArr.incrementDate).format("DD-MM-yyyy")}
          />
          <DisplayText
            label="Experience in years"
            value={updateEmployeeArr?.experience}
          />
          <DisplayText
            label="Loss of Pay"
            value={updateEmployeeArr?.lopCount}
          />
          <div className="row no-gutters">
            <label className="col-lg-5 mt-2 text-right pe-3">
              Increment Month / Year
            </label>
            <div className="col-lg-7">
              <DateField
                type="month"
                id="changeIncrementDate"
                value={changeIncrementDate}
                style={{ width: "60%" }}
                mandatory={1}
                onChange={(e) => {
                  setChangeIncrementDate(e.target.value);
                  setIncrementDateError(false);
                  setEmptyMonthError(false);
                }}
                error={
                  incrementDateError
                    ? "Please select greater than current month"
                    : emptyMonthError
                    ? "Please select Month & Year"
                    : ""
                }
                minDate={moment()}
                maxDate={moment().add(3, "years")}
              />
            </div>
            {/* <div className="row no-gutters">
              <label className="control-label col-lg-5"></label>
              <div className="col-lg-7 mt-1">
                <ErrorMessage
                  Message={"Please select valid Month / Year"}
                  view={incrementDateError}
                />
              </div>
            </div> */}
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button
            id="save"
            frmButton={false}
            text="F4 - Save"
            type="button"
            onClick={(e) => {
              handleSave();
            }}
          />
          <Button
            id="close"
            frmButton={false}
            text="Close"
            type="button"
            onClick={(e) => {
              setOpenModal(false);
              setChangeIncrementDate("");
              setIncrementDateError(false);
              setEmptyMonthError(false);
            }}
          />
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default IncrementDateDetails;
