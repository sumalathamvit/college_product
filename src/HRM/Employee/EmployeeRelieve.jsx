import React, { useEffect, useState, useRef, useContext } from "react";
import { Formik } from "formik";
import * as Yup from "yup";
import moment from "moment";
import { toast } from "react-toastify";

import empApi from "../../api/EmployeeApi";

import Button from "../../component/FormField/Button";
import DateFieldFormik from "../../component/FormField/DateFieldFormik";
import EmployeeCard from "../EmployeeCard";
import { employeeNOCSelectList } from "../../component/common/CommonArray";
import preFunction from "../../component/common/CommonFunction";
import CustomActivityIndicator from "../../component/common/CustomActivityIndicator";
import SelectFieldFormik from "../../component/FormField/SelectFieldFormik";
import TextAreaFieldFormik from "../../component/FormField/TextareaFieldFormik";
import { useNavigate } from "react-router-dom";
import ModalComponent from "../../component/ModalComponent";
import AuthContext from "../../auth/context";
import ScreenTitle from "../../component/common/ScreenTitle";
import PdfComponent from "../../component/common/PdfComponent";
import CheckboxField from "../../component/FormField/CheckboxField";
import RelievingOrderPDFDetail from "../../component/RelievingOrderPDF";
import DisplayText from "../../component/FormField/DisplayText";

