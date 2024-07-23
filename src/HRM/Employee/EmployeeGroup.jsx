import React, { useEffect, useRef, useState, useContext } from "react";
import { Formik } from "formik";
import { Modal } from "react-bootstrap";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import * as Yup from "yup";

import EmployeeApi from "../../api/EmployeeApi";

import preFunction from "../../component/common/CommonFunction";
import CustomActivityIndicator from "../../component/common/CustomActivityIndicator";
import Button from "../../component/FormField/Button";
import ScreenTitle from "../../component/common/ScreenTitle";
import TextFieldFormik from "../../component/FormField/TextFieldFormik";
import ModalComponent from "../../component/ModalComponent";
import SelectFieldFormik from "../../component/FormField/SelectFieldFormik";
import AuthContext from "../../auth/context";
import TextField from "../../component/FormField/TextField";

function EmployeeGroup() {
  const formikRef = useRef();
  const formikReference = useRef();
  const employeeFormikRef = useRef();

  const [load, setLoad] = useState(false);
  const [newEmployeeModal, setNewEmployeeModal] = useState(false);
  const [showRes, setShowRes] = useState(false);

  const [employeeGroupList, setEmployeeGroupList] = useState([]);
  const [employeeList, setEmployeeList] = useState([]);
  const [employeeArr, setEmployeeArr] = useState([]);
  const [deletedEmployeeArr, setDeletedEmployeeArr] = useState([]);
  const [employeeArrLength, setEmployeeArrLength] = useState(0);

  const [modalErrorOpen, setModalErrorOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [modalTitle, setModalTitle] = useState("");
  const [noChangesError, setNoChangesError] = useState(false);
  const { setUnSavedChanges, collegeId } = useContext(AuthContext);
  const collegeConfig = useSelector((state) => state.web.college);

  const formSchema = Yup.object().shape({
    college: collegeConfig.is_university
      ? Yup.object().required("Please select College")
      : Yup.mixed().notRequired(),
    groupName: Yup.string().required("Please enter Group Name"),
  });

  const getEmployeeFormSchema = Yup.object().shape({
    collegeId: collegeConfig.is_university
      ? Yup.object().required("Please select College")
      : Yup.mixed().notRequired(),
    group: Yup.object().required("Please select Employee Group"),
  });

  const EmployeeSchema = Yup.object().shape({
    empCode: Yup.object().required("Please select Employee No. / Name"),
  });

  const handleUnSavedChanges = (changed) => {
    if (changed === 1) {
      sessionStorage.setItem("unSavedChanges", true);
      setUnSavedChanges(true);
    } else {
      sessionStorage.setItem("unSavedChanges", false);
      setUnSavedChanges(false);
    }
  };

  // Function to add New Employee group
  const handleAddEmployeeGroup = async (values) => {
    if (load) return;
    console.log("values--", values);
    try {
      setLoad(true);
      const addActivityGroupRes = await EmployeeApi.addEmployeeActivityGroup(
        collegeConfig.is_university ? values.college.collegeID : collegeId,
        values.groupName
      );
      console.log("addActivityGroupRes---", addActivityGroupRes);
      if (!addActivityGroupRes.data.message.success) {
        setModalTitle("Message");
        setModalMessage(addActivityGroupRes.data.message.message);
        setModalErrorOpen(true);
        setLoad(false);
        return;
      }
      setNewEmployeeModal(false);
      toast.success(addActivityGroupRes.data.message.message);
      if (!collegeConfig.is_university) {
        getGroupList(collegeId);
      } else {
        if (formikRef.current.values.college) {
          getGroupList(formikRef.current.values.college.collegeID);
        }
      }
      setLoad(false);
    } catch (error) {
      console.log("exception--", error);
    }
  };

  // Function to assign Employee to Employee Group
  const assignEmployeeGroup = async (values) => {
    if (load) return;
    console.log("values--", values);
    console.log("EmployeeArr--", employeeArr);
    console.log("noChangesError--", noChangesError);
    if (!noChangesError) {
      setModalTitle("Message");
      setModalMessage("No Changes made");
      setModalErrorOpen(true);
      setLoad(false);
      return;
    }
    try {
      setLoad(true);
      // check the condition if the Employee is already added
      for (let i = 0; i < employeeArr.length; i++) {
        if (
          employeeArr[i].employeeID ===
          employeeFormikRef?.current?.values?.empCode?.custom_employeeid
        ) {
          console.log("saveEmployee");
          setModalTitle("Message");
          setModalMessage("Employee already added");
          setModalErrorOpen(true);
          setLoad(false);
          return;
        }
      }
      const employeeValues = employeeFormikRef?.current?.values;
      if (employeeValues?.empCode) {
        console.log("employeeValues---", employeeValues);
        handleAddEmployee(employeeValues);
      }

      let employeeDetailArray = employeeArr.map((obj) => {
        console.log("obj--", obj);
        return {
          employeeActivityGroupDetailID: obj.employeeActivityGroupDetailID,
          employeeID: obj.employeeID,
          isActive: obj.isActive,
        };
      });
      employeeDetailArray = employeeDetailArray.concat(deletedEmployeeArr);
      console.log("employeeDetailArray--->", employeeDetailArray);

      const assignGroupRes = await EmployeeApi.assignEmployeeToActivityGroup(
        values.group.employeeActivityGroupID,
        employeeDetailArray
      );
      console.log("assignGroupRes---", assignGroupRes);
      if (!assignGroupRes.data.message.success) {
        setModalTitle("Message");
        setModalMessage(assignGroupRes.data.message.message);
        setModalErrorOpen(true);
        setLoad(false);
        return;
      }
      toast.success(assignGroupRes.data.message.message);
      setNoChangesError(false);
      setEmployeeArr([]);
      setDeletedEmployeeArr([]);
      setEmployeeArrLength(0);
      setShowRes(false);
      handleUnSavedChanges(0);
      setLoad(false);
      return;
    } catch (error) {
      setLoad(false);
      console.log("exception--", error);
    }
  };

  // Function to add Employee to the list
  const handleAddEmployee = async (values) => {
    console.log("values.empCode---", values.empCode);

    for (let i = 0; i < employeeArr.length; i++) {
      // console.log("employeeArr[i].empCode--", employeeArr[i].custom_employeeid);
      if (employeeArr[i].employeeID === values.empCode.custom_employeeid) {
        console.log("addEmployee");
        setModalTitle("Message");
        setModalMessage("Employee already added");
        setModalErrorOpen(true);
        setLoad(false);
        return;
      }
    }

    let obj = {
      employeeActivityGroupDetailID: null,
      employeeID: values.empCode.custom_employeeid,
      isActive: 1,
      department: values.empCode.department,
      designation: values.empCode.designation,
      employeeName: values.empCode.employee_name,
    };
    employeeArr.push(obj);
    console.log("employeeArr--", employeeArr);
    setNoChangesError(true);

    handleUnSavedChanges(1);
    employeeFormikRef.current.resetForm();
    document.getElementById("empCode")?.focus();
  };

  // Function to delete Employee from the list
  const handleDeleteEmployee = (item) => {
    console.log("item", item);

    const deleteEmployee = employeeArr.filter((m) => m !== item);
    setEmployeeArr(deleteEmployee);
    console.log("employeeArr", employeeArr);
  };

  // Function to search Employee
  const employeeSearch = async (value) => {
    setEmployeeList([]);
    try {
      if (value.length > 2) {
        const employeeRes = await EmployeeApi.employeeSearch(value);
        console.log("employeeRes", employeeRes);
        setEmployeeList(employeeRes.data.message.employee_data);
        return employeeRes.data.message.employee_data;
      }
    } catch (error) {
      console.log("error----", error);
    }
  };

  // Function to get all assigned students
  const getAllAssignedEmployees = async (values) => {
    console.log("values--", values);

    try {
      setLoad(true);
      const getAllAssignedStudentsRes =
        await EmployeeApi.getAllAssignedGroupEmployee(
          values.group.employeeActivityGroupID
        );
      console.log("getAllAssignedStudentsRes---", getAllAssignedStudentsRes);
      setEmployeeArr(getAllAssignedStudentsRes.data.message.data.employees);
      setEmployeeArrLength(
        getAllAssignedStudentsRes.data.message.data.employees.length
      );
      setShowRes(true);
      setLoad(false);
      return;
    } catch (error) {
      setLoad(false);
      console.log("exception--", error);
    }
  };

  // Function to get all Employee Group list
  const getGroupList = async (college_id) => {
    console.log("college_id--", college_id);
    try {
      setLoad(true);
      const getAllActivityGroupRes =
        await EmployeeApi.getAllEmployeeActivityGroup(college_id);
      console.log("getAllActivityGroupRes---", getAllActivityGroupRes);
      setEmployeeGroupList(
        getAllActivityGroupRes.data.message.data.employee_activity_group
      );

      setLoad(false);
      return;
    } catch (error) {
      setLoad(false);
      console.log("exception--", error);
    }
  };

  useEffect(() => {
    if (!collegeConfig.is_university) {
      getGroupList(collegeId);
    }
  }, [collegeConfig.is_university]);

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
        <div style={{ textAlign: "right" }}>
          <Button
            isTable={true}
            frmButton={false}
            className={"btn-green"}
            onClick={() => setNewEmployeeModal(true)}
            text={"New Employee Group"}
            type="button"
          />
        </div>
        <Formik
          enableReinitialize={true}
          innerRef={formikReference}
          initialValues={{
            collegeId: "",
            group: "",
          }}
          validationSchema={getEmployeeFormSchema}
          onSubmit={getAllAssignedEmployees}
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
                <div className="col-lg-8">
                  {collegeConfig.is_university ? (
                    <SelectFieldFormik
                      autoFocus
                      tabIndex={1}
                      label="College"
                      id="collegeId"
                      mandatory={1}
                      options={collegeConfig.collegeList}
                      getOptionLabel={(option) => option.collegeName}
                      getOptionValue={(option) => option.collegeID}
                      searchIcon={false}
                      clear={false}
                      onChange={(text) => {
                        setFieldValue("collegeId", text);
                        handleUnSavedChanges(1);
                        getGroupList(text.collegeID);
                      }}
                    />
                  ) : null}
                  <SelectFieldFormik
                    autoFocus={!collegeConfig.is_university}
                    label="Employee Group"
                    tabIndex={collegeConfig.is_university ? 2 : 1}
                    id="group"
                    mandatory={1}
                    style={{ width: "80%" }}
                    options={employeeGroupList}
                    getOptionLabel={(option) =>
                      option.employeeActivityGroupName
                    }
                    getOptionValue={(option) => option.employeeActivityGroupID}
                    onChange={(text) => {
                      setFieldValue("group", text);
                      setShowRes(false);
                    }}
                  />
                </div>
                {!showRes && (
                  <Button
                    text={"Show"}
                    tabIndex={collegeConfig.is_university ? 3 : 2}
                    onClick={(e) => preFunction.handleErrorFocus(errors)}
                  />
                )}
              </form>
            );
          }}
        </Formik>
        {showRes && (
          <div className="col-lg-12 mt-3">
            <Formik
              enableReinitialize={true}
              innerRef={employeeFormikRef}
              initialValues={{
                empCode: "",
              }}
              validationSchema={EmployeeSchema}
              onSubmit={handleAddEmployee}
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
                    <table className="table table-bordered">
                      <thead>
                        <tr>
                          <th width="2%">No.</th>
                          <th>Employee No. & Employee Name</th>
                          <th width="30%">Department</th>
                          <th width="15%">Designation</th>
                          <th width="5%"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {employeeArr.map((item, index) => {
                          return (
                            <tr>
                              <td>{index + 1}</td>
                              <td>
                                {item.employeeID + " - " + item.employeeName}
                              </td>
                              <td>{item.department?.split("-")[0]}</td>
                              <td>{item.designation}</td>
                              {item.employeeActivityGroupDetailID ? (
                                <td style={{ textAlign: "center" }}>
                                  <input
                                    type="checkbox"
                                    name="isActive"
                                    id="isActive"
                                    value={item.isActive}
                                    checked={item.isActive === 1 ? true : false}
                                    onChange={(e) => {
                                      handleUnSavedChanges(1);
                                      employeeArr[index].isActive =
                                        item.isActive === 1 ? 0 : 1;
                                      setEmployeeArr([...employeeArr]);
                                      console.log("item--", item);
                                      setNoChangesError(true);
                                    }}
                                  />
                                </td>
                              ) : (
                                <td>
                                  <Button
                                    isTable={true}
                                    type="button"
                                    className="plus-button"
                                    text="-"
                                    onClick={() => handleDeleteEmployee(item)}
                                  />
                                </td>
                              )}
                            </tr>
                          );
                        })}
                        <tr>
                          <td></td>
                          <td>
                            <SelectFieldFormik
                              autoFocus={showRes ? true : false}
                              placeholder="Employee No / Name"
                              id="empCode"
                              mandatory={1}
                              tabIndex={3}
                              clear={true}
                              isTable={true}
                              searchIcon={true}
                              // style={{ width: "60%" }}
                              options={employeeList}
                              getOptionLabel={(option) =>
                                option.custom_employeeid +
                                " - " +
                                option.employee_name
                              }
                              getOptionValue={(option) => option.name}
                              onInputChange={(inputValue) => {
                                employeeSearch(inputValue);
                              }}
                              onChange={(text) => {
                                setFieldValue("empCode", text);
                                handleUnSavedChanges(1);
                                console.log("text--", text);
                                setNoChangesError(true);
                              }}
                            />
                          </td>
                          <td></td>
                          <td></td>
                          <td>
                            <Button
                              isTable={true}
                              text="+"
                              tabIndex={5}
                              type="submit"
                              className="plus-button"
                              onClick={(e) =>
                                preFunction.handleErrorFocus(errors)
                              }
                            />
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </form>
                );
              }}
            </Formik>
            <Button
              text={"F4 - Save"}
              id="save"
              tabIndex={4}
              type="button"
              onClick={(e) => {
                assignEmployeeGroup(formikReference?.current?.values);
              }}
            />
          </div>
        )}

        <Modal
          show={newEmployeeModal}
          onEscapeKeyDown={() => setNewEmployeeModal(false)}
          size="lg"
          centered
        >
          <Modal.Header>
            <Modal.Title>New Employee Group</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Formik
              enableReinitialize={true}
              innerRef={formikRef}
              initialValues={{
                college: "",
                groupName: "",
              }}
              validationSchema={formSchema}
              onSubmit={handleAddEmployeeGroup}
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
                            setFieldValue("college", text);
                            handleUnSavedChanges(1);
                          }}
                        />
                      ) : null}
                      <TextFieldFormik
                        autoFocus={!collegeConfig.is_university}
                        label="Group Name"
                        tabIndex={40}
                        id="groupName"
                        mandatory={1}
                        maxlength={30}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="text-center mt-3">
                      <Button
                        className={"btn me-4"}
                        frmButton={false}
                        tabIndex={41}
                        onClick={(e) => {
                          preFunction.handleErrorFocus(errors);
                        }}
                        text="Save"
                      />
                      <Button
                        text="Close"
                        type="button"
                        frmButton={false}
                        onClick={(e) => {
                          setNewEmployeeModal(false);
                        }}
                      />
                    </div>
                  </form>
                );
              }}
            </Formik>
          </Modal.Body>
        </Modal>
      </div>
    </div>
  );
}
export default EmployeeGroup;
