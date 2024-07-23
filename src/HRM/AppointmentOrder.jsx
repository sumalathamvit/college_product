import React, { useEffect, useState, useContext } from "react";
import { useSelector } from "react-redux";
import { Formik } from "formik";

import Button from "../component/FormField/Button";
import preFunction from "../component/common/CommonFunction";
import CustomActivityIndicator from "../component/common/CustomActivityIndicator";
import DateFieldFormik from "../component/FormField/DateFieldFormik";
import SelectFieldFormik from "../component/FormField/SelectFieldFormik";
import TextFieldFormik from "../component/FormField/TextFieldFormik";
import ModalComponent from "../component/ModalComponent";
import ScreenTitle from "../component/common/ScreenTitle";
import PdfComponent from "../component/common/PdfComponent";
import AuthContext from "../auth/context";
import * as Yup from "yup";
import empApi from "../api/EmployeeApi";
import EmployeeApi from "../api/EmployeeApi";

import "../Print.css";
import AppointmentOrderPDFDetail from "../component/AppointmentOrderPDF";

function AppointmentOrder() {
  //#region const
  const [load, setLoad] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [showEmployeeNo, setShowEmployeeNo] = useState(false);
  const [modalErrorOpen, setModalErrorOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [modalTitle, setModalTitle] = useState("");

  const [pdfContent, setPdfContent] = useState("");
  const [designationList, setDesignationList] = useState([]);
  const [employeeList, setEmployeeeList] = useState([]);
  const collegeConfig = useSelector((state) => state.web.college);
  const { collegeId, collegeName } = useContext(AuthContext);
  console.log("collegeConfig", collegeConfig);
  //#endregion

  const FormSchema = Yup.object().shape({
    college: collegeConfig.is_university
      ? Yup.object().required("Please select College")
      : Yup.mixed().notRequired(),
    employeeName: Yup.string().required("Please enter Employee Name"),
    designation: Yup.object().required("Please select Designation"),
    joiningDate: Yup.date().required("Please select Joining Date"),
    salary: Yup.number().required("Please enter Salary"),
  });

  const handleReprint = async () => {
    setOpenModal(true);
    setTimeout(() => {
      setOpenModal(false);
    }, 1);
    setTimeout(() => {
      handleSecondPrint();
    }, 1000);
  };

  const handleSecondPrint = async () => {
    setOpenModal(true);
    setTimeout(() => {
      setOpenModal(false);
    }, 1);
  };

  const handleShow = async (values) => {
    console.log("value", values);
    try {
      setLoad(true);
      setShowEmployeeNo(true);

      const Employee = {
        college: collegeConfig.is_university
          ? values?.college?.collegeName
          : collegeName,
        employeeName: values.employeeName,
        designation: values.designation.designation,
        joiningDate: values.joiningDate,
        salary: values.salary,
        authorizedEmployee: values.authorizedEmployee,
      };
      console.log("Employee", Employee);

      let pdfContent = (
        <AppointmentOrderPDFDetail employee={Employee} secondCopy={true} />
      );

      setPdfContent(pdfContent);
      setLoad(false);
    } catch (error) {
      setLoad(false);
      console.log(error);
    }
  };

  const getAllList = async (collegeId) => {
    try {
      const masterRes = await empApi.getAllMasters(2, collegeId);
      console.log("masterRes---", masterRes);
      setDesignationList(masterRes.data.message.data.designation);
    } catch (error) {
      console.log("error----", error);
    }
  };

  const searchEmployee = async (value) => {
    console.log("value", value);
    setEmployeeeList([]);
    if (value && value.length > 2) {
      const employeeRes = await EmployeeApi.employeeSearch(value);
      console.log("empList", employeeRes);
      setEmployeeeList(employeeRes.data.message.employee_data);
    }
  };

  useEffect(() => {
    if (!collegeConfig.is_university) {
      getAllList(collegeId);
    }
  }, [collegeConfig]);

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
        <ScreenTitle titleClass="page-heading-position" />

        <div className="row no-gutters">
          <div className="row no-gutters mt-1">
            {!showEmployeeNo ? (
              <Formik
                enableReinitialize={false}
                // innerRef={formikRef}
                initialValues={{
                  college: "",
                  employeeName: "",
                  designation: "",
                  joiningDate: "",
                  salary: "",
                  authorizedEmployee: "",
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
                      <div className="col-lg-10">
                        {collegeConfig.is_university && (
                          <SelectFieldFormik
                            autoFocus
                            tabIndex={1}
                            labelSize={4}
                            label="College"
                            id="college"
                            mandatory={1}
                            options={collegeConfig.collegeList}
                            getOptionLabel={(option) => option.collegeName}
                            getOptionValue={(option) => option.collegeID}
                            searchIcon={false}
                            clear={false}
                            //   style={{ width: "70%" }}
                            onChange={(text) => {
                              setFieldValue("college", text);
                              console.log("text", text);
                              getAllList(text?.collegeID);
                            }}
                          />
                        )}

                        <TextFieldFormik
                          autoFocus={collegeConfig.is_university ? false : true}
                          tabIndex={2}
                          labelSize={4}
                          label="Employee Name"
                          id="employeeName"
                          mandatory={1}
                          onChange={(e) => {
                            setFieldValue("employeeName", e.target.value);
                            // setShowRes(false);
                          }}
                        />
                        <SelectFieldFormik
                          tabIndex={3}
                          labelSize={4}
                          label="Designation"
                          id="designation"
                          style={{ width: "65%" }}
                          mandatory={1}
                          options={designationList}
                          clear={true}
                          getOptionLabel={(option) => option.designation}
                          getOptionValue={(option) => option.designation}
                          onChange={(text) => {
                            setFieldValue("designation", text);
                            // setShowRes(false);
                          }}
                        />
                        <DateFieldFormik
                          tabIndex={4}
                          labelSize={4}
                          // style={{ width: "45%" }}
                          label="Joining Date"
                          id="joiningDate"
                          mandatory={1}
                          onChange={(e) => {
                            setFieldValue("joiningDate", e.target.value);
                            // setShowRes(false);
                          }}
                        />
                        <TextFieldFormik
                          id="salary"
                          label="Salary"
                          labelSize={4}
                          tabIndex={5}
                          mandatory={1}
                          onChange={(e) => {
                            if (
                              preFunction.amountValidation(e?.target?.value)
                            ) {
                              setFieldValue("salary", e?.target?.value);
                              // handleUnSavedChanges(1);
                            }
                          }}
                          maxlength={7}
                          style={{ width: "29%" }}
                        />
                        <SelectFieldFormik
                          label="Signing Authority"
                          placeholder={"Employee No. / Name"}
                          id="authorizedEmployee"
                          labelSize={4}
                          tabIndex={6}
                          mandatory={1}
                          maxlength={40}
                          options={employeeList}
                          searchIcon={true}
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
                            setFieldValue("authorizedEmployee", text);
                          }}
                        />
                      </div>
                      <Button
                        text="Generate Appointment Order"
                        type="submit"
                        tabIndex={7}
                        onClick={(e) => {
                          preFunction.handleErrorFocus(errors);
                        }}
                      />
                    </form>
                  );
                }}
              </Formik>
            ) : (
              <>
                {pdfContent}

                <div className="text-center">
                  <Button
                    frmButton={false}
                    tabIndex={1}
                    type="button"
                    onClick={() => handleReprint()}
                    text="Print"
                  />
                  &nbsp;&nbsp;
                  <Button
                    tabIndex={2}
                    frmButton={false}
                    text={"Generate Another Appointment Order"}
                    onClick={() => {
                      // setEnrollNumber("");
                      setShowEmployeeNo(false);
                    }}
                  />
                </div>
              </>
            )}
          </div>
        </div>
      </div>
      <div
        style={{
          display: "none",
        }}
      >
        {openModal ? (
          <PdfComponent
            printContent={pdfContent}
            handleClick={() => {
              setOpenModal(false);
            }}
          />
        ) : null}
      </div>
    </div>
  );
}

export default AppointmentOrder;
