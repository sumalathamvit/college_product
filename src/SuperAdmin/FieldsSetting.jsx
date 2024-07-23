import React, { useEffect, useRef, useState, useContext } from "react";
import * as Yup from "yup";
import { Formik } from "formik";

import preFunction from "../component/common/CommonFunction";
import CustomActivityIndicator from "../component/common/CustomActivityIndicator";
import SelectFieldFormik from "../component/FormField/SelectFieldFormik";
import ReactSelectField from "../component/FormField/ReactSelectField";
import Button from "../component/FormField/Button";
import ScreenTitle from "../component/common/ScreenTitle";

import LibraryApi from "../api/libraryapi";
import { useSelector } from "react-redux";
import AuthContext from "../auth/context";
import ModalComponent from "../component/ModalComponent";
import Modal from "react-bootstrap/Modal";
import {
  chooseFieldList,
  componentTypeList,
} from "../component/common/CommonArray";
import TextFieldFormik from "../component/FormField/TextFieldFormik";
import { toast } from "react-toastify";
import TextField from "../component/FormField/TextField";

function FieldsSetting() {
  //#region const
  // const { collegeId, collegeName } = useContext(AuthContext);
  const collegeConfig = useSelector((state) => state.web.college);

  const [load, setLoad] = useState(false);
  const [showRes, setShowRes] = useState(false);
  const [moduleList, setModuleList] = useState([]);
  const [fieldList, setFieldList] = useState([]);

  const [modalErrorOpen, setModalErrorOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [modalTitle, setModalTitle] = useState("");

  const [formList, setFormList] = useState([]);
  const { setUnSavedChanges } = useContext(AuthContext);
  const [pageConfigId, setPageConfigId] = useState(0);
  const [checkChange, setCheckChange] = useState(false);
  const [componentList, setComponentList] = useState([]);
  const [openModal, setOpenModal] = useState(false);

  const formikRef = useRef();
  const fieldFormikRef = useRef();
  const elementFormikRef = useRef();
  //#endregion

  const FormSchema = Yup.object().shape({
    // college: collegeConfig.is_university
    //   ? Yup.object().required("Please select College")
    //   : Yup.mixed().notRequired(),
    module: Yup.object().required("Please select Module"),
    screenName: Yup.object().required("Please select Screen Name"),
  });

  const AddFieldSchema = Yup.object().shape({
    addComponentID: Yup.object().required("Please enter Element ID"),
    addMandatory: Yup.object().required("Please select Mandatory"),
    addVisible: Yup.object().required("Please select Show"),
  });

  const addElementSchema = Yup.object().shape({
    elementId: Yup.string().required("Please enter Element ID"),
    componentName: Yup.string().required("Please enter Component Name"),
    type: Yup.object().required("Please select Type"),
  });

  let tabIndex = 4;
  let finalTabIndex = 5;

  const handleUnSavedChanges = (changed) => {
    if (changed === 1) {
      sessionStorage.setItem("unSavedChanges", true);
      setUnSavedChanges(true);
    } else {
      sessionStorage.setItem("unSavedChanges", false);
      setUnSavedChanges(false);
    }
  };

  // Function to show the fields detail
  const handelShow = async (values) => {
    console.log("values", values);
    setFieldList([]);
    if (load) return;
    try {
      setLoad(true);

      const getPageConfigData = await LibraryApi.getPageConfigData(
        collegeConfig.institution_type,
        values.module?.moduleID,
        values.screenName?.formID
      );
      console.log("getPageConfigData", getPageConfigData);

      getComponentList(
        values.screenName?.formID,
        getPageConfigData?.data?.message?.data?.value
      );

      setShowRes(true);
      setPageConfigId(getPageConfigData?.data?.message?.data?.pageConfigID);

      if (getPageConfigData?.data?.message?.data) {
        console.log("getPageConfigData", getPageConfigData);
        // setFieldList(getPageConfigData?.data?.message?.data?.value);
        let fieldArr = [];
        for (
          let i = 0;
          i < getPageConfigData?.data?.message?.data?.value.length;
          i++
        ) {
          fieldArr.push({
            componentId:
              getPageConfigData?.data?.message?.data?.value[i].componentId,
            componentName:
              getPageConfigData?.data?.message?.data?.value[i].componentName,
            type: getPageConfigData?.data?.message?.data?.value[i].type,
            attribute:
              getPageConfigData?.data?.message?.data?.value[i].attribute?.split(
                ","
              ),
          });
        }
        console.log("fieldArr", fieldArr);
        setFieldList(fieldArr);
      }
      setLoad(false);
    } catch (error) {
      setLoad(false);
      console.log(error);
    }
  };

  // Function to add fields to the list
  const handleAddField = async (values) => {
    console.log("values---", values);
    if (load) return;

    // Check if the component ID already exists
    let check = fieldList.filter(
      (m) => m.componentId === values.addComponentID.componentID
    );
    if (check.length > 0) {
      setModalMessage("Element ID already exists");
      setModalErrorOpen(true);
      setModalTitle("Error");
      return false;
    }

    let obj = {
      componentId: values.addComponentID.componentID,
      componentName: JSON.parse(values.addComponentID.value)?.id,
      type: JSON.parse(values.addComponentID.value)?.type,
      attribute: [
        values.addVisible.value,
        values.addMandatory.value,
        values.addLabel,
        values.addPlaceholder,
      ],
    };
    console.log("obj", obj);
    fieldList.push(obj);
    handleUnSavedChanges(1);
    setCheckChange(true);
    fieldFormikRef.current.resetForm();
    return true;
  };

  // Function to delete fields from the list
  const handleDeleteStudent = (item) => {
    console.log("item", item);

    const deleteStudent = fieldList.filter((m) => m !== item);
    setFieldList(deleteStudent);
    handleUnSavedChanges(1);
    setCheckChange(true);
    getComponentList(formikRef.current.values.screenName.formID, deleteStudent);
  };

  // Function to save the fields detail
  const handelSave = async (values) => {
    console.log("values", values, fieldList);

    if (checkChange === false) {
      setModalMessage("No changes made");
      setModalErrorOpen(true);
      setModalTitle("Message");
      return;
    }

    if (
      fieldFormikRef.current.values.addComponentID &&
      fieldFormikRef.current.values.addVisible &&
      fieldFormikRef.current.values.addMandatory
    ) {
      const check = handleAddField(fieldFormikRef.current.values);
      if (!check) {
        return;
      }
    }

    if (load) return;
    try {
      setLoad(true);
      let attribute = [];

      for (let i = 0; i < fieldList.length; i++) {
        const attributeText =
          fieldList[i].attribute[0] +
          "," +
          fieldList[i].attribute[1] +
          "," +
          fieldList[i].attribute[2] +
          "," +
          fieldList[i].attribute[3];
        // for visible
        if (fieldList[i].attribute[0].toLowerCase() == "yes") {
          let visible = {
            id: "c" + fieldList[i].componentId,
            type: "text",
            attribute: {
              style: "display:flex",
            },
          };
          attribute.push(visible);
        } else if (fieldList[i].attribute[0].toLowerCase() == "no") {
          let visible = {
            id: "c" + fieldList[i].componentId,
            type: "text",
            attribute: {
              style: "display:none",
            },
          };
          attribute.push(visible);
        }
        let mandatory = {};
        // for mandatory
        if (fieldList[i].attribute[1].toLowerCase() == "yes") {
          mandatory = {
            id: fieldList[i].componentId,
            type: fieldList[i].type,
            attribute: {
              class: fieldList[i].type == "text" ? "form-control" : "",
            },
          };
        } else if (fieldList[i].attribute[1].toLowerCase() == "no") {
          mandatory = {
            id: fieldList[i].componentId,
            type: fieldList[i].type,
            attribute: {
              class:
                fieldList[i].type == "text"
                  ? "form-control non-mandatory-input"
                  : "non-mandatory-input",
            },
          };
        }
        attribute.push(mandatory);

        // for label
        if (
          fieldList[i].attribute[2].toLowerCase() != "default" &&
          fieldList[i].attribute[2] != ""
        ) {
          let item = attribute.findIndex(
            (m) => m.id === fieldList[i].componentId
          );
          console.log("item", item);
          if (item === -1) {
            attribute.push({
              id: fieldList[i].componentId,
              attribute: { alt: fieldList[i].attribute[2] },
            });
          } else {
            attribute[item].attribute.alt = fieldList[i].attribute[2];
          }
        }

        // for placeholder
        if (
          fieldList[i].attribute[3].toLowerCase() != "default" &&
          fieldList[i].attribute[3] != ""
        ) {
          let item = attribute.findIndex(
            (m) => m.id === fieldList[i].componentId
          );
          if (item === -1) {
            attribute.push({
              id: fieldList[i].componentId,
              attribute: {
                placeholder: fieldList[i].attribute[3],
              },
            });
          } else {
            attribute[item].attribute.placeholder =
              fieldList[i].attribute[3].toLowerCase() === "default"
                ? ""
                : fieldList[i].attribute[3];
          }
        }
        console.log("attribute", attribute);
        fieldList[i].attribute = attributeText;
      }

      const jsonString = JSON.stringify(fieldList);
      const escapedJsonString = jsonString.replace(/"/g, '\\"');

      const attributeString = JSON.stringify(attribute);
      const escapedJsonattributeString = attributeString.replace(/"/g, '\\"');
      console.log("escapedJsonattributeString", escapedJsonattributeString);

      const saveFieldsSetting = await LibraryApi.upDatePageConfig(
        pageConfigId,
        collegeConfig.institution_type,
        formikRef.current.values.module.moduleID,
        formikRef.current.values.screenName.formID,
        formikRef.current.values.screenName.formLink,
        escapedJsonString,
        escapedJsonattributeString
      );
      console.log("saveFieldsSetting", saveFieldsSetting);

      handleUnSavedChanges(0);
      if (!saveFieldsSetting.data.message.success) {
        setModalMessage(saveFieldsSetting.data.message.message);
        setModalErrorOpen(true);
        setModalTitle("Message");
        setLoad(false);
        return;
      }
      toast.success(saveFieldsSetting.data.message.message);
      // formikRef.current.resetForm();
      // fieldFormikRef.current.resetForm();
      setFieldList([]);
      setShowRes(false);
      setCheckChange(false);
      handelShow(formikRef.current.values);
      setLoad(false);
    } catch (error) {
      console.log("error", error);
      setLoad(false);
    }
  };

  const handleAddElement = async (values) => {
    console.log("values", values);
    if (load) return;
    try {
      setLoad(true);

      let value = {
        id: values.componentName,
        type: values.type.value,
      };
      console.log("value", value);

      const addComponent = await LibraryApi.addComponent(
        formikRef.current.values.module.moduleID,
        formikRef.current.values.screenName.formID,
        values.elementId,
        JSON.stringify(value)
      );
      console.log("addComponent", addComponent);
      if (!addComponent.data.message.success) {
        setModalMessage(addComponent.data.message.message);
        setModalErrorOpen(true);
        setModalTitle("Error");
        setLoad(false);
        return;
      }
      toast.success(addComponent.data.message.message);
      setOpenModal(false);
      getComponentList(formikRef.current.values.screenName.formID, fieldList);
      setLoad(false);
    } catch (error) {
      console.log("error", error);
      setLoad(false);
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
    } catch (error) {
      console.log("error", error);
    }
  };

  const getFormList = async (module) => {
    if (load) return;
    console.log("module", module);
    try {
      setLoad(true);
      const getFormList = await LibraryApi.getFormList(module.moduleID);
      console.log("getFormList", getFormList);
      setFormList(getFormList.data.message.data.form);
      setLoad(false);
    } catch (error) {
      setLoad(false);
      console.log("error", error);
    }
  };

  const getComponentList = async (formID, configData) => {
    try {
      const getComponentList = await LibraryApi.getComponentList(formID);
      console.log("getComponentList", getComponentList);
      if (configData) {
        let componentArr = [];
        for (
          let i = 0;
          i < getComponentList.data.message.data.components.length;
          i++
        ) {
          let check = configData.filter(
            (m) =>
              m.componentId ===
              getComponentList.data.message.data.components[i].componentID
          );
          if (check.length === 0) {
            componentArr.push(getComponentList.data.message.data.components[i]);
          }
        }
        console.log("componentArr", componentArr);
        setComponentList(componentArr);
      }
    } catch (error) {
      console.log("error", error);
    }
  };

  useEffect(() => {
    getAllMaster();
  }, []);

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
        <ScreenTitle titleClass={"page-heading-position"} />
        <div className="row no-gutters mt-1">
          <Formik
            innerRef={formikRef}
            enableReinitialize={true}
            initialValues={{
              // college: "",
              module: "",
              screenName: "",
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
                  {/* {collegeConfig.is_university && (
                    <SelectFieldFormik
                      autoFocus
                      labelSize={2}
                      tabIndex={1}
                      label="College"
                      id="college"
                      mandatory={1}
                      options={collegeConfig.collegeList}
                      getOptionLabel={(option) => option.collegeName}
                      getOptionValue={(option) => option.collegeID}
                      searchIcon={false}
                      clear={false}
                      style={{ width: "50%" }}
                      onChange={(text) => {
                        setFieldValue("college", text);
                        setFieldValue("module", "");
                        setFieldValue("screenName", "");
                        console.log("text", text);
                        setShowRes(false);
                        // getAllList(text?.collegeID);
                      }}
                    />
                  )} */}
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
                      setFieldValue("screenName", "");
                      getFormList(text);
                    }}
                  />
                  <SelectFieldFormik
                    label="Screen Name"
                    labelSize={2}
                    id="screenName"
                    getOptionLabel={(option) => option.form}
                    getOptionValue={(option) => option.formID}
                    options={formList}
                    style={{ width: "30%" }}
                    mandatory={1}
                    maxlength={15}
                    tabIndex={3}
                    onChange={(text) => {
                      setShowRes(false);
                      setFieldValue("screenName", text);
                    }}
                  />
                  {!showRes ? (
                    <Button
                      text="Show"
                      tabIndex={4}
                      onClick={(e) => preFunction.handleErrorFocus(errors)}
                    />
                  ) : null}
                </form>
              );
            }}
          </Formik>
          {showRes && (
            <div className="col-lg-12">
              <Formik
                enableReinitialize={true}
                innerRef={fieldFormikRef}
                initialValues={{
                  addComponentID: "",
                  addComponentName: "",
                  addMandatory: "",
                  addVisible: "",
                  addLabel: "",
                  addPlaceholder: "",
                }}
                validationSchema={AddFieldSchema}
                onSubmit={handleAddField}
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
                        <div className="col-lg-12 text-right">
                          <Button
                            frmButton={false}
                            isTable={true}
                            text={`Add Element`}
                            type="button"
                            className={"btn-green"}
                            onClick={() => setOpenModal(true)}
                          />
                        </div>
                        <div className="subhead-row">
                          <div className="subhead">Fields Detail</div>
                          <div className="col line-div"></div>
                        </div>
                        <div className="table p-0 m-0">
                          <table className="table table-bordered mb-1">
                            <thead>
                              <tr>
                                <th width="1%">No.</th>
                                <th width="15%">Element ID</th>
                                <th>Component Name</th>
                                <th width="15%">Visible</th>
                                <th width="15%">Mandatory</th>
                                <th width="15%">Label</th>
                                <th width="15%">Placeholder</th>
                                <th width="9%"></th>
                              </tr>
                            </thead>
                            {/* {fieldList.length === 0 ? (
                              <tbody>
                                <tr>
                                  <td colSpan="9" className="text-center">
                                    No records found
                                  </td>
                                </tr>
                              </tbody>
                            ) : ( */}
                            <tbody>
                              {fieldList?.map((item, index) => {
                                tabIndex = tabIndex + 3;
                                finalTabIndex = tabIndex + 3;
                                return (
                                  <tr key={index}>
                                    <td>{index + 1}</td>
                                    <td>{item.componentId}</td>
                                    <td>{item.componentName}</td>
                                    <td>
                                      <ReactSelectField
                                        autoFocus={index == 0 ? true : false}
                                        tabIndex={tabIndex}
                                        id="show"
                                        searchIcon={false}
                                        isTable={true}
                                        placeholder={" "}
                                        value={
                                          item?.attribute[0]
                                            ? {
                                                label: item?.attribute[0],
                                                value: item?.attribute[0],
                                              }
                                            : null
                                        }
                                        options={chooseFieldList}
                                        onChange={(text) => {
                                          console.log("text", text);
                                          let status = text ? text.value : "";
                                          fieldList[index].attribute[0] =
                                            status;
                                          setFieldList([...fieldList]);
                                          handleUnSavedChanges(1);
                                          setCheckChange(true);
                                        }}
                                      />
                                    </td>
                                    <td>
                                      <ReactSelectField
                                        tabIndex={tabIndex + 1}
                                        labelSize={0}
                                        id="mandatory"
                                        isTable={true}
                                        placeholder={" "}
                                        searchIcon={false}
                                        value={
                                          item?.attribute[1]
                                            ? {
                                                label: item?.attribute[1],
                                                value: item?.attribute[1],
                                              }
                                            : null
                                        }
                                        options={chooseFieldList}
                                        onChange={(text) => {
                                          let status = text ? text.value : "";
                                          fieldList[index].attribute[1] =
                                            status;
                                          setFieldList([...fieldList]);
                                          handleUnSavedChanges(1);
                                          setCheckChange(true);
                                        }}
                                      />
                                    </td>
                                    <td>
                                      <TextField
                                        tabIndex={tabIndex + 2}
                                        id="labelName"
                                        isTable={true}
                                        maxlength={45}
                                        value={item?.attribute[2]}
                                        onChange={(e) => {
                                          let value = e.target.value
                                            ? e.target.value
                                            : "";
                                          fieldList[index].attribute[2] = value;
                                          setFieldList([...fieldList]);
                                          handleUnSavedChanges(1);
                                          setCheckChange(true);
                                        }}
                                      />
                                    </td>
                                    <td>
                                      <TextField
                                        tabIndex={tabIndex + 3}
                                        id="placeholder"
                                        isTable={true}
                                        maxlength={45}
                                        value={item.attribute[3]}
                                        onChange={(e) => {
                                          let value = e.target.value
                                            ? e.target.value
                                            : "";
                                          fieldList[index].attribute[3] = value;
                                          setFieldList([...fieldList]);
                                          handleUnSavedChanges(1);
                                          setCheckChange(true);
                                        }}
                                      />
                                    </td>
                                    <td>
                                      <Button
                                        isTable={true}
                                        type="button"
                                        className="plus-button"
                                        text="-"
                                        onClick={() =>
                                          handleDeleteStudent(item)
                                        }
                                      />
                                    </td>
                                  </tr>
                                );
                              })}
                              <tr>
                                <td></td>
                                <td>
                                  <SelectFieldFormik
                                    autoFocus
                                    placeholder={"Element ID"}
                                    tabIndex={finalTabIndex + 1}
                                    id="addComponentID"
                                    mandatory={1}
                                    options={componentList}
                                    getOptionLabel={(option) =>
                                      option.componentID
                                    }
                                    getOptionValue={(option) => option.value}
                                    onChange={(text) => {
                                      setFieldValue("addComponentID", text);
                                      handleUnSavedChanges(1);
                                      setCheckChange(true);
                                    }}
                                  />
                                </td>
                                <td>
                                  {fieldFormikRef?.current?.values
                                    ?.addComponentID?.value
                                    ? JSON.parse(
                                        fieldFormikRef?.current?.values
                                          ?.addComponentID?.value
                                      ).id
                                    : null}
                                </td>
                                <td>
                                  <SelectFieldFormik
                                    placeholder={"Visible"}
                                    tabIndex={finalTabIndex + 2}
                                    id="addVisible"
                                    mandatory={1}
                                    options={chooseFieldList}
                                    getOptionLabel={(option) => option.label}
                                    getOptionValue={(option) => option.value}
                                    onChange={(text) => {
                                      setFieldValue("addVisible", text);
                                      handleUnSavedChanges(1);
                                      setCheckChange(true);
                                    }}
                                  />
                                </td>
                                <td>
                                  <SelectFieldFormik
                                    placeholder={"Mandatory "}
                                    tabIndex={finalTabIndex + 3}
                                    id="addMandatory"
                                    mandatory={1}
                                    options={chooseFieldList}
                                    getOptionLabel={(option) => option.label}
                                    getOptionValue={(option) => option.value}
                                    onChange={(text) => {
                                      setFieldValue("addMandatory", text);
                                      handleUnSavedChanges(1);
                                      setCheckChange(true);
                                    }}
                                  />
                                </td>
                                <td>
                                  <TextFieldFormik
                                    placeholder={"Label"}
                                    tabIndex={finalTabIndex + 4}
                                    id="addLabel"
                                    maxlength={20}
                                    onChange={(e) => {
                                      setFieldValue("addLabel", e.target.value);
                                      setCheckChange(true);
                                    }}
                                  />
                                </td>
                                <td>
                                  <TextFieldFormik
                                    placeholder={"Placeholder"}
                                    tabIndex={finalTabIndex + 5}
                                    id="addPlaceholder"
                                    maxlength={20}
                                    onChange={(e) => {
                                      setFieldValue(
                                        "addPlaceholder",
                                        e.target.value
                                      );
                                      setCheckChange(true);
                                    }}
                                  />
                                </td>
                                <td>
                                  <Button
                                    isTable={true}
                                    text="+"
                                    tabIndex={finalTabIndex + 6}
                                    type="submit"
                                    className="plus-button"
                                    onClick={(e) => {
                                      console.log(
                                        "values",
                                        tabIndex,
                                        finalTabIndex
                                      );
                                      preFunction.handleErrorFocus(errors);
                                    }}
                                  />
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </form>
                  );
                }}
              </Formik>
              <Button
                text="F4 - Save"
                type="Submit"
                onClick={() => handelSave()}
                id="save"
              />
            </div>
          )}
        </div>
        <Modal
          show={openModal}
          dialogClassName="my-modal"
          onEscapeKeyDown={() => setOpenModal(false)}
        >
          <Formik
            enableReinitialize={true}
            innerRef={elementFormikRef}
            initialValues={{
              elementId: "",
              componentName: "",
              type: "",
            }}
            validationSchema={addElementSchema}
            onSubmit={handleAddElement}
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
                  <Modal.Header>
                    <Modal.Title>Add Element</Modal.Title>
                  </Modal.Header>
                  <Modal.Body>
                    <div className="row px-5">
                      <div className="row no-gutters pb-2 mt-1 ">
                        <TextFieldFormik
                          autoFocus
                          tabIndex={101}
                          labelSize={4}
                          id="elementId"
                          label="Element ID"
                          mandatory={1}
                          maxlength={40}
                          style={{ width: "80%" }}
                          onChange={(e) => {
                            setFieldValue("elementId", e.target.value);
                            // setNoChange(true);
                          }}
                        />
                        <TextFieldFormik
                          tabIndex={102}
                          labelSize={4}
                          id="componentName"
                          label="Component Name"
                          mandatory={1}
                          maxlength={40}
                          style={{ width: "80%" }}
                          onChange={(e) => {
                            setFieldValue("componentName", e.target.value);
                            // setNoChange(true);
                          }}
                        />
                        <SelectFieldFormik
                          tabIndex={103}
                          label="Type"
                          labelSize={4}
                          id="type"
                          getOptionLabel={(option) => option.label}
                          getOptionValue={(option) => option.value}
                          options={componentTypeList}
                          style={{ width: "40%" }}
                          mandatory={1}
                          maxlength={15}
                          onChange={(text) => {
                            setFieldValue("type", text);
                          }}
                        />
                      </div>
                    </div>
                  </Modal.Body>
                  <Modal.Footer>
                    <div className="row my-1 py-2">
                      <div className="col-lg-6 d-flex justify-content-end">
                        <Button
                          tabIndex={104}
                          isTable={true}
                          text="Save"
                          onClick={(e) => {
                            preFunction.handleErrorFocus(errors);
                          }}
                        />
                      </div>

                      <div className="col-lg-6 d-flex justify-content-start p-0">
                        <Button
                          isTable={true}
                          text="Close"
                          type="button"
                          onClick={(e) => {
                            setOpenModal(false);
                          }}
                        />
                      </div>
                    </div>
                  </Modal.Footer>
                </form>
              );
            }}
          </Formik>
        </Modal>
      </div>
    </div>
  );
}
export default FieldsSetting;
