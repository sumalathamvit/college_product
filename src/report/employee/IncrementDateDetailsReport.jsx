import React, { useEffect, useState, useRef, useContext } from "react";
import { Formik } from "formik";
import * as Yup from "yup";
import moment from "moment";
import HeadingIcon from "@mui/icons-material/CurrencyRupee";
import { useNavigate } from "react-router-dom";

import empApi from "../../api/EmployeeApi";

import SelectFieldFormik from "../../component/FormField/SelectFieldFormik";
import Button from "../../component/FormField/Button";
import DateFieldFormik from "../../component/FormField/DateFieldFormik";
import preFunction from "../../component/common/CommonFunction";
import CustomActivityIndicator from "../../component/common/CustomActivityIndicator";
import { useSelector } from "react-redux";
import AuthContext from "../../auth/context";
import CommonApi from "../../component/common/CommonApi";
import ScreenTitle from "../../component/common/ScreenTitle";

function IncrementDateDetailsReport() {
  const navigate = useNavigate();
  const formikRef = useRef();
  const [load, setLoad] = useState(false);
  const [designationList, setDesignationList] = useState([]);
  const [designationCategoryList, setDesignationCategoryList] = useState([]);
  const [departmentList, setDepartmentList] = useState([]);
  const [showRes, setShowRes] = useState(false);
  const [empCodeList, setEmpCodeList] = useState([]);
  const [employeeArr, setEmployeeArr] = useState([]);
  const collegeConfig = useSelector((state) => state.web.college);
  const { collegeId, collegeName } = useContext(AuthContext);

  const FormSchema = Yup.object().shape({
    college: collegeConfig.is_university
      ? Yup.object().required("Please select College")
      : Yup.mixed().notRequired(),
    incrementDate: Yup.date().required("Please select Date"),
  });

  const handleCSVData = async (values, type) => {
    console.log("values", values);
    try {
      const csvData = [
        [
          "No.",
          // "Employee No.",
          "Name",
          "Date of Joining",
          "Increment Date",
          "Experience",
          "Loss of Pay",
        ],
      ];
      values.map((item, index) => {
        csvData[index + 1] = [
          index + 1,
          // item.employeeID,
          item.name,
          moment(item.dateOfJoining).format("DD-MM-YYYY"),
          moment(item.incrementDate).format("DD-MM-YYYY"),
          item.experience,
          item.lopCount,
        ];
      });
      if (type == 1) {
        preFunction.generatePDF(
          collegeName,
          "Increment Date Details Report",
          csvData
        );
      } else {
        preFunction.downloadCSV(csvData, "Increment Date Details Report.csv");
      }
    } catch (error) {
      setLoad(false);
      console.log("error", error);
    }
  };

  const handleShow = async (values, type = 0) => {
    if (load) return;
    console.log("values", values);
    setShowRes(true);
    try {
      setLoad(true);
      const incrementDateDetails = await empApi.getIncrementDateDetails(
        collegeConfig.is_university ? values.college.collegeID : collegeId,
        values.incrementDate
          ? moment(values.incrementDate).startOf("month").format("YYYY-MM-DD")
          : null,
        values.incrementDate
          ? moment(values.incrementDate).endOf("month").format("YYYY-MM-DD")
          : null,
        values.employeeCode ? values.employeeCode.name : null,
        values.designation && values.designation.designation != "All"
          ? values.designation.designation
          : null,
        values.designationCategory &&
          values.designationCategory.designationCategory != "All"
          ? values.designationCategory.designationCategory
          : null,
        values.department ? values.department.department_id : null
      );

      console.log("incrementDateDetails", incrementDateDetails);
      if (type) {
        handleCSVData(incrementDateDetails.data.message.data, type);
      }
      setEmployeeArr(incrementDateDetails.data.message.data);
      setLoad(false);
    } catch (error) {
      setLoad(false);
      console.log("error", error);
    }
  };

  const searchEmployee = async (text) => {
    setEmpCodeList(await CommonApi.searchEmployee(text));
  };

  const getAllList = async (collegeId) => {
    try {
      setLoad(true);
      const masterRes = await empApi.getAllMasters(2, collegeId);
      console.log("masterRes---", masterRes);
      setDepartmentList(masterRes.data.message.data.department);
      setDesignationList(masterRes.data.message.data.designation);
      setDesignationCategoryList(
        masterRes.data.message.data.designationCategory
      );
      setLoad(false);
    } catch (error) {
      setLoad(false);
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
              department: "",
              designation: "",
            }}
            validationSchema={FormSchema}
            onSubmit={(values) => handleShow(values)}
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
                    <div className="col-lg-10">
                      {collegeConfig.is_university && (
                        <SelectFieldFormik
                          autoFocus
                          // labelSize={3}
                          tabIndex={1}
                          label="College"
                          id="college"
                          mandatory={1}
                          options={collegeConfig.collegeList}
                          getOptionLabel={(option) => option.collegeName}
                          getOptionValue={(option) => option.collegeID}
                          searchIcon={false}
                          clear={false}
                          style={{ width: "70%" }}
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
                        label="Increment Month"
                        id="incrementDate"
                        tabIndex={2}
                        style={{ width: "30%" }}
                        mandatory={1}
                        onChange={(e) => {
                          setFieldValue("incrementDate", e.target.value);
                        }}
                        minDate={moment().subtract(2, "years")}
                        maxDate={moment().add(1, "years")}
                      />
                      <SelectFieldFormik
                        label="Department"
                        id="department"
                        clear={true}
                        tabIndex={3}
                        options={departmentList}
                        style={{ width: "70%" }}
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
                        clear={true}
                        tabIndex={4}
                        getOptionLabel={(option) => option.designation}
                        getOptionValue={(option) => option.designation}
                        options={designationList}
                        style={{ width: "60%" }}
                        onChange={(text) => {
                          setFieldValue("designation", text);
                          setShowRes(false);
                        }}
                      />
                      <SelectFieldFormik
                        label="Employee No. / Name"
                        id="employeeCode"
                        style={{ width: "60%" }}
                        clear={true}
                        options={empCodeList}
                        searchIcon={true}
                        tabIndex={6}
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
                          setFieldValue("employeeCode", text);
                          setShowRes(false);
                        }}
                      />
                    </div>
                    <Button
                      tabIndex={7}
                      text="Show"
                      type="submit"
                      onClick={(e) => preFunction.handleErrorFocus(errors)}
                    />
                    {showRes ? (
                      <>
                        <div className="row no-gutters mt-4">
                          {employeeArr.length > 0 ? (
                            <div className="row totcntstyle">
                              <div className="col-lg-6"></div>
                              <div className="col-lg-6 text-right p-0">
                                <button
                                  type="button"
                                  className="btn"
                                  onClick={() => handleShow(values, 2)}
                                >
                                  Export Excel
                                </button>
                                <button
                                  type="button"
                                  className="btn ms-3"
                                  onClick={(e) => handleShow(values, 1)}
                                >
                                  Export PDF
                                </button>
                              </div>
                            </div>
                          ) : null}
                          <div className="table-responsive row mt-2 p-0">
                            <table className="table table-bordered table-hover">
                              <thead>
                                <tr>
                                  <th width="1%">No.</th>
                                  {/* <th width="20%">Employee No.</th> */}
                                  <th>Name</th>
                                  <th width="10%">Date of Joining</th>
                                  <th width="10%">Increment Date</th>
                                  <th width="5%">Experience (Year)</th>
                                  <th width="5%">Loss of Pay</th>
                                </tr>
                              </thead>
                              <tbody>
                                {employeeArr.length === 0 ? (
                                  <tr>
                                    <td colspan={9} align="center">
                                      No data found
                                    </td>
                                  </tr>
                                ) : (
                                  employeeArr.map((item, index) => {
                                    return (
                                      <tr key={index}>
                                        <td>{index + 1}</td>
                                        {/* <td>{item.employeeID}</td> */}
                                        <td>{item.name}</td>
                                        <td>
                                          {moment(item.dateOfJoining).format(
                                            "DD-MM-YYYY"
                                          )}
                                        </td>
                                        <td>
                                          {moment(item.incrementDate).format(
                                            "DD-MM-YYYY"
                                          )}
                                        </td>
                                        <td>{item.experience}</td>
                                        <td>{item.lopCount}</td>
                                      </tr>
                                    );
                                  })
                                )}
                              </tbody>
                            </table>
                          </div>
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
    </div>
  );
}

export default IncrementDateDetailsReport;
