import React, { useRef, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import moment from "moment";
import { toast } from "react-toastify";
import * as Yup from "yup";
import { Formik } from "formik";
import { useSelector } from "react-redux";

import attendanceApi from "../../api/attendanceapi";
import LibraryApi from "../../api/libraryapi";

import preFunction from "../../component/common/CommonFunction";
import CustomActivityIndicator from "../../component/common/CustomActivityIndicator";
import Button from "../../component/FormField/Button";
import ScreenTitle from "../../component/common/ScreenTitle";
import DateFieldFormik from "../../component/FormField/DateFieldFormik";
import SelectFieldFormik from "./../../component/FormField/SelectFieldFormik";
import ModalComponent from "../../component/ModalComponent";

import AuthContext from "../../auth/context";
import storage from "../../auth/storage";

function SalarySlipList() {
  const navigate = useNavigate();

  const formikRef = useRef();

  const collegeConfig = useSelector((state) => state.web.college);
  const { collegeId, collegeName, setInstituteArray } = useContext(AuthContext);

  const [data, setData] = useState([]);
  const [needFinalize, setNeedFinalize] = useState(false);
  const [load, setLoad] = useState(false);
  const [showRes, setShowRes] = useState(false);

  const [modalErrorOpen, setModalErrorOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [modalTitle, setModalTitle] = useState("");

  const FormSchema = Yup.object().shape({
    college: collegeConfig.is_university
      ? Yup.object().required("Please Select College")
      : Yup.string().nullable(),
    fromDate: Yup.string().required("Please select Payroll Month"),
  });

  const getAllList = async (values) => {
    setData([]);
    try {
      const salSlipRes = await attendanceApi.getAllSalarySlips(
        moment(values.fromDate).startOf("month").format("yyyy-MM-DD"),
        moment(values.fromDate).endOf("month").format("yyyy-MM-DD"),
        collegeConfig.is_university ? values.college.collegeName : collegeName
      );
      console.log("salSlipRes---", salSlipRes);
      setNeedFinalize(false);
      for (let i = 0; i < salSlipRes.data.data.length; i++) {
        if (salSlipRes.data.data[i].docstatus == 0) {
          setNeedFinalize(true);
          break;
        }
      }
      setData(salSlipRes.data.data);
      setShowRes(true);
    } catch (error) {
      console.log(error);
    }
  };

  const andleSetPayDate = async (collegeId, fromDate) => {
    try {
      const collegeConfigRes = await LibraryApi.getCollegeConfigData(
        collegeId,
        "HRMS_DATA"
      );
      console.log("collegeConfigRes", collegeConfigRes);
      if (!collegeConfigRes.data.message.success) {
        return false;
      }

      let tempData = [...collegeConfigRes.data.message.data.config_data];
      let tempObj = JSON.parse(
        collegeConfigRes.data.message.data.config_data[0].value
      );
      tempObj["PAYROLL_DATE"] = moment(fromDate)
        .endOf("month")
        .format("DD-MM-YYYY");
      tempData[0].value = JSON.stringify(tempObj);
      console.log("tempData", tempData);
      const addorUpdateConfig = await LibraryApi.upDateConfig(
        collegeConfigRes.data.message.data.config_data[0].configID,
        collegeId,
        collegeConfigRes.data.message.data.config_data[0].data,
        tempData[0].value
      );
      console.log("addorUpdateConfig", addorUpdateConfig);

      let institueArr = storage.getInstituteArray();
      console.log("institueArr---", institueArr);
      institueArr.map((item) => {
        console.log("item---", item);
        if (item.collegeID == collegeId) {
          item.PAYROLL_DATE = moment(fromDate)
            .endOf("month")
            .format("DD-MM-YYYY")
            .toString();
        }
      });
      console.log("institueArr---", institueArr);

      const arrayString = JSON.stringify(institueArr);
      sessionStorage.setItem("INSTITUTE_ARR", arrayString);
      setInstituteArray(institueArr);

      if (!addorUpdateConfig.data.message.success) {
        return false;
      }
      return true;
    } catch (error) {
      console.log("error--", error);
      return false;
    }
  };

  const handleFinalize = async () => {
    if (load) return;
    try {
      setLoad(true);
      for (let i = 0; i < data.length; i++) {
        const submitSalarySlipRes = await attendanceApi.submitSalarySlip(
          data[i].name
        );
        console.log("submitSalarySlipRes---", submitSalarySlipRes);
      }
      const payDateUpdateRes = await andleSetPayDate(
        collegeConfig.is_university
          ? formikRef.current.values.college.collegeID
          : collegeId,
        formikRef.current.values.fromDate
      );
      console.log("payDateUpdateRes---", payDateUpdateRes);
      if (!payDateUpdateRes) {
        setModalErrorOpen(true);
        setModalTitle("Message");
        setModalMessage("Failed to update Payroll Date");
        setLoad(false);
      }

      toast.success("Salary Slips Finalized Successfully");
      getAllList(formikRef.current.values);
    } catch (error) {
      console.log("error---", error);
    }
    setLoad(false);
  };

  return (
    <div className="content-area-bigreport" onClick={preFunction.hideNavbar}>
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
            college: collegeConfig.is_university ? "" : collegeId,
            fromDate: moment().subtract(1, "months").format("yyyy-MM"),
          }}
          validationSchema={FormSchema}
          onSubmit={getAllList}
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
                <div className="row no-gutters mt-1 ">
                  <div className="col-lg-9">
                    {collegeConfig.is_university ? (
                      <SelectFieldFormik
                        autoFocus
                        tabIndex={0}
                        label="College"
                        id="college"
                        mandatory={1}
                        options={collegeConfig.collegeList}
                        getOptionLabel={(option) => option.collegeName}
                        getOptionValue={(option) => option.collegeID}
                        searchIcon={false}
                        clear={false}
                        onChange={(text) => {
                          setShowRes(false);
                          setFieldValue("college", text);
                        }}
                        style={{ width: "80%" }}
                      />
                    ) : null}
                    <DateFieldFormik
                      autoFocus={!collegeConfig.is_university}
                      label={"Payroll Month"}
                      id="fromDate"
                      type="month"
                      tabindex={1}
                      mandatory={1}
                      onChange={(e) => {
                        setFieldValue("fromDate", e.target.value);
                        setShowRes(false);
                      }}
                      maxDate={moment().subtract(1, "months")}
                      minDate={moment().subtract(2, "years")}
                      style={{ width: "30%" }}
                    />
                  </div>
                  <Button
                    tabindex={2}
                    text="Show"
                    onClick={(e) => preFunction.handleErrorFocus(errors)}
                  />
                </div>
              </form>
            );
          }}
        </Formik>
        {showRes && (
          <div className="row no-gutters mt-3">
            <div className="table-responsive">
              <table className="table table-bordered table-hover">
                <thead>
                  <tr>
                    <th width="1%">No.</th>
                    <th>Name</th>
                    <th width="12%">Designation</th>
                    <th width="23%">Department</th>
                    <th width="5%">Earnings (₹)</th>
                    <th width="5%">Deductions (₹)</th>
                    <th width="5%">Gross Pay (₹)</th>
                    <th width="5%">Net Pay (₹)</th>
                    <th width="5%">View</th>
                  </tr>
                </thead>
                {data?.length > 0 ? (
                  <tbody>
                    {data.map((item, index) => {
                      return (
                        <tr key={index}>
                          <td>{index + 1}</td>
                          <td>{item.employee_name}</td>
                          <td>{item.designation}</td>
                          <td>{item.department.split("-")[0]}</td>
                          <td align="right">{item.base_gross_pay}</td>
                          <td align="right">{item.total_deduction}</td>
                          <td align="right">{item.gross_pay}</td>
                          <td align="right">{item.net_pay}</td>
                          <td>
                            <Button
                              isTable={true}
                              className="btn-3"
                              onClick={() =>
                                navigate("/view-salary-slip", {
                                  state: {
                                    id: item.name,
                                    employeeId: item.employee,
                                    fromDate: formikRef.current.values.fromDate,
                                  },
                                })
                              }
                              text={"View"}
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                ) : (
                  <tbody>
                    <tr>
                      <td colSpan={20} align="center">
                        No records found
                      </td>
                    </tr>
                  </tbody>
                )}
              </table>
              {data?.length > 0 && needFinalize && (
                <Button
                  isTable={true}
                  type="button"
                  onClick={() => handleFinalize()}
                  text={"Finalize"}
                />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
export default SalarySlipList;
