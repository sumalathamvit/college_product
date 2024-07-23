import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import * as Yup from "yup";
import { Formik } from "formik";

import preFunction from "../component/common/CommonFunction";
import CustomActivityIndicator from "../component/common/CustomActivityIndicator";
import SelectFieldFormik from "../component/FormField/SelectFieldFormik";
import Button from "../component/FormField/Button";
import ScreenTitle from "../component/common/ScreenTitle";

import LibraryApi from "../api/libraryapi";
import ModalComponent from "../component/ModalComponent";
import { toast } from "react-toastify";
import CheckboxField from "../component/FormFieldLibrary/CheckboxField";

const FormSchema = Yup.object().shape({
  role: Yup.object().required("Please select Role"),
  module: Yup.object().required("Please select Module"),
});

function RoleSetting() {
  //#region const
  const navigate = useNavigate();
  const location = useLocation();
  const [load, setLoad] = useState(false);
  const [showRes, setShowRes] = useState(false);

  const [moduleList, setModuleList] = useState([]);
  const [roleList, setRoleList] = useState([]);
  const [roleSettingList, setRoleSettingList] = useState([]);

  const [modalErrorOpen, setModalErrorOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [modalTitle, setModalTitle] = useState("");

  const formikRef = useRef();
  //#endregion

  const handelShow = async (values) => {
    if (load) return;
    try {
      setLoad(true);
      const getMasterAssignRoleRes = await LibraryApi.getMasterAssignRole(
        "role_setting",
        values?.module?.moduleID,
        values?.role?.roleID
      );
      console.log("getMasterAssignRoleRes", getMasterAssignRoleRes);
      if (!getMasterAssignRoleRes.data.message.success) {
        setModalMessage(getMasterAssignRoleRes.data.message.message);
        setModalErrorOpen(true);
        setModalTitle("Message");
        setLoad(false);
        return false;
      }
      setShowRes(true);

      for (
        let i = 0;
        i < getMasterAssignRoleRes.data.message.data.role_setting.length;
        i++
      ) {
        getMasterAssignRoleRes.data.message.data.role_setting[
          i
        ].toUpdate = false;
      }
      setRoleSettingList(getMasterAssignRoleRes.data.message.data.role_setting);
      setLoad(false);
    } catch (error) {
      setLoad(false);
      console.log(error);
    }
  };

  const handelSave = async () => {
    if (load) return;
    try {
      setLoad(true);
      console.log("roleSettingList", roleSettingList);
      let newRoleArr = [];
      for (let i = 0; i < roleSettingList.length; i++) {
        if (roleSettingList[i].toUpdate) {
          newRoleArr.push({
            roleSettingID: roleSettingList[i].roleSettingID,
            rAdd: roleSettingList[i].rAdd ? 1 : 0,
            rDelete: roleSettingList[i].rDelete ? 1 : 0,
            rModify: roleSettingList[i].rModify ? 1 : 0,
            rView: roleSettingList[i].rView ? 1 : 0,
            rPrint: roleSettingList[i].rPrint ? 1 : 0,
          });
        }
      }
      if (newRoleArr.length === 0) {
        setModalMessage("No changes made");
        setModalErrorOpen(true);
        setModalTitle("Message");
        setLoad(false);
        return;
      }
      const updateRoleSettingRes = await LibraryApi.updateRoleSetting(
        newRoleArr
      );
      console.log("updateRoleSettingRes", updateRoleSettingRes);
      if (!updateRoleSettingRes.data.message.success) {
        setModalMessage(updateRoleSettingRes.data.message.message);
        setModalErrorOpen(true);
        setModalTitle("Message");
        setLoad(false);
        return;
      }
      toast.success(updateRoleSettingRes.data.message.message);
      handelShow(formikRef.current.values);
      setLoad(false);
    } catch (error) {
      setLoad(false);
      console.log(error);
    }
  };

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
  const handleCheckBoxOnchange = (e) => {
    console.log("e", e);
    //check all the checkboxes of this checkbox checked
    let checkAll = document.getElementById("checkAll").checked;
    console.log("checkAll", checkAll);
    for (let i = 0; i < roleSettingList.length; i++) {
      roleSettingList[i].rAdd = checkAll;
      roleSettingList[i].rDelete = checkAll;
      roleSettingList[i].rModify = checkAll;
      roleSettingList[i].rView = checkAll;
      roleSettingList[i].rPrint = checkAll;
      roleSettingList[i].toUpdate = true;
    }
    setRoleSettingList([...roleSettingList]);
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
        <ScreenTitle titleClass={"page-heading-position"} />
        <div className="row no-gutters mt-1">
          <Formik
            innerRef={formikRef}
            enableReinitialize={true}
            initialValues={{
              module: "",
              role: "",
            }}
            validationSchema={FormSchema}
            onSubmit={handelShow}
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
                  <SelectFieldFormik
                    autoFocus
                    label="Role"
                    labelSize={2}
                    id="role"
                    getOptionLabel={(option) => option.role}
                    getOptionValue={(option) => option.roleID}
                    options={roleList}
                    style={{ width: "30%" }}
                    mandatory={1}
                    maxlength={15}
                    tabIndex={1}
                    onChange={(text) => {
                      setShowRes(false);
                      setFieldValue("role", text);
                    }}
                  />
                  <SelectFieldFormik
                    label="Module"
                    labelSize={2}
                    id="module"
                    getOptionLabel={(option) => option.module}
                    getOptionValue={(option) => option.moduleID}
                    options={moduleList}
                    style={{ width: "30%" }}
                    mandatory={1}
                    maxlength={15}
                    tabIndex={2}
                    onChange={(text) => {
                      setShowRes(false);
                      setFieldValue("module", text);
                    }}
                  />
                  {roleSettingList.length === 0 || !showRes ? (
                    <Button
                      text="Show"
                      tabIndex={3}
                      onClick={(e) => preFunction.handleErrorFocus(errors)}
                    />
                  ) : null}
                </form>
              );
            }}
          </Formik>
          {showRes && (
            <div className="row no-gutters mt-3 ">
              <div className="text-right">
                <CheckboxField
                  id="checkAll"
                  label="Select All"
                  onChange={(e) => handleCheckBoxOnchange(e)}
                  onClick={(e) => handleCheckBoxOnchange(e)}
                />
              </div>
              <div className="table-responsive ">
                <table className="table table-bordered table-hover">
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
                                  item.toUpdate = true;
                                  setRoleSettingList([...roleSettingList]);
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
                                  item.toUpdate = true;
                                  setRoleSettingList([...roleSettingList]);
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
                                  item.toUpdate = true;
                                  setRoleSettingList([...roleSettingList]);
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
                                  item.toUpdate = true;
                                  setRoleSettingList([...roleSettingList]);
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
                                  item.toUpdate = true;
                                  setRoleSettingList([...roleSettingList]);
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
                                  item.toUpdate = true;
                                  item.rAll = !item.rAll;
                                  setRoleSettingList([...roleSettingList]);
                                }}
                              />
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  )}
                </table>
              </div>
              {roleSettingList.length > 0 && (
                <Button
                  text="F4 - Save"
                  type="Submit"
                  onClick={() => handelSave()}
                  id="save"
                />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
export default RoleSetting;
