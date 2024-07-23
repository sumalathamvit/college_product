import React, { useEffect, useState, useRef } from "react";
import * as Yup from "yup";
import { Formik } from "formik";
import { toast } from "react-toastify";

import LibraryApi from "../api/libraryapi";

import preFunction from "../component/common/CommonFunction";
import CustomActivityIndicator from "../component/common/CustomActivityIndicator";
import SelectFieldFormik from "../component/FormField/SelectFieldFormik";
import Button from "../component/FormField/Button";
import ScreenTitle from "../component/common/ScreenTitle";
import DisplayText from "../component/FormField/DisplayText";
import ModalComponent from "../component/ModalComponent";
import CheckboxField from "../component/FormFieldLibrary/CheckboxField";
import CommonApi from "../component/common/CommonApi";

const FormSchema = Yup.object().shape({
  employeeCode: Yup.object().required("Please select Employee No. / Name"),
  role: Yup.object().required("Please select Role"),
  module: Yup.object().required("Please select Module"),
});

function UserRight() {
  //#region const
  const formikRef = useRef();
  const [load, setLoad] = useState(false);
  const [showRes, setShowRes] = useState(false);
  const [empCodeList, setEmpCodeList] = useState([]);
  const [moduleList, setModuleList] = useState([]);
  const [roleList, setRoleList] = useState([]);
  const [roleSettingList, setRoleSettingList] = useState([]);

  const [modalErrorOpen, setModalErrorOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [modalTitle, setModalTitle] = useState("");
  const [modulewithRoleList, setModulewithRoleList] = useState([]);
  //#endregion

  const getAllMaster = async () => {
    try {
      const getMasterAssignRoleRes = await LibraryApi.getMasterAssignRole(
        "module"
      );
      console.log("getMasterAssignRoleRes", getMasterAssignRoleRes);
      if (!getMasterAssignRoleRes.data.message.success) {
        console.log("error", getMasterAssignRoleRes.data.message);
        return;
      }
      setModuleList(getMasterAssignRoleRes.data.message.data.module);
      setRoleList(getMasterAssignRoleRes.data.message.data.role);
    } catch (error) {
      console.log("error", error);
    }
  };

  const searchEmployee = async (text) => {
    setEmpCodeList(await CommonApi.searchEmployee(text));
  };

  const handleSave = async (values) => {
    if (load) return;

    setLoad(true);
    const getUserSettingRes = await LibraryApi.getUserSetting(
      values.employeeCode.personal_email,
      values.role.roleID,
      values.module.moduleID
    );

    const userSetList = getUserSettingRes.data.message.data.user_setting;
    console.log("roleSettingList--", roleSettingList);
    console.log("userSetList--", userSetList);

    const toPassArr = await handleValidateCheckBox(values, userSetList);

    if (toPassArr.length == 0) {
      setModalErrorOpen(true);
      setModalTitle("No Changes");
      setModalMessage("No changes made");
      setLoad(false);
      return;
    }

    try {
      const saveUserSettingRes = await LibraryApi.saveUserSetting(
        values.employeeCode.personal_email,
        values.employeeCode.name,
        values.role.roleID,
        values.status ? "Active" : "Inactive",
        toPassArr
      );
      console.log("saveUserSettingRes", saveUserSettingRes);
      if (!saveUserSettingRes.data.message.success) {
        setModalTitle("Message");
        setModalMessage(saveUserSettingRes.data.message.message);
        setModalErrorOpen(true);
        setLoad(false);
        return;
      }
      toast.success(saveUserSettingRes.data.message.message);
      handleShow(values);
      setLoad(false);
    } catch (error) {
      setLoad(false);
      console.log("error", error);
    }
  };

  const handleValidateCheckBox = async (userSetList) => {
    let toPassArr = [];
    console.log("roleSettingList--", roleSettingList);
    console.log("usrSetList--", userSetList);

    for (let i = 0; i < roleSettingList.length; i++) {
      if (
        roleSettingList[i].rAdd == 1 ||
        roleSettingList[i].rDelete == 1 ||
        roleSettingList[i].rModify == 1 ||
        roleSettingList[i].rView == 1 ||
        roleSettingList[i].rPrint == 1
      ) {
        if (roleSettingList[i].userSettingID) {
          toPassArr.push({
            userSettingID: roleSettingList[i].userSettingID,
            formID: roleSettingList[i].formID,
            rAdd: roleSettingList[i].rAdd,
            rDelete: roleSettingList[i].rDelete,
            rModify: roleSettingList[i].rModify,
            rView: roleSettingList[i].rView,
            rPrint: roleSettingList[i].rPrint,
            toUpdate: 1,
            toDelete: 0,
          });
        } else {
          toPassArr.push({
            userSettingID: null,
            formID: roleSettingList[i].formID,
            rAdd: roleSettingList[i].rAdd,
            rDelete: roleSettingList[i].rDelete,
            rModify: roleSettingList[i].rModify,
            rView: roleSettingList[i].rView,
            rPrint: roleSettingList[i].rPrint,
          });
        }
      } else if (roleSettingList[i].userSettingID) {
        toPassArr.push({
          userSettingID: roleSettingList[i].userSettingID,
          formID: roleSettingList[i].formID,
          rAdd: roleSettingList[i].rAdd,
          rDelete: roleSettingList[i].rDelete,
          rModify: roleSettingList[i].rModify,
          rView: roleSettingList[i].rView,
          rPrint: roleSettingList[i].rPrint,
          toUpdate: 0,
          toDelete: 1,
        });
        // }
      }
    }
    console.log("toPassArr", toPassArr);
    return toPassArr;
  };

  const handleShow = async (values) => {
    if (load) return;
    console.log("values", values);
    try {
      setLoad(true);
      const getUserSettingRes = await LibraryApi.getUserSetting(
        values.employeeCode.personal_email,
        values.role.roleID,
        values.module.moduleID
      );
      console.log("getUserSettingRes", getUserSettingRes);
      setRoleSettingList(getUserSettingRes.data.message.data.user_setting);
      document.getElementById("checkAll")?.focus();
      setShowRes(true);
      setLoad(false);
    } catch (error) {
      setLoad(false);
      console.log("error", error);
    }
  };

  const handleCheckBoxOnchange = (e) => {
    let checkAll = document.getElementById("checkAll").checked;
    console.log("checkAll", checkAll);
    for (let i = 0; i < roleSettingList.length; i++) {
      roleSettingList[i].rAdd = checkAll ? 1 : 0;
      roleSettingList[i].rDelete = checkAll ? 1 : 0;
      roleSettingList[i].rModify = checkAll ? 1 : 0;
      roleSettingList[i].rView = checkAll ? 1 : 0;
      roleSettingList[i].rPrint = checkAll ? 1 : 0;
    }
    setRoleSettingList([...roleSettingList]);
  };

  // employee code wise get role list
  const handleEmployeeRoleList = async (text) => {
    console.log("text", text);
    if (!text && text.length == 0) {
      setModalErrorOpen(true);
      setModalTitle("Message");
      setModalMessage("Please select Employee No. / Name");
      setLoad(false);
      return;
    }

    try {
      setLoad(true);
      const getRoleModuleRes = await LibraryApi.getUserSettingByUser(
        text.personal_email
      );
      console.log("getRoleModuleRes", getRoleModuleRes);
      if (getRoleModuleRes.data.message.data.user_setting.length > 0) {
        setModulewithRoleList(getRoleModuleRes.data.message.data.user_setting);
      }
      setLoad(false);
    } catch (error) {
      setLoad(false);
      console.log("error", error);
    }
  };

  const handleRoleList = async (text) => {
    console.log("text", text);
    if (text) {
      for (let i = 0; i < roleList.length; i++) {
        if (roleList[i].roleID == text.custom_role_id) {
          formikRef.current.setFieldValue("role", roleList[i]);
          break;
        }
      }
      formikRef.current.setFieldValue("module", "");
      if (text.status == "Active") {
        formikRef.current.setFieldValue("status", true);
      } else {
        formikRef.current.setFieldValue("status", false);
      }
      handleEmployeeRoleList(text);
    } else {
      setModulewithRoleList([]);
    }
  };

  useEffect(() => {
    getAllMaster();
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
        <Formik
          innerRef={formikRef}
          enableReinitialize={true}
          initialValues={{
            employeeCode: "",
            role: "",
            module: "",
            status: "",
          }}
          validationSchema={FormSchema}
          onSubmit={handleShow}
        >
          {({ errors, values, handleChange, handleSubmit, setFieldValue }) => {
            return (
              <form onSubmit={handleSubmit} autoComplete="off">
                <div className="row no-gutters mt-2">
                  <div className="col-lg-9">
                    <SelectFieldFormik
                      autoFocus
                      label="Employee No. / Name"
                      labelSize={3}
                      id="employeeCode"
                      mandatory={1}
                      maxlength={20}
                      tabIndex={1}
                      style={{ width: "60%" }}
                      options={empCodeList}
                      searchIcon={true}
                      clear={true}
                      getOptionLabel={(option) =>
                        option.custom_employeeid + " - " + option.employee_name
                      }
                      getOptionValue={(option) => option.name}
                      onInputChange={(inputValue) => {
                        searchEmployee(inputValue);
                      }}
                      onChange={(text) => {
                        setFieldValue("employeeCode", text);
                        setFieldValue("status", false);
                        setFieldValue("role", "");
                        handleRoleList(text);
                        setShowRes(false);
                      }}
                    />
                    <DisplayText
                      label="Department"
                      labelSize={3}
                      value={
                        values?.employeeCode?.department
                          ? values?.employeeCode?.department?.split("-")[0]
                          : "-"
                      }
                    />

                    <DisplayText
                      label="Desigination"
                      labelSize={3}
                      value={values?.employeeCode?.designation ?? "-"}
                    />
                    <SelectFieldFormik
                      label="Role"
                      labelSize={3}
                      id="role"
                      getOptionLabel={(option) => option.role}
                      getOptionValue={(option) => option.roleID}
                      options={roleList}
                      style={{ width: "30%" }}
                      mandatory={1}
                      maxlength={15}
                      tabIndex={2}
                      onChange={(text) => {
                        setShowRes(false);
                        setFieldValue("role", text);
                      }}
                    />
                    <SelectFieldFormik
                      label="Module"
                      labelSize={3}
                      id="module"
                      getOptionLabel={(option) => option.module}
                      getOptionValue={(option) => option.moduleID}
                      options={moduleList}
                      style={{ width: "30%" }}
                      mandatory={1}
                      maxlength={15}
                      tabIndex={3}
                      onChange={(text) => {
                        setShowRes(false);
                        setFieldValue("module", text);
                        setModulewithRoleList([]);
                      }}
                    />
                    <DisplayText
                      label="Employee Status"
                      labelSize={3}
                      value={
                        <CheckboxField
                          id="status"
                          value={values.status}
                          checked={values.status}
                          isTable={true}
                          onChange={(e) => {
                            setFieldValue("status", !values.status);
                          }}
                        />
                      }
                    />
                  </div>
                  <div className="col-lg-3 text-right p-1">
                    <a
                      href="#"
                      tabIndex={4}
                      onClick={(e) => {
                        handleEmployeeRoleList(values.employeeCode);
                      }}
                    >
                      Show All
                    </a>
                  </div>
                  {roleSettingList.length === 0 || !showRes ? (
                    <Button
                      text={"Show"}
                      tabIndex={4}
                      onClick={() => preFunction.handleErrorFocus(errors)}
                    />
                  ) : null}
                  {/* {(values?.employeeCode?.status == "Active" &&
                    values?.status == false) ||
                  values.employeeCode.custom_role_id != values.role.roleID ? (
                    <Button text={"Update Status & Role"} type="button" />
                  ) : null} */}
                </div>

                {showRes && (
                  <>
                    <div className="row no-gutters">
                      <div className="col-lg-10"></div>
                      <div className="col-lg-2 text-right mb-2">
                        {roleSettingList.length > 0 && (
                          <DisplayText
                            label={"Select All"}
                            labelSize={11}
                            value={
                              <CheckboxField
                                id="checkAll"
                                isTable={true}
                                onChange={(e) => handleCheckBoxOnchange(e)}
                                onClick={(e) => handleCheckBoxOnchange(e)}
                              />
                            }
                          />
                        )}
                      </div>
                      <div className="table-responsive">
                        <table className="table table-bordered table-hover m-0">
                          <thead>
                            <tr>
                              <th width="1%">No.</th>
                              {/* <th width="20%">Module</th> */}
                              <th>Forms</th>
                              <th width="7%">Add</th>
                              <th width="7%">Delete</th>
                              <th width="7%">Modify</th>
                              <th width="7%">View</th>
                              <th width="7%">Print</th>
                              <th width="7%">All</th>
                            </tr>
                          </thead>
                          {roleSettingList.length === 0 ? (
                            <tbody>
                              <tr>
                                <td colSpan="9" className="text-center">
                                  No records found
                                </td>
                              </tr>
                            </tbody>
                          ) : (
                            <tbody>
                              <>
                                {roleSettingList.map((item, index) => {
                                  return (
                                    <tr key={index}>
                                      <td>{index + 1}</td>
                                      {/* <td>{item.module}</td> */}
                                      <td>{item.form}</td>
                                      <td align="center">
                                        <CheckboxField
                                          id={"rAdd" + index}
                                          isTable={true}
                                          checked={item.rAdd}
                                          onChange={(e) => {
                                            item.rAdd = !item.rAdd;
                                            setRoleSettingList([
                                              ...roleSettingList,
                                            ]);
                                          }}
                                        />
                                      </td>
                                      <td align="center">
                                        <CheckboxField
                                          id={"rDelete" + index}
                                          isTable={true}
                                          checked={item.rDelete}
                                          onChange={() => {
                                            item.rDelete = !item.rDelete;
                                            setRoleSettingList([
                                              ...roleSettingList,
                                            ]);
                                          }}
                                        />
                                      </td>
                                      <td align="center">
                                        <CheckboxField
                                          id={"rModify" + index}
                                          isTable={true}
                                          checked={item.rModify}
                                          onChange={() => {
                                            item.rModify = !item.rModify;
                                            setRoleSettingList([
                                              ...roleSettingList,
                                            ]);
                                          }}
                                        />
                                      </td>
                                      <td align="center">
                                        <CheckboxField
                                          id={"rView" + index}
                                          isTable={true}
                                          checked={item.rView}
                                          onChange={() => {
                                            item.rView = !item.rView;

                                            setRoleSettingList([
                                              ...roleSettingList,
                                            ]);
                                          }}
                                        />
                                      </td>
                                      <td align="center">
                                        <CheckboxField
                                          id={"rPrint" + index}
                                          isTable={true}
                                          checked={item.rPrint}
                                          onChange={() => {
                                            item.rPrint = !item.rPrint;

                                            setRoleSettingList([
                                              ...roleSettingList,
                                            ]);
                                          }}
                                        />
                                      </td>
                                      <td align="center">
                                        <CheckboxField
                                          isTable={true}
                                          id={"rAll" + index}
                                          checked={
                                            item.rAdd &&
                                            item.rDelete &&
                                            item.rModify &&
                                            item.rView &&
                                            item.rPrint
                                          }
                                          onChange={(e) => {
                                            if (e.target.checked) {
                                              item.rAdd = 1;
                                              item.rDelete = 1;
                                              item.rModify = 1;
                                              item.rView = 1;
                                              item.rPrint = 1;
                                            } else {
                                              item.rAdd = 0;
                                              item.rDelete = 0;
                                              item.rModify = 0;
                                              item.rView = 0;
                                              item.rPrint = 0;
                                            }
                                            setRoleSettingList([
                                              ...roleSettingList,
                                            ]);
                                          }}
                                        />
                                      </td>
                                    </tr>
                                  );
                                })}
                              </>
                            </tbody>
                          )}
                        </table>
                      </div>
                    </div>
                    {roleSettingList.length > 0 && (
                      <Button
                        id="save"
                        text="F4 - Save"
                        tabIndex={4}
                        type="button"
                        onClick={() => handleSave(values)}
                      />
                    )}
                  </>
                )}

                {modulewithRoleList.length > 0 && (
                  <>
                    <div className="subhead-row">
                      <div className="subhead">Previous Rights</div>
                      <div className="col line-div"></div>
                    </div>
                    <div className="row no-gutters">
                      <div className="table-responsive">
                        <table className="table table-bordered table-hover">
                          <thead>
                            <tr>
                              <th width="1%">No.</th>
                              <th>Forms</th>
                              <th width="7%">Add</th>
                              <th width="7%">Delete</th>
                              <th width="7%">Modify</th>
                              <th width="7%">View</th>
                              <th width="7%">Print</th>
                            </tr>
                          </thead>
                          <tbody>
                            {modulewithRoleList.map((item, index) => {
                              return (
                                <>
                                  {index === 0 ||
                                  modulewithRoleList[index - 1].module !==
                                    item.module ? (
                                    <tr key={index}>
                                      <td colSpan={7} className="table-total">
                                        {"Module : " + item.module}
                                      </td>
                                    </tr>
                                  ) : null}
                                  <tr key={index}>
                                    <td>{index + 1}</td>
                                    <td>{item.form}</td>
                                    <td align="center">
                                      <CheckboxField
                                        id={"rAdd" + index}
                                        isTable={true}
                                        checked={item.rAdd}
                                        disabled={true}
                                      />
                                    </td>
                                    <td align="center">
                                      <CheckboxField
                                        id={"rDelete" + index}
                                        isTable={true}
                                        checked={item.rDelete}
                                        disabled
                                      />
                                    </td>
                                    <td align="center">
                                      <CheckboxField
                                        id={"rModify" + index}
                                        isTable={true}
                                        checked={item.rModify}
                                        disabled
                                      />
                                    </td>
                                    <td align="center">
                                      <CheckboxField
                                        id={"rView" + index}
                                        isTable={true}
                                        checked={item.rView}
                                        disabled
                                      />
                                    </td>
                                    <td align="center">
                                      <CheckboxField
                                        id={"rPrint" + index}
                                        isTable={true}
                                        checked={item.rPrint}
                                        disabled={true}
                                      />
                                    </td>
                                  </tr>
                                </>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </>
                )}
              </form>
            );
          }}
        </Formik>
      </div>
    </div>
  );
}

export default UserRight;
function handleEmployeeChange(setFieldValue, text, roleList, setShowRes) {
  setFieldValue("employeeCode", text);
  setFieldValue("status", false);
  setFieldValue("role", "");
  if (text) {
    for (let i = 0; i < roleList.length; i++) {
      if (roleList[i].roleID == text.custom_role_id) {
        setFieldValue("role", roleList[i]);
        break;
      }
    }
    setFieldValue("module", "");
    if (text.status == "Active") {
      setFieldValue("status", true);
    } else {
      setFieldValue("status", false);
    }
  }
  setShowRes(false);
}