function EmployeeRelieve() {
  const navigate = useNavigate();
  const [load, setLoad] = useState(false);
  const [empCodeList, setEmpCodeList] = useState([]);
  const [data, setData] = useState([]);
  const [employeeInfo, setEmployeeInfo] = useState();

  const [modalErrorOpen, setModalErrorOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [modalTitle, setModalTitle] = useState("");
  const { unSavedChanges, setUnSavedChanges } = useContext(AuthContext);
  const [pdfContent, setPdfContent] = useState("");
  const [openModal, setOpenModal] = useState(false);
  const [AuthorityEmpList, setAuthorityEmpList] = useState([]);
  const [showRelievedEmployee, setShowRelievedEmployee] = useState(false);
  const formikRef = useRef();

  const FormSchema = Yup.object().shape({
    remarks: showRelievedEmployee
      ? Yup.string().notRequired()
      : Yup.string()
          .min(3, "Must be at least 3 characters long")
          .matches(/^[A-Za-z0-9\s,.'\-&@#]+$/, "Please enter valid Remarks")
          .required("Please enter Remarks")
          .trim(),
    resignationLetterDate: showRelievedEmployee
      ? Yup.date().notRequired()
      : Yup.date().required("Please select Resignation Letter Date"),
    relieveDate: showRelievedEmployee
      ? Yup.date().notRequired()
      : Yup.date().required("Please select Relieving Date"),
    authorizedBy: Yup.object().required("Please select Authorized By"),
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

  const handlePrint = async () => {
    setOpenModal(true);
    if (showRelievedEmployee) {
      setTimeout(() => {
        setOpenModal(false);
      }, 100);
    } else {
      setTimeout(() => {
        setOpenModal(false);
      }, 1);
      setTimeout(() => {
        handleSecondPrint();
      }, 1000);
    }
  };

  const handleSecondPrint = async () => {
    setOpenModal(true);
    setTimeout(() => {
      setOpenModal(false);
    }, 1);
  };

  const handleSave = async (values, { resetForm }) => {
    if (load) return;
    let valuesArray = Object.entries(values).map(([key, value]) => ({
      [key]: value,
    }));
    console.log("valuesArray", valuesArray, values);
    let arr = [];
    valuesArray.forEach((value) => {
      data.forEach((item) => {
        const nocStatus = value[item.camelCase]?.value;
        if (nocStatus === "Not Cleared") {
          console.log("testing", nocStatus);
          arr.push(item.camelCase);
        }
      });
    });

    if (arr.length > 0 && !showRelievedEmployee) {
      setModalMessage("Please clear all NOCs");
      setModalTitle("Message");
      setModalErrorOpen(true);
      setLoad(false);
      return;
    }

    try {
      setLoad(true);
      if (showRelievedEmployee) {
        handleRelievingPDF(values);
      } else {
        const relieveEmployee = await empApi.relieveEmployee(
          values.remarks,
          moment(values.resignationLetterDate).format("yyyy-MM-DD"),
          moment(values.relieveDate).format("yyyy-MM-DD"),
          employeeInfo.name
        );
        console.log("relieveEmployee---", relieveEmployee);
        if (relieveEmployee.ok) {
          handleUnSavedChanges(0);
          handleRelievingPDF(values);
          toast.success("Employee Relieved Successfully");
          resetForm();
          formikRef.current.setFieldValue("employeeCode", "");
        } else {
          if (relieveEmployee.data && relieveEmployee.data._server_messages) {
            setModalMessage(
              employeeInfo.employee_name +
                " " +
                "is reporting person of another employee"
            );
            setModalTitle("Message");
            setModalErrorOpen(true);
            setLoad(false);
          }
        }
      }
      setLoad(false);
    } catch (error) {
      setLoad(false);
      console.log("error", error);
    }
  };

  const handleRelievingPDF = async (values) => {
    if (!showRelievedEmployee) {
      employeeInfo.relieving_date = values.relieveDate;
    }
    employeeInfo.authorizedBy = values.authorizedBy?.employee_name;
    employeeInfo.authorizedByDesignation = values.authorizedBy?.designation;

    let pdfContent = (
      <RelievingOrderPDFDetail employee={employeeInfo} secondCopy={true} />
    );

    setPdfContent(pdfContent);
    handlePrint();
  };

  const handleGetEmployeeDetails = async (employeeDetail) => {
    setEmployeeInfo();
    setEmpCodeList([]);
    setAuthorityEmpList([]);
    formikRef.current.setFieldValue("remarks", "");
    formikRef.current.setFieldValue("resignationLetterDate", "");
    formikRef.current.setFieldValue("relieveDate", "");
    // formik set value for all the noc's
    data.forEach((item) => {
      formikRef.current.setFieldValue(`${item.camelCase}`, {
        value: "Not Cleared",
      });
    });

    try {
      setLoad(true);
      console.log("enrollNo---", employeeDetail);
      setEmployeeInfo(employeeDetail);
      getEmployeeNOC();

      setLoad(false);
    } catch (error) {
      setLoad(false);
      console.log("error----", error);
    }
  };

  const searchEmployee = async (text) => {
    if (text && text.length > 2) {
      const employeeRes = await empApi.employeeSearch(
        text,
        showRelievedEmployee ? 2 : 1
      );
      console.log("empList", employeeRes);
      setEmpCodeList(employeeRes.data.message.employee_data);
    }
  };

  const searchAuthorityEmployee = async (text) => {
    if (text && text.length > 2) {
      const employeeRes = await empApi.employeeSearch(text);
      console.log("empList", employeeRes);
      // to remove the current employee from the list
      const filteredEmployeeList =
        employeeRes.data.message.employee_data.filter(
          (item) => item.custom_employeeid !== employeeInfo.custom_employeeid
        );
      console.log("filteredEmployeeList", filteredEmployeeList);

      setAuthorityEmpList(filteredEmployeeList);
    }
  };

  const getEmployeeNOC = async () => {
    try {
      const getEmployeeNOC = await empApi.getNOCMaster();
      console.log("getEmployeeNOC", getEmployeeNOC);
      for (let i = 0; i < getEmployeeNOC.data.data.length; i++) {
        const camelCaseWord = getEmployeeNOC.data.data[i].name
          .split(" ")
          .map((word, index) =>
            index === 0
              ? word.toLowerCase()
              : word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
          )
          .join("");
        getEmployeeNOC.data.data[i].camelCase = camelCaseWord;
      }
      setData(getEmployeeNOC.data.data);
    } catch (error) {
      console.log("error----", error);
    }
  };

  const handleCheckBox = () => {
    formikRef.current.setFieldValue("employeeCode", "");
    formikRef.current.setFieldValue("authorizedBy", "");
    formikRef.current.setFieldTouched("authorizedBy", false);
    formikRef.current.setFieldTouched("remarks", false);
    formikRef.current.setFieldTouched("resignationLetterDate", false);
    formikRef.current.setFieldTouched("relieveDate", false);
  };

  useEffect(() => {
    getEmployeeNOC();
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
        <div className="row no-gutters">
          <Formik
            enableReinitialize={true}
            innerRef={formikRef}
            initialValues={{
              relieveDate: "",
              resignationLetterDate: "",
              remarks: "",
              authorizedBy: "",
              ...(data.length > 0 &&
                data.reduce((acc, item) => {
                  acc[item.camelCase] = { value: "Not Cleared" };
                  return acc;
                }, {})),
            }}
            validationSchema={FormSchema}
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
                        tabIndex={1}
                        style={{ width: "70%" }}
                        options={empCodeList}
                        searchIcon={true}
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
                          setFieldValue("employeeCode", text);
                          handleGetEmployeeDetails(text);
                          setAuthorityEmpList([]);
                        }}
                      />
                      <div className="row">
                        <div className="col-3"></div>
                        <div className="col-9 p-0">
                          <CheckboxField
                            tabIndex={2}
                            label="Show Relieved Employee"
                            id="showRelievedEmployee"
                            checked={showRelievedEmployee}
                            onChange={() => {
                              setShowRelievedEmployee(!showRelievedEmployee);
                              handleCheckBox();
                            }}
                          />
                        </div>
                      </div>
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
                          <div className="subhead">Employee NOC's</div>
                          <div className="col line-div"></div>
                        </div>
                        <div className="col-lg-9">
                          {data.length > 0
                            ? data.map((item1, index) => {
                                return showRelievedEmployee ? (
                                  <DisplayText
                                    labelSize={3}
                                    label={item1.name}
                                    value={"Cleared"}
                                  />
                                ) : (
                                  <SelectFieldFormik
                                    label={item1.name}
                                    id={item1.camelCase}
                                    style={{ width: "35%" }}
                                    mandatory={1}
                                    maxlength={11}
                                    labelSize={3}
                                    options={employeeNOCSelectList}
                                    clear={false}
                                    tabIndex={2 + index}
                                    getOptionLabel={(option) => option.value}
                                    getOptionValue={(option) => option.value}
                                    onChange={(text) => {
                                      setFieldValue(`${item1.camelCase}`, text);
                                      handleUnSavedChanges(1);
                                    }}
                                  />
                                );
                              })
                            : null}
                          {showRelievedEmployee && employeeInfo ? (
                            <>
                              <DisplayText
                                labelSize={3}
                                label="Remarks"
                                value={employeeInfo?.reason_for_leaving}
                              />
                              <DisplayText
                                labelSize={3}
                                label="Resignation Letter Date"
                                value={moment(
                                  employeeInfo?.resignation_letter_date
                                ).format("DD-MM-YYYY")}
                              />
                              <DisplayText
                                labelSize={3}
                                label="Relieving Date"
                                value={moment(
                                  employeeInfo?.relieving_date
                                ).format("DD-MM-YYYY")}
                              />
                            </>
                          ) : (
                            <>
                              <TextAreaFieldFormik
                                maxlength={120}
                                id={`remarks`}
                                name="remarks"
                                label="Remarks"
                                mandatory={1}
                                tabIndex={data?.length + 2}
                                placeholder="Remarks"
                                value={values.remarks}
                                labelSize={3}
                                style={{ width: "60%" }}
                                onChange={(e) => {
                                  setFieldValue("remarks", e.target.value);
                                  handleUnSavedChanges(1);
                                }}
                              />

                              <DateFieldFormik
                                label="Resignation Letter Date"
                                id="resignationLetterDate"
                                maxDate={new Date()}
                                minDate={
                                  new Date(moment().subtract(5, "months"))
                                }
                                mandatory={1}
                                tabIndex={data?.length + 3}
                                style={{ width: "30%" }}
                                labelSize={3}
                                onChange={(e) => {
                                  setFieldValue(
                                    "resignationLetterDate",
                                    e.target.value
                                  );
                                  handleUnSavedChanges(1);
                                }}
                              />
                              <DateFieldFormik
                                label="Relieving Date"
                                id="relieveDate"
                                labelSize={3}
                                maxDate={new Date()}
                                minDate={
                                  new Date(moment().subtract(1, "months"))
                                }
                                style={{ width: "30%" }}
                                tabIndex={data?.length + 4}
                                mandatory={1}
                                onChange={(e) => {
                                  setFieldValue("relieveDate", e.target.value);
                                  handleUnSavedChanges(1);
                                }}
                              />
                            </>
                          )}
                          <SelectFieldFormik
                            tabIndex={data?.length + 5}
                            label="Signing Authority"
                            placeholder={"Employee No. / Name"}
                            id="authorizedBy"
                            labelSize={3}
                            mandatory={1}
                            maxlength={40}
                            options={AuthorityEmpList}
                            searchIcon={true}
                            getOptionLabel={(option) =>
                              option.custom_employeeid +
                              " - " +
                              option.employee_name
                            }
                            getOptionValue={(option) => option.name}
                            onInputChange={(inputValue) => {
                              searchAuthorityEmployee(inputValue);
                            }}
                            onChange={(text) => {
                              setFieldValue("authorizedBy", text);
                            }}
                            style={{ width: "70%" }}
                          />
                        </div>

                        <div className="row ms-2">
                          <Button
                            id="save"
                            text={
                              showRelievedEmployee ? "Reprint" : "F4 - Save"
                            }
                            tabIndex={data?.length + 6}
                            type="submit"
                            onClick={(e) =>
                              preFunction.handleErrorFocus(errors)
                            }
                          />
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

export default EmployeeRelieve;
