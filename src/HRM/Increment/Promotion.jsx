import React, { useState, useContext, useRef } from "react";
import { useNavigate } from "react-router-dom";
import HeadingIcon from "@mui/icons-material/TrendingUp";
import { toast } from "react-toastify";
import * as Yup from "yup";
import moment from "moment";
import { Formik } from "formik";

import empApi from "../../api/EmployeeApi";

import preFunction from "../../component/common/CommonFunction";
import CustomActivityIndicator from "../../component/common/CustomActivityIndicator";
import Button from "../../component/FormField/Button";
import SelectFieldFormik from "../../component/FormField/SelectFieldFormik";
import DateFieldFormik from "../../component/FormField/DateFieldFormik";
import TextAreaFieldFormik from "../../component/FormField/TextareaFieldFormik";
import SwitchField from "../../component/FormField/SwitchField";

import EmployeeCard from "../EmployeeCard";

import AuthContext from "../../auth/context";
import DisplayText from "../../component/FormField/DisplayText";
import ScreenTitle from "../../component/common/ScreenTitle";
import CommonApi from "../../component/common/CommonApi";

function Promotion() {
  //#region const
  const navigate = useNavigate();
  const formikRef = useRef();
  const [load, setLoad] = useState(false);
  const [empCodeList, setEmpCodeList] = useState([]);
  const [employeeInfo, setEmployeeInfo] = useState();
  const [prevDate, setPrevDate] = useState();
  const [reportToList, setReportToList] = useState([]);
  const [promotionHistory, setPromotionHistory] = useState([]);
  const [designationList, setDesignationList] = useState([]);
  const [departmentList, setDepartmentList] = useState([]);

  const { setUnSavedChanges } = useContext(AuthContext);
  //#endregion

  const formSchema = Yup.object().shape({
    promotionDate: Yup.date()
      .min(
        moment(prevDate).toDate(),
        "Promotion Date should be greater than " +
          moment(prevDate).format("DD-MM-YYYY")
      )
      .max(
        moment().toDate(),
        `Promotion Date should be less than ${moment().format("DD-MM-YYYY")}`
      )
      .required("Please select Promotion Date"),

    designation: Yup.object().required("Please select Designation"),
    reason: Yup.string().required("Please enter Promotion Note"),
  });

  const handleUnSavedChanges = (changed) => {
    if (changed == 1) {
      sessionStorage.setItem("unSavedChanges", true);
      setUnSavedChanges(true);
    } else {
      sessionStorage.setItem("unSavedChanges", false);
      setUnSavedChanges(false);
    }
  };

  const handleSave = async (values, { resetForm }) => {
    if (load) return;
    console.log("values-->", values);
    console.log("employeeInfo-->", employeeInfo);
    let promotionArray = [];
    if (values.designation) {
      let object = {
        property: "Designation",
        current: employeeInfo.designation,
        new: values.designation.designation,
        fieldname: "designation",
      };
      promotionArray.push(object);
    }
    if (values.department) {
      let object = {
        property: "Department",
        current: employeeInfo.department,
        new: values.department.department_id,
        fieldname: "department",
      };
      promotionArray.push(object);
    }
    if (values.reportTo) {
      let object = {
        property: "Reports To",
        current: employeeInfo.reports_to,
        new: values.reportTo.name,
        fieldname: "reports_to",
      };
      promotionArray.push(object);
    }
    console.log("promotionArray---", promotionArray);

    try {
      setLoad(true);
      if (promotionArray.length > 0) {
        const promotionRes = await empApi.addPromotion(
          values.employeeCode.name,
          moment(values.promotionDate).format("YYYY-MM-DD"),
          promotionArray,
          values.reason
        );
        console.log("PrmotionRes--->", promotionRes);
        if (promotionRes.ok) {
          handleUnSavedChanges(0);
          toast.success(`Promotion processed Successfully`);
          resetForm();
          if (values.isIncrement) {
            navigate("/increment", {
              state: {
                id: values.employeeCode.name,
              },
            });
          } else {
            document.getElementById("employeeCode").focus();
          }
        }
      }
      setLoad(false);
    } catch (error) {
      setLoad(false);
      console.log("error", error);
    }
  };

  const searchEmployee = async (text) => {
    setEmpCodeList(await CommonApi.searchEmployee(text));
  };

  const handleGetEmployeeDetails = async (employeeDetail) => {
    console.log("employeeInfo", employeeInfo);
    try {
      setLoad(true);
      setEmployeeInfo(employeeDetail);

      const masterRes = await empApi.getAllMasters(
        2,
        employeeDetail?.custom_college_id
      );
      console.log("masterRes---", masterRes);
      setDepartmentList(masterRes.data.message.data.department);
      let designationList = masterRes.data.message.data.designation.filter(
        (item) => item.designation !== employeeDetail.designation
      );
      setDesignationList(designationList);
      let reportTo = masterRes.data.message.data.reportTo.filter(
        (item) => item.name !== employeeDetail.name
      );
      console.log(reportTo);
      setReportToList(reportTo);

      const getPromotionListRes = await empApi.getPromotionListByEmployee(
        employeeDetail.name
      );
      console.log("getPromotionListRes--->", getPromotionListRes);
      setPromotionHistory(getPromotionListRes.data.message.data);

      if (getPromotionListRes.data.message.data.length > 0) {
        setPrevDate(getPromotionListRes.data.message.data[0].promotion_date);
      } else {
        setPrevDate(employeeDetail.date_of_joining);
      }
      document.getElementById("promotionDate")?.focus();
      setLoad(false);
    } catch (error) {
      setLoad(false);
      console.log("error----", error);
    }
  };

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
            initialValues={{
              employeeCode: "",
              promotionDate: "",
              designation: "",
              department: "",
              reportTo: "",
              reason: "",
              isIncrement: false,
            }}
            validationSchema={formSchema}
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
                  <div className="row no-gutters">
                    <div className="col-lg-9">
                      <SelectFieldFormik
                        autoFocus
                        label="Employee No. / Name"
                        id="employeeCode"
                        mandatory={1}
                        style={{ width: "60%" }}
                        options={empCodeList}
                        searchIcon={true}
                        tabIndex={1}
                        labelSize={3}
                        clear={true}
                        getOptionLabel={(option) =>
                          option.custom_employeeid +
                          " - " +
                          option.employee_name
                        }
                        getOptionValue={(option) => option.name}
                        onInputChange={(inputValue) => {
                          searchEmployee(inputValue);
                        }}
                        onChange={(text) => {
                          formikRef.current?.resetForm();
                          if (text) {
                            setFieldValue("employeeCode", text);
                            handleGetEmployeeDetails(text);
                          }
                        }}
                      />
                    </div>
                    {values.employeeCode ? (
                      <>
                        <div className="subhead-row">
                          <div className="subhead">Employee Details</div>
                          <div className="col line-div"></div>
                        </div>
                        {employeeInfo && (
                          <EmployeeCard employeeInfo={employeeInfo} />
                        )}
                        <div className="subhead-row">
                          <div className="subhead">Promotion History </div>
                          <div className="col line-div"></div>
                        </div>
                        <div className="row no-gutters">
                          <table className="table table-bordered">
                            <thead>
                              <tr>
                                <th width="1%">No.</th>
                                <th width="9%">Date</th>
                                <th width="15%">Old Designation</th>
                                <th width="15%">New Designation</th>
                                <th>Old Dept</th>
                                <th>New Dept</th>
                                <th width="10%">Old Reports To</th>
                                <th width="10%">New Reports To</th>
                              </tr>
                            </thead>
                            {promotionHistory.length == 0 ? (
                              <tbody>
                                <tr>
                                  <td colSpan="10" className="text-center">
                                    No data found
                                  </td>
                                </tr>
                              </tbody>
                            ) : (
                              <tbody>
                                {promotionHistory.map((item, index) => (
                                  <tr key={index}>
                                    <td>{index + 1}</td>
                                    <td>
                                      {moment(item.promotion_date).format(
                                        "DD-MM-YYYY"
                                      )}
                                    </td>
                                    <td>{item.oldDesignation}</td>
                                    <td>{item.newDesignation}</td>
                                    <td>{item.oldDepartment?.split("-")[0]}</td>
                                    <td>{item.newDepartment?.split("-")[0]}</td>
                                    <td>{item.oldReportsTo}</td>
                                    <td>{item.newReportsTo}</td>
                                  </tr>
                                ))}
                              </tbody>
                            )}
                          </table>
                        </div>
                        <div className="subhead-row">
                          <div className="subhead">Promotion Detail </div>
                          <div className="col line-div"></div>
                        </div>
                        <div className="col-lg-10">
                          <DisplayText
                            label="Date of Joining"
                            value={moment(employeeInfo?.date_of_joining).format(
                              "DD-MM-YYYY"
                            )}
                            labelSize={3}
                          />
                          <DateFieldFormik
                            label="Promotion Date"
                            id="promotionDate"
                            maxDate={null}
                            minDate={null}
                            mandatory={1}
                            tabIndex={2}
                            style={{ width: "25%" }}
                            labelSize={3}
                            onChange={(e) => {
                              setFieldValue("promotionDate", e.target.value);
                              handleUnSavedChanges(1);
                            }}
                          />
                          <SelectFieldFormik
                            label="Designation"
                            id="designation"
                            mandatory={1}
                            labelSize={3}
                            tabIndex={3}
                            options={designationList}
                            getOptionLabel={(option) => option.designation}
                            getOptionValue={(option) => option.designation}
                            style={{ width: "60%" }}
                            onChange={(text) => {
                              setFieldValue("designation", text);
                              handleUnSavedChanges(1);
                            }}
                          />
                          <SelectFieldFormik
                            label="Department"
                            id="department"
                            labelSize={3}
                            tabIndex={4}
                            clear={true}
                            options={departmentList}
                            style={{ width: "60%" }}
                            getOptionLabel={(option) => option.department}
                            getOptionValue={(option) => option.department_id}
                            onChange={(text) => {
                              setFieldValue("department", text);
                              handleUnSavedChanges(1);
                            }}
                          />
                          <SelectFieldFormik
                            label="Report To"
                            id="reportTo"
                            labelSize={3}
                            tabIndex={5}
                            clear={true}
                            getOptionLabel={(option) =>
                              option.custom_employeeid +
                              " - " +
                              option.employee_name
                            }
                            getOptionValue={(option) => option.name}
                            options={reportToList}
                            style={{ width: "60%" }}
                            onChange={(text) => {
                              setFieldValue("reportTo", text);
                              handleUnSavedChanges(1);
                            }}
                          />

                          <TextAreaFieldFormik
                            maxlength={120}
                            id={`reason`}
                            labelSize={3}
                            tabIndex={6}
                            name="reason"
                            label="Promotion Note"
                            value={values.reason}
                            style={{ width: "70%" }}
                            mandatory={1}
                            onChange={(e) => {
                              setFieldValue("reason", e.target.value);
                              handleUnSavedChanges(1);
                            }}
                          />

                          <SwitchField
                            label="Apply Increment"
                            id="isIncrement"
                            tabIndex={7}
                            labelSize={3}
                            yesOption="Yes"
                            noOption="No"
                            checked={values.isIncrement}
                            onChange={(text) => {
                              setFieldValue("isIncrement", text);
                              handleUnSavedChanges(1);
                            }}
                          />
                        </div>
                        <Button
                          id="save"
                          text="F4 - Save"
                          tabIndex={8}
                          type="submit"
                          onClick={(e) => {
                            preFunction.handleErrorFocus(errors);
                          }}
                        />
                      </>
                    ) : null}
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

export default Promotion;
